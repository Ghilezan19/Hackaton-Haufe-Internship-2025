import { generateWithOpenAI } from './openai.js';
import { 
  AnalysisType, 
  Finding, 
  CodeReviewRequest, 
  CodeReviewResponse,
  Severity 
} from '../types/review.js';
import { v4 as uuidv4 } from 'uuid';

// System prompts for different analysis types
const ANALYSIS_PROMPTS: Record<AnalysisType, string> = {
  security: `You are a security expert. Analyze the code for:
- SQL injection, XSS, CSRF vulnerabilities
- Authentication and authorization issues
- Exposed secrets or credentials
- Insecure cryptography
- Input validation issues
- File handling vulnerabilities
Provide specific line numbers and security recommendations.`,

  quality: `You are a code quality expert. Analyze the code for:
- Code smells and anti-patterns
- Readability and maintainability
- Naming conventions
- Code duplication
- Complexity issues
- Adherence to SOLID principles
Provide specific improvements with examples.`,

  performance: `You are a performance optimization expert. Analyze the code for:
- Algorithmic complexity issues (O(n²) or worse)
- Memory leaks
- Inefficient loops or iterations
- Unnecessary computations
- Database query optimization
- Resource management
Suggest optimizations with performance impact estimates.`,

  architecture: `You are a software architecture expert. Analyze the code for:
- Design patterns usage
- Separation of concerns
- Dependency management
- Coupling and cohesion
- Scalability considerations
- Modularity and reusability
Provide architectural recommendations.`,

  testing: `You are a testing expert. Analyze the code for:
- Missing unit tests
- Edge cases not covered
- Test coverage gaps
- Critical paths without tests
- Integration test requirements
Suggest specific test cases to add.`,

  documentation: `You are a documentation expert. Analyze the code for:
- Missing or inadequate comments
- Unclear function/class descriptions
- Missing API documentation
- Complex logic without explanation
- Outdated comments
Suggest documentation improvements.`
};

