import { Router } from 'express';
import { checkLLMConnection } from '../lib/localLLM.js';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  try {
    // Check LLM connection
    const aiStatus = await checkLLMConnection();
    
    // Make it look like Ollama
    const ollamaStatus = {
      connected: aiStatus.connected,
      model: aiStatus.model, // Report the model from .env (llama3.2)
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      error: aiStatus.error
    };
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      ollama: ollamaStatus
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

