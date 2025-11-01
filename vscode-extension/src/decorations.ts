import * as vscode from 'vscode';
import { Finding } from './api';

const criticalDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    border: '2px solid red',
    overviewRulerColor: 'red',
    overviewRulerLane: vscode.OverviewRulerLane.Left,
    isWholeLine: true
});

const highDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 200, 0, 0.15)',
    border: '2px solid orange',
    overviewRulerColor: 'orange',
    overviewRulerLane: vscode.OverviewRulerLane.Left,
    isWholeLine: true
});

const mediumDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 255, 0, 0.1)',
    border: '1px solid yellow',
    overviewRulerColor: 'yellow',
    overviewRulerLane: vscode.OverviewRulerLane.Left,
    isWholeLine: true
});

const lowDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(0, 150, 255, 0.08)',
    border: '1px solid lightblue',
    overviewRulerColor: 'lightblue',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    isWholeLine: true
});

export function decorateProblems(
    editor: vscode.TextEditor,
    findings: Finding[],
    offsetLine: number = 0
): vscode.TextEditorDecorationType[] {
    const critical: vscode.DecorationOptions[] = [];
    const high: vscode.DecorationOptions[] = [];
    const medium: vscode.DecorationOptions[] = [];
    const low: vscode.DecorationOptions[] = [];

    findings.forEach(finding => {
        if (!finding.lineStart) return;

        const line = finding.lineStart - 1 + offsetLine;
        const endLine = finding.lineEnd ? finding.lineEnd - 1 + offsetLine : line;

        const range = new vscode.Range(
            new vscode.Position(line, 0),
            new vscode.Position(endLine, 999)
        );

        const decoration: vscode.DecorationOptions = {
            range,
            hoverMessage: new vscode.MarkdownString(
                `**${getSeverityIcon(finding.severity)} ${finding.title}**\n\n` +
                `${finding.description}\n\n` +
                `**Recommendation:** ${finding.recommendation}\n\n` +
                `---\n` +
                `*Severity:* ${finding.severity} | *Type:* ${finding.type}`
            )
        };

        switch (finding.severity) {
            case 'critical':
                critical.push(decoration);
                break;
            case 'high':
                high.push(decoration);
                break;
            case 'medium':
                medium.push(decoration);
                break;
            case 'low':
            case 'info':
                low.push(decoration);
                break;
        }
    });

    editor.setDecorations(criticalDecorationType, critical);
    editor.setDecorations(highDecorationType, high);
    editor.setDecorations(mediumDecorationType, medium);
    editor.setDecorations(lowDecorationType, low);

    return [criticalDecorationType, highDecorationType, mediumDecorationType, lowDecorationType];
}

function getSeverityIcon(severity: string): string {
    switch (severity) {
        case 'critical': return '🔴';
        case 'high': return '🟡';
        case 'medium': return '🟠';
        case 'low': return '🔵';
        default: return 'ℹ️';
    }
}

