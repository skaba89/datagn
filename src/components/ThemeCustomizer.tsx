'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ThemeCustomizer() {
    const { status } = useSession();

    useEffect(() => {
        if (status !== 'authenticated') return;

        const controller = new AbortController();
        const signal = controller.signal;

        fetch('/api/workspace', { signal })
            .then(r => {
                if (r.status === 401) return null;
                return r.json();
            })
            .then(data => {
                if (data && data.settings) {
                    const s = data.settings;
                    const root = document.documentElement;
                    if (s.primaryColor) {
                        root.style.setProperty('--gl', s.primaryColor);
                        root.style.setProperty('--gl-20', `${s.primaryColor}33`);
                    }
                    if (s.secondaryColor) {
                        root.style.setProperty('--gn', s.secondaryColor);
                        root.style.setProperty('--gn-20', `${s.secondaryColor}33`);
                    }
                }
            })
            .catch((e) => {
                if (e.name !== 'AbortError') {
                    // Ignorer silencieusement les autres erreurs
                }
            });

        return () => {
            controller.abort();
        };
    }, [status]);

    return null; // Composant logique pure
}
