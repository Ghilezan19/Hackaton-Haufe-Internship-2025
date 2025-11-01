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
exports.StatsProvider = void 0;
const vscode = __importStar(require("vscode"));
class StatsProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    updateStats(stats) {
        this.stats = stats;
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        if (!this.stats) {
            return [new StatItem('No statistics yet', '', '$(info)')];
        }
        return [
            new StatItem(`Overall Score: ${this.stats.overallScore}/100`, this.getScoreDescription(this.stats.overallScore), this.getScoreIcon(this.stats.overallScore)),
            new StatItem(`Total Issues: ${this.stats.totalFindings}`, 'Total number of findings', '$(search)'),
            new StatItem(`Critical: ${this.stats.critical}`, 'Critical severity issues', '$(error)'),
            new StatItem(`High: ${this.stats.high}`, 'High severity issues', '$(warning)'),
            new StatItem(`Medium: ${this.stats.medium}`, 'Medium severity issues', '$(info)'),
            new StatItem(`Low: ${this.stats.low}`, 'Low severity issues', '$(circle-outline)')
        ];
    }
    getScoreIcon(score) {
        if (score >= 90)
            return '$(pass-filled)';
        if (score >= 70)
            return '$(check)';
        if (score >= 50)
            return '$(warning)';
        return '$(error)';
    }
    getScoreDescription(score) {
        if (score >= 90)
            return 'Excellent code quality!';
        if (score >= 70)
            return 'Good code quality';
        if (score >= 50)
            return 'Needs improvement';
        return 'Major issues found';
    }
}
exports.StatsProvider = StatsProvider;
class StatItem extends vscode.TreeItem {
    constructor(label, tooltip, icon) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.tooltip = tooltip;
        this.icon = icon;
        this.tooltip = tooltip;
        this.iconPath = new vscode.ThemeIcon(icon.replace('$(', '').replace(')', ''));
    }
}
//# sourceMappingURL=statsProvider.js.map