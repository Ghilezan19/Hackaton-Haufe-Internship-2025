import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { reviewRouter } from './routes/review.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { pricingRouter } from './routes/pricing.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectDatabase } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/review', reviewRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Lintora Backend running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for: ${CORS_ORIGIN}`);
  console.log(`🤖 Ollama host: ${process.env.OLLAMA_HOST || 'http://localhost:11434'}`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/lintora'}`);
});

