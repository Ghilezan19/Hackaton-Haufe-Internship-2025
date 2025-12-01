import { generateWithOpenAI, checkOpenAIConnection } from '../services/openai.js';

/**
 * Wrapper function for LLM generation using OpenAI
 * This acts as a unified interface for code analysis
 */
export async function generateWithLLM(
  prompt: string,
  systemPrompt?: string
): Promise<{ response: string; tokensUsed: number }> {
  return generateWithOpenAI(prompt, systemPrompt);
}

/**
 * Check LLM connection status
 */
export async function checkLLMConnection(): Promise<{
  connected: boolean;
  model: string;
  error?: string;
}> {
  return checkOpenAIConnection();
}
