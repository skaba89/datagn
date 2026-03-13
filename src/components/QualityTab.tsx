'use client';

import { useMemo } from 'react';
import { Row, ColInfo, prettyName } from '@/lib/parser';
import { useI18n } from '@/i18n/I18nContext';

interface Props {
    data: Row[];
    cols: ColInfo;
    visualModel?: string;
}

export default function QualityTab({ data, cols, visualModel = 'MODERN' }: Props) {
    const { t } = useI18n();

    const stats = useMemo(() => {
        if (!data.length) return [];
        const allKeys = Object.keys(data[0]);
        return allKeys.map(key => {
            const values = data.map(r => r[key]);
            const filled = values.filter(v => v !== '' && v != null).length;
            const fillRate = (filled / data.length) * 100;

            let detectedType = t.quality.types.unknown;
            if (cols.num.includes(key)) detectedType = t.quality.types.number;
            else if (cols.date.includes(key)) detectedType = t.quality.types.date;
            else if (cols.txt.includes(key)) detectedType = t.quality.types.text;

            let anomalies = 0;
            if (detectedType === t.quality.types.number) anomalies = values.filter(v => v === 0).length;
            else if (detectedType === t.quality.types.text) anomalies = values.filter(v => String(v).length > 200).length;

            return { key, type: detectedType, filled, total: data.length, fillRate: fillRate.toFixed(1), anomalies };
        });
    }, [data, cols, t.quality.types]);

    const globalScore = stats.length
        ? stats.reduce((a, b) => a + Number(b.fillRate), 0) / stats.length
        : 0;

    const scoreColor = globalScore > 90 ? '#10B981' : globalScore > 60 ? '#FBBF24' : '#EF4444';

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 4, height: 24, background: scoreColor, borderRadius: 2 }} />
                        <h2 style={{ fontSize: 24, fontWeight: 950, color: 'var(--tx)', margin: 0, letterSpacing: '-1px' }}>
                            {t.quality.title}
                        </h2>
                    </div>
                    <p style={{ color: 'var(--mu)', fontSize: 13, marginLeft: 14 }}>{t.quality.subtitle}</p>
                </div>
                <div style={{ background: `${scoreColor}12`, border: `1px solid ${scoreColor}30`, borderRadius: 16, padding: '12px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 950, color: scoreColor, letterSpacing: '-1px' }}>{globalScore.toFixed(0)}%</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '1px' }}>Score Global</div>
                </div>
            </div>

            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
                {stats.map(s => {
                    const fillNum = Number(s.fillRate);
                    const cardColor = fillNum > 90 ? '#10B981' : fillNum > 60 ? '#FBBF24' : '#EF4444';
                    return (
                        <div key={s.key} style={{
                            background: 'rgba(10, 20, 15, 0.4)', backdropFilter: 'blur(16px)',
                            border: `1px solid ${cardColor}20`, borderRadius: 20, padding: '20px 24px',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: `${s.fillRate}%`, background: cardColor, boxShadow: `0 0 8px ${cardColor}` }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--tx)', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prettyName(s.key)}</div>
                                <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: `${cardColor}15`, color: cardColor, border: `1px solid ${cardColor}25` }}>{s.type}</div>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 950, color: cardColor, letterSpacing: '-1px', marginBottom: 4 }}>{s.fillRate}%</div>
                            <div style={{ color: 'var(--mu)', fontSize: 11, marginBottom: 12 }}>
                                {t.quality.fill} : {s.filled} / {s.total} {t.quality.lines}
                            </div>
                            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                                <div style={{ height: '100%', width: `${s.fillRate}%`, background: `linear-gradient(90deg, ${cardColor}, ${cardColor}80)`, borderRadius: 4 }} />
                            </div>
                            {s.anomalies > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    <div
                                        style={{
                                            fontSize: 11, color: '#EF4444',
                                            background: 'rgba(239, 68, 68, 0.08)', padding: '6px 10px',
                                            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
                                            border: '1px solid rgba(239,68,68,0.15)',
                                            fontWeight: 700
                                        }}>
                                        ⚠️ {t.quality.anomalies.replace('{count}', String(s.anomalies))}
                                    </div>
                                    <div style={{
                                        marginTop: 8, fontSize: 10, color: 'var(--mu)',
                                        lineHeight: 1.4, padding: '8px 10px', background: 'rgba(255,255,255,0.03)',
                                        borderRadius: 8, borderLeft: '2px solid #EF4444'
                                    }}>
                                        <strong>💡 Explication :</strong> {
                                            s.type === t.quality.types.number ? t.quality.anomalies_help.number :
                                                s.type === t.quality.types.text ? t.quality.anomalies_help.text :
                                                    t.quality.anomalies_help.date
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Global progress bar */}
            <div style={{ background: 'rgba(10, 20, 15, 0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: '24px 28px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--tx)', marginBottom: 16 }}>{t.quality.score}</h3>
                <div style={{ height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ height: '100%', width: `${globalScore}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}80)`, borderRadius: 8, boxShadow: `0 0 12px ${scoreColor}60` }} />
                </div>
                <p style={{ color: 'var(--mu)', fontSize: 12 }}>
                    {t.quality.score_desc} — Score actuel : <strong style={{ color: scoreColor }}>{globalScore.toFixed(1)}%</strong>
                </p>
            </div>
        </div>
    );
}
