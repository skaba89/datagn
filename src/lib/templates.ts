// ============================================
// DASHBOARD TEMPLATES
// Pre-built dashboard configurations for quick setup
// ============================================

export const DASHBOARD_TEMPLATES = {
  sales: {
    id: 'sales',
    name: 'Ventes & Revenus',
    icon: '💼',
    color: '#3B82F6',
    description: 'Suivi des performances commerciales',
    layout: 'bento' as const,
    kpis: [
      { name: 'Chiffre d\'Affaires', category: 'Finance', vizType: 'sparkline', color: '#3B82F6', size: 'large', columnSpan: 2 },
      { name: 'Nouveaux Clients', category: 'Ventes', vizType: 'trend', color: '#10B981', size: 'medium' },
      { name: 'Taux de Conversion', category: 'Ventes', vizType: 'gauge', color: '#8B5CF6', size: 'medium' },
      { name: 'Pipeline Value', category: 'Ventes', vizType: 'progress', color: '#F59E0B', size: 'medium' },
      { name: 'Win Rate', category: 'Ventes', vizType: 'comparison', color: '#06B6D4', size: 'small' },
      { name: 'Panier Moyen', category: 'Ventes', vizType: 'scorecard', color: '#EC4899', size: 'small' }
    ]
  },

  finance: {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    color: '#10B981',
    description: 'Indicateurs financiers et profitability',
    layout: 'grid' as const,
    kpis: [
      { name: 'Revenus Totaux', category: 'Finance', vizType: 'sparkline', color: '#10B981', size: 'large', columnSpan: 2 },
      { name: 'Marge Brute', category: 'Finance', vizType: 'bullet', color: '#22C55E', size: 'medium' },
      { name: 'EBITDA', category: 'Finance', vizType: 'trend', color: '#3B82F6', size: 'medium' },
      { name: 'Cash Flow', category: 'Finance', vizType: 'gauge', color: '#8B5CF6', size: 'medium' },
      { name: 'DPO', category: 'Finance', vizType: 'scorecard', color: '#F59E0B', size: 'small' },
      { name: 'Burn Rate', category: 'Finance', vizType: 'progress', color: '#EF4444', size: 'small' }
    ]
  },

  marketing: {
    id: 'marketing',
    name: 'Marketing',
    icon: '📈',
    color: '#8B5CF6',
    description: 'Campagnes et acquisition',
    layout: 'grid' as const,
    kpis: [
      { name: 'Leads Générés', category: 'Marketing', vizType: 'sparkline', color: '#8B5CF6', size: 'medium' },
      { name: 'Coût par Lead', category: 'Marketing', vizType: 'comparison', color: '#EF4444', size: 'medium' },
      { name: 'ROI Campagnes', category: 'Marketing', vizType: 'gauge', color: '#10B981', size: 'medium' },
      { name: 'Taux d\'Ouverture', category: 'Marketing', vizType: 'progress', color: '#F59E0B', size: 'medium' },
      { name: 'Engagement Rate', category: 'Marketing', vizType: 'trend', color: '#06B6D4', size: 'medium' }
    ]
  },

  operations: {
    id: 'operations',
    name: 'Opérations',
    icon: '⚙️',
    color: '#F59E0B',
    description: 'Performance opérationnelle',
    layout: 'grid' as const,
    kpis: [
      { name: 'Efficacité', category: 'Opérations', vizType: 'gauge', color: '#10B981', size: 'medium' },
      { name: 'Temps de Cycle', category: 'Opérations', vizType: 'bullet', color: '#F59E0B', size: 'medium' },
      { name: 'Défauts', category: 'Opérations', vizType: 'trend', color: '#EF4444', size: 'medium' },
      { name: 'SLA', category: 'Opérations', vizType: 'progress', color: '#3B82F6', size: 'medium' },
      { name: 'Productivity', category: 'Opérations', vizType: 'scorecard', color: '#8B5CF6', size: 'small' }
    ]
  },

  support: {
    id: 'support',
    name: 'Support Client',
    icon: '🎧',
    color: '#EC4899',
    description: 'Métriques de support',
    layout: 'grid' as const,
    kpis: [
      { name: 'Tickets Ouverts', category: 'Support', vizType: 'sparkline', color: '#3B82F6', size: 'medium' },
      { name: 'Temps de Réponse', category: 'Support', vizType: 'bullet', color: '#10B981', size: 'medium' },
      { name: 'Satisfaction', category: 'Support', vizType: 'gauge', color: '#8B5CF6', size: 'medium' },
      { name: 'Résolution Rate', category: 'Support', vizType: 'progress', color: '#10B981', size: 'medium' },
      { name: 'NPS', category: 'Support', vizType: 'scorecard', color: '#F59E0B', size: 'medium' }
    ]
  },

  it: {
    id: 'it',
    name: 'IT & Infrastructure',
    icon: '🖥️',
    color: '#06B6D4',
    description: 'Surveillance IT',
    layout: 'flex' as const,
    kpis: [
      { name: 'Uptime', category: 'IT', vizType: 'gauge', color: '#10B981', size: 'medium' },
      { name: 'Latence', category: 'IT', vizType: 'bullet', color: '#F59E0B', size: 'medium' },
      { name: 'Erreurs', category: 'IT', vizType: 'trend', color: '#EF4444', size: 'medium' },
      { name: 'CPU Usage', category: 'IT', vizType: 'progress', color: '#3B82F6', size: 'small' },
      { name: 'Memory', category: 'IT', vizType: 'progress', color: '#8B5CF6', size: 'small' }
    ]
  },

  executive: {
    id: 'executive',
    name: 'Vue Exécutive',
    icon: '👑',
    color: '#F59E0B',
    description: 'Dashboard pour la direction',
    layout: 'bento' as const,
    kpis: [
      { name: 'Chiffre d\'Affaires', category: 'Finance', vizType: 'sparkline', color: '#10B981', size: 'xlarge', columnSpan: 2 },
      { name: 'Croissance', category: 'Finance', vizType: 'comparison', color: '#3B82F6', size: 'large', columnSpan: 2 },
      { name: 'EBITDA', category: 'Finance', vizType: 'gauge', color: '#8B5CF6', size: 'medium' },
      { name: 'Clients Actifs', category: 'Ventes', vizType: 'scorecard', color: '#F59E0B', size: 'medium' },
      { name: 'NPS', category: 'Support', vizType: 'scorecard', color: '#EC4899', size: 'medium' },
      { name: 'Risque', category: 'Finance', vizType: 'bullet', color: '#EF4444', size: 'medium' }
    ]
  }
} as const;

