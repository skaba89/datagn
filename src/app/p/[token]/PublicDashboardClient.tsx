'use client';

import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import { buildViz, detectCols, Row, VizData } from '@/lib/parser';
import { loadSource } from '@/lib/fetcher';

export default function PublicDashboardClient({ db }: { db: any }) {
    const [data, setData] = useState<Row[]>([]);
    const [viz, setViz] = useState<VizData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const rows = await loadSource(db.sourceType, db.config);
                setData(rows);
                setViz(buildViz(rows, detectCols(rows)));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [db]);

    const wsSettings = db.workspace?.settings as any || {};

    if (loading) return (
        <div style={{
            height: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#050E08', flexDirection: 'column', gap: 24
        }}>
            {/* Elite Loader */}
            <div style={{ position: 'relative', width: 80, height: 80 }}>
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '2px solid rgba(237,176,37,0.1)',
                    borderTop: '2px solid #EDB025',
                    animation: 'spin 1s linear infinite'
                }} />
                <div style={{
                    position: 'absolute', inset: 8, borderRadius: '50%',
                    border: '2px solid rgba(16,185,129,0.1)',
                    borderTop: '2px solid #10B981',
                    animation: 'spin 1.4s linear infinite reverse'
                }} />
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 24
                }}>📊</div>
            </div>
            <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 6 }}>
                    Chargement du rapport...
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    Analyse des données en cours
                </div>
            </div>
        </div>
    );

    if (error || !viz) return (
        <div style={{
            height: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#050E08'
        }}>
            <div style={{
                textAlign: 'center', maxWidth: 420, padding: '40px 32px',
                background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>🚫</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
                    Données indisponibles
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                    Impossible de charger les données source de ce dashboard. La source de données a peut-être été désactivée ou modifiée.
                </div>
                {error && (
                    <div style={{
                        marginTop: 16, fontSize: 11, color: '#EF4444',
                        background: 'rgba(239,68,68,0.08)', padding: '10px 14px',
                        borderRadius: 10, fontFamily: 'monospace', textAlign: 'left',
                        border: '1px solid rgba(239,68,68,0.15)'
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{
            background: 'var(--bg)',
            minHeight: '100vh',
            '--gl': wsSettings.primaryColor || '#EDB025',
        } as any}>
            <Dashboard
                data={data}
                viz={viz}
                sourceType={db.sourceType as any}
                cfg={db.config}
                dbId={db.id}
                dbName={db.name}
                history={db.history}
                readOnly={true}
            />

            {/* Floating Action Bar */}
            <div style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
                display: 'flex', alignItems: 'center', gap: 10
            }}>
                {/* Print / Export PDF Button */}
                <button
                    onClick={handlePrint}
                    title="Exporter en PDF"
                    style={{
                        background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
                        color: '#FBBF24', borderRadius: 12, padding: '8px 16px', cursor: 'pointer',
                        fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8,
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(251,191,36,0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(251,191,36,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    📄 Exporter PDF
                </button>

                {/* Powered by watermark */}
                <div style={{
                    background: 'rgba(5, 14, 8, 0.8)', padding: '8px 16px',
                    borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 11, color: 'rgba(255,255,255,0.5)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                }}>
                    {wsSettings.logo ? (
                        <img src={wsSettings.logo} alt="Logo" style={{ height: 14, maxWidth: 60, objectFit: 'contain' }} />
                    ) : (
                        <span>📈</span>
                    )}
                    Propulsé par{' '}
                    <span style={{ color: '#FBBF24', fontWeight: 800 }}>
                        {wsSettings.orgName || 'DataGN IA'}
                    </span>
                </div>
            </div>
        </div>
    );
}
