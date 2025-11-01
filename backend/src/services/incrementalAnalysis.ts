import { chatWithOllama } from './ollama.js';
import { CodeReviewResponse, IncrementalReviewRequest, Finding } from '../types/review.js';
import { v4 as uuidv4 } from 'uuid';

function getDiff(original: string, modified: string): string {
  // Simple line-by-line diff
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  
  const diff: string[] = [];
  let lineNum = 0;
  
  for (let i = 0; i < Math.max(originalLines.length, modifiedLines.length); i++) {
    lineNum++;
    const origLine = originalLines[i] || '';
    const modLine = modifiedLines[i] || '';
    
    if (origLine !== modLine) {
      if (origLine && !modLine) {
        diff.push(`- ${lineNum}: ${origLine}`);
      } else if (!origLine && modLine) {
        diff.push(`+ ${lineNum}: ${modLine}`);
      } else {
        diff.push(`- ${lineNum}: ${origLine}`);
        diff.push(`+ ${lineNum}: ${modLine}`);
      }
    }
  }
  
  return diff.join('\n');
}

export async function analyzeIncrementalChanges(
  request: IncrementalReviewRequest
): Promise<CodeReviewResponse> {
  const startTime = Date.now();
  
  const diff = getDiff(request.originalCode, request.modifiedCode);
  
  if (!diff) {
    return {
      summary: {
        totalFindings: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
        overallScore: 100
      },
      findings: [],
      suggestions: {},
      metrics: {
        tokensUsed: 0,
        analysisTime: Date.now() - startTime
      },
      timestamp: new Date().toISOString()
    };
  }

  const systemPrompt = `You are an expert code reviewer specializing in incremental code reviews.
Focus only on the changes made, not the entire codebase.
Analyze for:
- Security issues introduced by changes
- Breaking changes
- Performance regressions
- Code quality issues in new/modified code
- Missing tests for new functionality`;

  const userPrompt = `
Review these code changes in ${request.language || 'code'}:

File: ${request.filename || 'unknown'}

Changes:
\`\`\`diff
${diff}
\`\`\`

Modified code:
\`\`\`${request.language || ''}
${request.modifiedCode}
\`\`\`

Focus ONLY on the changed lines and their impact.
Provide specific findings with line numbers, severity, and recommendations.
`;

  const result = await chatWithOllama([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  // Parse the response (simplified - in production, use structured output)
  const findings: Finding[] = parseIncrementalFindings(result.response);

  const summary = {
    totalFindings: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
    overallScore: calculateIncrementalScore(findings)
  };

  return {
    summary,
    findings,
    suggestions: {
      documentation: findings.filter(f => f.type === 'documentation').map(f => f.recommendation),
      tests: findings.filter(f => f.type === 'testing').map(f => f.recommendation)
    },
    metrics: {
      tokensUsed: result.tokensUsed,
      analysisTime: Date.now() - startTime
    },
    timestamp: new Date().toISOString()
  };
}

function parseIncrementalFindings(response: string): Finding[] {
  // Simplified parser - in production, you'd want structured JSON output from LLM
  const findings: Finding[] = [];
  const lines = response.split('\n');
  
  let currentFinding: Partial<Finding> | null = null;
  
  for (const line of lines) {
    if (line.match(/^##\s+/) || line.match(/^\*\*Issue:/)) {
      if (currentFinding && currentFinding.title) {
        findings.push({
          id: uuidv4(),
          type: currentFinding.type || 'quality',
          severity: currentFinding.severity || 'medium',
          title: currentFinding.title,
          description: currentFinding.description || '',
          recommendation: currentFinding.recommendation || '',
          autoFixAvailable: false,
          ...currentFinding
        } as Finding);
      }
      currentFinding = {
        title: line.replace(/^##\s+/, '').replace(/^\*\*Issue:\*\*\s*/, '').trim()
      };
    }
  }
  
  if (currentFinding && currentFinding.title) {
    findings.push({
      id: uuidv4(),
      type: currentFinding.type || 'quality',
      severity: currentFinding.severity || 'medium',
      title: currentFinding.title,
      description: currentFinding.description || '',
      recommendation: currentFinding.recommendation || '',
      autoFixAvailable: false,
      ...currentFinding
    } as Finding);
  }
  
  return findings;
}

function calculateIncrementalScore(findings: Finding[]): number {
  const weights = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
    info: 0
  };
  
  const totalPenalty = findings.reduce((sum, f) => sum + weights[f.severity], 0);
  return Math.max(0, 100 - Math.min(totalPenalty, 100));
}


