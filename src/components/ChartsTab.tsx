'use client';

import { useState, useMemo } from 'react';
import { VizData, prettyName } from '@/lib/parser';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area, ComposedChart, Brush
} from 'recharts';

import { useI18n } from '@/i18n/I18nContext';
import { useTheme } from './ThemeProvider';

interface Props {
    viz: VizData;
    palette?: 'vibrant' | 'pastel' | 'cool' | 'trust' | 'master';
    annotations?: { point: string; text: string }[];
    onBarClick?: (col: string, val: string) => void;
    onCrossFilter?: (col: string, val: any) => void;
    currency?: string;
    aliases?: Record<string, string>;
    visualModel?: string;
    activeKPI?: string | null;
    onActiveKPIChange?: (col: string) => void;
}

const PALETTES = {
    vibrant: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#F97316'],
    pastel: ['#A7D7C5', '#F4D35E', '#A9D6E5', '#BDB2FF', '#FFADAD', '#FFD6A5'],
    cool: ['#0EA5E9', '#6366F1', '#8B5CF6', '#D946EF', '#EC4899', '#F43F5E'],
    trust: ['#0F172A', '#1E293B', '#334155', '#475569', '#64748B', '#94A3B8'],
    master: ['#EDB025', '#3CA06A', '#3B82F6', '#8B5CF6', '#EF4444', '#F97316'], // Global GN Palette
};

const PIE_LEGEND_STYLE = { fontSize: 10, color: 'var(--mu)', fontWeight: 700 };

