import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import {
  transcribeAudio,
  chatWithMentor,
  generateSpeech,
  createAvatarVideo,
  getConversationHistory,
  getConversation,
  deleteConversation,
} from '../controllers/aiMentorController';

const router = express.Router();

// Configurare multer pentru upload audio
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Protected routes (require authentication)
router.post('/transcribe', authenticate, upload.single('audio'), transcribeAudio);
router.post('/chat', authenticate, chatWithMentor);
router.post('/speech', generateSpeech); // Public pentru simplitate
router.post('/avatar', createAvatarVideo); // Public pentru simplitate
router.get('/conversations', authenticate, getConversationHistory);
router.get('/conversations/:id', authenticate, getConversation);
router.delete('/conversations/:id', authenticate, deleteConversation);

export default router;
