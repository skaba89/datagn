'use client';

import { Row, ColInfo } from '@/lib/parser';
import { useI18n } from '@/i18n/I18nContext';
import { useState, useMemo, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface Props {
    data: Row[];
    onExportCSV: () => void;
    visualModel?: string;
}

const PAGE_SIZES = [25, 50, 100, 250];

export default function TableTab({ data, onExportCSV, visualModel = 'MODERN' }: Props) {
    const { t } = useI18n();
    const { theme } = useTheme();
    const [isMobile, setIsMobile] = useState(false);
    const [search, setSearch] = useState('');
    const [sortCol, setSortCol] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(50);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 650);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const cols = useMemo(() => Object.keys(data[0] || {}).slice(0, 14), [data]);

    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter(r => cols.some(c => String(r[c] ?? '').toLowerCase().includes(q)));
    }, [data, search, cols]);

    const sorted = useMemo(() => {
        if (!sortCol) return filtered;
        return [...filtered].sort((a, b) => {
            const av = a[sortCol], bv = b[sortCol];
            const an = Number(av), bn = Number(bv);
            if (!isNaN(an) && !isNaN(bn)) return sortAsc ? an - bn : bn - an;
            return sortAsc
                ? String(av ?? '').localeCompare(String(bv ?? ''))
                : String(bv ?? '').localeCompare(String(av ?? ''));
        });
    }, [filtered, sortCol, sortAsc]);

    const totalPages = Math.ceil(sorted.length / pageSize);
    const paged = sorted.slice(page * pageSize, page * pageSize + pageSize);

    const handleSort = (col: string) => {
        if (sortCol === col) setSortAsc(a => !a);
        else { setSortCol(col); setSortAsc(true); }
        setPage(0);
    };

    const rowHoverBg = theme === 'dark' ? 'rgba(255,255,255,.018)' : 'rgba(0,0,0,.018)';
    const rowBorder = theme === 'dark' ? 'rgba(255,255,255,.025)' : 'rgba(0,0,0,.025)';

    return (
        <div style={{
            background: visualModel === 'NEON' ? 'rgba(0,0,0,0.8)' : 'rgba(10, 20, 15, 0.4)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)'
        }}>
            {/* ── Header ──────────────────────────────────────── */}
            <div style={{
                padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 12,
                background: 'rgba(0,0,0,0.2)'
            }}>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--tx)', letterSpacing: '-0.5px' }}>
                        {t.table.raw_data || 'Données Brutes'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>
                        {sorted.length.toLocaleString()} entrées · {cols.length} colonnes
                        {search && ` · Filtré : "${search}"`}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, opacity: 0.5 }}>🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(0); }}
                            placeholder="Recherche rapide..."
                            style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 10, padding: '7px 12px 7px 30px', color: 'var(--tx)',
                                fontSize: 12, outline: 'none', width: 180, fontFamily: 'var(--ff-sans)'
                            }}
                        />
                    </div>
                    {/* Page size */}
                    <select
                        value={pageSize}
                        onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
                        style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 10, padding: '7px 10px', color: 'var(--mu)',
                            fontSize: 11, outline: 'none', fontFamily: 'var(--ff-sans)', cursor: 'pointer'
                        }}
                    >
                        {PAGE_SIZES.map(n => <option key={n} value={n}>{n} lignes</option>)}
                    </select>
                    {/* Export */}
                    <button onClick={onExportCSV} style={{
                        padding: '7px 14px', borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer',
                        border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.08)', color: 'var(--gl)',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.08)'}
                    >
                        ⬇ Exporter CSV
                    </button>
                </div>
            </div>

            {/* ── Table ──────────────────────────────────────── */}
            <div style={{ overflowX: 'auto' }}>
                {!isMobile ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 9, color: 'var(--mu)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>#</th>
                                {cols.map(col => (
                                    <th
                                        key={col}
                                        onClick={() => handleSort(col)}
                                        style={{
                                            padding: '10px 16px', textAlign: 'left', fontSize: 9, color: sortCol === col ? 'var(--gl)' : 'var(--mu)',
                                            fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap',
                                            cursor: 'pointer', userSelect: 'none',
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        {col} {sortCol === col ? (sortAsc ? '↑' : '↓') : '⇅'}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map((row, i) => (
                                <tr
                                    key={page * pageSize + i}
                                    style={{ borderBottom: `1px solid ${rowBorder}` }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHoverBg; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                                >
                                    <td style={{ padding: '9px 16px', color: 'var(--mu)', fontFamily: 'var(--ff-mono)', fontSize: 10 }}>
                                        {page * pageSize + i + 1}
                                    </td>
                                    {cols.map(col => {
                                        const val = row[col];
                                        const isNum = typeof val === 'number' || (!isNaN(Number(val)) && val !== '');
                                        return (
                                            <td key={col} style={{
                                                padding: '9px 16px',
                                                color: isNum ? 'var(--gl)' : 'var(--tx)',
                                                fontFamily: isNum ? 'var(--ff-mono)' : 'inherit',
                                                whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis'
                                            }}>
                                                {String(val ?? '').slice(0, 40)}{String(val ?? '').length > 40 ? '…' : ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12 }}>
                        {paged.map((row, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 14 }}>
                                <div style={{ fontSize: 9, color: 'var(--gl)', fontWeight: 800, marginBottom: 10 }}>
                                    ENTRÉE #{page * pageSize + i + 1}
                                </div>
                                {cols.slice(0, 8).map(col => (
                                    <div key={col} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 10 }}>
                                        <div style={{ fontSize: 9, color: 'var(--mu)', fontWeight: 700, textTransform: 'uppercase' }}>{col}</div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx)', textAlign: 'right' }}>{String(row[col] ?? '')}</div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Pagination ──────────────────────────────────── */}
            {totalPages > 1 && (
                <div style={{
                    padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)', flexWrap: 'wrap', gap: 8
                }}>
                    <div style={{ fontSize: 11, color: 'var(--mu)' }}>
                        Page {page + 1} / {totalPages} — {sorted.length.toLocaleString()} résultats
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                            onClick={() => setPage(0)}
                            disabled={page === 0}
                            style={paginBtnStyle(page === 0)}
                        >«</button>
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 0}
                            style={paginBtnStyle(page === 0)}
                        >‹</button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, k) => {
                            const idx = Math.max(0, Math.min(totalPages - 5, page - 2)) + k;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setPage(idx)}
                                    style={{
                                        ...paginBtnStyle(false),
                                        background: idx === page ? 'var(--gl)' : 'rgba(255,255,255,0.04)',
                                        color: idx === page ? '#000' : 'var(--mu)',
                                        fontWeight: idx === page ? 900 : 600,
                                    }}
                                >{idx + 1}</button>
                            );
                        })}
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= totalPages - 1}
                            style={paginBtnStyle(page >= totalPages - 1)}
                        >›</button>
                        <button
                            onClick={() => setPage(totalPages - 1)}
                            disabled={page >= totalPages - 1}
                            style={paginBtnStyle(page >= totalPages - 1)}
                        >»</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function paginBtnStyle(disabled: boolean) {
    return {
        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        color: disabled ? 'rgba(255,255,255,0.2)' : 'var(--mu)',
        transition: 'all 0.2s'
    } as React.CSSProperties;
}
