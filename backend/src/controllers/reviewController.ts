import { Request, Response } from 'express';
import { analyzeCode, generateAutoFix } from '../services/codeAnalysis.js';
import { analyzeIncrementalChanges } from '../services/incrementalAnalysis.js';
import { CodeReviewRequest, IncrementalReviewRequest } from '../types/review.js';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import fs from 'fs/promises';

export async function reviewCodeHandler(req: AuthRequest, res: Response) {
  try {
    const request: CodeReviewRequest = req.body;

    if (!request.code) {
      return res.status(400).json({
        error: 'Missing required field: code'
      });
    }

    console.log(`📝 Analyzing ${request.language || 'code'} (${request.code.length} chars)`);
    
    const result = await analyzeCode(request);
    
    console.log(`✅ Analysis complete: ${result.findings.length} findings in ${result.metrics.analysisTime}ms`);
    
    // Track usage if user is authenticated
    if (req.user) {
      await trackReviewUsage(req.user._id.toString(), {
        language: request.language || 'unknown',
        filename: request.filename,
        codeSize: request.code.length,
        findings: result.findings.length,
        overallScore: result.summary.overallScore,
        tokensUsed: result.metrics.tokensUsed,
        analysisTime: result.metrics.analysisTime,
      });

      // Decrement reviews left (unless admin or unlimited)
      if (req.user.role !== 'admin' && req.user.subscription.totalReviewsAllowed !== -1) {
        req.user.subscription.reviewsLeft = Math.max(0, req.user.subscription.reviewsLeft - 1);
        req.user.subscription.reviewsUsed += 1;
        await req.user.save();
      }

      // Add subscription info to response
      (result as any).subscription = {
        plan: req.user.subscription.plan,
        reviewsLeft: req.user.subscription.reviewsLeft,
        reviewsUsed: req.user.subscription.reviewsUsed,
      };
    }
    
    res.json(result);
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({
      error: 'Code review failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function trackReviewUsage(userId: string, data: any) {
  try {
    await Review.create({
      userId,
      ...data,
    });
  } catch (error) {
    console.error('Error tracking review usage:', error);
  }
}

export async function reviewFileHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const code = await fs.readFile(req.file.path, 'utf-8');
    const language = detectLanguage(req.file.originalname);

    const request: CodeReviewRequest = {
      code,
      language,
      filename: req.file.originalname,
      analysisTypes: req.body.analysisTypes ? JSON.parse(req.body.analysisTypes) : undefined,
      guidelines: req.body.guidelines ? JSON.parse(req.body.guidelines) : undefined
    };

    console.log(`📁 Analyzing file: ${req.file.originalname} (${code.length} chars)`);
    
    const result = await analyzeCode(request);
    
    // Clean up uploaded file
    await fs.unlink(req.file.path).catch(err => console.error('Cleanup error:', err));
    
    console.log(`✅ File analysis complete: ${result.findings.length} findings`);
    
    res.json(result);
  } catch (error) {
    console.error('File review error:', error);
    
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    res.status(500).json({
      error: 'File review failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function incrementalReviewHandler(req: AuthRequest, res: Response) {
  try {
    const request: IncrementalReviewRequest = req.body;

    if (!request.originalCode || !request.modifiedCode) {
      return res.status(400).json({
        error: 'Missing required fields: originalCode and modifiedCode'
      });
    }

    console.log('🔄 Performing incremental analysis...');
    
    const result = await analyzeIncrementalChanges(request);
    
    console.log(`✅ Incremental analysis complete`);
    
    res.json(result);
  } catch (error) {
    console.error('Incremental review error:', error);
    res.status(500).json({
      error: 'Incremental review failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function generateFixHandler(req: Request, res: Response) {
  try {
    const { code, finding, language } = req.body;

    if (!code || !finding) {
      return res.status(400).json({
        error: 'Missing required fields: code and finding'
      });
    }

    console.log(`🔧 Generating auto-fix for: ${finding.title}`);
    
    const fix = await generateAutoFix(code, finding, language);
    
    res.json({ fix });
  } catch (error) {
    console.error('Auto-fix error:', error);
    res.status(500).json({
      error: 'Auto-fix generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function generateCompleteFixHandler(req: Request, res: Response) {
  try {
    const { code, language, findings } = req.body;

    if (!code || !language || !findings) {
      return res.status(400).json({
        error: 'Missing required fields: code, language, and findings'
      });
    }

    console.log(`✨ Generating complete fixed code for ${findings.length} issues...`);
    
    // Generate complete fixed code using OpenAI
    const { generateWithOpenAI } = await import('../services/openai.js');
    
    const systemPrompt = `Ești un expert programator. Trebuie să corectezi TOATE problemele din cod și să returnezi codul COMPLET și CORECT.

IMPORTANT:
- Returnează DOAR CODUL, fără explicații
- Păstrează formatarea și indentarea
- Corectează TOATE problemele menționate
- Nu adăuga comentarii extra`;

    const issuesList = findings.map((f: any, i: number) => 
      `${i + 1}. Linia ${f.lineStart || '?'}: ${f.description || f.title}`
    ).join('\n');

    const userPrompt = `Corectează următoarele probleme în codul ${language}:

${issuesList}

Cod original:
\`\`\`${language}
${code}
\`\`\`

Returnează codul COMPLET și CORECT (doar cod, fără markdown):`;

    const result = await generateWithOpenAI(userPrompt, systemPrompt);
    
    // Clean up the response - remove markdown if present
    let fixedCode = result.response.trim();
    fixedCode = fixedCode.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');
    
    console.log(`✅ Complete fix generated successfully`);
    
    res.json({ fixedCode });
  } catch (error) {
    console.error('Complete fix error:', error);
    res.status(500).json({
      error: 'Complete fix generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala'
  };
  
  return languageMap[ext] || ext;
}

