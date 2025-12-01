import { generateWithOpenAI } from './openai.js';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';
import { AISuggestion } from '../models/AISuggestion.js';
import mongoose from 'mongoose';

/**
 * Generate AI teaching suggestions for a teacher about a specific student
 * Analyzes student's errors and provides actionable teaching tips
 */
export async function generateTeacherSuggestions(
  studentId: string,
  teacherId: string,
  timeframeDays: number = 30
): Promise<{
  suggestion: any;
  reviewsAnalyzed: number;
}> {
  try {
    // Get student info
    const student = await User.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Calculate timeframe
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);

    // Get all reviews for this student in timeframe
    const reviews = await Review.find({
      userId: studentId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return {
        suggestion: {
          summary: `${student.name} hasn't submitted any code for review in the last ${timeframeDays} days.`,
          suggestions: ['Encourage the student to submit code for review regularly.'],
          strengths: [],
          areasForImprovement: ['Needs to start practicing coding.'],
          recommendedExercises: [],
        },
        reviewsAnalyzed: 0,
      };
    }

    // Analyze all findings
    const allFindings = reviews.flatMap(r => r.findingsDetails || []);
    const errorsByType = groupErrorsByType(allFindings);
    const errorsBySeverity = groupErrorsBySeverity(allFindings);
    
    // Calculate progress
    const recentReviews = reviews.slice(0, Math.floor(reviews.length / 2));
    const olderReviews = reviews.slice(Math.floor(reviews.length / 2));
    const recentAvgScore = calculateAverageScore(recentReviews);
    const olderAvgScore = calculateAverageScore(olderReviews);
    const isImproving = recentAvgScore > olderAvgScore;

    // Prepare data for GPT
    const systemPrompt = `You are an experienced computer science teacher and mentor. 
Analyze a student's coding errors and provide actionable teaching suggestions.
Be specific, encouraging, and focus on patterns rather than individual mistakes.`;

    const userPrompt = `Student: ${student.name}
Grade: ${student.studentProfile?.grade || 'Unknown'}
Analysis Period: Last ${timeframeDays} days
Total Code Reviews: ${reviews.length}

ERROR STATISTICS:
${Object.entries(errorsByType).map(([type, count]) => `- ${type}: ${count} issues`).join('\n')}

SEVERITY BREAKDOWN:
${Object.entries(errorsBySeverity).map(([sev, count]) => `- ${sev}: ${count} issues`).join('\n')}

PROGRESS TREND:
- Recent average score: ${recentAvgScore.toFixed(1)}/100
- Earlier average score: ${olderAvgScore.toFixed(1)}/100
- Trend: ${isImproving ? 'Improving ✓' : 'Needs attention'}

Most Common Errors (top 5):
${getMostCommonErrors(allFindings).slice(0, 5).map((e, i) => `${i+1}. ${e.title} (${e.count}x)`).join('\n')}

As a teacher, provide:
1. A brief summary of the student's coding journey
2. 3-5 specific teaching suggestions to help them improve
3. 2-3 strengths to encourage
4. 2-3 key areas for improvement
5. 2-3 recommended exercises or topics to practice

Format your response as JSON:
{
  "summary": "brief overview",
  "suggestions": ["tip 1", "tip 2", ...],
  "strengths": ["strength 1", ...],
  "areasForImprovement": ["area 1", ...],
  "recommendedExercises": ["exercise 1", ...]
}`;

    const result = await generateWithOpenAI(userPrompt, systemPrompt);
    
    // Parse JSON response
    let parsedContent;
    try {
      // Try to extract JSON from response
      const jsonMatch = result.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback if parsing fails
      parsedContent = {
        summary: result.response.substring(0, 500),
        suggestions: ['Review the detailed analysis above.'],
        strengths: ['Shows effort in submitting code for review.'],
        areasForImprovement: ['Continue practicing regularly.'],
        recommendedExercises: ['Practice coding exercises daily.'],
      };
    }

    // Save suggestion to database
    const aiSuggestion = await AISuggestion.create({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      studentId: new mongoose.Types.ObjectId(studentId),
      type: 'teaching_tips',
      content: parsedContent,
      basedOnReviews: reviews.map(r => r._id),
      timeframe: { start: startDate, end: endDate },
    });

    return {
      suggestion: {
        id: aiSuggestion._id,
        ...parsedContent,
        reviewsAnalyzed: reviews.length,
        timeframe: { start: startDate, end: endDate },
      },
      reviewsAnalyzed: reviews.length,
    };
  } catch (error) {
    console.error('Generate teacher suggestions error:', error);
    throw error;
  }
}

