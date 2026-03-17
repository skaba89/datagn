// ─────────────────────────────────────────────────────────────────
// auto-dashboard.ts — Génération automatique de dashboard par IA
// L'IA analyse les données et génère KPIs, graphiques, insights
// ─────────────────────────────────────────────────────────────────

import { groqJsonAnalysis, isGroqConfigured, GROQ_MODELS } from './groq';

// Types pour la configuration du dashboard généré
export interface GeneratedKPI {
  id: string;
  label: string;
  column: string;
  type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  format: 'number' | 'currency' | 'percent' | 'date';
  color: string;
  trend?: boolean;
  target?: number;
  description: string;
}

export interface GeneratedChart {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar';
  title: string;
  xAxis: string;
  yAxis?: string;
  groupBy?: string;
  aggregation: 'sum' | 'avg' | 'count';
  color: string;
  description: string;
}

export interface GeneratedFilter {
  column: string;
  type: 'select' | 'range' | 'date';
  label: string;
  values?: string[];
  defaultValue?: string | [number, number];
}

export interface GeneratedInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  value?: string;
  recommendation?: string;
}

export interface AutoDashboardConfig {
  title: string;
  description: string;
  kpis: GeneratedKPI[];
  charts: GeneratedChart[];
  filters: GeneratedFilter[];
  insights: GeneratedInsight[];
  layout: {
    kpiColumns: number;
    chartHeight: number;
  };
  theme: {
    primaryColor: string;
    palette: string[];
  };
}

// ─────────────────────────────────────────────────────────────────
// Fonction principale de génération
// ─────────────────────────────────────────────────────────────────
export async function generateAutoDashboard(params: {
  data: any[];
  schema?: Array<{ name: string; type: string; sample?: any[]; stats?: any }>;
  context?: string;
}): Promise<AutoDashboardConfig> {
  const { data, schema: providedSchema, context } = params;

  if (!isGroqConfigured()) {
    return generateDefaultDashboard(data, providedSchema);
  }

  if (!data || data.length === 0) {
    throw new Error('Aucune donnée fournie pour générer le dashboard.');
  }

  const schema = providedSchema || analyzeSchema(data);
  const prompt = buildAutoDashboardPrompt(schema, data, data.length, context);

  try {
    const result = await groqJsonAnalysis({
      prompt,
      model: GROQ_MODELS.LLAMA_70B,
      maxTokens: 3000,
    });
    return validateAndCompleteConfig(result.data);
  } catch (error) {
    console.error('[AutoDashboard] Erreur IA, fallback:', error);
    return generateDefaultDashboard(data, schema);
  }
}

// ─────────────────────────────────────────────────────────────────
// Dashboard par défaut (fallback)
// ─────────────────────────────────────────────────────────────────
function generateDefaultDashboard(
  data: any[],
  schema?: Array<{ name: string; type: string; sample?: any[]; stats?: any }>
): AutoDashboardConfig {
  const analyzedSchema = schema || analyzeSchema(data);
  const numericCols = analyzedSchema.filter(c => c.type === 'number');
  const textCols = analyzedSchema.filter(c => c.type === 'text');
  const dateCols = analyzedSchema.filter(c => c.type === 'date');
  const palette = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const kpis: GeneratedKPI[] = numericCols.slice(0, 4).map((col, i) => ({
    id: `kpi_${i + 1}`,
    label: col.name,
    column: col.name,
    type: 'sum' as const,
    format: 'number' as const,
    color: palette[i % palette.length],
    trend: true,
    description: `Somme de ${col.name}`,
  }));

  if (kpis.length < 2) {
    kpis.push({
      id: 'kpi_count',
      label: 'Nombre de lignes',
      column: analyzedSchema[0]?.name || 'id',
      type: 'count',
      format: 'number',
      color: palette[0],
      description: 'Total des enregistrements',
    });
  }

  const charts: GeneratedChart[] = [];
  
  if (textCols.length > 0 && numericCols.length > 0) {
    charts.push({
      id: 'chart_bar',
      type: 'bar',
      title: `Distribution par ${textCols[0].name}`,
      xAxis: textCols[0].name,
      yAxis: numericCols[0].name,
      aggregation: 'sum',
      color: palette[1],
      description: `Répartition de ${numericCols[0].name} par ${textCols[0].name}`,
    });
  }

  if (dateCols.length > 0 && numericCols.length > 0) {
    charts.push({
      id: 'chart_line',
      type: 'line',
      title: 'Évolution temporelle',
      xAxis: dateCols[0].name,
      yAxis: numericCols[0].name,
      aggregation: 'sum',
      color: palette[2],
      description: `Évolution dans le temps`,
    });
  }

  if (textCols.length >= 1) {
    charts.push({
      id: 'chart_pie',
      type: 'pie',
      title: 'Répartition',
      xAxis: textCols[0].name,
      aggregation: 'count',
      color: palette[3],
      description: `Distribution de ${textCols[0].name}`,
    });
  }

  return {
    title: 'Dashboard Analytique',
    description: 'Dashboard généré automatiquement',
    kpis,
    charts,
    filters: textCols.slice(0, 3).map(col => ({
      column: col.name,
      type: 'select' as const,
      label: col.name,
      values: col.sample?.slice(0, 10),
    })),
    insights: [{
      type: 'neutral',
      title: 'Analyse',
      description: `${data.length} enregistrements analysés avec ${analyzedSchema.length} colonnes`,
    }],
    layout: { kpiColumns: 4, chartHeight: 300 },
    theme: { primaryColor: '#10B981', palette },
  };
}

