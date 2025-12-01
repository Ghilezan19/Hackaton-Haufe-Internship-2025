import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Classroom } from '../models/Classroom.js';
import { generateParentSummary } from '../services/aiSuggestionService.js';
import { AISuggestion } from '../models/AISuggestion.js';

/**
 * Get parent's child information
 */
export async function getChildInfo(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'parent') {
      res.status(403).json({ error: 'Parent role required' });
      return;
    }

    const studentIds = req.user.parentProfile?.studentIds || [];
    
    if (studentIds.length === 0) {
      res.json({
        message: 'No children linked to your account',
        children: [],
      });
      return;
    }

    // Get children details
    const children = await User.find({
      _id: { $in: studentIds },
      role: 'student',
    }).select('name email studentProfile createdAt');

    // Get details for each child
    const childrenWithDetails = await Promise.all(
      children.map(async (child) => {
        // Get classroom info
        let classroom = null;
        if (child.studentProfile?.classroomId) {
          classroom = await Classroom.findById(child.studentProfile.classroomId)
            .select('name subject grade schoolYear')
            .populate('teacherId', 'name email');
        }

        // Get recent activity
        const totalReviews = await Review.countDocuments({ userId: child._id });
        const recentReviews = await Review.find({ userId: child._id })
          .sort({ createdAt: -1 })
          .limit(5);

        const avgScore = recentReviews.length > 0
          ? recentReviews.reduce((sum, r) => sum + r.overallScore, 0) / recentReviews.length
          : 0;

        return {
          id: child._id,
          name: child.name,
          email: child.email,
          grade: child.studentProfile?.grade,
          studentCode: child.studentProfile?.studentCode,
          classroom: classroom ? {
            id: classroom._id,
            name: classroom.name,
            subject: classroom.subject,
            grade: classroom.grade,
            teacher: classroom.teacherId,
          } : null,
          activity: {
            totalReviews,
            recentReviewsCount: recentReviews.length,
            averageScore: Math.round(avgScore),
            lastActivity: recentReviews[0]?.createdAt,
          },
        };
      })
    );

    res.json({
      children: childrenWithDetails,
      totalChildren: children.length,
    });
  } catch (error) {
    console.error('Get child info error:', error);
    res.status(500).json({ error: 'Failed to fetch child information' });
  }
}

/**
 * Get child's reviews (parent view - less technical details)
 */
export async function getChildReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'parent') {
      res.status(403).json({ error: 'Parent role required' });
      return;
    }

    const { childId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    // Verify parent has access to this child
    const studentIds = req.user.parentProfile?.studentIds || [];
    const hasAccess = studentIds.some(id => id.toString() === childId);

    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied. This student is not your child.' });
      return;
    }

    const child = await User.findById(childId).select('name email');
    if (!child) {
      res.status(404).json({ error: 'Child not found' });
      return;
    }

    // Get reviews (simplified for parents)
    const reviews = await Review.find({ userId: childId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const totalReviews = await Review.countDocuments({ userId: childId });

    // Simplify for parents - less technical jargon
    const simplifiedReviews = reviews.map(r => ({
      id: r._id,
      date: r.createdAt,
      language: r.language,
      score: r.overallScore,
      issuesFound: r.findings,
      summary: r.overallScore >= 80 ? 'Excellent work!' :
               r.overallScore >= 60 ? 'Good job, some improvements needed' :
               r.overallScore >= 40 ? 'Needs practice in some areas' :
               'Encourage more practice',
      // Group findings by severity (simplified)
      issues: {
        critical: r.findingsDetails?.filter(f => f.severity === 'critical').length || 0,
        important: r.findingsDetails?.filter(f => f.severity === 'high').length || 0,
        minor: r.findingsDetails?.filter(f => ['medium', 'low'].includes(f.severity || '')).length || 0,
      },
    }));

    res.json({
      child: {
        id: child._id,
        name: child.name,
      },
      reviews: simplifiedReviews,
      totalReviews,
      hasMore: totalReviews > Number(skip) + Number(limit),
    });
  } catch (error) {
    console.error('Get child reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

/**
 * Generate AI progress summary for parent
 */
export async function getChildProgressSummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'parent') {
      res.status(403).json({ error: 'Parent role required' });
      return;
    }

    const { childId } = req.params;
    const { timeframe = 30 } = req.query; // days

    // Verify access
    const studentIds = req.user.parentProfile?.studentIds || [];
    const hasAccess = studentIds.some(id => id.toString() === childId);

    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied. This student is not your child.' });
      return;
    }

    const child = await User.findById(childId).select('name email');
    if (!child) {
      res.status(404).json({ error: 'Child not found' });
      return;
    }

    // Generate AI summary
    const result = await generateParentSummary(childId, Number(timeframe));

    res.json({
      child: {
        id: child._id,
        name: child.name,
      },
      summary: result.summary,
      reviewsAnalyzed: result.reviewsAnalyzed,
    });
  } catch (error) {
    console.error('Generate parent summary error:', error);
    res.status(500).json({ 
      error: 'Failed to generate progress summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get previous AI summaries for a child
 */
export async function getChildAISummaries(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'parent') {
      res.status(403).json({ error: 'Parent role required' });
      return;
    }

    const { childId } = req.params;

    // Verify access
    const studentIds = req.user.parentProfile?.studentIds || [];
    const hasAccess = studentIds.some(id => id.toString() === childId);

    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const summaries = await AISuggestion.find({
      studentId: childId,
      type: 'parent_summary',
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ summaries });
  } catch (error) {
    console.error('Get AI summaries error:', error);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
}

/**
 * Get parent dashboard overview
 */
export async function getParentDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'parent') {
      res.status(403).json({ error: 'Parent role required' });
      return;
    }

    const studentIds = req.user.parentProfile?.studentIds || [];

    if (studentIds.length === 0) {
      res.json({
        message: 'No children linked yet',
        overview: { totalChildren: 0 },
        children: [],
      });
      return;
    }

    // Get children with recent activity
    const children = await User.find({
      _id: { $in: studentIds },
      role: 'student',
    }).select('name email studentProfile');

    const childrenWithActivity = await Promise.all(
      children.map(async (child) => {
        // Get recent reviews (last 7 days)
        const recentReviews = await Review.find({
          userId: child._id,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }).sort({ createdAt: -1 });

        const avgScore = recentReviews.length > 0
          ? recentReviews.reduce((sum, r) => sum + r.overallScore, 0) / recentReviews.length
          : 0;

        // Get classroom
        let classroom = null;
        if (child.studentProfile?.classroomId) {
          classroom = await Classroom.findById(child.studentProfile.classroomId)
            .select('name subject');
        }

        return {
          id: child._id,
          name: child.name,
          email: child.email,
          grade: child.studentProfile?.grade,
          classroom: classroom ? {
            name: classroom.name,
            subject: classroom.subject,
          } : null,
          recentActivity: {
            reviewsThisWeek: recentReviews.length,
            averageScore: Math.round(avgScore),
            trend: avgScore >= 70 ? 'doing_well' : avgScore >= 50 ? 'needs_practice' : 'needs_attention',
          },
        };
      })
    );

    res.json({
      overview: {
        totalChildren: children.length,
      },
      children: childrenWithActivity,
    });
  } catch (error) {
    console.error('Get parent dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
