// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { reviewRouter } from './routes/review.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { pricingRouter } from './routes/pricing.js';
import exercisesRouter from './routes/exercises.js';
import { classroomRouter } from './routes/classroom.js';
import { teacherRouter } from './routes/teacher.js';
import { parentRouter } from './routes/parent.js';
import aiMentorRouter from './routes/aiMentor.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectDatabase } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8083';

// Debug: Check if OpenAI key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY not found in environment!');
  console.error('Make sure .env file exists in backend/ directory');
} else {
  console.log('✅ OpenAI API Key loaded:', process.env.OPENAI_API_KEY.substring(0, 20) + '...');
}

// Connect to MongoDB
connectDatabase();

// Middleware
// Allow multiple origins for development
const allowedOrigins = [
  'http://localhost:8083',
  'http://localhost:8085',
  'http://localhost:5173'
];
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/review', reviewRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/classrooms', classroomRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/parent', parentRouter);
app.use('/api/ai-mentor', aiMentorRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 ScoalaDeAI Backend running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for: ${CORS_ORIGIN}`);
  console.log(`🤖 AI Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/scoaladeai'}`);
});

