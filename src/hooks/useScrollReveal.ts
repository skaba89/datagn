import { useEffect } from 'react';

export function useScrollReveal(options = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }) {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Optionnel : ne plus l'observer une fois affiché
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach((el) => observer.observe(el));

        return () => {
            revealElements.forEach((el) => observer.unobserve(el));
        };
    }, [options]);
}
