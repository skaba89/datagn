"use client";

import React from 'react';
import { useI18n } from '@/i18n/I18nContext';

export default function LanguageSelector() {
    const { language, setLanguage } = useI18n();

    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
                onClick={() => setLanguage('fr')}
                style={{
                    background: language === 'fr' ? 'var(--gl)' : 'transparent',
                    border: `1px solid ${language === 'fr' ? 'var(--gl)' : 'var(--bd)'}`,
                    color: language === 'fr' ? '#000' : 'var(--mu)',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                FR
            </button>
            <button
                onClick={() => setLanguage('en')}
                style={{
                    background: language === 'en' ? 'var(--gl)' : 'transparent',
                    border: `1px solid ${language === 'en' ? 'var(--gl)' : 'var(--bd)'}`,
                    color: language === 'en' ? '#000' : 'var(--mu)',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                EN
            </button>
        </div>
    );
}
