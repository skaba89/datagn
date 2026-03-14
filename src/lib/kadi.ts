// ────────────────────────────────────────────────────────────────
// kadi.ts — Client Kadi IA (appels vers /api/kadi)
// ────────────────────────────────────────────────────────────────
import { KpiData, VizData } from './parser';

export interface KadiMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Appel de base ─────────────────────────────────────────────
export async function kadiCall(
  messages: KadiMessage[],
  systemExtra?: string,
  dashboardId?: string,
  maxTokens?: number
): Promise<string> {
  const resp = await fetch('/api/kadi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemExtra, dashboardId, maxTokens }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Erreur ${resp.status}`);
  }
  const data = await resp.json() as { text?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data.text ?? 'Réponse indisponible';
}

// ── Analyse automatique des données (Mode Expert BI) ──────────
export async function kadiAnalyze(params: {
  rowCount: number;
  source: string;
  kpis: KpiData[];
  topCats: VizData['bars'];
  org?: string;
}): Promise<string> {
  const { rowCount, source, kpis, topCats, org } = params;

  const kpiLines = kpis.slice(0, 6).map(k =>
    `• ${k.col.toUpperCase()}: total=${k.total.toLocaleString('fr')}, tendance=${k.trend > 0 ? '+' : ''}${k.trend}%, avg=${Math.round(k.avg).toLocaleString('fr')}`
  ).join('\n');

  const catLines = topCats.slice(0, 6).map(c =>
    `• ${c.name}: ${c.value.toLocaleString('fr')} (Leader)`
  ).join('\n');

  const prompt =
    `En tant que Senior Data Analyst Stratégique${org ? ` pour ${org}` : ''}, analyse ce dataset :\n\n` +
    `CONTEXTE : Source=${source} | Volume=${rowCount} lignes\n\n` +
    `INDICATEURS BRUTS :\n${kpiLines || '—'}\n\n` +
    `SEGMENTATION CLÉ :\n${catLines || '—'}\n\n` +
    `LIVRABLES ATTENDUS (Ton Exécutif, Précis, Actionnable) :\n` +
    `1. 🎯 RÉSUMÉ EXÉCUTIF : La santé globale en 2 phrases (North Star focus).\n` +
    `2. 📈 PERFORMANCE CLÉ : Analyse des tendances (qu'est-ce qui tire la croissance ?).\n` +
    `3. 🔦 ANOMALIES & RISQUES : Identifie des valeurs atypiques ou des baisses inquiétantes.\n` +
    `4. 🔮 PROJECTION 30 JOURS : Extrapolation intelligente basée sur les ratios actuels.\n` +
    `5. 💡 RECOMMANDATIONS : 3 actions concrètes pour optimiser les résultats.\n\n` +
    `Note: Utilise un ton de leader, pas juste descriptif.`;

  return kadiCall(
    [{ role: 'user', content: prompt }],
    'Tu es Kadi v2 (Expert BI Mode). Une IA souveraine d\'analyse stratégique. Ton objectif est d\'aider à la prise de décision rapide et éclairée au plus haut niveau. Tu ne te contentes pas de lire les chiffres, tu les interprètes en termes d\'opportunités et de menaces.',
    undefined,
    1000
  );
}

// ── Génération rapport ────────────────────────────────────────
export type ReportType = 'mensuel' | 'alerte' | 'donateur' | 'itie';

export async function kadiReport(params: {
  type: ReportType;
  org: string;
  periode: string;
  source: string;
  rowCount: number;
  kpis: KpiData[];
  topCats: VizData['bars'];
}): Promise<string> {
  const { type, org, periode, source, rowCount, kpis, topCats } = params;

  const typeLabel: Record<ReportType, string> = {
    mensuel: 'rapport mensuel complet avec résumé exécutif',
    alerte: 'note d\'alerte urgente avec indicateurs critiques',
    donateur: 'rapport bailleur de fonds format standard ONU/OCDE',
    itie: 'rapport de conformité ITIE/ESG transparence minière',
  };

  const kpiLines = kpis.map(k =>
    `• ${k.col}: ${k.total.toFixed(0)} (${k.trend > 0 ? '+' : ''}${k.trend}%)`
  ).join('\n');

  const catLines = topCats.slice(0, 5).map(c =>
    `• ${c.name}: ${c.value.toLocaleString('fr')}`
  ).join('\n');

  const prompt =
    `Rédige un ${typeLabel[type]} pour: ${org}\n` +
    `Période: ${periode} | Source: ${source} | Lignes: ${rowCount}\n\n` +
    `KPIs:\n${kpiLines || '—'}\n\n` +
    `Top catégories:\n${catLines || '—'}\n\n` +
    `Format professionnel:\n` +
    `1. En-tête officiel + résumé exécutif (3 phrases)\n` +
    `2. Indicateurs clés commentés\n` +
    `3. Points d'attention et risques\n` +
    `4. Recommandations concrètes (3 minimum)\n` +
    `5. Conclusion et prochaines étapes\n\n` +
    `Ton: professionnel, adapté aux bailleurs ONU/ONG internationaux.`;

  return kadiCall([{ role: 'user', content: prompt }], undefined, undefined, 1200);
}
