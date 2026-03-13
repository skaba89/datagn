'use client';

import { useState } from 'react';
import { Row, ColInfo, prettyName } from '@/lib/parser';
import { useI18n } from '@/i18n/I18nContext';

interface Props {
    data: Row[];
    cols: ColInfo;
    onFilter: (filtered: Row[]) => void;
}

export default function FilterBar({ data, cols, onFilter }: Props) {
    const { t } = useI18n();
    const [search, setSearch] = useState<Record<string, string[]>>({});
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const apply = () => {
        let filtered = [...data];

        // 1. Date Filter
        if (cols.date[0] && (dateFrom || dateTo)) {
            const dc = cols.date[0];
            filtered = filtered.filter(r => {
                const val = new Date(String(r[dc])).getTime();
                if (dateFrom && val < new Date(dateFrom).getTime()) return false;
                if (dateTo && val > new Date(dateTo).getTime()) return false;
                return true;
            });
        }

        // 2. Multi-Select/Text Filters
        Object.entries(search).forEach(([col, vals]) => {
            if (!vals || vals.length === 0) return;
            filtered = filtered.filter(r =>
                vals.some(v => String(r[col]).toLowerCase().includes(v.toLowerCase()))
            );
        });

        onFilter(filtered);
    };

    const activeFilterCount = Object.values(search).flat().length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                zIndex: 10,
                background: 'rgba(5, 12, 8, 0.4)',
                backdropFilter: 'blur(30px) saturate(150%)',
                padding: '16px 24px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                margin: '12px 0 24px 0',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
        >
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 12, position: 'relative' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '10px', background: 'var(--cd)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--bd)',
                        boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)'
                    }}>
                        <span style={{ fontSize: '18px', filter: 'drop-shadow(0 0 5px var(--gn))' }}>🔍</span>
                        {activeFilterCount > 0 && (
                            <div style={{
                                position: 'absolute', top: -5, right: -5, width: 18, height: 18,
                                background: 'linear-gradient(135deg, var(--gn), var(--gl))', color: '#000', borderRadius: '50%',
                                fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid var(--bg)', boxShadow: '0 0 15px var(--gn-40)'
                            }}>
                                {activeFilterCount}
                            </div>
                        )}
                    </div>
                    <div style={{ color: 'var(--mu)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2.5px', opacity: 0.8 }}>
                        {t.common.filters}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                    {/* Date Range - Ultra Compact Premium */}
                    {cols.date[0] && (
                        <div style={{
                            display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.05)',
                            padding: '6px 14px', borderRadius: '14px', border: '1px solid var(--bd)',
                            transition: 'all 0.3s ease'
                        }} className="control-item">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                style={{ ...INP_STYLE, width: '130px', fontSize: '12px' }}
                            />
                            <span style={{ color: 'var(--mu)', fontSize: '14px', opacity: 0.4 }}>→</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                style={{ ...INP_STYLE, width: '130px', fontSize: '12px' }}
                            />
                        </div>
                    )}

                    {/* Axes Selectors - Glass look */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {cols.txt.slice(0, 3).map(c => {
                            const uniqueVals = Array.from(new Set(data.map(r => String(r[c])))).slice(0, 25);
                            const selected = search[c] || [];

                            return (
                                <div key={c} style={{
                                    position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--bd)',
                                    borderRadius: '14px', padding: '6px 16px', minWidth: '150px',
                                    transition: 'all 0.3s ease'
                                }} className="control-item">
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--gl)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{prettyName(c)}</span>
                                    <select
                                        onChange={(e) => {
                                            if (!e.target.value) return;
                                            const next = selected.includes(e.target.value)
                                                ? selected.filter(v => v !== e.target.value)
                                                : [...selected, e.target.value];
                                            setSearch({ ...search, [c]: next });
                                        }}
                                        value=""
                                        style={{ ...INP_STYLE, minWidth: '40px', cursor: 'pointer', flex: 1, textAlign: 'right', fontWeight: 800 }}
                                    >
                                        <option value="">{selected.length ? `${selected.length} ✓` : '+'}</option>
                                        {uniqueVals.map(v => (
                                            <option key={v} value={v} style={{ background: 'var(--bg)', color: 'var(--tx)' }}>{v} {selected.includes(v) ? '✓' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ flex: 1 }} />

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {(dateFrom || dateTo || Object.values(search).some(v => v.length > 0)) && (
                            <button
                                onClick={() => {
                                    setDateFrom(''); setDateTo(''); setSearch({});
                                    onFilter(data);
                                }}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.12)', border: 'none',
                                    color: '#EF4444', fontSize: '10px', fontWeight: 900, cursor: 'pointer',
                                    padding: '10px 18px', borderRadius: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    letterSpacing: '0.5px'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                {t.common.reset}
                            </button>
                        )}

                        <button
                            onClick={apply}
                            style={{
                                background: 'linear-gradient(135deg, var(--gn), var(--gl))',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '10px 28px',
                                fontSize: '13px',
                                fontWeight: 900,
                                cursor: 'pointer',
                                color: '#000',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
                                letterSpacing: '0.5px'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.25)';
                            }}
                        >
                            {t.common.apply}
                        </button>
                    </div>
                </div>
            </div>

            {/* Badges de filtres actifs - Animated Row */}
            {Object.values(search).some(v => v.length > 0) && (
                <div style={{
                    display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12,
                    paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)',
                    animation: 'fadeIn 0.5s ease-out forwards'
                }}>
                    {Object.entries(search).map(([col, vals]) => (
                        vals.map(v => (
                            <div key={v + col} onClick={() => setSearch({ ...search, [col]: vals.filter(x => x !== v) })}
                                style={{
                                    background: 'rgba(255,255,255,0.07)', color: 'var(--tx)', fontSize: '11px', fontWeight: 600,
                                    padding: '5px 12px', borderRadius: '10px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <span style={{ opacity: 0.5, fontWeight: 900, color: 'var(--gl)', fontSize: '9px', textTransform: 'uppercase' }}>{prettyName(col)}</span>
                                <span style={{ color: 'var(--tx)' }}>{v}</span>
                                <span style={{ opacity: 0.4, fontSize: '12px', fontWeight: 300 }}>✕</span>
                            </div>
                        ))
                    ))}
                </div>
            )}
        </div>
    );
}

const INP_STYLE = {
    background: 'transparent',
    border: 'none',
    color: 'var(--tx)',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'var(--ff-sans)',
    fontWeight: 500
};
