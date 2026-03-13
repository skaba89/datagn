'use client';

import { VizData } from '@/lib/parser';
import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';

interface Props {
    viz: VizData;
    onRegionClick?: (region: string) => void;
    crossFilter?: { col: string; value: any } | null;
    visualModel?: string;
}

// Chemins SVG simplifiés pour les 8 régions de Guinée
const GUINEA_MAP = [
    { id: 'BOKE', name: 'Boké', d: "M 20,100 C 40,80 60,70 80,85 L 100,120 L 70,160 L 30,150 Z" },
    { id: 'KINDIA', name: 'Kindia', d: "M 80,85 C 100,70 120,80 140,95 L 150,130 L 120,165 L 100,120 Z" },
    { id: 'CONAKRY', name: 'Conakry', d: "M 82,145 L 95,145 L 95,155 L 82,155 Z" }, // Petite zone pour Conakry
    { id: 'LABE', name: 'Labé', d: "M 100,30 C 130,20 160,30 180,50 L 170,90 L 140,95 L 100,120 L 110,70 Z" },
    { id: 'MAMOU', name: 'Mamou', d: "M 140,95 L 170,90 L 190,120 L 180,150 L 150,130 Z" },
    { id: 'FARANAH', name: 'Faranah', d: "M 170,50 C 200,40 230,50 250,70 L 240,130 L 190,120 L 170,90 Z" },
    { id: 'KANKAN', name: 'Kankan', d: "M 250,70 C 280,60 330,70 350,100 L 330,180 L 260,190 L 240,130 Z" },
    { id: 'NZEREKORE', name: 'Nzérékoré', d: "M 260,190 L 330,180 L 310,250 L 250,260 Z" }
];

export default function MapTab({ viz, onRegionClick, crossFilter, visualModel = 'MODERN' }: Props) {
    const { t, language } = useI18n();
    const [hovered, setHovered] = useState<string | null>(null);
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';

    if (!viz.geo || viz.geo.length === 0) {
        return (
            <div style={{ padding: 60, textAlign: 'center', background: 'var(--sf)', borderRadius: 16, border: '1px dashed var(--bd)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{t.map.no_geo}</div>
                <div style={{ fontSize: 13, color: 'var(--mu)', marginTop: 8, maxWidth: 400, margin: '8px auto 0' }}>
                    {t.map.no_geo_desc}
                </div>
            </div>
        );
    }

    const maxVal = Math.max(...viz.geo.map(g => g.value), 1);
    const totalGeoVolume = viz.geo.reduce((a, b) => a + b.value, 0);
    const topRegion = [...viz.geo].sort((a, b) => b.value - a.value)[0];

    const getOpacity = (val: number) => {
        return 0.2 + (val / maxVal) * 0.8;
    };

    const hoveredData = hovered ? viz.geo.find(g => g.name.toUpperCase() === hovered) : null;

    const isActive = (id: string) => crossFilter?.col === 'region' && crossFilter?.value === id;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            {/* Map Area */}
            <div style={{
                background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 16,
                padding: 32, minHeight: 520, display: 'flex', flexDirection: 'column',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.5px' }}>{t.map.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--mu)' }}>{t.map.subtitle}</div>
                    </div>
                    {crossFilter?.col === 'region' && (
                        <div style={{ fontSize: 10, background: 'var(--gl)', color: '#000', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                            FILTRE ACTIF : {crossFilter.value}
                        </div>
                    )}
                </div>

                {/* SVG Guinea Map */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%', maxWidth: 600, filter: visualModel === 'NEON' ? 'drop-shadow(0 0 20px rgba(237, 176, 37, 0.1))' : 'none' }}>
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {GUINEA_MAP.map(reg => {
                            const data = viz.geo?.find(g => g.name.toUpperCase() === reg.id);
                            const val = data?.value || 0;
                            const isHovered = hovered === reg.id;
                            const active = isActive(reg.id);

                            let fill = val > 0 ? `rgba(237, 176, 37, ${getOpacity(val)})` : 'var(--cd)';
                            if (active) fill = 'var(--gl)';
                            if (visualModel === 'NEON' && val > 0) fill = `rgba(237, 176, 37, ${getOpacity(val) * 1.2})`;
                            if (visualModel === 'NEON' && active) fill = '#FFD700';

                            return (
                                <path
                                    key={reg.id}
                                    d={reg.d}
                                    onMouseEnter={() => setHovered(reg.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => onRegionClick?.(reg.id)}
                                    fill={fill}
                                    stroke={isHovered || active ? (visualModel === 'NEON' ? '#FFD700' : 'var(--gl)') : 'var(--bd)'}
                                    strokeWidth={isHovered || active ? 3 : 1}
                                    style={{
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        filter: (isHovered || active) && visualModel !== 'CORPORATE' ? 'url(#glow)' : 'none',
                                        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                                        transformOrigin: 'center'
                                    }}
                                />
                            );
                        })}
                    </svg>

                    {/* Tooltip Floating */}
                    {hovered && hoveredData && (
                        <div style={{
                            position: 'absolute', top: 20, right: 20, background: 'var(--cd)',
                            border: '1.5px solid var(--gl)', borderRadius: 12, padding: '12px 16px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.4)', animation: 'fadeIn .2s forwards'
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase' }}>{hoveredData.name}</div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--tx)' }}>{hoveredData.value.toLocaleString(locale)}</div>
                            <div style={{ fontSize: 11, color: 'var(--gl)', fontWeight: 700 }}>{((hoveredData.value / totalGeoVolume) * 100).toFixed(1)}% du total</div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                        <div style={{ width: 12, height: 12, background: 'var(--cd)', borderRadius: 3 }} />
                        <span>Aucune donnée</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                        <div style={{ width: 12, height: 12, background: 'rgba(237, 176, 37, 0.4)', borderRadius: 3 }} />
                        <span>Volume faible</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                        <div style={{ width: 12, height: 12, background: 'rgba(237, 176, 37, 1)', borderRadius: 3 }} />
                        <span>Volume élevé</span>
                    </div>
                </div>
            </div>

            {/* Sidebar Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20 }}>
                    <div style={{ fontSize: 12, color: 'var(--mu)', fontWeight: 800, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.map.ranking}</div>
                    {[...viz.geo].sort((a, b) => b.value - a.value).slice(0, 5).map((g, i) => (
                        <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%', background: 'rgba(237, 176, 37, 0.1)',
                                color: 'var(--gl)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 900
                            }}>
                                {i + 1}
                            </div>
                            <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{g.name}</div>
                            <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--tx)' }}>{g.value.toLocaleString(locale)}</div>
                        </div>
                    ))}
                </div>

                <div style={{ background: 'linear-gradient(135deg, var(--sf) 0%, var(--cd) 100%)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20, flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--gl)', fontWeight: 800, marginBottom: 12, textTransform: 'uppercase' }}>{t.map.insight_title}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--tx)', fontWeight: 500 }}>
                        {t.map.insight_desc
                            .replace('{region}', topRegion?.name || '?')
                            .replace('{percent}', totalGeoVolume > 0 ? ((topRegion?.value / totalGeoVolume) * 100).toFixed(1) : '0')
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
