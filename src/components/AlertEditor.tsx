'use client';

import { useState } from 'react';
import { ColInfo } from '@/lib/parser';
import { useI18n } from '@/i18n/I18nContext';

export interface AlertThreshold {
    id: string;
    col: string;
    op: '>' | '<' | '=';
    value: number;
    color: string;
    label: string;
}

interface Props {
    cols: ColInfo;
    onAdd: (alert: AlertThreshold) => void;
    onClose: () => void;
}

const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

export default function AlertEditor({ cols, onAdd, onClose }: Props) {
    const { t } = useI18n();
    const [col, setCol] = useState(cols.num[0] || '');
    const [op, setOp] = useState<AlertThreshold['op']>('<');
    const [value, setValue] = useState(0);
    const [label, setLabel] = useState(t.alert_editor.label_placeholder);
    const [color, setColor] = useState(COLORS[0]);

    const handleAdd = () => {
        if (!col || isNaN(value)) return;
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            col,
            op,
            value,
            color,
            label
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out forwards'
        }}>
            <div style={{
                background: 'var(--bg)', border: '1px solid var(--bd)',
                borderRadius: 20, width: '100%', maxWidth: 450, padding: 28,
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.5px' }}>{t.alert_editor.title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--mu)', cursor: 'pointer', fontSize: 18 }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={LBL_STYLE}>{t.alert_editor.label_label}</label>
                        <input
                            placeholder={t.alert_editor.label_placeholder}
                            style={INP_STYLE}
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 10, alignItems: 'end' }}>
                        <div>
                            <label style={LBL_STYLE}>{t.alert_editor.col_label}</label>
                            <select style={INP_STYLE} value={col} onChange={e => setCol(e.target.value)}>
                                {cols.num.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={LBL_STYLE}>{t.alert_editor.op}</label>
                            <select style={INP_STYLE} value={op} onChange={e => setOp(e.target.value as any)}>
                                <option value="<">{t.alert_editor.ops.lt}</option>
                                <option value=">">{t.alert_editor.ops.gt}</option>
                                <option value="=">{t.alert_editor.ops.eq}</option>
                            </select>
                        </div>
                        <div>
                            <label style={LBL_STYLE}>{t.alert_editor.threshold}</label>
                            <input
                                type="number"
                                style={INP_STYLE}
                                value={value}
                                onChange={e => setValue(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={LBL_STYLE}>{t.alert_editor.color_label}</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {COLORS.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: 32, height: 32, borderRadius: '50%', background: c,
                                        cursor: 'pointer', border: color === c ? '3px solid #fff' : 'none',
                                        transition: 'transform 0.2s', transform: color === c ? 'scale(1.1)' : 'scale(1)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{
                        marginTop: 10, padding: 16, background: 'rgba(239, 68, 68, 0.05)',
                        borderRadius: 12, border: `1px dashed ${color}`, fontSize: 13, color: 'var(--tx)'
                    }}>
                        <span style={{ color: 'var(--mu)' }}>{t.alert_editor.logic}</span>
                        {t.alert_editor.than.eq.split(' ')[0]} <span style={{ fontWeight: 800 }}>{col || '?'}</span> est {op === '<' ? t.alert_editor.than.lt : op === '>' ? t.alert_editor.than.gt : t.alert_editor.than.eq} <span style={{ fontWeight: 800, color }}>{value.toLocaleString()}</span>.
                    </div>

                    <button
                        onClick={handleAdd}
                        style={{
                            marginTop: 10, background: 'var(--gl)', color: '#000',
                            border: 'none', borderRadius: 12, padding: '14px',
                            fontWeight: 900, cursor: 'pointer', fontSize: 14,
                            boxShadow: '0 4px 14px rgba(237, 176, 37, 0.3)'
                        }}
                    >
                        {t.alert_editor.add_btn}
                    </button>
                </div>
            </div>
        </div>
    );
}

const LBL_STYLE = { fontSize: 10, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase' as const, marginBottom: 8, display: 'block' };
const INP_STYLE = {
    width: '100%', background: 'var(--cd)', border: '1px solid var(--bd)',
    borderRadius: 10, padding: '12px', color: 'var(--tx)', fontSize: 13, outline: 'none'
};
