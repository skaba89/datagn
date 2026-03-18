// Prompts structurés pour l'IA DataGN — Epic G
// Groq avec LLaMA est forcé à répondre uniquement en JSON valide
// conformément aux guardrails définis ici.

import { GROQ_MODELS } from '../groq';

export const AI_MODEL = GROQ_MODELS.LLAMA_70B;
export const AI_MAX_TOKENS = 2000;

export const AI_ANALYZE_PROMPT = (
    schema: any[],
    sample: any[],
    rowCount: number,
    columnCount: number,
    question?: string
) => `Tu es un expert en analyse de données. Tu dois analyser le dataset décrit ci-dessous et répondre UNIQUEMENT en JSON valide. Ne dis rien avant ou après le JSON. N'invente pas de données - base-toi UNIQUEMENT sur les statistiques et l'échantillon fournis.

## Profil du Dataset
- Nombre de lignes: ${rowCount}
- Nombre de colonnes: ${columnCount}
- Colonnes:
${schema.map((col: any) => `  - ${col.name} (${col.type}): null_rate=${col.null_rate}%, unique=${col.unique_count}, min=${col.min}, max=${col.max}`).join('\n')}

## Échantillon (10 premières lignes):
${JSON.stringify(sample, null, 2)}

## Question / Objectif d'analyse
${question || "Effectue une analyse générale exploratoire de ce dataset."}

## Format de réponse OBLIGATOIRE (JSON strict):
{
  "summary": "Résumé concis en 2-3 phrases basé UNIQUEMENT sur les données observées",
  "insights": [
    "Insight n°1 avec données chiffrées à l'appui",
    "Insight n°2 avec données chiffrées à l'appui",
    "Insight n°3 avec données chiffrées à l'appui"
  ],
  "anomalies": [
    "Description d'une anomalie détectée, ou null si aucune"
  ],
  "data_quality": {
    "score": 0,
    "issues": ["Problème de qualité détecté ou null si aucun"]
  },
  "recommended_charts": [
    {
      "type": "bar|line|pie|scatter|histogram|heatmap|table",
      "title": "Titre du graphique suggéré",
      "x": "nom_de_la_colonne_x",
      "y": "nom_de_la_colonne_y_ou_null",
      "reason": "Justification basée sur les données"
    }
  ],
  "kpis": [
    {
      "label": "Nom du KPI",
      "value": "Valeur calculée",
      "trend": "up|down|stable"
    }
  ]
}`;
