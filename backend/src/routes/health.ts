import { Router } from 'express';
import { checkLLMConnection } from '../lib/localLLM.js';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  try {
    // Check LLM connection
    const aiStatus = await checkLLMConnection();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      ai: {
        connected: aiStatus.connected,
        model: aiStatus.model,
        provider: 'OpenAI',
        error: aiStatus.error
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

