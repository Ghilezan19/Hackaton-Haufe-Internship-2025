import * as vscode from 'vscode';
import { Finding } from './api';

export class FindingsProvider implements vscode.TreeDataProvider<FindingItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<FindingItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private findings: Finding[] = [];

    updateFindings(findings: Finding[]) {
        this.findings = findings;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FindingItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FindingItem): FindingItem[] {
        if (!element) {
            // Root level - group by severity
            if (this.findings.length === 0) {
                return [new FindingItem('No issues found! ✅', '', vscode.TreeItemCollapsibleState.None)];
            }

            const groups: { [key: string]: Finding[] } = {
                critical: [],
                high: [],
                medium: [],
                low: [],
                info: []
            };

            this.findings.forEach(f => {
                groups[f.severity].push(f);
            });

            const items: FindingItem[] = [];
            
            if (groups.critical.length > 0) {
                items.push(new FindingItem(
                    `🔴 Critical (${groups.critical.length})`,
                    'critical',
                    vscode.TreeItemCollapsibleState.Expanded,
                    groups.critical
                ));
            }
            if (groups.high.length > 0) {
                items.push(new FindingItem(
                    `🟡 High (${groups.high.length})`,
                    'high',
                    vscode.TreeItemCollapsibleState.Expanded,
                    groups.high
                ));
            }
            if (groups.medium.length > 0) {
                items.push(new FindingItem(
                    `🟠 Medium (${groups.medium.length})`,
                    'medium',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    groups.medium
                ));
            }
            if (groups.low.length > 0) {
                items.push(new FindingItem(
                    `🔵 Low (${groups.low.length})`,
                    'low',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    groups.low
                ));
            }

            return items;
        } else if (element.findings) {
            // Show individual findings
            return element.findings.map(f => {
                const line = f.lineStart ? ` (Line ${f.lineStart})` : '';
                return new FindingItem(
                    `${f.title}${line}`,
                    f.description,
                    vscode.TreeItemCollapsibleState.None,
                    undefined,
                    f
                );
            });
        }

        return [];
    }
}

class FindingItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly findings?: Finding[],
        public readonly finding?: Finding
    ) {
        super(label, collapsibleState);
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
                            selection: new vscode.Range(
                                finding.lineStart - 1, 0,
                                finding.lineEnd || finding.lineStart - 1, 999
                            )
                        }
                    ]
                };
            }
        }
    }
}

