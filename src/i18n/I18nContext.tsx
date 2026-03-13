"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import fr from './dictionaries/fr.json';
import en from './dictionaries/en.json';

type Dictionary = typeof fr;
type Language = 'fr' | 'en';

interface I18nContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Dictionary;
}

const dictionaries = { fr, en };

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('fr');

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('datagn_lang') as Language;
        if (saved && (saved === 'fr' || saved === 'en')) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('datagn_lang', lang);
        document.documentElement.lang = lang;
    };

    const value = {
        language,
        setLanguage: handleSetLanguage,
        t: dictionaries[language] as Dictionary
    };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}
