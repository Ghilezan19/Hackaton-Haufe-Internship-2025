import { Router } from 'express';
import {
  createClassroom,
  getTeacherClassrooms,
  getClassroomDetails,
  joinClassroom,
  removeStudentFromClassroom,
  deleteClassroom,
} from '../controllers/classroomController.js';
import { authenticate } from '../middleware/auth.js';
import { isTeacher, isStudent, canAccessClassroom } from '../middleware/roleAuth.js';

export const classroomRouter = Router();

// All routes require authentication
classroomRouter.use(authenticate);

// Teacher routes
classroomRouter.post('/', isTeacher, createClassroom);
classroomRouter.get('/my-classrooms', isTeacher, getTeacherClassrooms);
classroomRouter.delete('/:id', isTeacher, deleteClassroom);
classroomRouter.delete('/:id/students/:studentId', isTeacher, removeStudentFromClassroom);

// Student routes
classroomRouter.post('/join', isStudent, joinClassroom);

// Shared routes (teacher or student)
classroomRouter.get('/:id', canAccessClassroom, getClassroomDetails);
