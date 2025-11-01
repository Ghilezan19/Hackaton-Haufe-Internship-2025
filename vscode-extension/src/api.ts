import * as vscode from 'vscode';
import fetch from 'node-fetch';

export interface CodeReviewResult {
    findings: Finding[];
    summary: Summary;
    metrics: Metrics;
}

export interface Finding {
    id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    lineStart?: number;
    lineEnd?: number;
    recommendation: string;
}

export interface Summary {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    overallScore: number;
}

export interface Metrics {
    tokensUsed: number;
    analysisTime: number;
    costEstimate: number;
}

export class LintoraAPI {
    private baseUrl: string;
    private authToken: string;

    constructor(private context: vscode.ExtensionContext) {
        const config = vscode.workspace.getConfiguration('lintora');
        this.baseUrl = config.get('apiUrl') || 'http://localhost:3000/api';
        this.authToken = config.get('authToken') || '';
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        return headers;
    }

    async reviewCode(code: string, language: string, filename?: string): Promise<CodeReviewResult> {
        const config = vscode.workspace.getConfiguration('lintora');
        const analysisTypes = config.get<string[]>('analysisTypes') || ['security', 'quality'];

        try {
            const response = await fetch(`${this.baseUrl}/review/code`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    code,
                    language,
                    filename,
                    analysisTypes
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error((error as any).message || 'Review failed');
            }

            return await response.json() as CodeReviewResult;
        } catch (error) {
            if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
                throw new Error('Backend not running. Start it with: cd backend && npm run dev');
            }
            throw error;
        }
    }

    async generateCompleteFix(code: string, language: string, findings: Finding[]): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/review/complete-fix`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    code,
                    language,
                    findings
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error((error as any).message || 'Fix generation failed');
            }

            const result = await response.json() as { fixedCode: string };
            return result.fixedCode;
        } catch (error) {
            throw error;
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

