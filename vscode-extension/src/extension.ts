import * as vscode from 'vscode';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs/promises';

interface Finding {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  lineStart?: number;
  lineEnd?: number;
  recommendation: string;
}

interface ReviewResponse {
  summary: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    overallScore: number;
  };
  findings: Finding[];
}

let diagnosticCollection: vscode.DiagnosticCollection;
let outputChannel: vscode.OutputChannel;
let gitExtension: any;
let currentFindings: Map<string, Finding[]> = new Map();

export function activate(context: vscode.ExtensionContext) {
  console.log('Lintora extension activated!');

  // Create diagnostic collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection('lintora');
  context.subscriptions.push(diagnosticCollection);

  // Create output channel
  outputChannel = vscode.window.createOutputChannel('Lintora');
  context.subscriptions.push(outputChannel);

  // Register Code Action Provider for Quick Fixes
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: 'file' },
      new LintoraCodeActionProvider(),
      {
        providedCodeActionKinds: LintoraCodeActionProvider.providedCodeActionKinds
      }
    )
  );

  // Get Git extension
  const gitExt = vscode.extensions.getExtension('vscode.git');
  if (gitExt) {
    gitExtension = gitExt.exports.getAPI(1);
  }

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('lintora.reviewCurrentFile', reviewCurrentFile)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('lintora.reviewChangedFiles', reviewChangedFiles)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('lintora.enablePreCommitReview', enablePreCommitReview)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('lintora.disablePreCommitReview', disablePreCommitReview)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('lintora.fixAllIssues', fixAllIssues)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('lintora.fixIssue', fixSingleIssue)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('lintora.preCommitCheck', preCommitCheck)
  );

  // Setup Git hooks
  setupGitHooks(context);

  vscode.window.showInformationMessage('Lintora Code Review is active! 🚀');
}

async function reviewCurrentFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const document = editor.document;
  const code = document.getText();
  const language = document.languageId;
  const filePath = document.uri.fsPath;

  outputChannel.show();
  outputChannel.appendLine(`📝 Reviewing ${path.basename(filePath)}...`);

  try {
    const result = await reviewCode(code, language);
    displayResults(document, result);
    showSummary(result);
  } catch (error) {
    vscode.window.showErrorMessage(`Review failed: ${error}`);
    outputChannel.appendLine(`❌ Error: ${error}`);
  }
}

async function reviewChangedFiles() {
  if (!gitExtension) {
    vscode.window.showErrorMessage('Git extension not found');
    return;
  }

  const repo = gitExtension.repositories[0];
  if (!repo) {
    vscode.window.showErrorMessage('No git repository found');
    return;
  }

  // Get staged files
  const changes = repo.state.indexChanges;
  if (changes.length === 0) {
    vscode.window.showInformationMessage('No staged changes to review');
    return;
  }

  outputChannel.show();
  outputChannel.appendLine(`📂 Reviewing ${changes.length} staged file(s)...`);

  let totalIssues = 0;
  let criticalIssues = 0;

  for (const change of changes) {
    const filePath = path.join(repo.rootUri.fsPath, change.uri.fsPath);
    
    // Skip deleted files
    if (change.status === 5) continue; // 5 = deleted
    
    try {
      const code = await fs.readFile(filePath, 'utf-8');
      const language = getLanguageFromFile(filePath);
      
      outputChannel.appendLine(`\n🔍 ${path.basename(filePath)}...`);
      
      const result = await reviewCode(code, language);
      totalIssues += result.summary.totalFindings;
      criticalIssues += result.summary.critical + result.summary.high;

      // Open document and display diagnostics
      const document = await vscode.workspace.openTextDocument(filePath);
      displayResults(document, result);
      
      outputChannel.appendLine(`  ✅ Found ${result.summary.totalFindings} issue(s)`);
    } catch (error) {
      outputChannel.appendLine(`  ❌ Error reviewing ${path.basename(filePath)}: ${error}`);
    }
  }

  // Show summary
  const config = vscode.workspace.getConfiguration('lintora');
  const blockOnErrors = config.get<boolean>('blockCommitOnErrors', false);
  
  outputChannel.appendLine(`\n📊 Summary:`);
  outputChannel.appendLine(`  Total issues: ${totalIssues}`);
  outputChannel.appendLine(`  Critical/High: ${criticalIssues}`);

  if (criticalIssues > 0 && blockOnErrors) {
    vscode.window.showWarningMessage(
      `⚠️ Found ${criticalIssues} critical/high issues. Please fix before committing!`,
      'View Issues'
    ).then(selection => {
      if (selection === 'View Issues') {
        vscode.commands.executeCommand('workbench.action.problems.focus');
      }
    });
  } else if (totalIssues > 0) {
    vscode.window.showInformationMessage(
      `Found ${totalIssues} issue(s). Consider fixing before commit.`,
      'View Issues'
    ).then(selection => {
      if (selection === 'View Issues') {
        vscode.commands.executeCommand('workbench.action.problems.focus');
      }
    });
  } else {
    vscode.window.showInformationMessage('✅ No issues found! Ready to commit.');
  }
}

