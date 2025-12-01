import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Classroom } from '../models/Classroom.js';
import { generateTeacherSuggestions } from '../services/aiSuggestionService.js';
import { AISuggestion } from '../models/AISuggestion.js';

/**
 * Get all students for a teacher (from all their classrooms)
 */
export async function getTeacherStudents(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({ error: 'Teacher role required' });
      return;
    }

    // Get all teacher's classrooms
    const classrooms = await Classroom.find({ teacherId: req.user._id });
    
    // Collect all unique student IDs
    const studentIds = [...new Set(classrooms.flatMap(c => c.studentIds))];

    // Get student details
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student',
    }).select('name email studentProfile createdAt');

    // Get recent activity for each student
    const studentsWithActivity = await Promise.all(
      students.map(async (student) => {
        const recentReviews = await Review.find({ userId: student._id })
          .sort({ createdAt: -1 })
          .limit(5);

        const totalReviews = await Review.countDocuments({ userId: student._id });
        
        const avgScore = recentReviews.length > 0
          ? recentReviews.reduce((sum, r) => sum + r.overallScore, 0) / recentReviews.length
          : 0;

        // Find which classroom this student belongs to
        const studentClassroom = classrooms.find(c => 
          c.studentIds.some(id => id.toString() === student._id.toString())
        );

        return {
          id: student._id,
          name: student.name,
          email: student.email,
          grade: student.studentProfile?.grade,
          classroom: studentClassroom ? {
            id: studentClassroom._id,
            name: studentClassroom.name,
            subject: studentClassroom.subject,
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
      students: studentsWithActivity,
      totalStudents: students.length,
    });
  } catch (error) {
    console.error('Get teacher students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
}

/**
 * Get all reviews for a specific student
 */
export async function getStudentReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({ error: 'Teacher role required' });
      return;
    }

    const { studentId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    // Verify teacher has access to this student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const classroomId = student.studentProfile?.classroomId;
    if (!classroomId) {
      res.status(403).json({ error: 'Student not in any classroom' });
      return;
    }

    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacherId: req.user._id,
    });

    if (!classroom) {
      res.status(403).json({ error: 'Access denied to this student' });
      return;
    }

    // Get reviews
    const reviews = await Review.find({ userId: studentId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const totalReviews = await Review.countDocuments({ userId: studentId });

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
      reviews: reviews.map(r => ({
        id: r._id,
        language: r.language,
        filename: r.filename,
        codeSize: r.codeSize,
        findings: r.findings,
        overallScore: r.overallScore,
        findingsDetails: r.findingsDetails,
        createdAt: r.createdAt,
      })),
      totalReviews,
      hasMore: totalReviews > Number(skip) + Number(limit),
    });
  } catch (error) {
    console.error('Get student reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

/**
 * Get all errors/findings for a specific student
 */
export async function getStudentErrors(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({ error: 'Teacher role required' });
      return;
    }

    const { studentId } = req.params;
    const { timeframe = 30 } = req.query; // days

    // Verify access (same as above)
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const classroomId = student.studentProfile?.classroomId;
    if (!classroomId) {
      res.status(403).json({ error: 'Student not in any classroom' });
      return;
    }

    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacherId: req.user._id,
    });

    if (!classroom) {
      res.status(403).json({ error: 'Access denied to this student' });
      return;
    }

    // Calculate timeframe
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(timeframe));

    // Get reviews with errors
    const reviews = await Review.find({
      userId: studentId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    // Collect all findings
    const allFindings = reviews.flatMap(review => 
      (review.findingsDetails || []).map(finding => ({
        ...finding,
        reviewId: review._id,
        reviewDate: review.createdAt,
        language: review.language,
        filename: review.filename,
      }))
    );

    // Group by type and severity
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const errorTimeline: Array<{ date: string; count: number }> = {};

    allFindings.forEach(finding => {
      // By type
      const type = finding.type || 'unknown';
      errorsByType[type] = (errorsByType[type] || 0) + 1;

      // By severity
      const severity = finding.severity || 'unknown';
      errorsBySeverity[severity] = (errorsBySeverity[severity] || 0) + 1;
    });

    res.json({
      student: {
        id: student._id,
        name: student.name,
      },
      timeframe: { start: startDate, end: endDate, days: Number(timeframe) },
      statistics: {
        totalErrors: allFindings.length,
        totalReviews: reviews.length,
        errorsByType,
        errorsBySeverity,
        averageErrorsPerReview: reviews.length > 0 ? allFindings.length / reviews.length : 0,
      },
      recentErrors: allFindings.slice(0, 20), // Latest 20 errors
    });
  } catch (error) {
    console.error('Get student errors error:', error);
    res.status(500).json({ error: 'Failed to fetch student errors' });
  }
}

