import express from 'express';
import { verifyExercise } from '../controllers/exerciseController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/verify', verifyExercise);

export default router;

