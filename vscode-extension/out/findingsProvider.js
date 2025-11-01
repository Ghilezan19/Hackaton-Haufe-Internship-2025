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
exports.FindingsProvider = void 0;
const vscode = __importStar(require("vscode"));
class FindingsProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.findings = [];
    }
    updateFindings(findings) {
        this.findings = findings;
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Root level - group by severity
            if (this.findings.length === 0) {
                return [new FindingItem('No issues found! ✅', '', vscode.TreeItemCollapsibleState.None)];
            }
            const groups = {
                critical: [],
                high: [],
                medium: [],
                low: [],
                info: []
            };
            this.findings.forEach(f => {
                groups[f.severity].push(f);
            });
            const items = [];
            if (groups.critical.length > 0) {
                items.push(new FindingItem(`🔴 Critical (${groups.critical.length})`, 'critical', vscode.TreeItemCollapsibleState.Expanded, groups.critical));
            }
            if (groups.high.length > 0) {
                items.push(new FindingItem(`🟡 High (${groups.high.length})`, 'high', vscode.TreeItemCollapsibleState.Expanded, groups.high));
            }
            if (groups.medium.length > 0) {
                items.push(new FindingItem(`🟠 Medium (${groups.medium.length})`, 'medium', vscode.TreeItemCollapsibleState.Collapsed, groups.medium));
            }
            if (groups.low.length > 0) {
                items.push(new FindingItem(`🔵 Low (${groups.low.length})`, 'low', vscode.TreeItemCollapsibleState.Collapsed, groups.low));
            }
            return items;
        }
        else if (element.findings) {
            // Show individual findings
            return element.findings.map(f => {
                const line = f.lineStart ? ` (Line ${f.lineStart})` : '';
                return new FindingItem(`${f.title}${line}`, f.description, vscode.TreeItemCollapsibleState.None, undefined, f);
            });
        }
        return [];
    }
}
exports.FindingsProvider = FindingsProvider;
class FindingItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState, findings, finding) {
        super(label, collapsibleState);
        this.label = label;
        this.tooltip = tooltip;
        this.collapsibleState = collapsibleState;
        this.findings = findings;
        this.finding = finding;
        this.tooltip = tooltip;
        if (finding) {
            this.description = finding.type;
            this.contextValue = 'finding';
            // Make it clickable if we have line info
            if (finding.lineStart) {
                this.command = {
                    command: 'vscode.open',
                    title: 'Go to line',
                    arguments: [
                        vscode.window.activeTextEditor?.document.uri,
                        {
                            selection: new vscode.Range(finding.lineStart - 1, 0, finding.lineEnd || finding.lineStart - 1, 999)
                        }
                    ]
                };
            }
        }
    }
}
//# sourceMappingURL=findingsProvider.js.map