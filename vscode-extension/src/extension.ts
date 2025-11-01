import * as vscode from 'vscode';
import { LintoraAPI } from './api';
import { FindingsProvider } from './findingsProvider';
import { StatsProvider } from './statsProvider';
import { decorateProblems } from './decorations';

let api: LintoraAPI;
let findingsProvider: FindingsProvider;
let statsProvider: StatsProvider;
let currentDecorations: vscode.TextEditorDecorationType[] = [];

export function activate(context: vscode.ExtensionContext) {
    console.log('Lintora extension activated!');

    // Initialize API
    api = new LintoraAPI(context);

    // Initialize providers
    findingsProvider = new FindingsProvider();
    statsProvider = new StatsProvider();

    // Register tree data providers
    vscode.window.registerTreeDataProvider('lintoraFindings', findingsProvider);
    vscode.window.registerTreeDataProvider('lintoraStats', statsProvider);

    // Register commands
    const reviewFileCommand = vscode.commands.registerCommand('lintora.reviewFile', async () => {
        await reviewCurrentFile();
    });

    const reviewSelectionCommand = vscode.commands.registerCommand('lintora.reviewSelection', async () => {
        await reviewSelection();
    });

    const reviewWorkspaceCommand = vscode.commands.registerCommand('lintora.reviewWorkspace', async () => {
        await reviewWorkspace();
    });

    const fixCodeCommand = vscode.commands.registerCommand('lintora.fixCode', async () => {
        await fixCode();
    });

    const configureCommand = vscode.commands.registerCommand('lintora.configure', async () => {
        await configureSettings();
    });

    context.subscriptions.push(
        reviewFileCommand,
        reviewSelectionCommand,
        reviewWorkspaceCommand,
        fixCodeCommand,
        configureCommand
    );

    // Auto-review on save if enabled
    const onSaveDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
        const config = vscode.workspace.getConfiguration('lintora');
        if (config.get('autoReview')) {
            await reviewDocument(document);
        }
    });

    context.subscriptions.push(onSaveDisposable);

    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(search-view-icon) Lintora';
    statusBarItem.tooltip = 'Click to review current file';
    statusBarItem.command = 'lintora.reviewFile';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    vscode.window.showInformationMessage('Lintora: AI Code Review activated!');
}

async function reviewCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor!');
        return;
    }

    await reviewDocument(editor.document);
}

async function reviewSelection() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor!');
        return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
        vscode.window.showWarningMessage('No code selected!');
        return;
    }

    const code = editor.document.getText(selection);
    const language = editor.document.languageId;

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Lintora: Reviewing selection...',
        cancellable: false
    }, async (progress) => {
        try {
            const result = await api.reviewCode(code, language);
            
            // Show results
            findingsProvider.updateFindings(result.findings);
            statsProvider.updateStats(result.summary);
            
            // Decorate editor
            clearDecorations();
            const decorations = decorateProblems(editor, result.findings, selection.start.line);
            currentDecorations = decorations;

            vscode.window.showInformationMessage(
                `Lintora: Found ${result.summary.totalFindings} issues (Score: ${result.summary.overallScore}/100)`
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Lintora: ${error instanceof Error ? error.message : 'Review failed'}`);
        }
    });
}

async function reviewDocument(document: vscode.TextDocument) {
    // Skip non-code files
    if (document.isUntitled || document.uri.scheme !== 'file') {
        return;
    }

    const code = document.getText();
    const language = document.languageId;
    const filename = document.fileName;

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Lintora: Reviewing ${filename.split(/[\\/]/).pop()}...`,
        cancellable: false
    }, async (progress) => {
        try {
            const result = await api.reviewCode(code, language, filename);
            
            // Show results
            findingsProvider.updateFindings(result.findings);
            statsProvider.updateStats(result.summary);
            
            // Decorate editor
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === document) {
                clearDecorations();
                const decorations = decorateProblems(editor, result.findings);
                currentDecorations = decorations;
            }

            // Show notification
            const severity = result.summary.critical > 0 ? 'critical' :
                           result.summary.high > 0 ? 'high' : 'ok';
            
            if (severity === 'critical') {
                vscode.window.showErrorMessage(
                    `Lintora: Found ${result.summary.critical} critical issues!`,
                    'View Issues'
                ).then(selection => {
                    if (selection) {
                        vscode.commands.executeCommand('workbench.view.extension.lintora');
                    }
                });
            } else if (severity === 'high') {
                vscode.window.showWarningMessage(
                    `Lintora: Found ${result.summary.high} high severity issues`,
                    'View Issues'
                ).then(selection => {
                    if (selection) {
                        vscode.commands.executeCommand('workbench.view.extension.lintora');
                    }
                });
            } else {
                vscode.window.showInformationMessage(
                    `Lintora: Score ${result.summary.overallScore}/100 (${result.summary.totalFindings} issues)`
                );
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Lintora: ${error instanceof Error ? error.message : 'Review failed'}`);
        }
    });
}

async function reviewWorkspace() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showWarningMessage('No workspace folder open!');
        return;
    }

    // Find all code files
    const files = await vscode.workspace.findFiles(
        '**/*.{js,jsx,ts,tsx,py,java,c,cpp,cs,php,rb,go,rs}',
        '**/node_modules/**'
    );

    if (files.length === 0) {
        vscode.window.showInformationMessage('No code files found!');
        return;
    }

    vscode.window.showInformationMessage(`Found ${files.length} files to review. This may take a while...`);

    let totalIssues = 0;
    let filesReviewed = 0;

    for (const file of files) {
        try {
            const document = await vscode.workspace.openTextDocument(file);
            const code = document.getText();
            const language = document.languageId;

            const result = await api.reviewCode(code, language, file.fsPath);
            totalIssues += result.summary.totalFindings;
            filesReviewed++;
        } catch (error) {
            console.error(`Error reviewing ${file.fsPath}:`, error);
        }
    }

    vscode.window.showInformationMessage(
        `Lintora: Reviewed ${filesReviewed} files, found ${totalIssues} issues`
    );
}

async function fixCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor!');
        return;
    }

    const document = editor.document;
    const code = document.getText();
    const language = document.languageId;

    // First, analyze code to get findings
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Lintora: Analyzing and fixing code...',
        cancellable: false
    }, async (progress) => {
        try {
            // Get analysis first
            const result = await api.reviewCode(code, language);
            
            if (result.findings.length === 0) {
                vscode.window.showInformationMessage('No issues found to fix!');
                return;
            }

            // Generate fixed code
            const fixedCode = await api.generateCompleteFix(code, language, result.findings);

            // Ask user to confirm
            const choice = await vscode.window.showInformationMessage(
                `Lintora found ${result.findings.length} issues. Apply automatic fixes?`,
                'Apply Fixes',
                'Cancel'
            );

            if (choice === 'Apply Fixes') {
                // Replace entire document
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(code.length)
                );
                edit.replace(document.uri, fullRange, fixedCode);
                await vscode.workspace.applyEdit(edit);

                vscode.window.showInformationMessage('Lintora: Code fixes applied! 🎉');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Lintora: ${error instanceof Error ? error.message : 'Fix failed'}`);
        }
    });
}

async function configureSettings() {
    vscode.commands.executeCommand('workbench.action.openSettings', 'lintora');
}

function clearDecorations() {
    currentDecorations.forEach(decoration => decoration.dispose());
    currentDecorations = [];
}

export function deactivate() {
    clearDecorations();
}

