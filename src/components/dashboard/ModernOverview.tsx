'use client';

import { memo, useState, useEffect, useMemo } from 'react';
import { Row, VizData, prettyName } from '@/lib/parser';
import { SourceType } from '@/lib/fetcher';
import { useI18n } from '@/i18n/I18nContext';
import KPICard, { KPIGrid } from './KPICard';

// ============================================
// Types
// ============================================

interface ModernOverviewProps {
  data: Row[];
  viz: VizData;
  sourceType: SourceType;
  currency?: string;
  aliases?: Record<string, string>;
  rankings: { best: any[]; bad: any[] };
  onKPIClick: (col: string) => void;
}

// ============================================
// Animated Background Component
// ============================================

function AnimatedBackground() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      {/* Gradient orbs */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        right: '-10%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
        animation: 'float 25s ease-in-out infinite reverse',
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '30%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        animation: 'float 30s ease-in-out infinite',
      }} />
      
      {/* Grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
    </div>
  );
}

// ============================================
// Smart Pulse Component
// ============================================

function SmartPulse({ data, viz }: { data: Row[]; viz: VizData }) {
  const { language } = useI18n();
  const [msgIndex, setMsgIndex] = useState(0);

  const topKpi = viz.kpis[0];
  const lowKpi = viz.kpis.reduce((min, k) => (k.trend < min.trend ? k : min), viz.kpis[0]);
  const highestTrend = [...viz.kpis].sort((a, b) => b.trend - a.trend)[0];

  const insights = useMemo(() => {
    const list = [
      `Analyse de ${data.length.toLocaleString()} enregistrements terminée en temps réel.`,
    ];

    if (topKpi) {
      list.push(`Vitalité globale : ${topKpi.trend > 0 ? 'Croissance positive' : 'Stagnation détectée'} sur l'indicateur majeur.`);
    }

    if (highestTrend && highestTrend.trend > 0) {
      list.push(`Performance exceptionnelle (+${Math.round(highestTrend.trend)}%) sur "${prettyName(highestTrend.col)}".`);
    }

    if (lowKpi && lowKpi.trend < 0) {
      list.push(`Contraction de ${Math.round(Math.abs(lowKpi.trend))}% identifiée sur "${prettyName(lowKpi.col)}".`);
    }

    return list;
  }, [data.length, topKpi, lowKpi, highestTrend]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % insights.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [insights.length]);

  return (
    <div style={{
      gridColumn: '1 / -1',
      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(16, 185, 129, 0.08))',
      borderRadius: 24,
      padding: '16px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      marginBottom: 16,
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Pulse indicator */}
      <div style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FBBF24, #10B981)',
        boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
        animation: 'pulse 2s infinite',
      }} />
      
      <div style={{
        fontSize: 10,
        fontWeight: 900,
        color: '#FBBF24',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        whiteSpace: 'nowrap',
      }}>
        Smart Pulse AI
      </div>
      
      <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.2)' }} />
      
      <div style={{
        fontSize: 14,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.9)',
        animation: 'fadeIn 0.5s ease-out',
      }} key={msgIndex}>
        {insights[msgIndex]}
      </div>
      
      <div style={{
        position: 'absolute',
        right: 28,
        fontSize: 10,
        fontWeight: 900,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '2px',
      }}>
        LIVE
      </div>
    </div>
  );
}

// ============================================
// Stats Card Component
// ============================================

const StatCard = memo(function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: string; 
  label: string; 
  value: string; 
  color: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        borderRadius: 20,
        padding: '20px 24px',
        border: `1px solid ${isHovered ? color : 'rgba(255,255,255,0.08)'}`,
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? `0 15px 40px rgba(0,0,0,0.3), 0 0 30px ${color}20` : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <span style={{
          fontSize: 28,
          fontWeight: 900,
          color: '#fff',
          fontFamily: 'var(--ff-mono, monospace)',
        }}>
          {value}
        </span>
      </div>
      <div style={{
        marginTop: 12,
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
      }}>
        {label}
      </div>
    </div>
  );
});

// ============================================
// Leaderboard Component
// ============================================

