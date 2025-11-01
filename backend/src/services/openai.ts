import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not set in environment variables!');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function generateWithOpenAI(
  prompt: string,
  systemPrompt?: string
): Promise<{ response: string; tokensUsed: number }> {
  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
      temperature: 0.2, // Very low for accuracy and precision
      max_tokens: 600, // Reduced for speed - only real issues
      top_p: 0.95,
      frequency_penalty: 0.3,
      presence_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return { response, tokensUsed };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate response from AI');
  }
}

export async function checkOpenAIConnection(): Promise<{
  connected: boolean;
  model: string;
  error?: string;
}> {
  try {
    // Test with a simple request
    await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5,
    });

    return {
      connected: true,
      model: OPENAI_MODEL,
    };
  } catch (error) {
    return {
      connected: false,
      model: OPENAI_MODEL,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

