"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorateProblems = decorateProblems;
const vscode = __importStar(require("vscode"));
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
function decorateProblems(editor, findings, offsetLine = 0) {
    const critical = [];
    const high = [];
    const medium = [];
    const low = [];
    findings.forEach(finding => {
        if (!finding.lineStart)
            return;
        const line = finding.lineStart - 1 + offsetLine;
        const endLine = finding.lineEnd ? finding.lineEnd - 1 + offsetLine : line;
        const range = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(endLine, 999));
        const decoration = {
            range,
            hoverMessage: new vscode.MarkdownString(`**${getSeverityIcon(finding.severity)} ${finding.title}**\n\n` +
                `${finding.description}\n\n` +
                `**Recommendation:** ${finding.recommendation}\n\n` +
                `---\n` +
                `*Severity:* ${finding.severity} | *Type:* ${finding.type}`)
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
function getSeverityIcon(severity) {
    switch (severity) {
        case 'critical': return '🔴';
        case 'high': return '🟡';
        case 'medium': return '🟠';
        case 'low': return '🔵';
        default: return 'ℹ️';
    }
}
//# sourceMappingURL=decorations.js.map