'use client';
// ─────────────────────────────────────────────────────────────────────────────
// SCDPanel.tsx — Panneau de configuration de l'historisation SCD
// Permet à l'utilisateur de choisir une clé primaire, une colonne de tri (date)
// et de basculer entre "Vue Actuelle" et "Historique Complet".
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { SCDConfig } from '@/hooks/useDashboardData';
import { Row } from '@/lib/parser';

interface Props {
    data: Row[];
    onApply: (config: SCDConfig | null) => void;
    currentConfig: SCDConfig | null;
}

export default function SCDPanel({ data, onApply, currentConfig }: Props) {
    const [open, setOpen] = useState(false);
    const [primaryCol, setPrimaryCol] = useState(currentConfig?.primaryCol || '');
    const [sortCol, setSortCol] = useState(currentConfig?.sortCol || '');
    const [view, setView] = useState<'active' | 'all'>(currentConfig?.view || 'active');

    const columns = data.length > 0
        ? Object.keys(data[0]).filter(c => !c.startsWith('_'))
        : [];

    const isActive = !!currentConfig;

    const handleApply = () => {
        if (!primaryCol || !sortCol) {
            onApply(null);
        } else {
            onApply({ primaryCol, sortCol, view });
        }
        setOpen(false);
    };

    const handleReset = () => {
        setPrimaryCol('');
        setSortCol('');
        setView('active');
        onApply(null);
        setOpen(false);
    };

    const SEL: React.CSSProperties = {
        width: '100%',
        background: 'var(--cd)',
        border: '1px solid var(--bd)',
        borderRadius: 8,
        padding: '10px 14px',
        color: 'var(--tx)',
        fontSize: 13,
        cursor: 'pointer',
        outline: 'none',
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Bouton déclencheur */}
            <button
                onClick={() => setOpen(o => !o)}
                title="Fusion multi-fichiers & Historisation SCD"
                style={{
                    background: isActive ? 'var(--gl)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isActive ? 'var(--gl)' : 'var(--bd)'}`,
                    borderRadius: 10,
                    height: 38,
                    padding: '0 14px',
                    cursor: 'pointer',
                    color: isActive ? '#000' : 'var(--tx)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 12,
                    fontWeight: 800,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
                <span>🔄</span>
                {isActive
                    ? (view === 'active' ? 'SCD: Actuel' : 'SCD: Historique')
                    : 'SCD / Fusion'}
            </button>

            {/* Panneau déroulant */}
            {open && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={() => setOpen(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 998, background: 'transparent'
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: '110%',
                        right: 0,
                        zIndex: 999,
                        background: 'var(--sf)',
                        border: '1px solid var(--bd)',
                        borderRadius: 16,
                        padding: 24,
                        minWidth: 320,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                        animation: 'fadeIn .2s ease-out forwards',
                    }}>
                        {/* En-tête */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
                            <div style={{ fontSize: 28 }}>🔄</div>
                            <div>
                                <div style={{ fontWeight: 900, color: 'var(--tx)', fontSize: 14 }}>Historisation SCD</div>
                                <div style={{ color: 'var(--mu)', fontSize: 11, lineHeight: 1.6 }}>
                                    Fusion de fichiers multi-périodes avec traçabilité des changements (SCD Type 2).
                                </div>
                            </div>
                        </div>

                        {/* Clé Primaire */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--gl)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                                🔑 Clé Primaire (Identifiant unique)
                            </label>
                            <select value={primaryCol} onChange={e => setPrimaryCol(e.target.value)} style={SEL}>
                                <option value="">-- Sélectionner une colonne --</option>
                                {columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                            <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 5 }}>
                                Ex: ID_Client, Matricule, Code_Projet
                            </div>
                        </div>

                        {/* Colonne de tri (Période) */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--gl)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                                📅 Colonne de Période / Date
                            </label>
                            <select value={sortCol} onChange={e => setSortCol(e.target.value)} style={SEL}>
                                <option value="">-- Sélectionner une colonne --</option>
                                {columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                                {/* Colonne _period auto-générée lors de la fusion */}
                                <option value="_period">_period (auto)</option>
                                <option value="_source_file">_source_file (nom fichier)</option>
                            </select>
                            <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 5 }}>
                                Ex: Date, Mois, _period (colonne auto-injectée à l'import)
                            </div>
                        </div>

                        {/* Toggle Vue */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                                Données à afficher
                            </label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {(['active', 'all'] as const).map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v)}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            borderRadius: 10,
                                            border: `1px solid ${view === v ? 'var(--gl)' : 'var(--bd)'}`,
                                            background: view === v ? 'var(--gl)' : 'var(--cd)',
                                            color: view === v ? '#000' : 'var(--tx)',
                                            fontWeight: 800,
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            transition: 'all .2s',
                                        }}
                                    >
                                        {v === 'active' ? '✅ Vue Actuelle' : '📚 Historique Complet'}
                                    </button>
                                ))}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 8 }}>
                                {view === 'active'
                                    ? 'Affiche uniquement la dernière version de chaque enregistrement'
                                    : 'Affiche toutes les versions pour analyser les tendances dans le temps'}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={handleReset}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--bd)',
                                    background: 'var(--cd)', color: 'var(--tx)', fontWeight: 800, fontSize: 12,
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                Désactiver SCD
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={!primaryCol || !sortCol}
                                style={{
                                    flex: 2, padding: '12px', borderRadius: 10, border: 'none',
                                    background: (!primaryCol || !sortCol) ? 'var(--cd)' : 'var(--gl)',
                                    color: (!primaryCol || !sortCol) ? 'var(--mu)' : '#000',
                                    fontWeight: 900, fontSize: 13,
                                    cursor: (!primaryCol || !sortCol) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: (!primaryCol || !sortCol) ? 'none' : '0 5px 15px var(--gn-20)'
                                }}
                            >
                                🔄 Appliquer l'Historisation
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