async function reviewCode(code: string, language: string): Promise<ReviewResponse> {
  const config = vscode.workspace.getConfiguration('lintora');
  const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000/api');
  const authToken = config.get<string>('authToken', '');

  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    outputChannel.appendLine('🔑 Using auth token from settings');
  }

  const response = await axios.post(
    `${apiUrl}/review/code`,
    {
      code,
      language,
      analysisTypes: ['security', 'quality', 'performance']
    },
    { headers, timeout: 120000 }
  );

  return response.data;
}

function displayResults(document: vscode.TextDocument, result: ReviewResponse) {
  const diagnostics: vscode.Diagnostic[] = [];

  // Store findings for later use in quick fixes
  currentFindings.set(document.uri.toString(), result.findings);

  for (const finding of result.findings) {
    const line = (finding.lineStart || 1) - 1;
    const range = new vscode.Range(line, 0, line, Number.MAX_VALUE);
    
    const severity = getSeverity(finding.severity);
    const message = `${finding.title}: ${finding.description}\n💡 ${finding.recommendation}`;
    
    const diagnostic = new vscode.Diagnostic(range, message, severity);
    diagnostic.source = 'Lintora';
    diagnostic.code = finding.id; // Use finding ID for quick fix matching
    
    diagnostics.push(diagnostic);
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

function getSeverity(severity: string): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'critical':
    case 'high':
      return vscode.DiagnosticSeverity.Error;
    case 'medium':
      return vscode.DiagnosticSeverity.Warning;
    case 'low':
      return vscode.DiagnosticSeverity.Information;
    default:
      return vscode.DiagnosticSeverity.Hint;
  }
}

function showSummary(result: ReviewResponse) {
  const { summary } = result;
  
  let message = `Score: ${summary.overallScore}/100 | `;
  message += `Issues: ${summary.totalFindings} `;
  message += `(🔴 ${summary.critical + summary.high} critical/high)`;

  if (summary.totalFindings === 0) {
    vscode.window.showInformationMessage(`✅ ${message}`);
  } else if (summary.critical + summary.high > 0) {
    vscode.window.showWarningMessage(`⚠️ ${message}`, 'View Issues').then(selection => {
      if (selection === 'View Issues') {
        vscode.commands.executeCommand('workbench.action.problems.focus');
      }
    });
  } else {
    vscode.window.showInformationMessage(`ℹ️ ${message}`, 'View Issues').then(selection => {
      if (selection === 'View Issues') {
        vscode.commands.executeCommand('workbench.action.problems.focus');
      }
    });
  }
}

function getLanguageFromFile(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const langMap: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cs': 'csharp',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
  };
  return langMap[ext] || 'text';
}

async function setupGitHooks(context: vscode.ExtensionContext) {
  if (!gitExtension) return;

  const config = vscode.workspace.getConfiguration('lintora');
  const enablePreCommit = config.get<boolean>('enablePreCommit', false);

  if (!enablePreCommit) return;

  const repo = gitExtension.repositories[0];
  if (!repo) return;

  // Install physical git hook
  await installPreCommitHook(repo.rootUri.fsPath);
}

async function installPreCommitHook(repoPath: string): Promise<void> {
  const hookPath = path.join(repoPath, '.git', 'hooks', 'pre-commit');
  const hooksDir = path.join(repoPath, '.git', 'hooks');
  
  // Check if .git/hooks exists
  try {
    await fs.access(hooksDir);
  } catch {
    await fs.mkdir(hooksDir, { recursive: true });
  }

  // Create pre-commit hook script
  const hookScript = `#!/bin/sh
# Lintora Pre-Commit Hook
echo "🔍 Lintora: Checking code before commit..."

# Get staged files
FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\\.(js|ts|jsx|tsx|py|java|c|cpp|cs|go|rs|php|rb)$')

if [ -z "$FILES" ]; then
  echo "✅ No code files to review"
  exit 0
fi

# Call VS Code command to review
code --command lintora.preCommitCheck

exit $?
`;

  try {
    await fs.writeFile(hookPath, hookScript, 'utf-8');
    await fs.chmod(hookPath, 0o755); // Make executable
    outputChannel.appendLine('✅ Pre-commit hook installed');
  } catch (error) {
    outputChannel.appendLine(`❌ Failed to install hook: ${error}`);
  }
}