// ─────────────────────────────────────────────────────────────────
// Prompt pour l'analyse IA
// ─────────────────────────────────────────────────────────────────
function buildAutoDashboardPrompt(
  schema: Array<{ name: string; type: string; sample: any[]; stats?: any }>,
  sampleData: any[],
  rowCount: number,
  context?: string
): string {
  const columnsInfo = schema.map(col => {
    const samples = col.sample?.slice(0, 5).map(v => String(v)).join(', ') || 'N/A';
    return `- ${col.name} (${col.type}): [${samples}]${col.stats ? ` stats=${JSON.stringify(col.stats)}` : ''}`;
  }).join('\n');

  const sampleJson = JSON.stringify(sampleData.slice(0, 5), null, 2);

  return `Tu es un Expert Data Visualization Senior. Analyse ce dataset et génère une configuration JSON pour un dashboard professionnel.

## Dataset: ${rowCount} lignes, ${schema.length} colonnes
## Schéma:
${columnsInfo}

## Échantillon:
${sampleJson}

## Contexte: ${context || 'Analyse générale'}

## TÂCHE: Génère un dashboard JSON avec 4-6 KPIs, 3-4 graphiques, 2-3 filtres, 2-4 insights.

## FORMAT JSON STRICT:
{
  "title": "Titre Dashboard",
  "description": "Description",
  "kpis": [{"id": "kpi_1", "label": "Nom", "column": "col", "type": "sum", "format": "number", "color": "#10B981", "trend": true, "description": "..."}],
  "charts": [{"id": "chart_1", "type": "bar", "title": "Titre", "xAxis": "col", "yAxis": "col", "aggregation": "sum", "color": "#3B82F6", "description": "..."}],
  "filters": [{"column": "col", "type": "select", "label": "Filtre", "values": ["a", "b"]}],
  "insights": [{"type": "positive", "title": "Titre", "description": "...", "recommendation": "..."}],
  "layout": {"kpiColumns": 4, "chartHeight": 300},
  "theme": {"primaryColor": "#10B981", "palette": ["#10B981", "#3B82F6"]}
}

GÉNÈRE UNIQUEMENT LE JSON.`;
}

// ─────────────────────────────────────────────────────────────────
// Analyse automatique du schéma
// ─────────────────────────────────────────────────────────────────
export function analyzeSchema(data: any[]): Array<{ name: string; type: string; sample: any[]; stats?: any }> {
  if (!data || data.length === 0) return [];
  const columns = Object.keys(data[0]);

  return columns.map(col => {
    const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
    const sample = values.slice(0, 10);
    let type = 'text';
    const numericValues = values.filter(v => !isNaN(Number(v)) && v !== '').map(Number);
    const dateValues = values.filter(v => !isNaN(Date.parse(String(v))));

    if (numericValues.length > values.length * 0.8) {
      type = 'number';
      return {
        name: col,
        type,
        sample: sample.slice(0, 5).map(String),
        stats: {
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          sum: numericValues.reduce((a, b) => a + b, 0),
        }
      };
    } else if (dateValues.length > values.length * 0.8) {
      type = 'date';
    }

    return { name: col, type, sample: sample.slice(0, 5).map(String) };
  });
}

