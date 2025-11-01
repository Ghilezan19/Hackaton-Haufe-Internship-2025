import { Router } from 'express';
import { 
  reviewCodeHandler, 
  reviewFileHandler,
  incrementalReviewHandler,
  generateFixHandler,
  generateCompleteFixHandler
} from '../controllers/reviewController.js';
import { upload } from '../middleware/upload.js';
import { authenticate, checkReviewLimit } from '../middleware/auth.js';

export const reviewRouter = Router();

// All review endpoints require authentication and check limits
reviewRouter.use(authenticate);
reviewRouter.use(checkReviewLimit);

// Review code sent as text
reviewRouter.post('/code', reviewCodeHandler);

// Review uploaded file
reviewRouter.post('/file', upload.single('file'), reviewFileHandler);

// Incremental review (only changed code)
reviewRouter.post('/incremental', incrementalReviewHandler);

// Generate auto-fix for a finding
reviewRouter.post('/fix', generateFixHandler);

// Generate complete fixed code
reviewRouter.post('/complete-fix', generateCompleteFixHandler);

