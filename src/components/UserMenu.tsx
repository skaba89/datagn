"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { useTheme } from "./ThemeProvider";

export default function UserMenu({ user, onSignOut }: { user: any, onSignOut: () => void }) {
    const { t } = useI18n();
    const { theme, toggleTheme } = useTheme();
    const [open, setOpen] = useState(false);

    if (!user) return null;

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
                onClick={toggleTheme}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--cd)', border: '1px solid var(--bd)',
                    color: 'var(--tx)', fontSize: '16px', cursor: 'pointer',
                    transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    borderRadius: '50%',
                    cursor: 'pointer'
                }}
            >
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--gn)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#000',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s',
                    border: '2px solid var(--gn)'
                }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '12px',
                    width: '200px',
                    background: 'var(--sf)',
                    border: '1px solid var(--bd)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    zIndex: 10,
                    backdropFilter: 'blur(20px)'
                }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid var(--bd)', fontSize: '11px', color: 'var(--mu)' }}>
                        {user.email}
                    </div>
                    <button
                        onClick={() => onSignOut()}
                        style={{
                            width: '100%',
                            padding: '12px',
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                    >
                        {t.nav.logout}
                    </button>
                </div>
            )}
        </div>
    );
}
