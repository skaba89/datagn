import React from 'react';
import { prettyName } from '@/lib/parser';

interface Props {
    augmentedData: any[];
    detectCols: (data: any[]) => { num: string[]; txt: string[]; date: string[] };
    hiddenKPIs: string[];
    fieldAliases: Record<string, string>;
    setHiddenKPIs: (kpis: string[]) => void;
    onClose: () => void;
}

export default function KPISelectorModal({ augmentedData, detectCols, hiddenKPIs, fieldAliases, setHiddenKPIs, onClose }: Props) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000
        }}>
            <div style={{ background: 'var(--sf)', padding: 32, borderRadius: 20, width: 450, border: '1px solid var(--bd)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>Sélecteur de KPIs</h3>
                <p style={{ fontSize: 12, color: 'var(--mu)', marginBottom: 20 }}>
                    Cochez les colonnes à afficher en tant que KPIs principaux sur ce dashboard.
                </p>
                <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {augmentedData.length > 0 && detectCols(augmentedData).num.map((col: string) => {
                        const isHidden = hiddenKPIs.includes(col);
                        return (
                            <label key={col} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 12px', background: 'var(--cd)', borderRadius: 10, border: '1px solid var(--bd)' }}>
                                <input
                                    type="checkbox"
                                    checked={!isHidden}
                                    onChange={() => {
                                        if (isHidden) setHiddenKPIs(hiddenKPIs.filter(h => h !== col));
                                        else setHiddenKPIs([...hiddenKPIs, col]);
                                    }}
                                    style={{ width: 18, height: 18, accentColor: 'var(--gn)' }}
                                />
                                <span style={{ fontSize: 13, color: 'var(--tx)', fontWeight: 600 }}>{fieldAliases[col] || prettyName(col)}</span>
                            </label>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: 12, background: 'var(--gl)', color: '#000', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}
                    >Terminer</button>
                </div>
            </div>
        </div>
    );
}