function parseAnalysisResponse(response: string, type: AnalysisType): Finding[] {
  const findings: Finding[] = [];
  
  // Improved parser that handles various GPT response formats
  const lines = response.split('\n');
  let currentFinding: Partial<Finding> | null = null;
  let collectingDescription = false;
  let collectingRecommendation = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // New finding starts with ##
    if (trimmedLine.match(/^##\s+/)) {
      // Save previous finding
      if (currentFinding && currentFinding.title) {
        const effortEstimate = estimateEffort(currentFinding.severity || 'medium', type);
        findings.push({
          id: uuidv4(),
          type,
          severity: currentFinding.severity || 'medium',
          title: currentFinding.title,
          description: currentFinding.description || currentFinding.title,
          recommendation: currentFinding.recommendation || 'Revizuiește și corectează.',
          autoFixAvailable: false,
          effortEstimate,
          ...currentFinding
        } as Finding);
      }
      
      currentFinding = {
        title: trimmedLine.replace(/^##\s+/, '').trim()
      };
      collectingDescription = false;
      collectingRecommendation = false;
    } 
    // Severity
    else if (trimmedLine.match(/severity:/i) || trimmedLine.match(/severitate:/i)) {
      const severityText = trimmedLine.split(':')[1]?.trim().toLowerCase();
      const severityMap: Record<string, Severity> = {
        'critical': 'critical',
        'critic': 'critical',
        'high': 'high',
        'înalt': 'high',
        'mare': 'high',
        'medium': 'medium',
        'mediu': 'medium',
        'low': 'low',
        'scăzut': 'low',
        'info': 'info'
      };
      if (currentFinding && severityText) {
        currentFinding.severity = severityMap[severityText] || 'medium';
      }
    }
    // Line number
    else if (trimmedLine.match(/line/i) || trimmedLine.match(/linia/i)) {
      const matches = trimmedLine.match(/\d+/g);
      if (matches && currentFinding) {
        currentFinding.lineStart = parseInt(matches[0]);
        currentFinding.lineEnd = matches[1] ? parseInt(matches[1]) : currentFinding.lineStart;
      }
    }
    // Problem/Description
    else if (trimmedLine.match(/^(problem|problema|description|descriere):/i)) {
      if (currentFinding) {
        currentFinding.description = trimmedLine.split(':').slice(1).join(':').trim();
        collectingDescription = true;
        collectingRecommendation = false;
      }
    }
    // Fix/Recommendation
    else if (trimmedLine.match(/^(fix|rezolvare|recommendation|recomandare|💡):/i)) {
      if (currentFinding) {
        const content = trimmedLine.split(':').slice(1).join(':').trim();
        currentFinding.recommendation = content.replace(/^💡\s*/, '');
        collectingRecommendation = true;
        collectingDescription = false;
      }
    }
    // Continue collecting multi-line description or recommendation
    else if (trimmedLine && currentFinding) {
      if (collectingDescription && currentFinding.description) {
        currentFinding.description += ' ' + trimmedLine;
      } else if (collectingRecommendation && currentFinding.recommendation) {
        currentFinding.recommendation += ' ' + trimmedLine;
      } else if (!currentFinding.description && trimmedLine.length > 10) {
        // First substantial line after title becomes description
        currentFinding.description = trimmedLine;
        collectingDescription = true;
      }
    }
  }
  
  // Add last finding
  if (currentFinding && currentFinding.title) {
    const effortEstimate = estimateEffort(currentFinding.severity || 'medium', type);
    findings.push({
      id: uuidv4(),
      type,
      severity: currentFinding.severity || 'medium',
      title: currentFinding.title,
      description: currentFinding.description || currentFinding.title,
      recommendation: currentFinding.recommendation || 'Revizuiește și corectează.',
      autoFixAvailable: false,
      effortEstimate,
      ...currentFinding
    } as Finding);
  }
  
  return findings;
}

function estimateEffort(
  severity: Severity,
  type: AnalysisType
): { time: string; difficulty: 'easy' | 'medium' | 'hard' } {
  // Effort estimation based on severity and type
  const effortMatrix: Record<Severity, Record<AnalysisType, { time: string; difficulty: 'easy' | 'medium' | 'hard' }>> = {
    critical: {
      security: { time: '2-4 hours', difficulty: 'hard' },
      quality: { time: '1-2 hours', difficulty: 'medium' },
      performance: { time: '2-3 hours', difficulty: 'hard' },
      architecture: { time: '4-8 hours', difficulty: 'hard' },
      testing: { time: '1-2 hours', difficulty: 'medium' },
      documentation: { time: '30 minutes', difficulty: 'easy' }
    },
    high: {
      security: { time: '1-2 hours', difficulty: 'medium' },
      quality: { time: '45-90 minutes', difficulty: 'medium' },
      performance: { time: '1-2 hours', difficulty: 'medium' },
      architecture: { time: '2-4 hours', difficulty: 'hard' },
      testing: { time: '45 minutes', difficulty: 'medium' },
      documentation: { time: '20 minutes', difficulty: 'easy' }
    },
    medium: {
      security: { time: '30-60 minutes', difficulty: 'medium' },
      quality: { time: '30 minutes', difficulty: 'easy' },
      performance: { time: '45 minutes', difficulty: 'medium' },
      architecture: { time: '1-2 hours', difficulty: 'medium' },
      testing: { time: '30 minutes', difficulty: 'easy' },
      documentation: { time: '15 minutes', difficulty: 'easy' }
    },
    low: {
      security: { time: '15-30 minutes', difficulty: 'easy' },
      quality: { time: '15 minutes', difficulty: 'easy' },
      performance: { time: '20 minutes', difficulty: 'easy' },
      architecture: { time: '30 minutes', difficulty: 'easy' },
      testing: { time: '20 minutes', difficulty: 'easy' },
      documentation: { time: '10 minutes', difficulty: 'easy' }
    },
    info: {
      security: { time: '5 minutes', difficulty: 'easy' },
      quality: { time: '5 minutes', difficulty: 'easy' },
      performance: { time: '5 minutes', difficulty: 'easy' },
      architecture: { time: '10 minutes', difficulty: 'easy' },
      testing: { time: '10 minutes', difficulty: 'easy' },
      documentation: { time: '5 minutes', difficulty: 'easy' }
    }
  };

  return effortMatrix[severity][type];
}

export async function analyzeCode(
  request: CodeReviewRequest
): Promise<CodeReviewResponse> {
  const startTime = Date.now();
  let totalTokens = 0;
  const allFindings: Finding[] = [];
  
  // Default to all analysis types if not specified
  const analysisTypes: AnalysisType[] = request.analysisTypes || [
    'security',
    'quality',
    'performance',
    'architecture',
    'testing',
    'documentation'
  ];

  // OPTIMIZED: Single combined request for SPEED with ACCURATE Romanian explanations
  try {
    const systemPrompt = `Ești un expert code reviewer. 

IMPORTANT:
1. Citește codul CU ATENȚIE și verifică ce EXISTĂ deja înainte să spui că lipsește
2. Găsește doar PROBLEME REALE, nu inventa
3. Dacă codul e corect, SPUNE că e corect, nu inventa probleme
4. Folosește română simplă

Exemple de ce să NU faci:
❌ "Lipsește #include" când există deja în cod
❌ "Nu ai return" când există return 0;
❌ Probleme inventate

Exemple bune:
✅ "Ai pus = în loc de =="
✅ "Variabila x nu e inițializată"
✅ "Lipsește ; la sfârșitul liniei"`;

    // Add line numbers to code for accurate references
    const codeLines = request.code.split('\n');
    const numberedCode = codeLines
      .map((line, index) => `${index + 1}| ${line}`)
      .join('\n');

    const userPrompt = `Analizează ATENT codul ${request.language || ''} (max 3 probleme REALE):

Codul cu numere de linie (FOLOSEȘTE ACESTE NUMERE EXACTE):
\`\`\`${request.language || ''}
${numberedCode}
\`\`\`

VERIFICĂ CODUL și găsește doar probleme REALE:
## [Problema REALĂ]
Line: [numărul EXACT din stânga, ex: 5]
Severity: critical/high/medium/low
Problem: [ce E GREȘIT - 1 propoziție]
Fix: [cum să rezolve - 1 propoziție]

IMPORTANT: Folosește numerele de linie din stânga (1|, 2|, 3|, etc.)!`;

    const result = await generateWithOpenAI(userPrompt, systemPrompt);
    totalTokens += result.tokensUsed;
    
    // Parse findings (will work with all types)
    const findings = parseAnalysisResponse(result.response, 'quality');
    allFindings.push(...findings);
  } catch (error) {
    console.error('Error analyzing code:', error);
  }

  // Calculate summary statistics
  const summary = {
    totalFindings: allFindings.length,
    critical: allFindings.filter(f => f.severity === 'critical').length,
    high: allFindings.filter(f => f.severity === 'high').length,
    medium: allFindings.filter(f => f.severity === 'medium').length,
    low: allFindings.filter(f => f.severity === 'low').length,
    info: allFindings.filter(f => f.severity === 'info').length,
    overallScore: calculateScore(allFindings)
  };

  const analysisTime = Date.now() - startTime;

  return {
    summary,
    findings: allFindings,
    suggestions: {
      documentation: allFindings
        .filter(f => f.type === 'documentation')
        .map(f => f.recommendation),
      tests: allFindings
        .filter(f => f.type === 'testing')
        .map(f => f.recommendation),
      refactoring: allFindings
        .filter(f => f.type === 'quality' || f.type === 'architecture')
        .map(f => f.recommendation)
    },
    metrics: {
      tokensUsed: totalTokens,
      analysisTime,
      costEstimate: totalTokens * 0.00001 // Rough estimate
    },
    timestamp: new Date().toISOString()
  };
}

function calculateScore(findings: Finding[]): number {
  const weights = {
    critical: 20,
    high: 10,
    medium: 5,
    low: 2,
    info: 0
  };
  
  const totalPenalty = findings.reduce((sum, f) => sum + weights[f.severity], 0);
  const maxPenalty = 100; // Maximum reasonable penalty
  
  return Math.max(0, 100 - Math.min(totalPenalty, maxPenalty));
}

export async function generateAutoFix(
  code: string,
  finding: Finding,
  language?: string
): Promise<string> {
  const prompt = `
Given this code issue:
**${finding.title}**
${finding.description}

In this ${language || 'code'}:
\`\`\`
${code}
\`\`\`

Provide ONLY the fixed code snippet without explanation.
`;

  const result = await generateWithOpenAI(
    prompt,
    'You are a code fixing expert. Provide only corrected code.'
  );

  return result.response.trim();
}

