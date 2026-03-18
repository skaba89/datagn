import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from '@/lib/cors';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { redisIncr, redisPExpire, redisPTTL } from '@/lib/redis';
import { groqChat, isGroqConfigured, GROQ_MODELS } from '@/lib/groq';

// ─────────────────────────────────────────────────────────────────
// Rate Limiter avec Redis — 20 req / 60 s par IP
// (Fallback "pass-through" si Redis n'est pas disponible)
// ─────────────────────────────────────────────────────────────────
const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000; // 1 minute

async function checkRateLimit(ip: string): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  try {
    const key = `ratelimit:kadi:${ip}`;
    const current = await redisIncr(key);

    if (current === 0) {
      // Redis indisponible → bypass silencieux
      return { ok: true, remaining: RATE_LIMIT, resetAt: Date.now() + RATE_WINDOW };
    }

    if (current === 1) {
      await redisPExpire(key, RATE_WINDOW);
    }

    const ttl = await redisPTTL(key);
    const resetAt = Date.now() + (ttl > 0 ? ttl : RATE_WINDOW);

    if (current > RATE_LIMIT) {
      return { ok: false, remaining: 0, resetAt };
    }
    return { ok: true, remaining: RATE_LIMIT - current, resetAt };
  } catch {
    // Fallback si Redis est down : on laisse passer
    return { ok: true, remaining: 1, resetAt: Date.now() + RATE_WINDOW };
  }
}



// ─────────────────────────────────────────────────────────────────
// Prompt système Kadi
// ─────────────────────────────────────────────────────────────────
const KADI_SYSTEM = `Tu es Kadi, l'IA officielle de DataGN (Conakry, Guinée). Tu parles français.
Tu es experte en data, dashboards, support client, et analyse terrain Afrique de l'Ouest.

RÔLES :
1. SUPPORT TECHNIQUE 24/7 — diagnostiquer et résoudre problèmes dashboard/données
2. ANALYSE DATA — interpréter les données, détecter anomalies, générer insights actionnables
3. MAINTENANCE — surveiller, alerter, proposer solutions concrètes
4. PROSPECTION — qualifier visiteurs, proposer démo gratuite 30 min
5. RAPPORTS — rédiger rapports professionnels pour bailleurs ONU/ONG/Mines

SERVICES DataGN :
• Dashboards temps réel (Google Sheets, CSV, KoboToolbox, API/BDD)
• Rapports PDF automatiques avec narration IA mensuelle
• Alertes WhatsApp & Email sur dépassement de seuil
• Formation data literacy 200$/personne/jour

OFFRES :
• Starter   1 500$/mois — 1 dashboard, 3 PDF/mois, alertes, 1 utilisateur
• Impact    4 000$/mois ⭐ — 3 dashboards, PDF illimités+IA, formation, 5 users, SLA 99%
• Enterprise 8 000–15 000$/mois — sur-mesure, géospatial, ESG/ITIE

CLIENTS : ONG (PNUD, UNICEF, FAO, IRC) · Bailleurs (AFD, BM, UE, USAID) · Gouvernements · Mines
AVANTAGES : seule agence locale Conakry · -60% vs international · déploiement 2 semaines
CONTACT : contact@datagn.com | Conakry, Guinée

Réponds toujours en français. Max 250 mots. Conclus par une action concrète.`;

