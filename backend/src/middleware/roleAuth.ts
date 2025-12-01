import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { User } from '../models/User.js';
import { Classroom } from '../models/Classroom.js';

/**
 * Middleware to check if user is a teacher
 */
export const isTeacher = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Access denied. Teacher role required.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Middleware to check if user is a student
 */
export const isStudent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Access denied. Student role required.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Middleware to check if user is a parent
 */
export const isParent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Access denied. Parent role required.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Middleware to check if teacher has access to a specific student
 */
export const isTeacherOfStudent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Teacher role required' });
    }

    const studentId = req.params.studentId || req.body.studentId;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID required' });
    }

    // Get student's classroom
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    const classroomId = student.studentProfile?.classroomId;
    if (!classroomId) {
      return res.status(403).json({ 
        error: 'Student is not assigned to any classroom' 
      });
    }

    // Check if teacher owns this classroom
    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacherId: req.user._id,
    });

    if (!classroom) {
      return res.status(403).json({ 
        error: 'Access denied. You are not the teacher of this student.' 
      });
    }

    // Add student and classroom to request for easy access
    req.body._student = student;
    req.body._classroom = classroom;
    
    next();
  } catch (error) {
    console.error('Teacher authorization error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Middleware to check if parent has access to a specific student (their child)
 */
export const isParentOfStudent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Parent role required' });
    }

    const studentId = req.params.studentId || req.body.studentId;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID required' });
    }

    // Check if this student is the parent's child
    const parentStudentIds = req.user.parentProfile?.studentIds || [];
    const hasAccess = parentStudentIds.some(
      id => id.toString() === studentId.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied. This student is not your child.' 
      });
    }

    // Get student info
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    req.body._student = student;
    
    next();
  } catch (error) {
    console.error('Parent authorization error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Middleware to check if user can access a classroom
 */
export const canAccessClassroom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const classroomId = req.params.classroomId || req.params.id;
    if (!classroomId) {
      return res.status(400).json({ error: 'Classroom ID required' });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Teacher owns the classroom
    if (req.user.role === 'teacher' && 
        classroom.teacherId.toString() === req.user._id.toString()) {
      req.body._classroom = classroom;
      return next();
    }

    // Student is in the classroom
    if (req.user.role === 'student' && 
        classroom.studentIds.some(id => id.toString() === req.user!._id.toString())) {
      req.body._classroom = classroom;
      return next();
    }

    return res.status(403).json({ 
      error: 'Access denied. You do not have access to this classroom.' 
    });
  } catch (error) {
    console.error('Classroom authorization error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
