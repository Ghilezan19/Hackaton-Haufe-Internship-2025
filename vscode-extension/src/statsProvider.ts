import * as vscode from 'vscode';
import { Summary } from './api';

export class StatsProvider implements vscode.TreeDataProvider<StatItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<StatItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private stats?: Summary;

    updateStats(stats: Summary) {
        this.stats = stats;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: StatItem): vscode.TreeItem {
        return element;
    }

    getChildren(): StatItem[] {
        if (!this.stats) {
            return [new StatItem('No statistics yet', '', '$(info)')];
        }

        return [
            new StatItem(
                `Overall Score: ${this.stats.overallScore}/100`,
                this.getScoreDescription(this.stats.overallScore),
                this.getScoreIcon(this.stats.overallScore)
            ),
            new StatItem(
                `Total Issues: ${this.stats.totalFindings}`,
                'Total number of findings',
                '$(search)'
            ),
            new StatItem(
                `Critical: ${this.stats.critical}`,
                'Critical severity issues',
                '$(error)'
            ),
            new StatItem(
                `High: ${this.stats.high}`,
                'High severity issues',
                '$(warning)'
            ),
            new StatItem(
                `Medium: ${this.stats.medium}`,
                'Medium severity issues',
                '$(info)'
            ),
            new StatItem(
                `Low: ${this.stats.low}`,
                'Low severity issues',
                '$(circle-outline)'
            )
        ];
    }

    private getScoreIcon(score: number): string {
        if (score >= 90) return '$(pass-filled)';
        if (score >= 70) return '$(check)';
        if (score >= 50) return '$(warning)';
        return '$(error)';
    }

    private getScoreDescription(score: number): string {
        if (score >= 90) return 'Excellent code quality!';
        if (score >= 70) return 'Good code quality';
        if (score >= 50) return 'Needs improvement';
        return 'Major issues found';
    }
}

class StatItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly icon: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = tooltip;
        this.iconPath = new vscode.ThemeIcon(icon.replace('$(', '').replace(')', ''));
    }
}