function Leaderboard({ 
  title, 
  items, 
  color, 
  icon 
}: { 
  title: string; 
  items: { name: string; value: number }[]; 
  color: string;
  icon: string;
}) {
  const { language } = useI18n();
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      borderRadius: 28,
      padding: 28,
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h4 style={{
          fontSize: 13,
          fontWeight: 900,
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          margin: 0,
        }}>
          {title}
        </h4>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.slice(0, 5).map((item, i) => (
          <div 
            key={item.name} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 16,
              padding: '12px 16px',
              background: i === 0 ? `${color}10` : 'transparent',
              borderRadius: 12,
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: i === 0 ? `${color}20` : 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 13,
              color: i === 0 ? color : 'rgba(255,255,255,0.5)',
            }}>
              {i + 1}
            </div>
            <div style={{ 
              flex: 1, 
              fontSize: 14, 
              fontWeight: 700, 
              color: 'rgba(255,255,255,0.9)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {item.name}
            </div>
            <div style={{ 
              fontWeight: 900, 
              fontSize: 15, 
              color: i === 0 ? color : 'rgba(255,255,255,0.8)',
              fontFamily: 'var(--ff-mono, monospace)',
            }}>
              {item.value.toLocaleString(locale)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function ModernOverview({
  data,
  viz,
  sourceType,
  currency = 'GNF',
  aliases = {},
  rankings,
  onKPIClick,
}: ModernOverviewProps) {
  const { t, language } = useI18n();
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  const statCards = [
    { icon: '💎', label: 'Efficacité', val: `${Math.round((viz.kpis[0]?.trend || 0) + 100)}%`, color: '#10B981' },
    { icon: '📊', label: 'Volume', val: data.length.toLocaleString(locale), color: '#FBBF24' },
    { icon: '🎯', label: 'KPIs', val: viz.kpis.length.toString(), color: '#8B5CF6' },
  ];

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      paddingBottom: 60,
    }}>
      <AnimatedBackground />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Smart Pulse Banner */}
        <SmartPulse data={data} viz={viz} />

        {/* Header Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: { lg: '2fr 1fr', md: '1fr' } as any,
          gap: 20,
          marginBottom: 32,
        }}>
          {/* Main Header Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(251, 191, 36, 0.08))',
            borderRadius: 32,
            padding: '40px 48px',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(30px)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Glow effect */}
            <div style={{
              position: 'absolute',
              top: '-100px',
              left: '-100px',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }} />
            
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: '#FBBF24',
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                }}>
                  {t.nav.overview.toUpperCase()}
                </span>
                {viz.industry && (
                  <span style={{
                    background: 'linear-gradient(135deg, #FBBF24, #10B981)',
                    color: '#000',
                    fontSize: 10,
                    fontWeight: 900,
                    padding: '4px 14px',
                    borderRadius: 20,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {viz.industry}
                  </span>
                )}
              </div>
              
              <h1 style={{
                fontSize: { base: '32px', lg: '48px' } as any,
                fontWeight: 950,
                letterSpacing: '-2px',
                color: '#fff',
                margin: 0,
                lineHeight: 1.1,
              }}>
                {viz.industry ? `Performance ${viz.industry}` : 'Tableau de Bord Stratégique'}
              </h1>
              
              <p style={{
                marginTop: 20,
                color: 'rgba(255,255,255,0.6)',
                fontSize: 16,
                lineHeight: 1.7,
                maxWidth: 500,
              }}>
                Pilotage assisté par IA. Visualisez vos indicateurs clés avec une précision optimale.
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {statCards.map((s) => (
              <StatCard key={s.label} icon={s.icon} label={s.label} value={s.val} color={s.color} />
            ))}
          </div>
        </div>

        {/* KPI Section */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 4,
              height: 28,
              background: 'linear-gradient(180deg, #FBBF24, #10B981)',
              borderRadius: 2,
            }} />
            <h2 style={{
              fontSize: 26,
              fontWeight: 900,
              color: '#fff',
              margin: 0,
              letterSpacing: '-0.5px',
            }}>
              Indicateurs Clés
            </h2>
            <div style={{
              marginLeft: 'auto',
              fontSize: 12,
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Mis à jour • {new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <KPIGrid 
            kpis={viz.kpis} 
            data={data} 
            aliases={aliases} 
            onKPIClick={onKPIClick}
          />
        </div>

        {/* Leaderboards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: { lg: '1fr 1fr', md: '1fr' } as any,
          gap: 20,
        }}>
          <Leaderboard
            title="Leaders Stratégiques"
            items={rankings.best}
            color="#10B981"
            icon="🏆"
          />
          <Leaderboard
            title="Zones de Vigilance"
            items={rankings.bad}
            color="#EF4444"
            icon="⚠️"
          />
        </div>
      </div>
    </div>
  );
}
