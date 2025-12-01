import { Request, Response } from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import FormData from 'form-data';
import Conversation from '../models/Conversation';
import { AuthRequest } from '../middleware/auth';

// Lazy initialization - only create OpenAI client when needed
let openaiClient: OpenAI | null = null;
const getOpenAIClient = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured in environment variables');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

const D_ID_API_KEY = process.env.D_ID_API_KEY || '';
const D_ID_API_URL = 'https://api.d-id.com';

// System prompt pentru AI Mentor
const MENTOR_SYSTEM_PROMPT = `Ești un profesor de programare empatic și prietenos, specializat în a ajuta elevii să înțeleagă conceptele de programare.

Reguli importante:
- Răspunde EXACT la ce te întreabă elevul
- DACĂ elevul vorbește despre altceva decât programare (ex: rețete, conversație casual), răspunde NATURAL și APOI sugerează să vorbească despre programare
- Răspunde DOAR în limba română
- Folosește un ton cald, încurajator și educațional
- Pentru întrebări despre programare: explică pe înțelesul elevilor de 12-18 ani cu exemple simple
- Dacă elevul arată cod cu erori, explică PAS CU PAS ce a greșit și de ce
- Ține răspunsurile scurte (max 3-4 propoziții) pentru conversație fluidă
- Dacă elevul te salută sau face conversație, răspunde NATURAL apoi ghidează-l spre programare

Exemple:
- "Salut!" → "Bună! Mă bucur să te văd! Cum te pot ajuta azi la programare?"
- "Să ne vedem la următoarea rețetă" → "Ha ha, sună interesant! Deși eu sunt specialist în programare, nu în gătit 😊 Ai vreo întrebare de cod astăzi?"
- "Ce e un for loop?" → "Un for loop e ca și cum ai repeta aceeași acțiune de mai multe ori..."

Personalitate:
- Natural și conversațional
- Entuziast despre programare
- Răbdător și înțelegător
- Nu forțezi subiecte - răspunzi natural apoi ghidezi
- Celebrezi progresul și încurajezi curiozitatea`;

/**
 * Speech-to-Text: Transcrie audio în text folosind Whisper
 */
export const transcribeAudio = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('📝 Transcribing audio...', {
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    const openai = getOpenAIClient();
    
    // Create a File-like object for Whisper API
    const audioFile = new File([req.file.buffer], 'audio.webm', {
      type: req.file.mimetype,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ro',
    });

    console.log('✅ Transcription success:', transcription.text);

    res.json({
      text: transcription.text,
    });
  } catch (error: any) {
    console.error('❌ Transcription error:', error.message || error);
    res.status(500).json({ 
      error: 'Failed to transcribe audio',
      details: error.message || 'Unknown error'
    });
  }
};

/**
 * Chat cu AI Mentor: Generează răspuns folosind GPT-4o
 */
export const chatWithMentor = async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversationId, codeContext } = req.body;
    const userId = req.user?.id;

    console.log('💬 Chat request:', { 
      userId, 
      messageLength: message?.length, 
      hasConversationId: !!conversationId,
      messagePreview: message?.substring(0, 50)
    });

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Găsește sau creează conversație
    let conversation = conversationId
      ? await Conversation.findById(conversationId)
      : new Conversation({
          userId,
          messages: [],
          codeContext,
        });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Adaugă mesajul user-ului
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Construiește context pentru GPT
    const messages: any[] = [
      { role: 'system', content: MENTOR_SYSTEM_PROMPT },
    ];

    // Adaugă context despre cod dacă există
    if (codeContext) {
      messages.push({
        role: 'system',
        content: `Context cod student:\n\`\`\`\n${codeContext}\n\`\`\``,
      });
    }

    // Adaugă istoric conversație (ultimele 10 mesaje)
    const recentMessages = conversation.messages.slice(-10);
    recentMessages.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Call GPT-4o
    const openai = getOpenAIClient();
    console.log('🤖 Trimit la GPT cu', messages.length, 'mesaje');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Sau 'gpt-4o' pentru mai multă calitate
      messages,
      temperature: 0.7,
      max_tokens: 300, // Răspunsuri scurte pentru conversație fluidă
    });

    const assistantMessage = completion.choices[0].message.content || 'Ne pare rău, nu am putut genera un răspuns.';
    console.log('✅ Răspuns GPT:', assistantMessage.substring(0, 100));

    // Adaugă răspunsul asistent-ului
    conversation.messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date(),
    });

    await conversation.save();
    console.log('✅ Conversație salvată:', conversation._id);

    res.json({
      conversationId: conversation._id,
      message: assistantMessage,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to chat with mentor' });
  }
};

