import { detectIndustry, IndustryTemplate } from './templates';

export type Row = Record<string, string | number>;

export interface ColInfo {
  num: string[];
  txt: string[];
  date: string[];
}

export interface KpiData {
  col: string;
  total: number;
  last: number;
  avg: number;
  trend: number;   // % change last vs prev
  color: string;
  count: number;
  unit?: string;
  target?: number; // Valeur cible pour le suivi d'objectifs
}

export interface VizData {
  series: Array<Record<string, string | number>>;  // pour line/area (max 40 pts)
  bars: Array<{ name: string; value: number }>;  // top-8 catégories
  pie: Array<{ name: string; value: number; color: string }>;
  kpis: KpiData[];
  numCols: string[];
  catCol: string;
  dateCol: string;
  barsCol?: string; // Optional: specific column used for bar aggregation
  geo?: Array<{ name: string; value: number }>; // Agrégation par région
  industry?: string; // Secteur détecté
}

const COLORS = [
  '#3CA06A', '#EDB025', '#3B82F6',
  '#8B5CF6', '#EF4444', '#F97316', '#0EA5E9', '#6366F1'
];

// ── Détecteur séparateur ─────────────────────────────────────
function detectSep(line: string): string {
  const sc = (line.match(/;/g) || []).length;
  const cc = (line.match(/,/g) || []).length;
  const tc = (line.match(/\t/g) || []).length;
  if (tc > sc && tc > cc) return '\t';
  if (sc > cc) return ';';
  return ',';
}

