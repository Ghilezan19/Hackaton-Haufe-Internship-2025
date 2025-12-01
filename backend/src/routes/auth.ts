import { Router } from 'express';
import { 
  signup, 
  login, 
  getProfile, 
  upgradePlan, 
  createAdmin,
  linkParentToStudent 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

export const authRouter = Router();

// Public routes
authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/admin/create', createAdmin); // Protected by admin secret

// Protected routes
authRouter.get('/profile', authenticate, getProfile);
authRouter.post('/upgrade', authenticate, upgradePlan);
authRouter.post('/link-parent', authenticate, linkParentToStudent);


