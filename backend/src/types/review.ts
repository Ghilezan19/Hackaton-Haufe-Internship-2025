export interface CodeReviewRequest {
  code: string;
  language?: string;
  filename?: string;
  guidelines?: string[];
  analysisTypes?: AnalysisType[];
}

export type AnalysisType = 
  | 'security' 
  | 'quality' 
  | 'performance' 
  | 'architecture' 
  | 'testing'
  | 'documentation';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  id: string;
  type: AnalysisType;
  severity: Severity;
  title: string;
  description: string;
  lineStart?: number;
  lineEnd?: number;
  codeSnippet?: string;
  recommendation: string;
  autoFixAvailable: boolean;
  autoFix?: string;
  effortEstimate?: {
    time: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  references?: string[];
}

export interface CodeReviewResponse {
  summary: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    overallScore: number; // 0-100
  };
  findings: Finding[];
  suggestions: {
    documentation?: string[];
    tests?: string[];
    refactoring?: string[];
  };
  metrics: {
    tokensUsed: number;
    analysisTime: number;
    costEstimate?: number;
  };
  timestamp: string;
}

export interface IncrementalReviewRequest {
  originalCode: string;
  modifiedCode: string;
  language?: string;
  filename?: string;
}

