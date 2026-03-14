'use client';

import { memo, useState, useEffect } from 'react';
import { prettyName } from '@/lib/parser';

// ============================================
// Types
// ============================================

interface KPICardProps {
  label: string;
  value: number | string;
  trend?: number;
  unit?: string;
  color?: string;
  index?: number;
  sparklineData?: number[];
  target?: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================
// Animated Counter
// ============================================

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(value * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
}

// ============================================
// Sparkline Component
// ============================================

const Sparkline = memo(function Sparkline({ 
  data, 
  color, 
  width = 140, 
  height = 50 
}: { 
  data: number[]; 
  color: string; 
  width?: number; 
  height?: number;
}) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 4;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  // Create gradient area
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const gradientId = `gradient-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path 
        d={areaD} 
        fill={`url(#${gradientId})`}
      />
      
      {/* Line */}
      <path 
        d={pathD} 
        fill="none" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ 
          filter: `drop-shadow(0 0 8px ${color}60)`,
        }}
      />
      
      {/* End dot */}
      <circle 
        cx={points[points.length - 1].x} 
        cy={points[points.length - 1].y} 
        r="4" 
        fill={color}
        style={{ filter: `drop-shadow(0 0 6px ${color}))` }}
      />
    </svg>
  );
});

// ============================================
// Progress Ring
// ============================================

function ProgressRing({ 
  progress, 
  color, 
  size = 60 
}: { 
  progress: number; 
  color: string; 
  size?: number;
}) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 1s ease-out',
          filter: `drop-shadow(0 0 8px ${color}))`,
        }}
      />
    </svg>
  );
}

// ============================================
// Main KPI Card Component
// ============================================

export const KPICard = memo(function KPICard({
  label,
  value,
  trend,
  unit,
  color = '#10B981',
  index = 0,
  sparklineData,
  target,
  onClick,
  size = 'md',
}: KPICardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizeStyles = {
    sm: { padding: '20px', minWidth: '200px' },
    md: { padding: '28px', minWidth: '280px' },
    lg: { padding: '36px', minWidth: '360px' },
  };

  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const progress = target ? Math.min((numericValue / target) * 100, 100) : null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))'
          : 'rgba(255,255,255,0.02)',
        borderRadius: '24px',
        border: `1px solid ${isHovered ? color : 'rgba(255,255,255,0.08)'}`,
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? `0 30px 60px rgba(0,0,0,0.4), 0 0 40px ${color}20`
          : '0 10px 30px rgba(0,0,0,0.2)',
        ...sizeStyles[size],
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0.5,
          transition: 'opacity 0.4s',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative' }}>
        <div
          style={{
            padding: '6px 14px',
            borderRadius: '10px',
            background: `${color}15`,
            color: color,
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            border: `1px solid ${color}30`,
          }}
        >
          {label}
        </div>
        
        {progress !== null && (
          <ProgressRing progress={progress} color={color} size={50} />
        )}
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px', position: 'relative' }}>
        <span
          style={{
            fontSize: size === 'lg' ? '42px' : size === 'md' ? '32px' : '24px',
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: size === 'lg' ? '16px' : '13px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Sparkline & Trend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        {sparklineData && sparklineData.length > 1 && (
          <Sparkline data={sparklineData} color={color} />
        )}
        
        {trend !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '12px',
              background: trend >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${trend >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            <span style={{ fontSize: '14px' }}>{trend >= 0 ? '↑' : '↓'}</span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: trend >= 0 ? '#10B981' : '#EF4444',
              }}
            >
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Target Progress Bar */}
      {target && (
        <div style={{ marginTop: '20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' as const }}>
              Objectif
            </span>
            <span style={{ fontSize: '11px', color: color, fontWeight: 800 }}>
              {Math.round((numericValue / target) * 100)}%
            </span>
          </div>
          <div
            style={{
              height: '6px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (numericValue / target) * 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${color}, ${color}CC)`,
                borderRadius: '10px',
                boxShadow: `0 0 20px ${color}60`,
                transition: 'width 1s ease-out',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

// ============================================
// KPI Grid Component
// ============================================

interface KPIGridProps {
  kpis: Array<{
    col: string;
    total: number;
    trend: number;
    color: string;
    unit?: string;
    target?: number;
    last: number;
  }>;
  data: Array<Record<string, any>>;
  aliases?: Record<string, string>;
  onKPIClick?: (col: string) => void;
}

export function KPIGrid({ kpis, data, aliases = {}, onKPIClick }: KPIGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}
    >
      {kpis.map((kpi, index) => (
        <KPICard
          key={kpi.col}
          label={aliases[kpi.col] || prettyName(kpi.col)}
          value={kpi.total}
          trend={kpi.trend}
          unit={kpi.unit}
          color={kpi.color}
          index={index}
          sparklineData={data.slice(-12).map(r => Number(r[kpi.col]) || 0)}
          target={kpi.target}
          onClick={() => onKPIClick?.(kpi.col)}
        />
      ))}
    </div>
  );
}

export default KPICard;