/**
 * Generate AI teaching suggestions for a student
 */
export async function generateAISuggestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({ error: 'Teacher role required' });
      return;
    }

    const { studentId } = req.params;
    const { timeframe = 30 } = req.body; // days

    // Verify access
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const classroomId = student.studentProfile?.classroomId;
    if (!classroomId) {
      res.status(403).json({ error: 'Student not in any classroom' });
      return;
    }

    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacherId: req.user._id,
    });

    if (!classroom) {
      res.status(403).json({ error: 'Access denied to this student' });
      return;
    }

    // Generate AI suggestions
    const result = await generateTeacherSuggestions(
      studentId,
      req.user._id.toString(),
      timeframe
    );

    res.json({
      student: {
        id: student._id,
        name: student.name,
      },
      aiSuggestion: result.suggestion,
      reviewsAnalyzed: result.reviewsAnalyzed,
    });
  } catch (error) {
    console.error('Generate AI suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get previous AI suggestions for a student
 */
export async function getStudentAISuggestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({ error: 'Teacher role required' });
      return;
    }

    const { studentId } = req.params;

    const suggestions = await AISuggestion.find({
      teacherId: req.user._id,
      studentId,
      type: 'teaching_tips',
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get AI suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch AI suggestions' });
  }
}

/**
 * Get teacher dashboard overview
 */
export async function getTeacherDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({ error: 'Teacher role required' });
      return;
    }

    // Get classrooms
    const classrooms = await Classroom.find({ teacherId: req.user._id });
    const totalStudents = classrooms.reduce((sum, c) => sum + c.studentIds.length, 0);

    // Get all student IDs
    const studentIds = [...new Set(classrooms.flatMap(c => c.studentIds))];

    // Get recent activity
    const recentReviews = await Review.find({
      userId: { $in: studentIds },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    // Get statistics
    const totalReviews = await Review.countDocuments({
      userId: { $in: studentIds },
    });

    // Students needing attention (low scores recently)
    const studentsNeedingAttention = await Review.aggregate([
      {
        $match: {
          userId: { $in: studentIds },
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        },
      },
      {
        $group: {
          _id: '$userId',
          avgScore: { $avg: '$overallScore' },
          reviewCount: { $sum: 1 },
        },
      },
      {
        $match: {
          avgScore: { $lt: 60 }, // Score below 60
        },
      },
      { $sort: { avgScore: 1 } },
      { $limit: 5 },
    ]);

    // Populate student names
    const studentsNeedingAttentionWithNames = await User.find({
      _id: { $in: studentsNeedingAttention.map(s => s._id) },
    }).select('name email');

    const studentsWithScores = studentsNeedingAttention.map(stat => {
      const student = studentsNeedingAttentionWithNames.find(
        s => s._id.toString() === stat._id.toString()
      );
      return {
        id: stat._id,
        name: student?.name || 'Unknown',
        email: student?.email,
        avgScore: Math.round(stat.avgScore),
        reviewCount: stat.reviewCount,
      };
    });

    res.json({
      overview: {
        totalClassrooms: classrooms.length,
        totalStudents,
        totalReviews,
        recentActivityCount: recentReviews.length,
      },
      classrooms: classrooms.map(c => ({
        id: c._id,
        name: c.name,
        subject: c.subject,
        grade: c.grade,
        studentCount: c.studentIds.length,
      })),
      recentActivity: recentReviews,
      studentsNeedingAttention: studentsWithScores,
    });
  } catch (error) {
    console.error('Get teacher dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