// ─────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Kadi IA — DataGN v2.1 (Groq Powered)',
    ts: new Date().toISOString(),
    rateLimit: { limit: RATE_LIMIT, window: '60s' },
    ai: {
      provider: 'Groq',
      model: GROQ_MODELS.LLAMA_70B,
      configured: isGroqConfigured()
    }
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const corsH = getCorsHeaders(origin);

  // ── Rate limiting ──────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
  const rl = await checkRateLimit(ip);

  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans 1 minute.' },
      {
        status: 429,
        headers: {
          ...corsH,
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
        },
      }
    );
  }

  try {
    // ── Validation body ────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400, headers: corsH });
    }

    const { messages, systemExtra, dashboardId, maxTokens = 800 } = body as {
      messages: Array<{ role: string; content: string }>;
      systemExtra?: string;
      dashboardId?: string;
      maxTokens?: number;
    };

    if (!Array.isArray(messages) || !messages.length) {
      return NextResponse.json({ error: 'messages requis (tableau non vide)' }, { status: 400, headers: corsH });
    }

    // ── Vérification Groq ───────────────────────────────────────────
    const groqConfigured = isGroqConfigured();
    
    console.log('[Kadi] Groq config check:', { groqConfigured });

    const isEnglish = messages.some(m => m.content.toLowerCase().includes('english') || m.content.toLowerCase().includes('hello'));
    const mockResponse = isEnglish
      ? "Hello! I am Kadi, your DataGN AI assistant. I am currently running in **Offline/Development mode** because your Groq API key is not configured.\n\nTo unlock my full analytical capabilities, please configure a valid `GROQ_API_KEY` in your environment variables. Get your FREE API key from https://console.groq.com/"
      : "Bonjour ! Je suis Kadi, votre assistante IA DataGN. Je fonctionne actuellement en **mode Hors-Ligne (Développement)** car votre clé API Groq n'est pas configurée.\n\nPour débloquer mes capacités d'analyse complètes, veuillez configurer une `GROQ_API_KEY` valide. Obtenez votre clé GRATUITE sur https://console.groq.com/";

    // ── Mode Hors-ligne / Simulation (Mock) ───────────────────────
    if (!groqConfigured) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({ text: mockResponse }, { status: 200, headers: { ...corsH, 'X-Kadi-Mode': 'Offline-Mock' } });
    }

    // Nettoyage strict pour Groq
    let valid = messages
      .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content.trim().slice(0, 4000)
      }));

    // Fusionner les messages consécutifs du même rôle
    const merged: { role: 'user' | 'assistant', content: string }[] = [];
    for (const msg of valid) {
      if (merged.length > 0 && merged[merged.length - 1].role === msg.role) {
        merged[merged.length - 1].content += "\n\n" + msg.content;
      } else {
        merged.push(msg);
      }
    }
    valid = merged;

    // S'assurer de commencer par 'user'
    if (valid.length > 0 && valid[0].role === 'assistant') {
      valid.shift();
    }

    if (!valid.length) {
      return NextResponse.json({ text: "Désolé, je n'ai pas reçu de message valide à traiter." }, { status: 200, headers: corsH });
    }

    const safeExtra = typeof systemExtra === 'string' ? systemExtra.slice(0, 500) : '';
    const finalSystemPrompt = KADI_SYSTEM + (safeExtra ? '\n\n' + safeExtra : '');

    let responseText = '';
    let tokensIn = 0;
    let tokensOut = 0;

    // ── Appel Groq ─────────────────────────────────────────────────
    try {
      const result = await groqChat({
        messages: valid.map(m => ({ role: m.role, content: m.content })),
        model: GROQ_MODELS.LLAMA_70B,
        maxTokens: Math.min(Number(maxTokens) || 800, 2000),
        temperature: 0.7,
        systemPrompt: finalSystemPrompt,
      });
      
      responseText = result.text;
      tokensIn = result.tokensIn || 0;
      tokensOut = result.tokensOut || 0;
      
      console.log('[Kadi] Groq Success - Tokens:', { in: tokensIn, out: tokensOut });
    } catch (err: any) {
      console.error('[Kadi] Groq Error:', err.message);
      
      // Fallback mock response
      return NextResponse.json({
        text: mockResponse + `\n\n(Erreur technique: ${err.message})`
      }, {
        status: 200,
        headers: { ...corsH, 'X-Kadi-Mode': 'Error-Fallback' }
      });
    }

    return NextResponse.json(
      { 
        text: responseText,
        usage: { tokensIn, tokensOut }
      },
      {
        status: 200,
        headers: {
          ...corsH,
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-Kadi-Version': '2.1',
          'X-Kadi-Provider': 'Groq',
          'X-Kadi-Model': GROQ_MODELS.LLAMA_70B,
        },
      }
    );

  } catch (err) {
    console.error('[Kadi] Server error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur. Contactez contact@datagn.com' },
      { status: 500, headers: corsH }
    );
  }
}