export type DashboardTemplate = typeof DASHBOARD_TEMPLATES[keyof typeof DASHBOARD_TEMPLATES];

// ============================================
// KPI VISUALIZATION CONFIGURATIONS
// ============================================

export const VIZ_CONFIGS = {
  sparkline: {
    name: 'Sparkline',
    icon: '📈',
    description: 'Mini graphique de tendance sur 12 points',
    supportsPrediction: true,
    minHeight: 40,
    maxHeight: 80
  },
  gauge: {
    name: 'Jauge',
    icon: '⭕',
    description: 'Jauge semi-circulaire avec gradient',
    supportsPrediction: false,
    minHeight: 80,
    maxHeight: 160
  },
  bullet: {
    name: 'Bullet Chart',
    icon: '📊',
    description: 'Comparaison visuelle avec zones de performance',
    supportsPrediction: false,
    minHeight: 60,
    maxHeight: 100
  },
  progress: {
    name: 'Progression',
    icon: '📋',
    description: 'Barre de progression vers objectif',
    supportsPrediction: false,
    minHeight: 40,
    maxHeight: 80
  },
  comparison: {
    name: 'Comparaison',
    icon: '🔄',
    description: 'Avant/Après avec indicateur de tendance',
    supportsPrediction: false,
    minHeight: 60,
    maxHeight: 100
  },
  scorecard: {
    name: 'Scorecard',
    icon: '🎯',
    description: 'Grande valeur centrée avec métriques',
    supportsPrediction: true,
    minHeight: 80,
    maxHeight: 120
  },
  trend: {
    name: 'Tendance',
    icon: '📉',
    description: 'Sparkline avec valeur intégrée',
    supportsPrediction: true,
    minHeight: 50,
    maxHeight: 80
  }
} as const;

export type VizConfig = typeof VIZ_CONFIGS[keyof typeof VIZ_CONFIGS];

// ============================================
// INDUSTRY TEMPLATES
// ============================================

