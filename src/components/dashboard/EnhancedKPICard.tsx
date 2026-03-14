'use client';

import { memo, useState, useEffect, useRef } from 'react';
import { prettyName } from '@/lib/parser';

// ============================================
// Types
// ============================================

interface EnhancedKPICardProps {
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
  showGauge?: boolean;
  previousValue?: number;
  description?: string;
}

// ============================================
// Animated Counter with Smooth Easing
// ============================================

function AnimatedCounter({ value, duration = 1500, prefix = '', suffix = '' }: { 
  value: number; 
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Advanced easing function (easeOutExpo)
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(value * easeOutExpo));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{prefix}{displayValue.toLocaleString()}{suffix}</>;
}

// ============================================
// Enhanced Sparkline with Gradient
// ============================================

const EnhancedSparkline = memo(function EnhancedSparkline({ 
  data, 
  color, 
  width = 160, 
  height = 60,
  showDots = true,
  animate = true
}: { 
  data: number[]; 
  color: string; 
  width?: number; 
  height?: number;
  showDots?: boolean;
  animate?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(!animate);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!animate) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (svgRef.current) {
      observer.observe(svgRef.current);
    }
    return () => observer.disconnect();
  }, [animate]);

  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 6;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y, val };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const gradientId = `sparkline-gradient-${color.replace('#', '')}`;
  const glowId = `sparkline-glow-${color.replace('#', '')}`;

  return (
    <svg ref={svgRef} width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="50%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Area fill with animation */}
      <path 
        d={areaD} 
        fill={`url(#${gradientId})`}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
      />
      
      {/* Main line with glow */}
      <path 
        d={pathD} 
        fill="none" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
        style={{
          strokeDasharray: isVisible ? 'none' : 1000,
          strokeDashoffset: isVisible ? 0 : 1000,
          transition: 'stroke-dashoffset 1.5s ease-out',
        }}
      />
      
      {/* Animated dots */}
      {showDots && points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 5 : 2}
          fill={i === points.length - 1 ? color : `${color}80`}
          style={{
            opacity: isVisible ? 1 : 0,
            transition: `opacity 0.3s ease-out ${i * 0.05}s`,
            filter: i === points.length - 1 ? `drop-shadow(0 0 8px ${color}))` : 'none',
          }}
        />
      ))}
    </svg>
  );
});

// ============================================
// Circular Progress Gauge
// ============================================

