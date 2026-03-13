'use client';

import { useState } from 'react';
import { ColInfo, prettyName } from '@/lib/parser';
import { useI18n } from '@/i18n/I18nContext';

export interface CustomKPI {
    id: string;
    name: string;
    colA: string;
    op: '+' | '-' | '*' | '/';
    colB: string; // can be a column name or a number
    target?: number;
}

interface Props {
    cols: ColInfo;
    onAdd: (kpi: CustomKPI) => void;
    onClose: () => void;
}

export default function KPIEditor({ cols, onAdd, onClose }: Props) {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [colA, setColA] = useState(cols.num[0] || '');
    const [op, setOp] = useState<CustomKPI['op']>('*');
    const [colB, setColB] = useState(cols.num[1] || '1');
    const [target, setTarget] = useState<string>('');

    const handleAdd = () => {
        if (!name || !colA || !colB) return;
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            name,
            colA,
            op,
            colB,
            target: target ? Number(target) : undefined
        });
        onClose();
    };
    // ... (skip UI part for now, will do in next tool call or together)

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out forwards'
        }}>
            <div style={{
                background: 'var(--bg)', border: '1px solid var(--bd)',
                borderRadius: 16, width: '100%', maxWidth: 450, padding: 24,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 900 }}>{t.kpi_editor.title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--mu)', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={LBL_STYLE}>{t.kpi_editor.name_label}</label>
                        <input
                            placeholder={t.kpi_editor.name_placeholder}
                            style={INP_STYLE}
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={LBL_STYLE}>{t.kpi_editor.col_a}</label>
                            <select style={INP_STYLE} value={colA} onChange={e => setColA(e.target.value)}>
                                {cols.num.map(c => <option key={c} value={c}>{prettyName(c)}</option>)}
                            </select>
                        </div>
                        <div style={{ width: 50 }}>
                            <label style={LBL_STYLE}>{t.kpi_editor.op}</label>
                            <select style={INP_STYLE} value={op} onChange={e => setOp(e.target.value as any)}>
                                <option value="+">+</option>
                                <option value="-">-</option>
                                <option value="*">×</option>
                                <option value="/">÷</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={LBL_STYLE}>{t.kpi_editor.col_b}</label>
                            <input
                                list="cols-list"
                                style={INP_STYLE}
                                value={colB}
                                onChange={e => setColB(e.target.value)}
                            />
                            <datalist id="cols-list">
                                {cols.num.map(c => <option key={c} value={c}>{prettyName(c)}</option>)}
                            </datalist>
                        </div>
                    </div>

                    <div>
                        <label style={LBL_STYLE}>Objectif (Cible - Optionnel)</label>
                        <input
                            type="number"
                            placeholder="Ex: 1000000"
                            style={INP_STYLE}
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                        />
                    </div>

                    <div style={{
                        marginTop: 10, padding: 12, background: 'var(--sf)',
                        borderRadius: 8, border: '1px dashed var(--bd)', fontSize: 13
                    }}>
                        <span style={{ color: 'var(--mu)' }}>{t.kpi_editor.preview}</span>
                        <code style={{ color: 'var(--gl)', fontWeight: 700 }}>{name || '?'} = {prettyName(colA)} {op} {prettyName(colB)}</code>
                    </div>

                    <button
                        onClick={handleAdd}
                        style={{
                            marginTop: 10, background: 'var(--gl)', color: '#000',
                            border: 'none', borderRadius: 8, padding: '12px',
                            fontWeight: 900, cursor: 'pointer', fontSize: 14
                        }}
                    >
                        {t.kpi_editor.add_btn}
                    </button>
                </div>
            </div>
        </div>
    );
}

const LBL_STYLE = { fontSize: 10, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase' as const, marginBottom: 6, display: 'block' };
const INP_STYLE = {
    width: '100%', background: 'var(--cd)', border: '1px solid var(--bd)',
    borderRadius: 8, padding: '10px 12px', color: 'var(--tx)', fontSize: 13, outline: 'none'
};
