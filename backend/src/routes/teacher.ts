import { Router } from 'express';
import {
  getTeacherStudents,
  getStudentReviews,
  getStudentErrors,
  generateAISuggestions,
  getStudentAISuggestions,
  getTeacherDashboard,
} from '../controllers/teacherController.js';
import { authenticate } from '../middleware/auth.js';
import { isTeacher } from '../middleware/roleAuth.js';

export const teacherRouter = Router();

// All routes require authentication and teacher role
teacherRouter.use(authenticate);
teacherRouter.use(isTeacher);

// Dashboard
teacherRouter.get('/dashboard', getTeacherDashboard);

// Students management
teacherRouter.get('/students', getTeacherStudents);
teacherRouter.get('/students/:studentId/reviews', getStudentReviews);
teacherRouter.get('/students/:studentId/errors', getStudentErrors);

// AI Suggestions
teacherRouter.post('/students/:studentId/ai-suggestions', generateAISuggestions);
teacherRouter.get('/students/:studentId/ai-suggestions', getStudentAISuggestions);