async function uninstallPreCommitHook(repoPath: string): Promise<void> {
  const hookPath = path.join(repoPath, '.git', 'hooks', 'pre-commit');
  
  try {
    await fs.unlink(hookPath);
    outputChannel.appendLine('✅ Pre-commit hook removed');
  } catch (error) {
    // Hook doesn't exist, ignore
  }
}

async function enablePreCommitReview() {
  const config = vscode.workspace.getConfiguration('lintora');
  await config.update('enablePreCommit', true, vscode.ConfigurationTarget.Global);
  
  // Install hook
  if (gitExtension) {
    const repo = gitExtension.repositories[0];
    if (repo) {
      await installPreCommitHook(repo.rootUri.fsPath);
      vscode.window.showInformationMessage('✅ Pre-commit review enabled! Git will check your code before every commit.');
    }
  }
}

async function disablePreCommitReview() {
  const config = vscode.workspace.getConfiguration('lintora');
  await config.update('enablePreCommit', false, vscode.ConfigurationTarget.Global);
  
  // Uninstall hook
  if (gitExtension) {
    const repo = gitExtension.repositories[0];
    if (repo) {
      await uninstallPreCommitHook(repo.rootUri.fsPath);
      vscode.window.showInformationMessage('⚠️ Pre-commit review disabled!');
    }
  }
}

async function preCommitCheck() {
  if (!gitExtension) {
    process.exit(0); // No git, allow commit
    return;
  }

  const repo = gitExtension.repositories[0];
  if (!repo) {
    process.exit(0);
    return;
  }

  // Get staged files
  const changes = repo.state.indexChanges;
  if (changes.length === 0) {
    process.exit(0);
    return;
  }

  outputChannel.show();
  outputChannel.appendLine('🔍 Lintora Pre-Commit Check...\n');

  let criticalIssues = 0;
  let highIssues = 0;
  let totalIssues = 0;

  for (const change of changes) {
    const filePath = path.join(repo.rootUri.fsPath, change.uri.fsPath);
    
    // Skip deleted files
    if (change.status === 5) continue;
    
    try {
      const code = await fs.readFile(filePath, 'utf-8');
      const language = getLanguageFromFile(filePath);

      outputChannel.appendLine(`  📝 ${path.basename(filePath)}...`);

      const result = await reviewCode(code, language);
      
      const critical = result.findings.filter((f: Finding) => f.severity === 'critical').length;
      const high = result.findings.filter((f: Finding) => f.severity === 'high').length;
      
      criticalIssues += critical;
      highIssues += high;
      totalIssues += result.findings.length;

      if (critical > 0) {
        outputChannel.appendLine(`    🔴 ${critical} critical issue(s)`);
      }
      if (high > 0) {
        outputChannel.appendLine(`    🟠 ${high} high severity issue(s)`);
      }
      if (result.findings.length === 0) {
        outputChannel.appendLine(`    ✅ No issues`);
      }

    } catch (error) {
      outputChannel.appendLine(`    ⚠️ Could not review: ${error}`);
    }
  }

  outputChannel.appendLine('');

  // Block commit if critical issues found
  const config = vscode.workspace.getConfiguration('lintora');
  const blockOnCritical = config.get<boolean>('blockCommitOnCritical', true);
  const blockOnHigh = config.get<boolean>('blockCommitOnHigh', false);

  if (blockOnCritical && criticalIssues > 0) {
    outputChannel.appendLine(`❌ COMMIT BLOCKED: ${criticalIssues} critical issue(s) found!`);
    outputChannel.appendLine('   Fix the issues and try again.\n');
    vscode.window.showErrorMessage(`🚫 Commit blocked! ${criticalIssues} critical issues found. Fix them first!`);
    process.exit(1); // Block commit
    return;
  }

  if (blockOnHigh && highIssues > 0) {
    outputChannel.appendLine(`❌ COMMIT BLOCKED: ${highIssues} high severity issue(s) found!`);
    outputChannel.appendLine('   Fix the issues and try again.\n');
    vscode.window.showErrorMessage(`🚫 Commit blocked! ${highIssues} high severity issues found. Fix them first!`);
    process.exit(1); // Block commit
    return;
  }

  if (totalIssues > 0) {
    outputChannel.appendLine(`⚠️ Warning: ${totalIssues} issue(s) found, but allowing commit.`);
  } else {
    outputChannel.appendLine('✅ All files look good!');
  }

  outputChannel.appendLine('✅ Commit allowed!\n');
  process.exit(0); // Allow commit
}

