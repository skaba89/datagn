'use client';
// ────────────────────────────────────────────────────────────────
// StepSource.tsx — Écran de choix de source de données (Elite UX)
// ────────────────────────────────────────────────────────────────
import { SourceType } from '@/lib/fetcher';
import { useI18n } from '@/i18n/I18nContext';

interface Props {
  onSelect: (type: SourceType) => void;
}

export default function StepSource({ onSelect }: Props) {
  const { t } = useI18n();

  const SOURCES: {
    type: SourceType;
    icon: string;
    label: string;
    desc: string;
    color: string;
    badge?: string;
  }[] = [
      {
        type: 'csv',
        icon: '📁',
        label: t.onboarding.sources.csv.label,
        desc: t.onboarding.sources.csv.desc,
        color: '#FBBF24',
        badge: 'RAPIDE',
      },
      {
        type: 'gsheets',
        icon: '📊',
        label: t.onboarding.sources.gsheets.label,
        desc: t.onboarding.sources.gsheets.desc,
        color: '#10B981',
        badge: 'TEMPS RÉEL',
      },
      {
        type: 'db',
        icon: '💽',
        label: 'Base de Données',
        desc: 'PostgreSQL, MySQL, ou SQL Server distants',
        color: '#E0234E',
      },
      {
        type: 'kobo',
        icon: '📋',
        label: t.onboarding.sources.kobo.label,
        desc: t.onboarding.sources.kobo.desc,
        color: '#3B82F6',
      },
      {
        type: 'api',
        icon: '🗄️',
        label: t.onboarding.sources.api.label,
        desc: t.onboarding.sources.api.desc,
        color: '#8B5CF6',
        badge: 'REST',
      },
      {
        type: 'dhis2',
        icon: '🏥',
        label: t.onboarding.sources.dhis2.label,
        desc: t.onboarding.sources.dhis2.desc,
        color: '#004A99',
        badge: 'SANTÉ',
      },
    ];

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      background: 'var(--bg)',
      transition: 'background 0.3s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background glows */}
      <div style={{ position: 'absolute', top: '5%', left: '10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* Header */}
      <div className="fu d1" style={{ textAlign: 'center', maxWidth: 860, width: '100%', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--gn), var(--gl))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 900, color: '#000',
            boxShadow: '0 0 30px rgba(16,185,129,0.4)'
          }}>D</div>
          <span style={{ fontWeight: 900, fontSize: 28, letterSpacing: '-1.5px', color: 'var(--tx)' }}>
            Data<span style={{ color: 'var(--gl)' }}>GN</span>
          </span>
          <div style={{
            padding: '4px 12px', borderRadius: 20,
            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
            color: 'var(--gl)', fontSize: 10, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase'
          }}>LIVE ✦</div>
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 900, letterSpacing: '-3px',
          lineHeight: 1, marginBottom: 20, color: 'var(--tx)'
        }}>
          {t.onboarding.hero_title}<br />
          <span className="text-gradient">{t.onboarding.hero_subtitle}</span>
        </h1>

        <p style={{
          color: 'var(--mu)', fontSize: 'clamp(15px, 1.5vw, 18px)', maxWidth: 640, margin: '0 auto 60px',
          lineHeight: 1.6, fontWeight: 400
        }}>
          {t.onboarding.hero_desc}
        </p>

        {/* Source Grid */}
        <div
          className="source-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, width: '100%' }}
        >
          {SOURCES.map((src, idx) => (
            <button
              key={src.type}
              onClick={() => onSelect(src.type)}
              className={`fu d${idx + 2}`}
              style={{
                background: 'var(--sf)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--bd)',
                borderRadius: 24,
                padding: '32px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                position: 'relative', overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                e.currentTarget.style.borderColor = src.color;
                e.currentTarget.style.boxShadow = `0 10px 20px rgba(0,0,0,0.1), 0 0 15px ${src.color}20`;
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderColor = 'var(--bd)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
              }}
            >
              {/* Corner accent */}
              <div style={{
                position: 'absolute', top: 0, right: 0, width: 40, height: 40,
                background: `linear-gradient(225deg, ${src.color}20, transparent)`,
                borderBottomLeftRadius: 20
              }} />

              {/* Icon Container */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                <div style={{
                  fontSize: 32, width: 64, height: 64, borderRadius: 16,
                  background: `${src.color}15`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', border: `1px solid ${src.color}30`,
                }}>{src.icon}</div>
                {src.badge && (
                  <span style={{
                    fontSize: 9, fontWeight: 900, color: src.color, letterSpacing: '1px',
                    padding: '2px 8px', borderRadius: 12, border: `1px solid ${src.color}30`,
                    background: `${src.color}10`, textTransform: 'uppercase'
                  }}>{src.badge}</span>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)', marginBottom: 6, letterSpacing: '-0.5px' }}>
                  {src.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--mu)', lineHeight: 1.5, fontWeight: 400 }}>
                  {src.desc}
                </div>
              </div>

              <div style={{
                marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 10, fontWeight: 800, color: src.color, textTransform: 'uppercase',
                letterSpacing: '0.5px', position: 'relative'
              }}>
                Connecter cette source <span>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Trust row */}
        <div style={{
          display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap',
          marginTop: 72, fontSize: 12, color: 'var(--mu)', opacity: 0.6, fontWeight: 500
        }}>
          {(t.onboarding.trust || []).map((txt: string) => (
            <span key={txt} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, color: 'var(--gn)' }}>✓</span> {txt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