/**
 * Text-to-Speech: Generează audio din text folosind OpenAI TTS
 */
export const generateSpeech = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    console.log('🔊 Generez audio TTS pentru:', text?.substring(0, 50));

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const openai = getOpenAIClient();
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // Sau 'tts-1-hd' pentru mai multă calitate
      voice: 'nova', // Voce feminină plăcută (alloy, echo, fable, onyx, nova, shimmer)
      input: text,
      speed: 1.0,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    console.log('✅ Audio TTS generat:', buffer.length, 'bytes');

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
    });

    res.send(buffer);
    console.log('✅ Audio TTS trimis la client');
  } catch (error: any) {
    console.error('❌ TTS error:', error.message || error);
    res.status(500).json({ error: 'Failed to generate speech', details: error.message });
  }
};

/**
 * D-ID Avatar: Creează video cu avatar vorbitor
 */
export const createAvatarVideo = async (req: Request, res: Response) => {
  try {
    const { text, audioUrl } = req.body;

    if (!text && !audioUrl) {
      return res.status(400).json({ error: 'Text or audio URL is required' });
    }

    if (!D_ID_API_KEY) {
      return res.status(500).json({ error: 'D-ID API key not configured' });
    }

    // Creează talk cu D-ID
    const response = await axios.post(
      `${D_ID_API_URL}/talks`,
      {
        script: {
          type: audioUrl ? 'audio' : 'text',
          ...(audioUrl ? { audio_url: audioUrl } : { input: text }),
          provider: {
            type: 'microsoft',
            voice_id: 'ro-RO-AlinaNeural', // Voce feminină românească
          },
        },
        config: {
          fluent: true,
          pad_audio: 0,
        },
        source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Vanessa_v1/image.jpeg', // Avatar default
      },
      {
        headers: {
          Authorization: `Basic ${D_ID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const talkId = response.data.id;

    // Polling pentru rezultat (D-ID procesează async)
    let talkData = response.data;
    let attempts = 0;
    const maxAttempts = 30; // 30 secunde max

    while (talkData.status !== 'done' && talkData.status !== 'error' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Așteaptă 1s
      
      const statusResponse = await axios.get(`${D_ID_API_URL}/talks/${talkId}`, {
        headers: {
          Authorization: `Basic ${D_ID_API_KEY}`,
        },
      });

      talkData = statusResponse.data;
      attempts++;
    }

    if (talkData.status === 'error') {
      return res.status(500).json({ error: 'Failed to generate avatar video' });
    }

    res.json({
      videoUrl: talkData.result_url,
      status: talkData.status,
      talkId,
    });
  } catch (error: any) {
    console.error('D-ID error:', error.response?.data || error);
    res.status(500).json({ 
      error: 'Failed to create avatar video',
      details: error.response?.data || error.message,
    });
  }
};

/**
 * Obține istoricul conversațiilor user-ului
 */
export const getConversationHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 10, skip = 0 } = req.query;

    const conversations = await Conversation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .select('-__v');

    const total = await Conversation.countDocuments({ userId });

    res.json({
      conversations,
      total,
      limit: Number(limit),
      skip: Number(skip),
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get conversation history' });
  }
};

/**
 * Obține o conversație specifică
 */
export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const conversation = await Conversation.findOne({
      _id: id,
      userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

/**
 * Șterge o conversație
 */
export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const conversation = await Conversation.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};