export interface IndustryTemplate {
    id: string;
    label: string;
    keywords: string[];
    kpis: {
        name: string;
        formula?: (row: any) => number;
        colA?: string;
        colB?: string;
        op?: '+' | '-' | '*' | '/';
        color: string;
        unit?: string;
    }[];
    suggestedCharts: string[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
    {
        id: 'mining',
        label: 'Mines & Ressources (ITIE)',
        keywords: ['production', 'redevance', 'extraction', 'tonnage', 'minerai', 'teneur'],
        kpis: [
            { name: 'Rendement Extraction', colA: 'Extraction', colB: 'Objectif', op: '/', color: '#EDB025', unit: '%' },
            { name: 'Efficacité Redevances', colA: 'Redevances', colB: 'Production', op: '/', color: '#3B82F6', unit: '%' },
            { name: 'Taux de Teneur Moyenne', colA: 'Teneur', colB: 'Production', op: '/', color: '#10B981', unit: '%' },
            { name: 'Coût d\'Extraction/Tonne', colA: 'Coûts', colB: 'Extraction', op: '/', color: '#EF4444', unit: 'GNF/T' }
        ],
        suggestedCharts: ['composed', 'map']
    },
    {
        id: 'finance',
        label: 'Banque & Finance / PME',
        keywords: ['chiffre d\'affaires', 'ca', 'ventes', 'charges', 'profit', 'ebitda', 'cash'],
        kpis: [
            { name: 'Marge Opérationnelle', colA: 'Profit', colB: 'CA', op: '/', color: '#3CA06A', unit: '%' },
            { name: 'Marge Nette', colA: 'Profit', colB: 'Ventes', op: '/', color: '#3B82F6', unit: '%' },
            { name: 'Point Mort (Est.)', colA: 'Charges', colB: 'Ventes', op: '/', color: '#EF4444', unit: '%' },
            { name: 'Ratio de Liquidité', colA: 'Trésorerie', colB: 'Dettes', op: '/', color: '#8B5CF6' }
        ],
        suggestedCharts: ['area', 'bar']
    },
    {
        id: 'health',
        label: 'Santé & Pharmaceutique',
        keywords: ['patients', 'consultations', 'vaccins', 'hospitalisation', 'lits', 'incidence'],
        kpis: [
            { name: 'Taux Occupation', colA: 'Hospitalisés', colB: 'Lits', op: '/', color: '#EF4444', unit: '%' },
            { name: 'Ratio Soignants/Patients', colA: 'Effectif Médical', colB: 'Patients', op: '/', color: '#8B5CF6' },
            { name: 'Taux de Rétablissement', colA: 'Sorties', colB: 'Entrées', op: '/', color: '#10B981', unit: '%' },
            { name: 'Délai d\'Attente Moyen', colA: 'Attente', colB: 'Consultations', op: '/', color: '#F59E0B', unit: 'min' }
        ],
        suggestedCharts: ['bar', 'area']
    },
    {
        id: 'gov',
        label: 'Gouvernance & Secteur Public',
        keywords: ['budget', 'alloué', 'consommé', 'engagement', 'exécution', 'social'],
        kpis: [
            { name: 'Taux Exécution', colA: 'Consommé', colB: 'Alloué', op: '/', color: '#004A99', unit: '%' },
            { name: 'Impact Social', colA: 'Bénéficiaires', colB: 'Cible', op: '/', color: '#10B981', unit: '%' },
            { name: 'Efficience Budgétaire', colA: 'Impact', colB: 'Dépenses', op: '/', color: '#8B5CF6', unit: 'score' },
            { name: 'Indice de Transparence', colA: 'Publiés', colB: 'Total Rapports', op: '/', color: '#3B82F6', unit: '%' }
        ],
        suggestedCharts: ['pie', 'composed']
    },
    {
        id: 'agri',
        label: 'Agriculture & Agro-industrie',
        keywords: ['récolte', 'rendement', 'hectare', 'semis', 'engrais', 'tonnes', 'parcelle', 'culture'],
        kpis: [
            { name: 'Rendement (T/ha)', colA: 'Récolte', colB: 'Hectares', op: '/', color: '#10B981', unit: 'T/ha' },
            { name: 'Efficacité Intrants', colA: 'Production', colB: 'Engrais', op: '/', color: '#3CA06A', unit: '%' },
            { name: 'Ratio de Perte Récolte', colA: 'Pertes', colB: 'Récolte', op: '/', color: '#EF4444', unit: '%' },
            { name: 'Valeur Ajoutée/Hectare', colA: 'Ventes', colB: 'Hectares', op: '/', color: '#EDB025', unit: 'GNF/ha' }
        ],
        suggestedCharts: ['bar', 'map']
    },
    {
        id: 'edu',
        label: 'Éducation & Formation',
        keywords: ['élèves', 'étudiants', 'réussite', 'abandon', 'classe', 'professeur', 'mention', 'scolarité'],
        kpis: [
            { name: 'Taux de Réussite', colA: 'Admis', colB: 'Inscrits', op: '/', color: '#3B82F6', unit: '%' },
            { name: 'Ratio Encadrement', colA: 'Professeurs', colB: 'Élèves', op: '/', color: '#8B5CF6', unit: 'Prof/Élève' },
            { name: 'Taux d\'Abandon', colA: 'Abandons', colB: 'Inscrits', op: '/', color: '#EF4444', unit: '%' },
            { name: 'Note Moyenne Certificat', colA: 'Total Notes', colB: 'Candidats', op: '/', color: '#10B981' }
        ],
        suggestedCharts: ['pie', 'bar']
    },
    {
        id: 'retail',
        label: 'Commerce & Retail',
        keywords: ['ventes', 'stock', 'articles', 'panier', 'client', 'magasin', 'rayon', 'retour'],
        kpis: [
            { name: 'Panier Moyen', colA: 'Ventes', colB: 'Transactions', op: '/', color: '#EDB025', unit: 'GNF' },
            { name: 'Rotation Stock', colA: 'Sorties', colB: 'Stock Initial', op: '/', color: '#F97316', unit: 'jours' },
            { name: 'Taux de Retour Client', colA: 'Retours', colB: 'Ventes', op: '/', color: '#EF4444', unit: '%' },
            { name: 'Conversion Prospect', colA: 'Ventes', colB: 'Visites', op: '/', color: '#3CA06A', unit: '%' }
        ],
        suggestedCharts: ['area', 'bar']
    },
    {
        id: 'logistics',
        label: 'Transport & Logistique',
        keywords: ['km', 'carburant', 'livraison', 'colis', 'trajet', 'chauffeur', 'véhicule', 'délai'],
        kpis: [
            { name: 'Coût au KM', colA: 'Dépenses', colB: 'Kilométrage', op: '/', color: '#EF4444', unit: 'GNF/km' },
            { name: 'Taux de Remplissage', colA: 'Volume Chargé', colB: 'Capacité Utile', op: '/', color: '#0EA5E9', unit: '%' },
            { name: 'Performance Délais', colA: 'Livrés Temps', colB: 'Total Livrés', op: '/', color: '#10B981', unit: '%' },
            { name: 'Émission Carbone/KM', colA: 'CO2', colB: 'Kilométrage', op: '/', color: '#6366F1' }
        ],
        suggestedCharts: ['composed', 'bar']
    }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getTemplateById(id: string): DashboardTemplate | undefined {
  return DASHBOARD_TEMPLATES[id as keyof typeof DASHBOARD_TEMPLATES];
}

export function getTemplateNames(): { id: string; name: string; icon: string }[] {
  return Object.values(DASHBOARD_TEMPLATES).map(t => ({
    id: t.id,
    name: t.name,
    icon: t.icon
  }));
}

export function generateKPIsFromTemplate(template: DashboardTemplate): Partial<KPI>[] {
  return template.kpis.map((kpi, index) => ({
    ...kpi,
    order: index,
    value: 0,
    previousValue: 0,
    trend: 0,
    sparkline: [],
    showPrediction: true,
    confidence: 0.85,
    columnSpan: kpi.columnSpan || 1,
    rowSpan: 1
  }));
}

/**
 * Tente de deviner le secteur d'activité basé sur les noms de colonnes
 */
export function detectIndustry(columns: string[]): IndustryTemplate | null {
    const colsLower = columns.map(c => c.toLowerCase());

    let bestMatch: IndustryTemplate | null = null;
    let maxMatches = 0;

    for (const template of INDUSTRY_TEMPLATES) {
        const matches = template.keywords.filter(kw =>
            colsLower.some(c => c.includes(kw))
        ).length;

        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = template;
        }
    }

    return maxMatches > 0 ? bestMatch : null;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target?: number;
  unit?: string;
  trend: number;
  category?: string;
  color: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  columnSpan: number;
  rowSpan: number;
  order: number;
  vizType: 'sparkline' | 'gauge' | 'trend' | 'progress' | 'bullet' | 'scorecard' | 'comparison';
  showPrediction?: boolean;
  confidence?: number;
  prediction?: number[];
  sparkline: number[];
}
