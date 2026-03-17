// ─────────────────────────────────────────────────────────────────
// groq.ts — Client Groq IA (API OpenAI-compatible)
// Groq fournit une inference ultra-rapide avec LLaMA, Mixtral, Gemma
// ─────────────────────────────────────────────────────────────────

import OpenAI from 'openai';

// Configuration du client Groq
const GROQ_API_KEY = process.env['GROQ_API_KEY'] || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// Modèles disponibles sur Groq
export const GROQ_MODELS = {
  LLAMA_70B: 'llama-3.3-70b-versatile',
  LLAMA_8B: 'llama-3.1-8b-instant',
  MIXTRAL: 'mixtral-8x7b-32768',
  GEMMA: 'gemma2-9b-it',
  LLAMA_70B_VERSATILE: 'llama-3.3-70b-versatile',
  LLAMA_8B_INSTANT: 'llama-3.1-8b-instant',
} as const;

export const DEFAULT_MODEL = GROQ_MODELS.LLAMA_70B;

let groqClient: OpenAI | null = null;

export function getGroqClient(): OpenAI | null {
  if (!GROQ_API_KEY || GROQ_API_KEY.startsWith('gsk_REMPLACEZ') || GROQ_API_KEY === '') {
    console.warn('[Groq] Clé API non configurée ou invalide');
    return null;
  }
  
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: GROQ_API_KEY,
      baseURL: GROQ_BASE_URL,
    });
  }
  
  return groqClient;
}

export function isGroqConfigured(): boolean {
  return !!GROQ_API_KEY && !GROQ_API_KEY.startsWith('gsk_REMPLACEZ') && GROQ_API_KEY.length > 10;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  text: string;
  tokensIn?: number;
  tokensOut?: number;
  model: string;
}

export async function groqChat(params: {
  messages: GroqMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}): Promise<GroqResponse> {
  const { messages, model = DEFAULT_MODEL, maxTokens = 1000, temperature = 0.7, systemPrompt } = params;
  
  const client = getGroqClient();
  
  if (!client) {
    throw new Error('Groq API non configurée. Veuillez définir GROQ_API_KEY.');
  }
  
  const formattedMessages: GroqMessage[] = [];
  
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  
  for (const msg of messages) {
    if (msg.role === 'system' && !systemPrompt) {
      formattedMessages.push(msg);
    } else if (msg.role !== 'system') {
      formattedMessages.push(msg);
    }
  }
  
  if (formattedMessages.length === 0 || (formattedMessages[0] && formattedMessages[0].role === 'assistant')) {
    formattedMessages.unshift({ role: 'user', content: 'Bonjour' });
  }
  
  try {
    const response = await client.chat.completions.create({
      model,
      messages: formattedMessages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: Math.min(maxTokens, 4096),
      temperature,
    });
    
    const choice = response.choices[0];
    const text = choice?.message?.content || '';
    
    return {
      text,
      tokensIn: response.usage?.prompt_tokens,
      tokensOut: response.usage?.completion_tokens,
      model: response.model,
    };
  } catch (error: any) {
    console.error('[Groq] Erreur API:', error.message);
    throw new Error(`Erreur Groq: ${error.message}`);
  }
}

export async function groqJsonAnalysis(params: {
  prompt: string;
  model?: string;
  maxTokens?: number;
}): Promise<{ data: any; rawText: string; tokensIn?: number; tokensOut?: number }> {
  const { prompt, model = DEFAULT_MODEL, maxTokens = 2000 } = params;
  
  const client = getGroqClient();
  
  if (!client) {
    throw new Error('Groq API non configurée');
  }
  
  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en analyse de données. Tu dois répondre UNIQUEMENT en JSON valide. Ne dis rien avant ou après le JSON. Assure-toi que le JSON est bien formaté et valide.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: Math.min(maxTokens, 4096),
      temperature: 0.3,
    });
    
    const rawText = response.choices[0]?.message?.content || '{}';
    
    let data: any;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch?.[0] || '{}');
    } catch {
      data = { raw: rawText, parse_error: true };
    }
    
    return {
      data,
      rawText,
      tokensIn: response.usage?.prompt_tokens,
      tokensOut: response.usage?.completion_tokens,
    };
  } catch (error: any) {
    console.error('[Groq] Erreur analyse JSON:', error.message);
    throw error;
  }
}