export default function ChartsTab({
    viz, palette = 'master' as any, annotations = [], onBarClick, onCrossFilter,
    currency = 'GNF', aliases = {}, visualModel = 'MODERN',
    activeKPI, onActiveKPIChange
}: Props) {
    const { t, language } = useI18n();
    const { theme } = useTheme();
    const [showForecast, setShowForecast] = useState(false);
    const [chartTypes, setChartTypes] = useState<string[]>(['composed', 'area', 'pie', 'bar']);

    const currentKPI = useMemo(() => activeKPI || viz.numCols[0], [activeKPI, viz.numCols]);

    const handleKPIChangeLocal = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onActiveKPIChange) onActiveKPIChange(e.target.value);
    };

    const toggleType = (idx: number, next: string) => {
        const copy = [...chartTypes];
        copy[idx] = next;
        setChartTypes(copy);
    };

    // Marqueurs d'annotations
    const dataWithNotes = useMemo(() => {
        return viz.bars.map(b => ({
            ...b,
            hasNote: annotations.some(a => a.point === b.name)
        }));
    }, [viz.bars, annotations]);

    // --- MOTEUR PRÉDICTIF (RÉGRESSION LINÉAIRE SIMPLE) ---
    const seriesWithForecast = useMemo(() => {
        if (!showForecast || !viz.series.length) return viz.series;

        const dataArr = viz.series;
        const n = dataArr.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        const mainCol = viz.numCols[0];
        dataArr.forEach((p, i) => {
            const val = Number(p[mainCol]) || 0;
            sumX += i;
            sumY += val;
            sumXY += i * val;
            sumX2 += i * i;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Projection sur 5 points futurs (Expert BI mode)
        const result = [...dataArr.map(p => ({ ...p, name: p._label, value: Number(p[mainCol]) || 0, forecast: null }))];
        for (let i = 0; i < 5; i++) {
            const nextX = n + i;
            const predVal = slope * nextX + intercept;
            result.push({
                _label: `Proj ${i + 1}`,
                name: `Proj ${i + 1}`,
                value: 0,
                forecast: Math.max(0, predVal)
            } as any);
        }
        return result;
    }, [viz.series, showForecast, viz.numCols]);

    // Series for main time charts
    const mainSeries = useMemo(() => {
        return viz.series.map(s => ({
            ...s,
            _displayLabel: s._label,
        }));
    }, [viz.series]);

    const COLORS = PALETTES[palette as keyof typeof PALETTES] || PALETTES.master;
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';

    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    const tooltipCursor = theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const isPeak = payload.some((p: any) => p.value > (viz.kpis[0]?.avg || 0) * 1.5);
            return (
                <div style={{
                    background: 'rgba(10, 10, 10, 0.95)',
                    border: `1px solid ${isPeak ? 'var(--go)' : 'var(--bd)'}`,
                    borderRadius: 20,
                    padding: '20px',
                    boxShadow: isPeak ? '0 20px 60px rgba(245, 158, 11, 0.3)' : '0 20px 40px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(20px)',
                    zIndex: 1000,
                    minWidth: 220
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <p style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {aliases[label] || label}
                        </p>
                        {isPeak && <span style={{ fontSize: 9, background: 'var(--go)', color: '#000', padding: '2px 8px', borderRadius: 10, fontWeight: 950 }}>PÉRODE CRITIQUE</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {payload.map((p: any, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color || p.fill }} />
                                    <span style={{ fontSize: 12, color: 'var(--tx)', fontWeight: 600, opacity: 0.9 }}>
                                        {p.name === '_growth' ? 'Variation' : (aliases[p.name] || prettyName(p.name))}
                                    </span>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 950, color: p.color || p.fill }}>
                                    {p.value.toLocaleString(locale)}
                                    {p.name === '_growth' ? '%' : (viz.kpis.find(k => k.col === p.name)?.unit ? ` ${viz.kpis.find(k => k.col === p.name)?.unit}` : '')}
                                </span>
                            </div>
                        ))}
                    </div>
                    {isPeak && <div style={{ marginTop: 12, fontSize: 10, color: 'var(--go)', fontWeight: 800, borderTop: '1px solid rgba(245, 158, 11, 0.2)', paddingTop: 8 }}>💡 L'IA détecte un écart de +50% vs moyenne.</div>}
                </div>
            );
        }
        return null;
    };

    const MagicFilters = () => (
        <div style={{
            display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap'
        }}>
            <button style={{
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--gn)', borderRadius: 16, padding: '10px 20px', fontSize: 11, fontWeight: 950,
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s'
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}>
                ✨ FOCUS CROISSANCE
            </button>
            <button style={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444', borderRadius: 16, padding: '10px 20px', fontSize: 11, fontWeight: 950,
                display: 'flex', alignItems: 'center', gap: 8
            }}>
                ⚠️ ALERTES ANOMALIES
            </button>
            <button style={{
                background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)',
                color: 'var(--gl)', borderRadius: 16, padding: '10px 20px', fontSize: 11, fontWeight: 950,
                display: 'flex', alignItems: 'center', gap: 8
            }}>
                🔮 PROJECTION IA
            </button>
        </div>
    );

    return (
        <div className="fu" style={{ animation: 'fadeIn 0.8s ease-out forwards', paddingBottom: 60 }}>
            <MagicFilters />

            <div className="charts-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 600px), 1fr))',
                gap: 24,
                width: '100%'
            }}>
                {/* 1. MASTER COMPOSED CHART — Volume + Growth Analysis */}
                <div className="glass-panel fu" style={{
                    borderRadius: 24, padding: 24, height: 420, position: 'relative',
                    background: 'rgba(10, 20, 15, 0.4)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)', animation: 'fadeIn 0.5s ease-out forwards',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div>
                                <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Tendances & Croissance</div>
                                <div style={{ fontSize: 18, fontWeight: 950, color: 'var(--tx)' }}>{aliases[currentKPI] || prettyName(currentKPI)}</div>
                            </div>
                            <div style={{ width: 1, height: 24, background: 'var(--bd)', margin: '0 8px' }} />
                            <select
                                value={currentKPI}
                                onChange={handleKPIChangeLocal}
                                style={{
                                    background: 'var(--cd)', color: 'var(--tx)', border: '1px solid var(--bd)',
                                    borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 700, outline: 'none'
                                }}
                            >
                                {viz.kpis.map(k => (
                                    <option key={k.col} value={k.col}>{aliases[k.col] || prettyName(k.col)}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['composed', 'area', 'bar', 'line'].map(t => (
                                <button key={t} onClick={() => toggleType(0, t)} style={{
                                    padding: '6px 12px', borderRadius: 8, fontSize: 10, fontWeight: 800,
                                    background: chartTypes[0] === t ? 'var(--gl)' : 'var(--cd)',
                                    color: chartTypes[0] === t ? '#000' : 'var(--tx)', border: 'none', cursor: 'pointer'
                                }}>{t.toUpperCase()}</button>
                            ))}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height="85%">
                        {chartTypes[0] === 'composed' ? (
                            <ComposedChart data={viz.series}>
                                <defs>
                                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={PALETTES[palette][0]} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={PALETTES[palette][0]} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bd)" opacity={0.5} />
                                <XAxis dataKey="_label" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--mu)' }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--mu)' }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--gn)' }} unit="%" />
                                <Tooltip content={<CustomTooltip currency={currency} aliases={aliases} />} />
                                <Bar yAxisId="left" dataKey={currentKPI} fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="_growth" stroke="var(--gn)" strokeWidth={3} dot={{ r: 4, fill: 'var(--gn)', strokeWidth: 2, stroke: 'var(--bg)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Brush dataKey="_label" height={30} stroke="var(--bd)" fill="var(--bg)" startIndex={Math.max(0, viz.series.length - 20)} />
                            </ComposedChart>
                        ) : chartTypes[0] === 'area' ? (
                            <AreaChart data={seriesWithForecast}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={PALETTES[palette][0]} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={PALETTES[palette][0]} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bd)" opacity={0.5} />
                                <XAxis dataKey="_label" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--mu)' }} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--mu)' }} />
                                <Tooltip content={<CustomTooltip currency={currency} aliases={aliases} />} />
                                <Area type="monotone" dataKey={currentKPI} stroke={PALETTES[palette][0]} strokeWidth={4} fill="url(#areaGrad)" />
                                {showForecast && <Area type="monotone" dataKey="forecast" stroke={PALETTES[palette][0]} strokeDasharray="5 5" fill="transparent" />}
                            </AreaChart>
                        ) : chartTypes[0] === 'bar' ? (
                            <BarChart data={viz.series}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bd)" opacity={0.5} />
                                <XAxis dataKey="_label" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--mu)' }} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--mu)' }} />
                                <Tooltip content={<CustomTooltip currency={currency} aliases={aliases} />} />
                                <Bar dataKey={currentKPI} fill={PALETTES[palette][0]} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        ) : (
                            <LineChart data={viz.series}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bd)" opacity={0.5} />
                                <XAxis dataKey="_label" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--mu)' }} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--mu)' }} />
                                <Tooltip content={<CustomTooltip currency={currency} aliases={aliases} />} />
                                <Line type="monotone" dataKey={currentKPI} stroke={PALETTES[palette][0]} strokeWidth={4} dot={{ r: 4, fill: PALETTES[palette][0], strokeWidth: 2, stroke: 'var(--bg)' }} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* 2. AREA ANALYSIS — Trend & Fill */}
                <div className="glass-panel fu d1" style={{
                    borderRadius: 28, padding: 28, height: 420, position: 'relative', overflow: 'hidden',
                    background: 'rgba(10, 20, 15, 0.4)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)', animation: 'fadeIn 0.5s ease-out forwards',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--tx)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tendances de Fond</div>
                        <button
                            onClick={() => setShowForecast(!showForecast)}
                            style={{
                                background: showForecast ? 'var(--gl)' : 'var(--cd)',
                                border: '1px solid var(--bd)', borderRadius: 12, padding: '6px 14px', fontSize: 11, cursor: 'pointer',
                                color: showForecast ? '#000' : 'var(--mu)', fontWeight: 900, boxShadow: showForecast ? '0 0 15px var(--gl-20)' : 'none'
                            }}
                        >
                            {showForecast ? '🔮 IA ANALYSE: ACTIF' : '🔮 ACTIVER IA'}
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <AreaChart data={seriesWithForecast}>
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--gl)" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="var(--gl)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="name" stroke="var(--mu)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--mu)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip currency={currency} aliases={aliases} />} />
                            <Area type="monotone" dataKey="value" stroke="var(--gl)" strokeWidth={3} fillOpacity={1} fill="url(#areaGradient)" />
                            {showForecast && <Area type="monotone" dataKey="forecast" stroke="#EF4444" strokeDasharray="5 5" fill="#EF4444" fillOpacity={0.05} />}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. CATEGORY SHARE — Donut Expert */}
                <div className="glass-panel fu d2" style={{
                    borderRadius: 28, padding: 28, height: 420, position: 'relative', overflow: 'hidden',
                    background: 'rgba(10, 20, 15, 0.4)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)', animation: 'fadeIn 0.5s ease-out forwards',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--tx)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 24 }}>Répartition Stratégique</div>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie
                                data={viz.pie}
                                innerRadius={75}
                                outerRadius={105}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {viz.pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                wrapperStyle={PIE_LEGEND_STYLE}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -85%)', textAlign: 'center', pointerEvents: 'none' }}>
                        <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 800 }}>TOTAL</div>
                        <div style={{ fontSize: 18, fontWeight: 950, color: 'var(--tx)' }}>{viz.pie.reduce((a, b) => a + b.value, 0).toLocaleString(locale)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

