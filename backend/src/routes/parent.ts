import { Router } from 'express';
import {
  getChildInfo,
  getChildReviews,
  getChildProgressSummary,
  getChildAISummaries,
  getParentDashboard,
} from '../controllers/parentController.js';
import { authenticate } from '../middleware/auth.js';
import { isParent } from '../middleware/roleAuth.js';

export const parentRouter = Router();

// All routes require authentication and parent role
parentRouter.use(authenticate);
parentRouter.use(isParent);

// Dashboard
parentRouter.get('/dashboard', getParentDashboard);

// Children information
parentRouter.get('/children', getChildInfo);
parentRouter.get('/children/:childId/reviews', getChildReviews);

// AI Progress Summary
parentRouter.get('/children/:childId/summary', getChildProgressSummary);
parentRouter.get('/children/:childId/ai-summaries', getChildAISummaries);
