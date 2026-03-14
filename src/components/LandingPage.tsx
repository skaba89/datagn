'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/I18nContext';
import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function LandingPage() {
    const { t } = useI18n();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    useScrollReveal(); // Active les animations "reveal" au scroll

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const FEATS = [
        { i: '🌍', t: t.landing.features.list.map.t, d: t.landing.features.list.map.d, size: 'bento-large', bg: 'var(--cd)' },
        { i: '🤖', t: t.landing.features.list.ia.t, d: t.landing.features.list.ia.d, size: 'bento-medium', bg: 'var(--sf)' },
        { i: '🔌', t: t.landing.features.list.connect.t, d: t.landing.features.list.connect.d, size: 'bento-medium', bg: 'rgba(251, 191, 36, 0.05)' },
    ];

    const PLANS = [
        { n: t.landing.pricing.starter.n, v: 1000, f: t.landing.pricing.starter.f, p: false },
        { n: t.landing.pricing.impact.n, v: 2500, f: t.landing.pricing.impact.f, p: true },
        { n: t.landing.pricing.enterprise.n, v: 4000, f: t.landing.pricing.enterprise.f, p: false },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'hidden', position: 'relative' }}>

            {/* Mesh Gradient Animé Global */}
            <div className="mesh-gradient-bg" />

            {/* Header / Nav (Verre dépoli) */}
            <nav style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 8%', position: 'fixed', top: 0, left: 0, right: 0,
                zIndex: 100, background: scrolled ? 'var(--sf)' : 'transparent',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                borderBottom: scrolled ? '1px solid var(--bd)' : '1px solid transparent',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 24, filter: 'drop-shadow(0 2px 4px rgba(237, 176, 37, 0.4))' }}>💎</div>
                    <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-1px' }}>
                        Data<span style={{ color: 'var(--gl)' }}>GN</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <a href="#features" className="nav-link">{t.landing.nav.solutions}</a>
                    <a href="#pricing" className="nav-link">{t.landing.nav.pricing}</a>

                    <button
                        onClick={toggleTheme}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '38px', height: '38px', borderRadius: '50%',
                            background: 'var(--cd)', border: '1px solid var(--bd)',
                            color: 'var(--tx)', fontSize: '18px', cursor: 'pointer',
                            transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                        title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    <Link href="/login" style={{
                        background: 'var(--tx)', color: 'var(--bg)', padding: '12px 28px',
                        borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none',
                        transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                    }} className="btn-hover">{t.landing.nav.start}</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                padding: '180px 8% 100px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1
            }}>
                <div style={{
                    padding: '8px 20px', background: 'var(--sf)', color: 'var(--gl)',
                    borderRadius: 40, fontSize: 13, fontWeight: 900, marginBottom: 40,
                    border: '1px solid var(--gl)', textTransform: 'uppercase', letterSpacing: '1px',
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)'
                }} className="reveal reveal-delay-1">
                    ✨ {t.landing.hero.ia_badge}
                </div>

                <h1 style={{
                    fontSize: 'clamp(48px, 6vw, 96px)', fontWeight: 900, lineHeight: 1.05,
                    marginBottom: 30, letterSpacing: '-3px', color: 'var(--tx)'
                }} className="reveal reveal-delay-2">
                    {t.landing.hero.title_1}<br />
                    <span className="text-gradient">
                        {t.landing.hero.title_2}
                    </span>
                </h1>

                <p style={{
                    maxWidth: 700, fontSize: 'clamp(18px, 2vw, 22px)', color: 'var(--mu)',
                    marginBottom: 50, lineHeight: 1.6, fontWeight: 400
                }} className="reveal reveal-delay-3">
                    {t.landing.hero.desc}
                </p>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }} className="reveal">
                    <Link href="/register" style={{
                        background: 'var(--brand-gradient)', color: '#000', padding: '18px 48px', borderRadius: '40px',
                        fontWeight: 900, fontSize: 16, textDecoration: 'none',
                        boxShadow: 'var(--brand-shadow)', transition: 'transform 0.3s'
                    }} className="btn-hover">{t.landing.hero.btn_main}</Link>

                    <a href="#features" style={{
                        background: 'var(--sf)', color: 'var(--tx)', padding: '18px 48px', borderRadius: '40px',
                        fontWeight: 800, fontSize: 16, textDecoration: 'none', border: '1px solid var(--bd)',
                        backdropFilter: 'blur(10px)', transition: 'all 0.3s'
                    }} className="btn-hover">{t.landing.hero.btn_sec}</a>
                </div>

                {/* Dashboard Interactive Mockup (Glassmorphism 2.0) */}
                <div className="reveal glass-panel" style={{
                    marginTop: 80, width: '100%', maxWidth: 1100, height: 600,
                    borderRadius: 32, padding: 24, position: 'relative', overflow: 'hidden',
                    borderColor: 'var(--gl)', boxShadow: '0 40px 100px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)',
                    transform: 'perspective(1000px) rotateX(2deg)'
                }}>
                    <div style={{ background: 'var(--bg)', width: '100%', height: '100%', borderRadius: 16, border: '1px solid var(--bd)', display: 'flex', flexDirection: 'column' }}>
                        {/* Mock Header */}
                        <div style={{ height: 60, borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', background: 'var(--cd)' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ height: 6, width: 40, background: 'var(--mu)', borderRadius: 3, opacity: 0.3 }} />
                                <div style={{ height: 6, width: 80, background: 'var(--mu)', borderRadius: 3, opacity: 0.3 }} />
                            </div>
                        </div>
                        {/* Mock Content Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 24, flex: 1 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ background: 'var(--sf)', borderRadius: 12, border: '1px solid var(--bd)', padding: 16, position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ width: 30, height: 4, background: 'var(--gn)', borderRadius: 2, marginBottom: 12 }} />
                                    <div style={{ width: '60%', height: 20, background: 'var(--tx)', opacity: 0.8, borderRadius: 4, marginBottom: 8 }} />
                                    <div style={{ width: '40%', height: 12, background: 'var(--mu)', opacity: 0.4, borderRadius: 4 }} />
                                </div>
                            ))}
                            <div style={{ gridColumn: 'span 2', background: 'var(--sf)', borderRadius: 12, border: '1px solid var(--bd)', padding: 20, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                                {[20, 40, 60, 30, 80, 50, 90, 100, 70].map((h, i) => (
                                    <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--gl)', borderRadius: '4px 4px 0 0', opacity: 0.8, transition: 'height 1s cubic-bezier(0.2, 0.8, 0.2, 1)', animation: `fadeUp 0.5s ${i * 0.1}s forwards` }} />
                                ))}
                            </div>
                            <div style={{ background: 'var(--cd)', borderRadius: 12, border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 100, height: 100, borderRadius: '50%', border: '12px solid var(--gn)', borderTopColor: 'var(--gl)', transform: 'rotate(45deg)' }} />
                            </div>
                        </div>
                    </div>

                    {/* Badge IA Kadi Interactif */}
                    <div style={{
                        position: 'absolute', bottom: 40, right: 40, background: 'var(--bg)', border: '1px solid var(--gl)',
                        padding: '16px 24px', borderRadius: 20, fontWeight: 800, fontSize: 14, color: 'var(--tx)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 10, display: 'flex', alignItems: 'center', gap: 12,
                        animation: 'float-complex 6s infinite'
                    }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{ fontSize: 10, color: 'var(--gl)', textTransform: 'uppercase', letterSpacing: '1px' }}>IA KADI ACTIVE</span>
                            <span>{t.landing.kadi_preview}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features (Bento Grid) */}
            <section id="features" style={{ padding: '120px 8%', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 60 }} className="reveal">
                    <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, marginBottom: 16, color: 'var(--tx)', letterSpacing: '-1px' }}>{t.landing.features.title}</h2>
                    <p style={{ color: 'var(--mu)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>{t.landing.features.subtitle}</p>
                </div>

                <div className="bento-grid">
                    {FEATS.map((f, i) => (
                        <div key={i} className={`bento-box ${f.size} reveal reveal-delay-${i + 1}`} style={{ background: f.bg }}>
                            <div style={{ fontSize: 48, marginBottom: 24, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }}>{f.i}</div>
                            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: 'var(--tx)' }}>{f.t}</h3>
                            <p style={{ fontSize: 16, color: 'var(--mu)', lineHeight: 1.6 }}>{f.d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" style={{ padding: '120px 8%', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 60 }} className="reveal">
                    <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, marginBottom: 16, color: 'var(--tx)', letterSpacing: '-1px' }}>{t.landing.pricing.title}</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, maxWidth: 1200, margin: '0 auto' }}>
                    {PLANS.map((p, i) => (
                        <div key={p.n} className={`bento-box reveal reveal-delay-${i + 1}`} style={{
                            background: p.p ? 'linear-gradient(180deg, var(--sf), var(--bg))' : 'var(--sf)',
                            borderColor: p.p ? 'var(--gl)' : 'var(--bd)',
                            boxShadow: p.p ? '0 30px 80px rgba(245, 158, 11, 0.1)' : '0 10px 30px rgba(0,0,0,0.05)',
                        }}>
                            {p.p && <div style={{ position: 'absolute', top: 32, right: -40, background: 'var(--gl)', color: '#000', fontSize: 11, fontWeight: 900, padding: '8px 50px', transform: 'rotate(45deg)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>RECOMMENDED</div>}

                            <div style={{ fontSize: 14, fontWeight: 800, color: p.p ? 'var(--gl)' : 'var(--mu)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '2px' }}>{p.n}</div>
                            <div style={{ fontSize: 56, fontWeight: 900, marginBottom: 32, letterSpacing: '-2px', color: 'var(--tx)' }}>
                                {p.v}€<span style={{ fontSize: 16, color: 'var(--mu)', fontWeight: 500, letterSpacing: 0 }}>/mo</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                                {p.f.map(item => (
                                    <div key={item} style={{ fontSize: 15, color: 'var(--tx)', display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'var(--gn-20)', color: 'var(--gn)', fontSize: 12, fontWeight: 900 }}>✓</div>
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <Link href="/register" style={{
                                display: 'block', padding: '18px', textAlign: 'center', borderRadius: 16,
                                background: p.p ? 'var(--brand-gradient)' : 'var(--cd)', color: p.p ? '#000' : 'var(--tx)',
                                fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s',
                                border: p.p ? 'none' : '1px solid var(--bd)'
                            }} className="btn-hover">{t.landing.pricing.choose.replace('{plan}', p.n)}</Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 8%', borderTop: '1px solid var(--bd)', textAlign: 'center', color: 'var(--mu)', fontSize: 14, background: 'var(--sf)', zIndex: 1, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ fontSize: 24 }}>💎</div>
                    <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-1px', color: 'var(--tx)' }}>
                        Data<span style={{ color: 'var(--gl)' }}>GN</span>
                    </div>
                </div>
                {t.landing.footer}
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                .nav-link { font-size: 14px; font-weight: 700; color: var(--mu); text-decoration: none; transition: color 0.3s; position: relative; }
                .nav-link:hover { color: var(--tx); }
                .btn-hover:hover { transform: translateY(-4px) scale(1.02); filter: brightness(1.05); }
                `
            }} />
        </div>
    );
}
