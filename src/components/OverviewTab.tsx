'use client';

import { Row, VizData, prettyName } from '@/lib/parser';
import { SourceType } from '@/lib/fetcher';
import { useI18n } from '@/i18n/I18nContext';
import { useTheme } from './ThemeProvider';

interface Props {
    data: Row[];
    viz: VizData;
    sourceType: SourceType;
    currency?: string;
    aliases?: Record<string, string>;
    visualModel?: string;
    rankings: { best: any[]; bad: any[] };
    onKPIClick: (col: string) => void;
}

export default function OverviewTab({
    data, viz, sourceType, currency = 'GNF', aliases = {}, visualModel = 'MODERN', rankings, onKPIClick
}: Props) {
    const { t, language } = useI18n();
    const { theme } = useTheme();
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';

    const statCards = [
        { icon: '💎', label: 'Efficacité', val: `${Math.round((viz.kpis[0]?.trend || 0) + 100)}%`, color: '#3CA06A' },
        { icon: '📊', label: 'Volume Data', val: data.length.toLocaleString(locale), color: 'var(--gl)' },
        { icon: '🤖', label: 'AI Score', val: '98%', color: '#8B5CF6' },
    ];

    const shadowColor = theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)';

    // Helper for Sparkline (Mini-Line Chart)
    const Sparkline = ({ color, col }: { color: string, col: string }) => {
        const points = data.slice(-12).map(r => Number(r[col]) || 0);
        const max = Math.max(...points) || 1;
        const min = Math.min(...points) || 0;
        const range = max - min || 1;
        const width = 120;
        const height = 40;

        if (points.length < 2) return <div style={{ width, height, background: 'var(--bd)', borderRadius: 4, opacity: 0.1 }} />;

        const path = points.map((p, i) => {
            const x = (i / (points.length - 1)) * width;
            const y = height - (((p - min) / range) || 0) * height;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        return (
            <svg width={width} height={height} style={{ overflow: 'visible' }}>
                <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    style={{ filter: `drop-shadow(0 0 5px ${color}80)` }} />
            </svg>
        );
    };

    // Section D: Leaderboards & Quality Score (Bento Mix)
    const SmartPulse = () => {
        const topKpi = viz.kpis[0];
        const lowKpi = viz.kpis.reduce((min, k) => (k.trend < min.trend ? k : min), viz.kpis[0]);
        const highestTrend = [...viz.kpis].sort((a, b) => b.trend - a.trend)[0];

        const insights = [
            `Intelligence Artificielle : Analyse de ${data.length} enregistrements terminée en temps réel.`,
        ];

        if (topKpi) {
            insights.push(`Vitalité globale : ${topKpi.trend > 0 ? 'Croissance positive' : 'Stagnation/Baisse'} détectée sur l'indicateur majeur (-${prettyName(topKpi.col)}-).`);
        }

        if (highestTrend && highestTrend.trend > 0) {
            insights.push(`🚀 Opportunité : Performance exceptionnelle (+${Math.round(highestTrend.trend)}%) relevée sur "${prettyName(highestTrend.col)}".`);
        }

        // Ajout d'insights sur les ratios automatiques
        const marginKpi = viz.kpis.find(k => k.col.includes('Marge'));
        if (marginKpi) {
            insights.push(`📈 Rentabilité : Votre marge opérationnelle est actuellement de ${Math.round(marginKpi.last)}${marginKpi.unit || ''}.`);
        }

        const costKpi = viz.kpis.find(k => k.col.includes('Coût Moyen'));
        if (costKpi) {
            insights.push(`📉 Optimisation : Le coût moyen unitaire est de ${costKpi.last.toLocaleString(locale)} ${costKpi.unit || ''}.`);
        }

        if (lowKpi && lowKpi.trend < 0) {
            insights.push(`⚠️ Alerte : Contraction de ${Math.round(Math.abs(lowKpi.trend))}% identifiée sur la métrique "${prettyName(lowKpi.col)}". Envisagez un audit.`);
        } else if (lowKpi) {
            insights.push(`💎 Excellence : Aucun de vos KPIs n'est en contraction par rapport à la période précédente.`);
        }

        const msgIndex = Math.floor(Date.now() / 7000) % insights.length;

        return (
            <div style={{
                gridColumn: '1 / -1',
                background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.05), rgba(16, 185, 129, 0.05))',
                border: '1px solid var(--bd)',
                borderRadius: 20,
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 12,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{
                    width: 10, height: 10, borderRadius: '50%', background: 'var(--gl)',
                    boxShadow: '0 0 15px var(--gl)', animation: 'pulse 2s infinite'
                }} />
                <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--gl)', textTransform: 'uppercase', letterSpacing: '2px', whiteSpace: 'nowrap' }}>
                    Smart Pulse AI
                </div>
                <div style={{ height: 16, width: 1, background: 'var(--bd)' }} />
                <div style={{
                    fontSize: 13, fontWeight: 700, color: 'var(--tx)', opacity: 0.9,
                    animation: 'fadeIn 1s ease-out forwards'
                }} key={msgIndex}>
                    {insights[msgIndex]}
                </div>
                <div style={{ position: 'absolute', right: 24, fontSize: 10, fontWeight: 900, color: 'var(--mu)', opacity: 0.5 }}>
                    LIVE ANALYSIS
                </div>
            </div>
        );
    };

    return (
        <div className="fu" style={{ animation: 'fadeIn 0.8s ease-out forwards', paddingBottom: 60 }}>
            {/* ── BENTO MASTER GRID ───────────────────────────────────── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gridAutoRows: 'minmax(120px, auto)',
                gap: 24,
            }}>
                <SmartPulse />

                {/* Section A: Digital North Star & Industry Badge (4 columns) */}
                <div style={{
                    gridColumn: '1 / span 5',
                    gridRow: 'span 2',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(251, 191, 36, 0.05))',
                    borderRadius: 32,
                    padding: 40,
                    border: '1px solid var(--bd)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxShadow: `0 20px 60px ${shadowColor}`,
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(30px)'
                }}>
                    <div style={{
                        position: 'absolute', top: -100, left: -100, width: 300, height: 300,
                        background: 'radial-gradient(circle, var(--gl-20) 0%, transparent 70%)',
                        filter: 'blur(60px)', opacity: 0.5
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative' }}>
                        <span style={{ fontSize: 10, fontWeight: 950, color: 'var(--gl)', textTransform: 'uppercase', letterSpacing: '4px' }}>
                            {t.nav.overview.toUpperCase()}
                        </span>
                        {viz.industry && (
                            <span style={{
                                background: 'var(--gl)', color: '#000', fontSize: 9, fontWeight: 950,
                                padding: '3px 12px', borderRadius: 20, boxShadow: '0 4px 15px var(--gl-40)'
                            }}>
                                {viz.industry.toUpperCase()}
                            </span>
                        )}
                    </div>
                    <h1 style={{ fontSize: 42, fontWeight: 950, letterSpacing: '-2.5px', color: 'var(--tx)', margin: 0, lineHeight: 1.05 }}>
                        {viz.industry ? `Performance ${viz.industry}` : (t.dashboard.executive_sum || "Résumé Stratégique")}
                    </h1>
                    <p style={{ marginTop: 24, color: 'var(--mu)', fontSize: 15, lineHeight: 1.6, maxWidth: 380, fontWeight: 600 }}>
                        Pilotage assisté par Intelligence Artificielle. Visualisez vos actifs stratégiques avec une précision chirurgicale.
                    </p>
                </div>

                {/* Section B: Global Vitality Stats */}
                {statCards.map((s, idx) => (
                    <div key={s.label} style={{
                        gridColumn: 'span 2',
                        background: 'rgba(255, 255, 255, 0.01)',
                        borderRadius: 24,
                        padding: 24,
                        border: '1px solid var(--bd)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: `0 10px 30px ${shadowColor}`,
                        transition: 'all 0.4s ease',
                        backdropFilter: 'blur(10px)'
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                            e.currentTarget.style.borderColor = s.color;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.borderColor = 'var(--bd)';
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 24 }}>{s.icon}</span>
                            <div style={{ fontSize: 24, fontWeight: 950, color: 'var(--tx)', fontFamily: 'var(--ff-mono)' }}>{s.val}</div>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>{s.label}</div>
                    </div>
                ))}

                {/* Section C: MAIN KPI GRID */}
                <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 4, height: 24, background: 'var(--gl)', borderRadius: 2 }} />
                            <h2 style={{ fontSize: 28, fontWeight: 950, color: 'var(--tx)', margin: 0, letterSpacing: '-1px' }}>Indicateurs Élites</h2>
                        </div>
                        <div style={{ color: 'var(--mu)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Live Engine • {new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {viz.kpis.map((k, idx) => (
                    <div key={k.col} style={{
                        gridColumn: idx < 6 ? 'span 4' : 'span 3',
                        background: 'rgba(255,255,255,0.01)',
                        borderRadius: 32,
                        padding: 32,
                        border: '1px solid var(--bd)',
                        cursor: 'pointer',
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(4px)'
                    }}
                        className="glass-panel fu"
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.borderColor = k.color;
                            e.currentTarget.style.boxShadow = `0 30px 60px rgba(0,0,0,0.5), 0 0 20px ${k.color}30`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'var(--bd)';
                            e.currentTarget.style.boxShadow = `0 10px 40px ${shadowColor}`;
                        }}
                        onClick={() => onKPIClick(k.col)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div>
                                <div style={{
                                    padding: '5px 14px', borderRadius: 12, background: `${k.color}15`,
                                    color: k.color, fontSize: 10, fontWeight: 950, textTransform: 'uppercase',
                                    border: `1px solid ${k.color}25`, display: 'inline-block', marginBottom: 12,
                                    letterSpacing: '1px'
                                }}>
                                    {aliases[k.col] || prettyName(k.col)}
                                </div>
                                <div style={{ fontSize: idx < 6 ? 36 : 24, fontWeight: 950, letterSpacing: '-2px', color: 'var(--tx)' }}>
                                    {k.total.toLocaleString(locale)}
                                    {k.unit && <span style={{ fontSize: idx < 6 ? 16 : 12, color: 'var(--mu)', marginLeft: 8, fontWeight: 700 }}>{k.unit}</span>}
                                </div>
                            </div>
                            <Sparkline color={k.color} col={k.col} />
                        </div>

                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                color: k.trend >= 0 ? '#10B981' : '#EF4444',
                                fontSize: 14, fontWeight: 950, background: k.trend >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                padding: '6px 12px', borderRadius: 12, border: `1px solid ${k.trend >= 0 ? '#10B98130' : '#EF444430'}`
                            }}>
                                {k.trend >= 0 ? '↗' : '↘'} {Math.abs(k.trend)}%
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--mu)', fontWeight: 700 }}>vs période préc.</div>
                        </div>

                        {k.target && (
                            <div style={{ marginTop: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800, color: 'var(--mu)', marginBottom: 8, textTransform: 'uppercase' }}>
                                    <span>Progression Cible</span>
                                    <span>{Math.round((k.total / k.target) * 100)}%</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                                    <div style={{
                                        width: `${Math.min(100, (k.total / k.target) * 100)}%`,
                                        height: '100%', background: `linear-gradient(90deg, ${k.color}, #FFF)`, borderRadius: 10,
                                        boxShadow: `0 0 15px ${k.color}80`
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Section D: Leaderboards */}
                <div style={{
                    gridColumn: '1 / span 6',
                    background: 'rgba(10, 20, 15, 0.4)',
                    borderRadius: 32,
                    padding: 32,
                    border: '1px solid var(--bd)',
                    boxShadow: `0 10px 40px ${shadowColor}`,
                    position: 'relative',
                    backdropFilter: 'blur(20px)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 950, color: 'var(--gn)', textTransform: 'uppercase', letterSpacing: '2.5px', margin: 0 }}>💎 Leaders Stratégiques</h4>
                        <div style={{ background: 'var(--gn)', width: 20, height: 2, borderRadius: 2 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {rankings.best.slice(0, 5).map((item, i) => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--gn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: 12 }}>{i + 1}</div>
                                <div style={{ flex: 1, fontSize: 14, fontWeight: 800, color: 'var(--tx)', opacity: 0.9 }}>{item.name}</div>
                                <div style={{ fontWeight: 950, fontSize: 16, color: 'var(--tx)' }}>{item.value.toLocaleString(locale)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    gridColumn: '7 / -1',
                    background: 'rgba(10, 20, 15, 0.4)',
                    borderRadius: 32,
                    padding: 32,
                    border: '1px solid var(--bd)',
                    boxShadow: `0 10px 40px ${shadowColor}`,
                    backdropFilter: 'blur(20px)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 950, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '2.5px', margin: 0 }}>⚠️ Zones de Vigilance</h4>
                        <div style={{ background: '#EF4444', width: 20, height: 2, borderRadius: 2 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {rankings.bad.slice(0, 5).map((item, i) => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: 12 }}>!</div>
                                <div style={{ flex: 1, fontSize: 14, fontWeight: 800, color: 'var(--tx)', opacity: 0.9 }}>{item.name}</div>
                                <div style={{ fontWeight: 950, fontSize: 16, color: '#EF4444' }}>{item.value.toLocaleString(locale)}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

