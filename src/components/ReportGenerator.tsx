'use client';

import { useState } from 'react';
import { Row, VizData } from '@/lib/parser';
import { useI18n } from '@/i18n/I18nContext';
import { generateEnterpriseReport } from '@/lib/export';

interface Props {
    data: Row[];
    viz: VizData;
    dbName: string;
    onClose: () => void;
}

export default function ReportGenerator({ data, viz, dbName, onClose }: Props) {
    const { t } = useI18n();
    const [title, setTitle] = useState(dbName);
    const [author, setAuthor] = useState('');
    const [includeCover, setIncludeCover] = useState(true);
    const [includeSummary, setIncludeSummary] = useState(true);
    const [includeCharts, setIncludeCharts] = useState(true);
    const [includeTable, setIncludeTable] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            await generateEnterpriseReport({
                title,
                author,
                data,
                viz,
                options: { includeCover, includeSummary, includeCharts, includeTable }
            });
            onClose();
        } catch (err) {
            alert("Erreur lors de la génération du rapport");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 20,
                width: '100%', maxWidth: 500, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800 }}>{t.dashboard.report_title || 'Générateur de Rapport Pro'} 📄</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--mu)', cursor: 'pointer', fontSize: 20 }}>&times;</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 11, color: 'var(--mu)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 6 }}>Titre du Rapport</label>
                        <input
                            value={title} onChange={e => setTitle(e.target.value)}
                            style={{ width: '100%', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 8, padding: '10px 12px', color: 'var(--tx)', outline: 'none' }}
                            placeholder="Ex: Rapport Annuel d'Activité"
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: 11, color: 'var(--mu)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 6 }}>Auteur / Organisation</label>
                        <input
                            value={author} onChange={e => setAuthor(e.target.value)}
                            style={{ width: '100%', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 8, padding: '10px 12px', color: 'var(--tx)', outline: 'none' }}
                            placeholder="Votre nom ou société"
                        />
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, marginTop: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Contenu du Document</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                                <input type="checkbox" checked={includeCover} onChange={e => setIncludeCover(e.target.checked)} />
                                Page de Garde Pro
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                                <input type="checkbox" checked={includeSummary} onChange={e => setIncludeSummary(e.target.checked)} />
                                Résumé Exécutif
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                                <input type="checkbox" checked={includeCharts} onChange={e => setIncludeCharts(e.target.checked)} />
                                Graphiques Clés
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                                <input type="checkbox" checked={includeTable} onChange={e => setIncludeTable(e.target.checked)} />
                                Tableau de Données
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            style={{
                                flex: 2, padding: '14px', borderRadius: 12, background: 'var(--gl)', color: '#000',
                                fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 10px 20px rgba(237,176,37,0.2)', transition: 'all 0.2s',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Génération...' : 'PDF Expert'}
                        </button>
                        <button
                            onClick={() => {
                                const blob = new Blob([JSON.stringify({ title, data, viz }, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = `${title.replace(/\s/g, '_')}_data.json`; a.click();
                            }}
                            style={{
                                flex: 1, padding: '14px', borderRadius: 12, background: 'var(--sf)', color: 'var(--tx)',
                                fontWeight: 700, border: '1px solid var(--bd)', cursor: 'pointer',
                                fontSize: 13
                            }}
                        >
                            JSON
                        </button>
                        <button
                            onClick={() => {
                                const csv = require('@/lib/parser').toCSV(data);
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = `${title.replace(/\s/g, '_')}_rows.csv`; a.click();
                            }}
                            style={{
                                flex: 1, padding: '14px', borderRadius: 12, background: 'var(--sf)', color: 'var(--tx)',
                                fontWeight: 700, border: '1px solid var(--bd)', cursor: 'pointer',
                                fontSize: 13
                            }}
                        >
                            CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
