import { Ollama } from 'ollama';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2:3b';

export const ollama = new Ollama({ host: OLLAMA_HOST });

export async function checkOllamaConnection(): Promise<{
  connected: boolean;
  model: string;
  host: string;
  error?: string;
}> {
  try {
    const models = await ollama.list();
    const modelExists = models.models.some((m) => m.name.includes(OLLAMA_MODEL.split(':')[0]));
    
    return {
      connected: true,
      model: OLLAMA_MODEL,
      host: OLLAMA_HOST,
      error: modelExists ? undefined : `Model ${OLLAMA_MODEL} not found. Please pull it first.`
    };
  } catch (error) {
    return {
      connected: false,
      model: OLLAMA_MODEL,
      host: OLLAMA_HOST,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function generateWithOllama(
  prompt: string,
  systemPrompt?: string
): Promise<{ response: string; tokensUsed: number }> {
  try {
    let fullResponse = '';
    let totalTokens = 0;

    const stream = await ollama.generate({
      model: OLLAMA_MODEL,
      prompt,
      system: systemPrompt,
      stream: true,
    });

    for await (const chunk of stream) {
      fullResponse += chunk.response;
      if (chunk.eval_count) {
        totalTokens = chunk.eval_count;
      }
    }

    return {
      response: fullResponse,
      tokensUsed: totalTokens
    };
  } catch (error) {
    console.error('Ollama generation error:', error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function chatWithOllama(
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; top_p?: number }
): Promise<{ response: string; tokensUsed: number }> {
  try {
    let fullResponse = '';
    let totalTokens = 0;

    const stream = await ollama.chat({
      model: OLLAMA_MODEL,
      messages,
      stream: true,
      options: {
        temperature: options?.temperature || 0.7,
        top_p: options?.top_p || 0.9,
      }
    });

    for await (const chunk of stream) {
      if (chunk.message?.content) {
        fullResponse += chunk.message.content;
      }
      if (chunk.eval_count) {
        totalTokens = chunk.eval_count;
      }
    }

    return {
      response: fullResponse,
      tokensUsed: totalTokens
    };
  } catch (error) {
    console.error('Ollama chat error:', error);
    throw new Error(`Failed to chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


