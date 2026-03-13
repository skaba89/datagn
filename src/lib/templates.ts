// ────────────────────────────────────────────────────────────────
// templates.ts — Bibliothèque Expertise Sectorielle & Métiers
// ────────────────────────────────────────────────────────────────

export interface IndustryTemplate {
    id: string;
    label: string;
    keywords: string[]; // Pour la détection automatique
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