// ── parseCSV ─────────────────────────────────────────────────
export function parseCSV(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const sep = detectSep(lines[0]);

  const splitLine = (line: string): string[] => {
    const cols: string[] = [];
    let cur = '';
    let inQ = false;
    for (const ch of line + sep) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === sep && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    return cols;
  };

  const headers = splitLine(lines[0]).map(h =>
    h.replace(/^["']|["']$/g, '').trim()
  );

  return lines.slice(1).map(line => {
    const vals = splitLine(line);
    const row: Row = {};
    headers.forEach((h, i) => {
      const raw = (vals[i] ?? '').replace(/^["']|["']$/g, '').trim();
      const sanitized = raw.replace(/[<>]/g, ''); // XSS Prevention
      row[h] = sanitized !== '' && !isNaN(Number(sanitized)) ? Number(sanitized) : sanitized;
    });
    return row;
  }).filter(r => Object.values(r).some(v => v !== ''));
}

// ── detectCols ───────────────────────────────────────────────
export function detectCols(data: Row[]): ColInfo {
  if (!data.length) return { num: [], txt: [], date: [] };
  const keys = Object.keys(data[0]);
  const num: string[] = [], txt: string[] = [], date: string[] = [];

  keys.forEach(k => {
    const vals = data.map(r => r[k]).filter(v => v !== '' && v != null);
    if (!vals.length) { txt.push(k); return; }

    const nNum = vals.filter(v => typeof v === 'number').length;
    const nDate = vals.filter(v => {
      const d = new Date(String(v));
      return !isNaN(d.getTime()) && String(v).length >= 6;
    }).length;

    if (nDate / vals.length > 0.4) date.push(k);
    else if (nNum / vals.length > 0.5) num.push(k);
    else txt.push(k);
  });

  return { num, txt, date };
}

/**
 * Transforme des noms de colonnes techniques en noms plus parlants
 */
export function prettyName(col: string): string {
  const low = col.toLowerCase().trim();
  const mapping: Record<string, string> = {
    'ca': 'Chiffre d\'Affaires',
    'sales': 'Ventes',
    'qty': 'Quantité',
    'stock': 'Niveau de Stock',
    'profit': 'Profit Net',
    'revenue': 'Revenus',
    'expenses': 'Dépenses',
    'costs': 'Coûts',
    'patients': 'Nombre de Patients',
    'visits': 'Visites',
    'production': 'Volume Production',
    'redevances': 'Total Redevances',
    'extraction': 'Volume Extraction',
    'budget': 'Budget Global',
    'consommé': 'Budget Consommé',
    'alloué': 'Budget Alloué',
    'price': 'Prix Unitaire',
  };

  if (mapping[low]) return mapping[low];
  
  // Si pas de match exact, on nettoie un peu (Majuscule, suppression _ et -)
  return col.charAt(0).toUpperCase() + col.slice(1).replace(/[_-]/g, ' ');
}

/**
 * Détecte si une colonne représente une valeur monétaire
 */
export function detectUnit(col: string): string | undefined {
  const low = col.toLowerCase();
  const moneyKeywords = ['ca', 'profit', 'revenue', 'dépenses', 'costs', 'redevances', 'budget', 'consommé', 'alloué', 'prix', 'price', 'ventes', 'sales'];
  
  if (moneyKeywords.some(kw => low.includes(kw))) {
    return 'GNF'; // Devise par défaut
  }
  
  if (low.includes('%') || low.includes('taux') || low.includes('rate')) return '%';
  
  return undefined;
}

// ── buildViz ─────────────────────────────────────────────────
export function buildViz(data: Row[], cols: ColInfo, targets: Record<string, number> = {}): VizData {
  if (!data.length) return { series: [], bars: [], pie: [], kpis: [], numCols: [], catCol: '', dateCol: '' };

  const { num, txt, date } = cols;
  const dateCol = date[0] || txt[0] || '';
  const numCols = num.slice(0, 6);
  const catCol = txt.find(c => c !== dateCol) || txt[0] || '';

  // 1. Détection Sectorielle
  const industry = detectIndustry(Object.keys(data[0]));

  // 2. Préparation Agrégateurs (Single Pass)
  const totals: Record<string, number> = {};
  const catMap: Record<string, number> = {};
  const geoMap: Record<string, number> = {};
  const GEN_REGIONS = ['CONAKRY', 'KINDIA', 'BOKE', 'MAMOU', 'LABE', 'FARANAH', 'KANKAN', 'NZEREKORE'];

  const geoCol = txt.find(c => {
    const samples = data.slice(0, 10).map(r => String(r[c] || '').toUpperCase());
    return samples.some(s => GEN_REGIONS.includes(s));
  });

  // Pour calcul trends (last / prev)
  const lastRow = data[data.length - 1];
  const prevRow = data[data.length - 2] || lastRow;

  // 3. Boucle unique sur la donnée
  data.forEach((r, idx) => {
    // Totaux pour KPIs standards
    numCols.forEach(c => {
      const v = Number(r[c]) || 0;
      totals[c] = (totals[c] || 0) + v;
    });

    // Agrégation Catégories (basé sur le premier numCol)
    if (catCol && numCols[0]) {
      const k = String(r[catCol] ?? 'Autre').slice(0, 28);
      catMap[k] = (catMap[k] || 0) + (Number(r[numCols[0]]) || 0);
    }

    // Agrégation Géo
    if (geoCol && numCols[0]) {
      const val = String(r[geoCol] || '').toUpperCase();
      const reg = GEN_REGIONS.find(g => val.includes(g));
      if (reg) geoMap[reg] = (geoMap[reg] || 0) + (Number(r[numCols[0]]) || 0);
    }
  });

  // 4. Calcul KPIs Métiers (Secteur)
  const industryKPIs: KpiData[] = [];
  if (industry) {
    industry.kpis.forEach(tk => {
      if (tk.colA && tk.colB && lastRow[tk.colA] !== undefined && lastRow[tk.colB] !== undefined) {
        const calculateVal = (row: Row) => {
          const vA = Number(row[tk.colA!]) || 0;
          const vB = Number(row[tk.colB!]) || 0;
          if (tk.op === '+') return vA + vB;
          if (tk.op === '-') return vA - vB;
          if (tk.op === '*') return vA * vB;
          if (tk.op === '/') return vB !== 0 ? vA / vB : 0;
          return vA;
        };

        const totalA = totals[tk.colA] || 0;
        const totalB = totals[tk.colB] || 0;
        let total = 0;
        if (tk.op === '+') total = totalA + totalB;
        if (tk.op === '-') total = totalA - totalB;
        if (tk.op === '*') total = totalA * totalB;
        if (tk.op === '/') total = totalB !== 0 ? totalA / totalB : 0;

        const last = calculateVal(lastRow);
        const prev = calculateVal(prevRow);
        const trend = prev ? +((last - prev) / Math.abs(prev) * 100).toFixed(1) : 0;

        industryKPIs.push({
          col: tk.name,
          total,
          last,
          avg: total / data.length,
          trend,
          color: tk.color,
          count: data.length,
          unit: tk.unit,
          target: targets[tk.name]
        });
      }
    });
  }

  // 4.5. Smart Ratios (Auto-détection de couples logiques)
  const smartKPIs: KpiData[] = [];
  if (numCols.includes('CA') && (numCols.includes('Charges') || numCols.includes('Profit'))) {
      const caTotal = totals['CA'] || 1;
      const profitCol = numCols.includes('Profit') ? 'Profit' : undefined;
      if (profitCol) {
          const profitTotal = totals[profitCol] || 0;
          const lastMargin = +((Number(lastRow[profitCol]) || 0) / (Number(lastRow['CA']) || 1) * 100).toFixed(1);
          const prevMargin = +((Number(prevRow[profitCol]) || 0) / (Number(prevRow['CA']) || 1) * 100).toFixed(1);
          const trend = prevMargin ? +((lastMargin - prevMargin) / Math.abs(prevMargin) * 100).toFixed(1) : 0;

          smartKPIs.push({
              col: 'Marge Totale (Auto)',
              total: +(profitTotal / caTotal * 100).toFixed(1),
              last: lastMargin,
              avg: +(profitTotal / caTotal * 100).toFixed(1),
              trend,
              color: '#3B82F6',
              count: data.length,
              unit: '%'
          });
      }
  }
  // Ratio de coût moyen si on a Volume et Coût
  const volumeCol = num.find(c => ['volume', 'qty', 'quantité', 'extraction', 'production'].includes(c.toLowerCase()));
  const costCol = num.find(c => ['coûts', 'charges', 'expenses', 'coût'].includes(c.toLowerCase()));
  if (volumeCol && costCol && !industryKPIs.some(k => k.col.includes('Coût'))) {
      const volTotal = totals[volumeCol] || 1;
      const costTotal = totals[costCol] || 0;
      const lastCost = +((Number(lastRow[costCol]) || 0) / (Number(lastRow[volumeCol]) || 1)).toFixed(2);
      const prevCost = +((Number(prevRow[costCol]) || 0) / (Number(prevRow[volumeCol]) || 1)).toFixed(2);
      const trend = prevCost ? +((lastCost - prevCost) / Math.abs(prevCost) * 100).toFixed(1) : 0;

      smartKPIs.push({
          col: `Coût Moyen/${prettyName(volumeCol)}`,
          total: +(costTotal / volTotal).toFixed(2),
          last: lastCost,
          avg: +(costTotal / volTotal).toFixed(2),
          trend: -trend, // Inverser car une hausse de coût est négative stratégiquement
          color: '#EF4444',
          count: data.length,
          unit: 'GNF'
      });
  }

  // 5. Série temporelle (max 40 pts)
  const series = data.slice(-40).map((r, i) => {
    const pt: Record<string, string | number> = {
      _label: String(r[dateCol] ?? '').slice(0, 14),
    };
    numCols.forEach(c => { pt[c] = Number(r[c]) || 0; });

    // Growth line sur le KPI principal
    if (i > 0 && numCols[0]) {
      const prevVal = Number(data.slice(-40)[i - 1][numCols[0]]) || 1;
      pt['_growth'] = +((Number(r[numCols[0]]) - prevVal) / Math.abs(prevVal) * 100).toFixed(1);
    } else {
      pt['_growth'] = 0;
    }
    return pt;
  });

  // 6. Finalisation Formats
  const bars = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const pie = bars.slice(0, 6).map((b, i) => ({
    ...b,
    color: COLORS[i % COLORS.length],
  }));

  const standardKPIs: KpiData[] = numCols.map((col, i) => {
    const last = Number(lastRow[col]) || 0;
    const prev = Number(prevRow[col]) || last;
    const trend = prev ? +((last - prev) / Math.abs(prev) * 100).toFixed(1) : 0;
    const total = totals[col] || 0;

    return {
      col, total, last,
      avg: total / data.length,
      trend,
      color: COLORS[i % COLORS.length],
      count: data.length,
      unit: detectUnit(col),
      target: targets[col],
    };
  });

  const geo = Object.keys(geoMap).length > 0
    ? Object.entries(geoMap).map(([name, value]) => ({ name, value }))
    : undefined;

  // Mixer KPIs (Industry first)
  const industryColNames = new Set([...industryKPIs, ...smartKPIs].map(k => k.col));
  const filteredStandard = standardKPIs.filter(k => !industryColNames.has(k.col));
  const allKPIs = [...industryKPIs, ...smartKPIs, ...filteredStandard].slice(0, 15);

  return { series, bars, pie, kpis: allKPIs, numCols, catCol, dateCol, geo, industry: industry?.label };
}

// ── toCSV ────────────────────────────────────────────────────
export function toCSV(data: Row[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = data.map(r => headers.map(h => escape(r[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}
