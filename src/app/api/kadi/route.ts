import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from '@/lib/cors';
import { auth } from '@/auth';
import prisma from '@/lib/db';


import { redisIncr, redisPExpire, redisPTTL } from '@/lib/redis';

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
    service: 'Kadi IA — DataGN v2.0',
    ts: new Date().toISOString(),
    rateLimit: { limit: RATE_LIMIT, window: '60s' },
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

    // ── Clés API ───────────────────────────────────────────────────
    const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
    const openAIKey = process.env.OPENAI_API_KEY || '';

    console.log('[Kadi] Keys check:', {
      hasAnthropic: !!anthropicKey,
      hasOpenAI: !!openAIKey,
      openAIStart: openAIKey ? openAIKey.substring(0, 10) + '...' : 'none'
    });

    if (!anthropicKey && !openAIKey) {
      return NextResponse.json(
        { error: 'Clé API manquante (Anthropic ou OpenAI) — configurez votre .env.local' },
        { status: 500, headers: corsH }
      );
    }

    const isEnglish = messages.some(m => m.content.toLowerCase().includes('english') || m.content.toLowerCase().includes('hello'));
    const mockResponse = isEnglish
      ? "Hello! I am Kadi, your DataGN AI assistant. I am currently running in **Offline/Development mode** because your API key is invalid or a demo key.\n\nTo unlock my full analytical capabilities on your datasets, please configure a valid `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in your environment variables. Let me know if you need help with the setup!"
      : "Bonjour ! Je suis Kadi, votre assistante IA DataGN. Je fonctionne actuellement en **mode Hors-Ligne (Développement)** car votre clé API est invalide ou de démonstration.\n\nPour débloquer mes capacités d'analyse complètes sur vos tableaux de bord, veuillez configurer une `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY` valide dans vos variables d'environnement. N'hésitez pas si vous avez besoin d'aide pour l'installation !";

    // ── Mode Hors-ligne / Simulation (Mock) ───────────────────────
    // On n'active le mock QUE si AUCUNE clé n'est valide
    const isAnthropicMock = !anthropicKey || anthropicKey.startsWith('sk-ant-api03-REMPLACEZ');
    const isOpenAIMock = !openAIKey || openAIKey.startsWith('sk-REMPLACEZ');

    if (isAnthropicMock && isOpenAIMock) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({ text: mockResponse }, { status: 200, headers: { ...corsH, 'X-Kadi-Mode': 'Offline-Mock' } });
    }

    // Nettoyage strict pour Anthropic et OpenAI
    let valid = messages
      .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content.trim().slice(0, 4000)
      }));

    // Fusionner les messages consécutifs du même rôle (requis par Anthropic)
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
    let lastError = '';

    // ── Appel OpenAI ───────────────────────────────
    if (openAIKey && !openAIKey.startsWith('sk-REMPLACEZ')) {
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAIKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: finalSystemPrompt },
              ...valid.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
            ],
            max_tokens: Math.min(Number(maxTokens) || 800, 1500),
            temperature: 0.7,
          }),
        });

        if (resp.ok) {
          const json = await resp.json();
          responseText = json?.choices?.[0]?.message?.content ?? '';
          console.log('[Kadi] OpenAI Success - Length:', responseText.length);
        } else {
          const errText = await resp.text();
          lastError = `OpenAI ${resp.status}: ${errText.substring(0, 50)}`;

          if (resp.status === 429) {
            lastError = "Quota OpenAI épuisé. Veuillez vérifier vos crédits.";
          }

          console.error('[Kadi] OpenAI Error Status:', resp.status, 'Body:', errText.substring(0, 100));
        }
      } catch (err: any) {
        lastError = `OpenAI Fetch Error: ${err.message}`;
        console.error('[Kadi] OpenAI Network/Fetch Error:', err);
      }
    }

    // ── Fallback Anthropic ───────────────
    if (!responseText && anthropicKey && !anthropicKey.startsWith('sk-ant-api03-REMPLACEZ')) {
      try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: Math.min(Number(maxTokens) || 800, 1500),
            system: finalSystemPrompt,
            messages: valid.map(m => ({
              role: m.role,
              content: m.content
            })),
          }),
        });

        if (resp.ok) {
          const json = await resp.json();
          responseText = json?.content?.[0]?.text ?? '';
        } else {
          const errText = await resp.text();
          let parsedErr = errText.substring(0, 50);
          try {
            const errJson = JSON.parse(errText);
            if (errJson.error && errJson.error.message) {
              parsedErr = errJson.error.message;
            } else if (errJson.error && errJson.error.type) {
              parsedErr = `Type: ${errJson.error.type}`;
            }
          } catch (e) { }

          lastError = `Anthropic ${resp.status}: ${parsedErr}`;

          // Détection spécifique de quota
          if (resp.status === 429 || resp.status === 400) {
            lastError = "Quota/Crédits insuffisants sur Anthropic.";
          }

          console.error('[Kadi] Anthropic error:', resp.status, errText.substring(0, 100));
        }
      } catch (err: any) {
        lastError = `Anthropic Fetch Error: ${err.message}`;
        console.warn('[Kadi] Anthropic Network Error (Offline mode?)');
      }
    }


    // ── Fallback final Mock (Maintenu si pas de réponse ou pas de clé) ──
    if (!responseText) {
      const errorDetail = lastError ? ` (Détail: ${lastError})` : '';
      return NextResponse.json({
        text: mockResponse + errorDetail
      }, {
        status: 200,
        headers: { ...corsH, 'X-Kadi-Mode': 'Offline-Mock-Fallback' }
      });
    }

    // ── Persistence DB (Désactivée en V2 car non définie dans le nouveau schéma) ──
    /*
    if (dashboardId) {
      try {
        const session = await auth();
        const wsId = (session?.user as any)?.workspaceId;
        const dbVerify = await prisma.dashboard.findFirst({
          where: { id: dashboardId, workspaceId: wsId }
        });
        if (dbVerify) {
          const userMsg = messages[messages.length - 1];
          // Le modèle kadiMessage a été supprimé en V2. 
          // À remplacer par AIAnalysis ou un nouveau modèle de Chat si nécessaire.
        }
      } catch (dbErr) {
        console.error('[Kadi] DB Save error:', dbErr);
      }
    }
    */

    return NextResponse.json(
      { text: responseText },
      {
        status: 200,
        headers: {
          ...corsH,
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-Kadi-Version': '2.0',
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