function CircularProgressGauge({ 
  progress, 
  color, 
  size = 80,
  strokeWidth = 6,
  showValue = true,
  label = ''
}: { 
  progress: number; 
  color: string; 
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  label?: string;
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle with glow */}
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
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 10px ${color}60)`,
          }}
        />
      </svg>
      {showValue && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: size > 60 ? 16 : 12,
            fontWeight: 900,
            color: '#fff',
          }}>
            {Math.round(progress)}%
          </span>
          {label && (
            <span style={{
              fontSize: 8,
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Trend Indicator with Arrow
// ============================================

function TrendIndicator({ trend, size = 'md' }: { trend: number; size?: 'sm' | 'md' | 'lg' }) {
  const isPositive = trend >= 0;
  const sizeStyles = {
    sm: { padding: '4px 8px', fontSize: 11, gap: 4 },
    md: { padding: '6px 12px', fontSize: 13, gap: 6 },
    lg: { padding: '8px 16px', fontSize: 15, gap: 8 },
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: sizeStyles[size].gap,
      padding: sizeStyles[size].padding,
      borderRadius: 12,
      background: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
      border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
    }}>
      <span style={{
        fontSize: sizeStyles[size].fontSize,
        transform: isPositive ? 'rotate(0deg)' : 'rotate(180deg)',
        transition: 'transform 0.3s',
      }}>
        ↑
      </span>
      <span style={{
        fontSize: sizeStyles[size].fontSize,
        fontWeight: 800,
        color: isPositive ? '#10B981' : '#EF4444',
      }}>
        {Math.abs(trend).toFixed(1)}%
      </span>
    </div>
  );
}

// ============================================
// Main Enhanced KPI Card Component
// ============================================

export const EnhancedKPICard = memo(function EnhancedKPICard({
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
  showGauge = true,
  previousValue,
  description,
}: EnhancedKPICardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const sizeStyles = {
    sm: { padding: '16px', minWidth: '180px' },
    md: { padding: '24px', minWidth: '260px' },
    lg: { padding: '32px', minWidth: '340px' },
  };

  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const progress = target ? Math.min((numericValue / target) * 100, 100) : null;
  const variation = previousValue ? ((numericValue - previousValue) / previousValue) * 100 : null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        position: 'relative',
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
          : 'rgba(255,255,255,0.02)',
        borderRadius: '28px',
        border: `1px solid ${isHovered ? color : 'rgba(255,255,255,0.08)'}`,
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isPressed 
          ? 'translateY(0) scale(0.98)' 
          : isHovered 
            ? 'translateY(-8px) scale(1.02)' 
            : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? `0 30px 60px rgba(0,0,0,0.4), 0 0 50px ${color}15`
          : '0 10px 30px rgba(0,0,0,0.2)',
        ...sizeStyles[size],
      }}
    >
      {/* Animated background gradient */}
      <div style={{
        position: 'absolute',
        top: '-100%',
        right: '-100%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${color}10 0%, transparent 50%)`,
        opacity: isHovered ? 1 : 0.5,
        transition: 'opacity 0.5s',
        pointerEvents: 'none',
        animation: isHovered ? 'rotate 10s linear infinite' : 'none',
      }} />

      {/* Top row: Label & Gauge/Target */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '20px',
        position: 'relative',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            padding: '6px 14px',
            borderRadius: '12px',
            background: `${color}12`,
            color: color,
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase' as const,
            letterSpacing: '1.5px',
            border: `1px solid ${color}25`,
            display: 'inline-block',
            marginBottom: 12,
          }}>
            {label}
          </div>
          {description && (
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: 4,
            }}>
              {description}
            </div>
          )}
        </div>
        
        {showGauge && progress !== null && (
          <CircularProgressGauge 
            progress={progress} 
            color={color} 
            size={60}
            label="Objectif"
          />
        )}
      </div>

      {/* Main value row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        gap: '8px', 
        marginBottom: '20px',
        position: 'relative',
      }}>
        <span style={{
          fontSize: size === 'lg' ? '48px' : size === 'md' ? '36px' : '28px',
          fontWeight: 900,
          letterSpacing: '-3px',
          color: '#fff',
          lineHeight: 1,
          textShadow: `0 0 30px ${color}30`,
        }}>
          {typeof value === 'number' 
            ? <AnimatedCounter value={value} /> 
            : value}
        </span>
        {unit && (
          <span style={{
            fontSize: size === 'lg' ? '18px' : '14px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
          }}>
            {unit}
          </span>
        )}
      </div>

      {/* Bottom row: Sparkline & Trend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'relative',
      }}>
        {sparklineData && sparklineData.length > 1 && (
          <EnhancedSparkline 
            data={sparklineData} 
            color={color} 
            width={140}
            height={50}
          />
        )}
        
        {trend !== undefined && (
          <TrendIndicator trend={trend} size={size === 'lg' ? 'lg' : 'md'} />
        )}
      </div>

      {/* Target progress bar (if has target) */}
      {target && (
        <div style={{ marginTop: '24px', position: 'relative' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '10px' 
          }}>
            <span style={{ 
              fontSize: '10px', 
              color: 'rgba(255,255,255,0.4)', 
              fontWeight: 700, 
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px',
            }}>
              Objectif
            </span>
            <span style={{ 
              fontSize: '11px', 
              color: color, 
              fontWeight: 800 
            }}>
              {Math.round((numericValue / target) * 100)}% atteint
            </span>
          </div>
          <div style={{
            height: '8px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Animated progress fill */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${Math.min(100, (numericValue / target) * 100)}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${color}, ${color}AA)`,
              borderRadius: '10px',
              boxShadow: `0 0 20px ${color}50`,
              transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
            {/* Shine effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1), transparent)',
              borderRadius: '10px 10px 0 0',
            }} />
          </div>
        </div>
      )}
    </div>
  );
});

// ============================================
// Enhanced KPI Grid with Responsive Layout
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

export function EnhancedKPIGrid({ kpis, data, aliases = {}, onKPIClick }: KPIGridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
    }}>
      {kpis.map((kpi, index) => (
        <EnhancedKPICard
          key={kpi.col}
          label={aliases[kpi.col] || prettyName(kpi.col)}
          value={kpi.total}
          trend={kpi.trend}
          unit={kpi.unit}
          color={kpi.color}
          index={index}
          sparklineData={data.slice(-15).map(r => Number(r[kpi.col]) || 0)}
          target={kpi.target}
          onClick={() => onKPIClick?.(kpi.col)}
          size={index < 3 ? 'lg' : 'md'}
          description={kpi.trend > 10 ? 'Performance exceptionnelle' : kpi.trend < -5 ? 'À surveiller' : undefined}
        />
      ))}
    </div>
  );
}

export default EnhancedKPICard;