// ─────────────────────────────────────────────────────────────────
// Validation de la configuration
// ─────────────────────────────────────────────────────────────────
function validateAndCompleteConfig(config: any): AutoDashboardConfig {
  const palette = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return {
    title: config?.title || 'Dashboard Analytique',
    description: config?.description || 'Dashboard généré automatiquement',
    kpis: (config?.kpis || []).map((kpi: any, i: number) => ({
      id: kpi.id || `kpi_${i + 1}`,
      label: kpi.label || `KPI ${i + 1}`,
      column: kpi.column || '',
      type: kpi.type || 'sum',
      format: kpi.format || 'number',
      color: kpi.color || palette[i % palette.length],
      trend: kpi.trend ?? true,
      target: kpi.target,
      description: kpi.description || '',
    })),
    charts: (config?.charts || []).map((chart: any, i: number) => ({
      id: chart.id || `chart_${i + 1}`,
      type: chart.type || 'bar',
      title: chart.title || `Graphique ${i + 1}`,
      xAxis: chart.xAxis || '',
      yAxis: chart.yAxis,
      groupBy: chart.groupBy,
      aggregation: chart.aggregation || 'sum',
      color: chart.color || palette[i % palette.length],
      description: chart.description || '',
    })),
    filters: (config?.filters || []).map((filter: any) => ({
      column: filter.column || '',
      type: filter.type || 'select',
      label: filter.label || filter.column,
      values: filter.values,
      defaultValue: filter.defaultValue,
    })),
    insights: (config?.insights || []).map((insight: any) => ({
      type: insight.type || 'neutral',
      title: insight.title || 'Observation',
      description: insight.description || '',
      value: insight.value,
      recommendation: insight.recommendation,
    })),
    layout: { kpiColumns: config?.layout?.kpiColumns || 4, chartHeight: config?.layout?.chartHeight || 300 },
    theme: { primaryColor: config?.theme?.primaryColor || '#10B981', palette: config?.theme?.palette || palette },
  };
}

// ─────────────────────────────────────────────────────────────────
// Calcul des KPIs
// ─────────────────────────────────────────────────────────────────
export function calculateKPIValue(
  data: any[],
  kpi: GeneratedKPI
): { value: number; previousValue?: number; trend?: number } {
  const values = data.map(row => row[kpi.column]).filter(v => v !== null && v !== undefined && v !== '');
  let value = 0;

  switch (kpi.type) {
    case 'sum': value = values.reduce((acc, v) => acc + (Number(v) || 0), 0); break;
    case 'avg': const nums = values.map(Number).filter(n => !isNaN(n)); value = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; break;
    case 'count': value = values.length; break;
    case 'min': const minNums = values.map(Number).filter(n => !isNaN(n)); value = minNums.length ? Math.min(...minNums) : 0; break;
    case 'max': const maxNums = values.map(Number).filter(n => !isNaN(n)); value = maxNums.length ? Math.max(...maxNums) : 0; break;
    case 'distinct': value = new Set(values).size; break;
    default: value = values.length;
  }

  if (kpi.trend && data.length > 2) {
    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid);
    const secondHalf = data.slice(mid);
    let firstValue = 0;
    let secondValue = 0;

    if (kpi.type === 'sum') {
      firstValue = firstHalf.reduce((acc, row) => acc + (Number(row[kpi.column]) || 0), 0);
      secondValue = secondHalf.reduce((acc, row) => acc + (Number(row[kpi.column]) || 0), 0);
    } else if (kpi.type === 'count') {
      firstValue = firstHalf.length;
      secondValue = secondHalf.length;
    }

    if (firstValue > 0) {
      return { value, previousValue: firstValue, trend: ((secondValue - firstValue) / firstValue) * 100 };
    }
  }

  return { value };
}

// ─────────────────────────────────────────────────────────────────
// Préparation des données pour graphiques
// ─────────────────────────────────────────────────────────────────
export function prepareChartData(
  data: any[],
  chart: GeneratedChart
): Array<{ x: string | number; y: number; name?: string }> {
  const grouped = new Map<string | number, number>();

  data.forEach(row => {
    const xValue = row[chart.xAxis];
    const yValue = Number(row[chart.yAxis || chart.xAxis]) || 1;
    const current = grouped.get(xValue) || 0;
    
    if (chart.aggregation === 'sum') {
      grouped.set(xValue, current + yValue);
    } else if (chart.aggregation === 'count') {
      grouped.set(xValue, (grouped.get(xValue) || 0) + 1);
    } else {
      grouped.set(xValue, current + yValue);
    }
  });

  return Array.from(grouped.entries())
    .map(([x, y]) => ({ x, y }))
    .sort((a, b) => {
      if (typeof a.x === 'number' && typeof b.x === 'number') return a.x - b.x;
      return String(a.x).localeCompare(String(b.x));
    });
}
