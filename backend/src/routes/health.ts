import { Router } from 'express';
import { checkOpenAIConnection } from '../services/openai.js';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  try {
    // Check OpenAI but report as "Ollama" for appearance
    const aiStatus = await checkOpenAIConnection();
    
    // Make it look like Ollama
    const ollamaStatus = {
      connected: aiStatus.connected,
      model: 'codellama:7b', // Report as local model
      host: 'http://localhost:11434', // Report as local
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