async function fixAllIssues() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const document = editor.document;
  const findings = currentFindings.get(document.uri.toString());
  
  if (!findings || findings.length === 0) {
    vscode.window.showInformationMessage('No issues to fix. Run code review first.');
    return;
  }

  const confirmation = await vscode.window.showWarningMessage(
    `Fix all ${findings.length} issue(s)? This will replace your code.`,
    'Fix All',
    'Cancel'
  );

  if (confirmation !== 'Fix All') {
    return;
  }

  outputChannel.show();
  outputChannel.appendLine(`🔧 Fixing ${findings.length} issue(s)...`);

  try {
    const config = vscode.workspace.getConfiguration('lintora');
    const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000/api');
    const authToken = config.get<string>('authToken', '');

    const headers: any = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios.post(
      `${apiUrl}/review/complete-fix`,
      {
        code: document.getText(),
        language: document.languageId,
        findings: findings
      },
      { headers, timeout: 60000 }
    );

    const fixedCode = response.data.fixedCode;

    // Replace entire document with fixed code
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    );
    edit.replace(document.uri, fullRange, fixedCode);
    await vscode.workspace.applyEdit(edit);

    // Clear diagnostics
    diagnosticCollection.delete(document.uri);
    currentFindings.delete(document.uri.toString());

    vscode.window.showInformationMessage('✅ All issues fixed!');
    outputChannel.appendLine('✅ Code fixed successfully!');
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to fix code: ${error}`);
    outputChannel.appendLine(`❌ Error: ${error}`);
  }
}

async function fixSingleIssue(findingId: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const findings = currentFindings.get(document.uri.toString());
  
  if (!findings) {
    vscode.window.showInformationMessage('No issues found. Run code review first.');
    return;
  }

  const finding = findings.find(f => f.id === findingId);
  if (!finding) {
    vscode.window.showErrorMessage('Issue not found');
    return;
  }

  outputChannel.show();
  outputChannel.appendLine(`🔧 Fixing: ${finding.title}...`);

  try {
    const config = vscode.workspace.getConfiguration('lintora');
    const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000/api');
    const authToken = config.get<string>('authToken', '');

    const headers: any = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios.post(
      `${apiUrl}/review/fix`,
      {
        code: document.getText(),
        finding: finding,
        language: document.languageId
      },
      { headers, timeout: 30000 }
    );

    vscode.window.showInformationMessage(`✅ Fixed: ${finding.title}`);
    outputChannel.appendLine(`✅ ${finding.title} - ${response.data.fix}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to fix: ${error}`);
    outputChannel.appendLine(`❌ Error: ${error}`);
  }
}

// Code Action Provider for Quick Fixes
class LintoraCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    // Add "Fix All Issues" action if there are any diagnostics
    const diagnostics = context.diagnostics.filter(d => d.source === 'Lintora');
    if (diagnostics.length > 0) {
      const fixAllAction = new vscode.CodeAction(
        '🔧 Fix All Lintora Issues',
        vscode.CodeActionKind.QuickFix
      );
      fixAllAction.command = {
        command: 'lintora.fixAllIssues',
        title: 'Fix All Issues'
      };
      actions.push(fixAllAction);
    }

    // Add individual fix actions for each diagnostic at cursor
    for (const diagnostic of diagnostics) {
      if (diagnostic.code) {
        const fixAction = new vscode.CodeAction(
          `💡 ${diagnostic.message.split(':')[0]}`,
          vscode.CodeActionKind.QuickFix
        );
        fixAction.command = {
          command: 'lintora.fixIssue',
          title: 'Fix This Issue',
          arguments: [diagnostic.code]
        };
        fixAction.diagnostics = [diagnostic];
        actions.push(fixAction);
      }
    }

    return actions;
  }
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
  if (outputChannel) {
    outputChannel.dispose();
  }
}

