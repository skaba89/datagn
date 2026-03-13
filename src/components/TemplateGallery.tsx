'use client';

import { useI18n } from '@/i18n/I18nContext';

interface Template {
    id: string;
    name: string;
    desc: string;
    icon: string;
    color: string;
    kpis: { name: string; colA: string; colB: string; op: string }[];
}

interface Props {
    onSelect: (template: Template) => void;
    onClose: () => void;
}

export default function TemplateGallery({ onSelect, onClose }: Props) {
    const { t } = useI18n();

    const TEMPLATES: Template[] = [
        {
            id: 'gov', name: 'Gouvernement & Planification',
            desc: 'Optimisé pour le suivi des politiques publiques et projets d\'État.',
            icon: '🏛️', color: '#004A99',
            kpis: [{ name: 'Taux Exécution', colA: 'Budget Consommé', colB: 'Budget Alloué', op: '/' }]
        },
        {
            id: 'mining', name: 'Exploitation Minière (ITIE)',
            desc: 'Focus sur les redevances, la production et l\'impact local.',
            icon: '⛏️', color: '#EDB025',
            kpis: [{ name: 'Rapport Redevance/Prod', colA: 'Redevances', colB: 'Production', op: '/' }]
        },
        {
            id: 'health', name: 'Santé Publique & Épidémies',
            desc: 'Suivi des indicateurs sanitaires et couverture vaccinale.',
            icon: '🏥', color: '#EF4444',
            kpis: [{ name: 'Taux Hospitalisation', colA: 'Patients', colB: 'Lits', op: '/' }]
        },
        {
            id: 'pme', name: 'Performance PME / Finance',
            desc: 'Gestion du CA, des charges et de la rentabilité mensuelle.',
            icon: '📈', color: '#3CA06A',
            kpis: [{ name: 'Marge Brute', colA: 'Ventes', colB: 'Achats', op: '-' }]
        },
        {
            id: 'rh', name: 'Ressources Humaines',
            desc: 'Analyse du turnover, de la masse salariale et du recrutement.',
            icon: '👥', color: '#8B5CF6',
            kpis: [{ name: 'Masse Salariale', colA: 'Salaire Base', colB: 'Bonus', op: '+' }]
        },
        {
            id: 'retail', name: 'Vente au détail / E-commerce',
            desc: 'Suivi des ventes journalières, du panier moyen et des stocks.',
            icon: '🛒', color: '#10B981',
            kpis: [{ name: 'Panier Moyen', colA: 'Chiffre Affaires', colB: 'Nombre Commandes', op: '/' }]
        },
        {
            id: 'edu', name: 'Éducation & Formation',
            desc: 'Analyse des taux de réussite, assiduité et effectifs scolaires.',
            icon: '🎓', color: '#F59E0B',
            kpis: [{ name: 'Taux Réussite', colA: 'Admis', colB: 'Effectif Total', op: '/' }]
        },
        {
            id: 'logistics', name: 'Logistique & Transport',
            desc: 'Optimisation des livraisons, coûts de flotte et délais.',
            icon: '🚚', color: '#6366F1',
            kpis: [{ name: 'Coût par Km', colA: 'Coûts Transport', colB: 'Kms Parcourus', op: '/' }]
        }
    ];

    return (
        <div className="fu" style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'
        }}>
            <div className="glass-panel" style={{
                borderRadius: 32, width: '100%', maxWidth: 800, padding: 40,
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Subtle Background Glow */}
                <div style={{
                    position: 'absolute', top: -100, right: -100, width: 300, height: 300,
                    background: 'radial-gradient(circle, var(--gn) 0%, transparent 70%)',
                    opacity: 0.15, filter: 'blur(60px)', pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, position: 'relative' }}>
                    <div>
                        <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', color: 'var(--tx)' }}>Galerie de Modèles 🏛️💎</h2>
                        <p style={{ fontSize: 15, color: 'var(--mu)', marginTop: 8 }}>Déployez des solutions analytiques de classe mondiale en quelques secondes.</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--bd)',
                            borderRadius: 14, width: 44, height: 44, color: 'var(--tx)',
                            cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >&times;</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {TEMPLATES.map((tmp, idx) => (
                        <div
                            key={tmp.id}
                            onClick={() => onSelect(tmp)}
                            className={`glass-card fu d${idx + 1}`}
                            style={{
                                borderRadius: 24, padding: 28, cursor: 'pointer',
                                position: 'relative', overflow: 'hidden', border: '1px solid var(--bd)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                e.currentTarget.style.borderColor = tmp.color;
                                e.currentTarget.style.boxShadow = `0 12px 24px rgba(0,0,0,0.15), 0 0 10px ${tmp.color}20`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.borderColor = 'var(--bd)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                width: 56, height: 56, borderRadius: 16, background: `${tmp.color}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 32, marginBottom: 20, border: `1px solid ${tmp.color}30`
                            }}>
                                {tmp.icon}
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: 'var(--tx)' }}>{tmp.name}</h3>
                            <p style={{ fontSize: 13, color: 'var(--mu)', lineHeight: 1.6 }}>{tmp.desc}</p>

                            {/* Decorative line */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
                                background: `linear-gradient(to bottom, ${tmp.color}, transparent)`,
                                opacity: 0.4
                            }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
