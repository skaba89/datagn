'use client';

import { useI18n } from '@/i18n/I18nContext';

interface Props {
    tabs: Array<{ id: string; label: string; icon: string }>;
    activeTab: string;
    onTabChange: (id: any) => void;
}

export default function MobileNav({ tabs, activeTab, onTabChange }: Props) {
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--sf)',
            borderTop: '1px solid var(--bd)',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 4px 24px', // Extra bottom padding for iOS home indicator
            zIndex: 1000,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
        }}>
            {tabs.map(t => (
                <button
                    key={t.id}
                    onClick={() => onTabChange(t.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        padding: '8px',
                        color: activeTab === t.id ? 'var(--gl)' : 'var(--mu)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                    }}
                >
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.label}</span>
                    {activeTab === t.id && (
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gl)', marginTop: 2 }} />
                    )}
                </button>
            ))}
        </div>
    );
}