/**
 * Generate AI summary for parents about their child's progress
 * Written in friendly, non-technical language
 */
export async function generateParentSummary(
  studentId: string,
  timeframeDays: number = 30
): Promise<{
  summary: any;
  reviewsAnalyzed: number;
}> {
  try {
    // Get student info
    const student = await User.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Calculate timeframe
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);

    // Get all reviews for this student in timeframe
    const reviews = await Review.find({
      userId: studentId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return {
        summary: {
          summary: `${student.name} hasn't submitted any coding assignments in the last ${timeframeDays} days. Encourage them to practice coding regularly!`,
          strengths: [],
          areasForImprovement: ['Needs to submit code for review'],
          overallProgress: 'No activity yet',
        },
        reviewsAnalyzed: 0,
      };
    }

    // Calculate statistics
    const avgScore = calculateAverageScore(reviews);
    const allFindings = reviews.flatMap(r => r.findingsDetails || []);
    const languages = [...new Set(reviews.map(r => r.language))];

    // Prepare friendly prompt for parents
    const systemPrompt = `You are a friendly teacher talking to a parent about their child's progress in coding.
Use simple, non-technical language. Be encouraging and positive while being honest about areas for improvement.
Avoid technical jargon - explain things in plain English that any parent would understand.`;

    const userPrompt = `Child's Name: ${student.name}
Grade: ${student.studentProfile?.grade || 'Unknown'}
Period: Last ${timeframeDays} days

ACTIVITY SUMMARY:
- Total coding assignments reviewed: ${reviews.length}
- Programming languages practiced: ${languages.join(', ')}
- Average quality score: ${avgScore.toFixed(1)}/100
- Total issues found: ${allFindings.length}

The child has been working on coding and their work has been analyzed automatically.
Please provide a parent-friendly summary with:
1. Overall progress summary (2-3 sentences, encouraging tone)
2. 2-3 strengths (what they're doing well)
3. 2-3 areas where they could improve (constructive, not negative)
4. General advice for the parent (how to support their child's learning)

Format as JSON:
{
  "summary": "friendly overview for parents",
  "strengths": ["strength 1", "strength 2"],
  "areasForImprovement": ["area 1", "area 2"],
  "overallProgress": "Excellent/Good/Fair/Needs Improvement",
  "parentAdvice": "advice for supporting the child"
}`;

    const result = await generateWithOpenAI(userPrompt, systemPrompt);
    
    // Parse JSON response
    let parsedContent;
    try {
      const jsonMatch = result.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      parsedContent = {
        summary: `${student.name} has been working on coding! They've completed ${reviews.length} assignments with an average score of ${avgScore.toFixed(1)}/100.`,
        strengths: ['Shows dedication by practicing regularly'],
        areasForImprovement: ['Continue practicing to improve'],
        overallProgress: avgScore >= 70 ? 'Good' : 'Fair',
        parentAdvice: 'Encourage them to keep practicing and celebrate their progress!',
      };
    }

    // Save suggestion to database
    const aiSuggestion = await AISuggestion.create({
      studentId: new mongoose.Types.ObjectId(studentId),
      type: 'parent_summary',
      content: parsedContent,
      basedOnReviews: reviews.map(r => r._id),
      timeframe: { start: startDate, end: endDate },
    });

    return {
      summary: {
        id: aiSuggestion._id,
        ...parsedContent,
        statistics: {
          totalReviews: reviews.length,
          averageScore: avgScore,
          languagesUsed: languages,
        },
        timeframe: { start: startDate, end: endDate },
      },
      reviewsAnalyzed: reviews.length,
    };
  } catch (error) {
    console.error('Generate parent summary error:', error);
    throw error;
  }
}

// Helper functions
function groupErrorsByType(findings: any[]): Record<string, number> {
  const groups: Record<string, number> = {};
  findings.forEach(f => {
    const type = f.type || 'unknown';
    groups[type] = (groups[type] || 0) + 1;
  });
  return groups;
}

function groupErrorsBySeverity(findings: any[]): Record<string, number> {
  const groups: Record<string, number> = {};
  findings.forEach(f => {
    const severity = f.severity || 'unknown';
    groups[severity] = (groups[severity] || 0) + 1;
  });
  return groups;
}

function getMostCommonErrors(findings: any[]): Array<{ title: string; count: number }> {
  const errorCounts: Record<string, number> = {};
  findings.forEach(f => {
    const title = f.title || 'Unknown error';
    errorCounts[title] = (errorCounts[title] || 0) + 1;
  });
  
  return Object.entries(errorCounts)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count);
}

function calculateAverageScore(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.overallScore || 0), 0);
  return sum / reviews.length;
}
