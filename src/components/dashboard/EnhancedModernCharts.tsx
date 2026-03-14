'use client';

import { memo, useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Brush, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Treemap, RadialBarChart, RadialBar
} from 'recharts';
import { VizData } from '@/lib/parser';
import { useI18n } from '@/i18n/I18nContext';

// ============================================
// Types
// ============================================

interface EnhancedModernChartsProps {
  viz: VizData;
  palette?: string[];
  onBarClick?: (category: string, value: number) => void;
  currency?: string;
  aliases?: Record<string, string>;
  onCrossFilter?: (key: string, value: any) => void;
  activeKPI?: string | null;
  onActiveKPIChange?: (kpi: string | null) => void;
}

// ============================================
// Enhanced Color Palettes
// ============================================

const COLORS = {
  primary: ['#10B981', '#059669', '#047857'],
  accent: ['#FBBF24', '#F59E0B', '#D97706'],
  secondary: ['#3B82F6', '#2563EB', '#1D4ED8'],
  purple: ['#8B5CF6', '#7C3AED', '#6D28D9'],
  red: ['#EF4444', '#DC2626', '#B91C1C'],
  cyan: ['#06B6D4', '#0891B2', '#0E7490'],
};

const FULL_PALETTE = [
  '#10B981', '#FBBF24', '#3B82F6', '#8B5CF6', 
  '#EF4444', '#F97316', '#06B6D4', '#EC4899',
  '#14B8A6', '#84CC16', '#F43F5E', '#6366F1'
];

// ============================================
// Advanced Custom Tooltip
// ============================================

const AdvancedTooltip = memo(function AdvancedTooltip({ 
  active, 
  payload, 
  label,
  currency = 'GNF',
  aliases = {},
  showTrend = true,
}: any) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
  const isPeak = payload.some((p: any) => p.value > total / payload.length * 1.5);

  return (
    <div style={{
      background: 'rgba(5, 10, 8, 0.95)',
      border: `1px solid ${isPeak ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 20,
      padding: '16px 20px',
      backdropFilter: 'blur(30px)',
      boxShadow: isPeak 
        ? '0 20px 60px rgba(251, 191, 36, 0.2)' 
        : '0 15px 40px rgba(0,0,0,0.5)',
      minWidth: 200,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
        }}>
          {aliases[label] || label}
        </span>
        {isPeak && (
          <span style={{
            background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
            color: '#000',
            fontSize: 9,
            fontWeight: 900,
            padding: '3px 10px',
            borderRadius: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            PIC DÉTECTÉ
          </span>
        )}
      </div>

      {/* Data rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 4,
                background: entry.color || entry.fill,
                boxShadow: `0 0 10px ${entry.color || entry.fill}50`,
              }} />
              <span style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'rgba(255,255,255,0.7)' 
              }}>
                {aliases[entry.name] || entry.name}
              </span>
            </div>
            <span style={{ 
              fontSize: 15, 
              fontWeight: 900, 
              color: entry.color || '#fff' 
            }}>
              {typeof entry.value === 'number' 
                ? entry.value.toLocaleString() 
                : entry.value}
              {entry.name?.includes('growth') ? '%' : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Footer with insights */}
      {showTrend && payload.length > 1 && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          fontWeight: 600,
        }}>
          💡 Total: {total.toLocaleString()} {currency}
        </div>
      )}
    </div>
  );
});

// ============================================
// Animated Chart Card
// ============================================

const AnimatedChartCard = memo(function AnimatedChartCard({
  title,
  subtitle,
  children,
  height = 350,
  headerRight,
  accent = '#10B981',
  onExpand,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
  headerRight?: React.ReactNode;
  accent?: string;
  onExpand?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered 
          ? 'rgba(255,255,255,0.04)' 
          : 'rgba(255,255,255,0.01)',
        borderRadius: 32,
        border: `1px solid ${isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isHovered 
          ? `0 30px 60px rgba(0,0,0,0.4), 0 0 40px ${accent}10` 
          : '0 10px 30px rgba(0,0,0,0.2)',
        transform: isHovered ? 'translateY(-4px)' : 'none',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: `linear-gradient(135deg, ${accent}08, transparent)`,
      }}>
        <div>
          <h3 style={{
            fontSize: 15,
            fontWeight: 900,
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.3px',
          }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              margin: '4px 0 0 0',
              fontWeight: 600,
            }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {headerRight}
          {onExpand && (
            <button
              onClick={onExpand}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '8px 14px',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                transition: 'all 0.2s',
              }}
            >
              ⛶ Agrandir
            </button>
          )}
        </div>
      </div>

      {/* Chart content */}
      <div style={{ padding: '20px', height }}>
        {children}
      </div>
    </div>
  );
});

// ============================================
// Forecast Engine (Linear Regression)
// ============================================

function useForecast(data: any[], valueKey: string, periods: number = 5) {
  return useMemo(() => {
    if (!data.length) return [];

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach((p, i) => {
      const val = Number(p[valueKey]) || 0;
      sumX += i;
      sumY += val;
      sumXY += i * val;
      sumX2 += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const result = data.map(p => ({ ...p, forecast: null }));

    // Add forecast periods
    for (let i = 0; i < periods; i++) {
      const nextX = n + i;
      const predVal = slope * nextX + intercept;
      result.push({
        _label: `Prévision ${i + 1}`,
        [valueKey]: null,
        forecast: Math.max(0, predVal),
      });
    }

    return result;
  }, [data, valueKey, periods]);
}

// ============================================
// Main Trend Chart (Area/Line/Bar Composed)
// ============================================

function MainTrendChart({ 
  data, 
  numCols, 
  showForecast = false,
  height = 380,
  palette = FULL_PALETTE,
  currency = 'GNF',
  aliases = {},
}: { 
  data: any[]; 
  numCols: string[];
  showForecast?: boolean;
  height?: number;
  palette?: string[];
  currency?: string;
  aliases?: Record<string, string>;
}) {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [activeMetric, setActiveMetric] = useState(numCols[0]);
  
  const forecastData = useForecast(data, activeMetric, 6);

  const chartData = showForecast ? forecastData : data;

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette[0]} stopOpacity={0.9} />
                <stop offset="100%" stopColor={palette[0]} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="_label" 
              stroke="rgba(255,255,255,0.2)"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <Tooltip content={<AdvancedTooltip currency={currency} aliases={aliases} />} />
            <Bar 
              dataKey={activeMetric} 
              fill="url(#barGradient)" 
              radius={[8, 8, 0, 0]}
              barSize={30}
            />
            {showForecast && (
              <Bar 
                dataKey="forecast" 
                fill={palette[1]} 
                fillOpacity={0.4}
                radius={[8, 8, 0, 0]}
                barSize={30}
              />
            )}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="_label" 
              stroke="rgba(255,255,255,0.2)"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <Tooltip content={<AdvancedTooltip currency={currency} aliases={aliases} />} />
            <Line 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={palette[0]}
              strokeWidth={4}
              dot={{ r: 5, fill: palette[0], strokeWidth: 3, stroke: 'rgba(0,0,0,0.5)' }}
              activeDot={{ r: 8, strokeWidth: 0, fill: palette[0] }}
              style={{ filter: `drop-shadow(0 0 15px ${palette[0]}50)` }}
            />
            {showForecast && (
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke={palette[4]}
                strokeDasharray="8 4"
                strokeWidth={3}
                dot={{ r: 4, fill: palette[4] }}
              />
            )}
          </LineChart>
        );
      default:
        return (
          <AreaChart data={chartData}>
            <defs>
              {numCols.slice(0, 4).map((col, i) => (
                <linearGradient key={col} id={`areaGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={palette[i]} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={palette[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="_label" 
              stroke="rgba(255,255,255,0.2)"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <Tooltip content={<AdvancedTooltip currency={currency} aliases={aliases} />} />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={palette[0]}
              strokeWidth={3}
              fill={`url(#areaGrad-0)`}
              style={{ filter: `drop-shadow(0 0 10px ${palette[0]}40)` }}
            />
            {showForecast && (
              <Area 
                type="monotone" 
                dataKey="forecast" 
                stroke={palette[4]}
                strokeDasharray="6 3"
                strokeWidth={2}
                fill={palette[4]}
                fillOpacity={0.1}
              />
            )}
          </AreaChart>
        );
    }
  };

  return (
    <AnimatedChartCard
      title="Évolution Temporelle"
      subtitle="Analyse des tendances sur la période"
      height={height}
      accent={palette[0]}
      headerRight={
        <div style={{ display: 'flex', gap: 6 }}>
          {(['area', 'line', 'bar'] as const).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 800,
                background: chartType === type ? palette[0] : 'rgba(255,255,255,0.05)',
                color: chartType === type ? '#000' : 'rgba(255,255,255,0.5)',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </AnimatedChartCard>
  );
}

// ============================================
// Category Distribution Chart
// ============================================

function CategoryDistributionChart({
  data,
  onClick,
  height = 320,
  palette = FULL_PALETTE,
}: {
  data: { name: string; value: number }[];
  onClick?: (name: string, value: number) => void;
  height?: number;
  palette?: string[];
}) {
  const [isAnimated, setIsAnimated] = useState(false);

  return (
    <AnimatedChartCard
      title="Distribution par Catégorie"
      subtitle="Classement par valeur"
      height={height}
      accent={palette[1]}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data.slice(0, 10)} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            {data.slice(0, 10).map((_, i) => (
              <linearGradient key={i} id={`catGrad-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={palette[i % palette.length]} stopOpacity={0.8} />
                <stop offset="100%" stopColor={palette[i % palette.length]} stopOpacity={0.3} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
          <XAxis 
            type="number" 
            stroke="rgba(255,255,255,0.2)"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
          />
          <YAxis 
            type="category" 
            dataKey="name"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)', fontWeight: 600 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
            width={100}
          />
          <Tooltip content={<AdvancedTooltip />} />
          <Bar 
            dataKey="value" 
            radius={[0, 10, 10, 0]}
            onClick={(d) => onClick?.(d.name, d.value)}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
            barSize={24}
          >
            {data.slice(0, 10).map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#catGrad-${index})`}
                style={{ 
                  filter: `drop-shadow(0 0 8px ${palette[index % palette.length]}40)`,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </AnimatedChartCard>
  );
}

// ============================================
// Donut/Pie Chart with Center Stats
// ============================================

function DonutChart({
  data,
  height = 320,
  palette = FULL_PALETTE,
  showLegend = true,
}: {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  palette?: string[];
  showLegend?: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <AnimatedChartCard
      title="Répartition Stratégique"
      subtitle="Part de chaque catégorie"
      height={height}
      accent={palette[2]}
    >
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={height - 80}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || palette[index % palette.length]}
                  stroke={activeIndex === index ? '#fff' : 'transparent'}
                  strokeWidth={activeIndex === index ? 3 : 0}
                  style={{
                    filter: activeIndex === index 
                      ? `drop-shadow(0 0 20px ${entry.color || palette[index % palette.length]})`
                      : 'none',
                    transition: 'all 0.3s',
                    transform: activeIndex === index ? 'scale(1.05)' : 'none',
                    transformOrigin: 'center',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<AdvancedTooltip />} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ 
                  fontSize: 11, 
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  paddingTop: 20,
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Stats */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}>
            TOTAL
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 950,
            color: '#fff',
            marginTop: 4,
          }}>
            {total.toLocaleString()}
          </div>
        </div>
      </div>
    </AnimatedChartCard>
  );
}

// ============================================
// Radial Bar Chart (Performance Indicators)
// ============================================

function PerformanceRadialChart({
  data,
  height = 300,
  palette = FULL_PALETTE,
}: {
  data: { name: string; value: number; fill?: string }[];
  height?: number;
  palette?: string[];
}) {
  const radialData = data.map((d, i) => ({
    ...d,
    fill: d.fill || palette[i % palette.length],
  }));

  return (
    <AnimatedChartCard
      title="Indicateurs de Performance"
      subtitle="Score par métrique"
      height={height}
      accent={palette[3]}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="20%" 
          outerRadius="90%" 
          data={radialData}
          startAngle={180}
          endAngle={0}
        >
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis 
            type="number" 
            domain={[0, 100]} 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
          />
          <RadialBar
            background={{ fill: 'rgba(255,255,255,0.05)' }}
            dataKey="value"
            cornerRadius={10}
          />
          <Legend
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}
          />
          <Tooltip content={<AdvancedTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
    </AnimatedChartCard>
  );
}

// ============================================
// Main Enhanced Charts Component
// ============================================

export default function EnhancedModernCharts({
  viz,
  palette,
  onBarClick,
  currency,
  aliases = {},
  onCrossFilter,
  activeKPI,
  onActiveKPIChange,
}: EnhancedModernChartsProps) {
  const { t, language } = useI18n();
  const [showForecast, setShowForecast] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string>('all');

  const currentPalette = palette || FULL_PALETTE;

  // Prepare performance data for radial chart
  const performanceData = useMemo(() => {
    return viz.kpis.slice(0, 5).map((kpi, i) => ({
      name: aliases[kpi.col] || kpi.col,
      value: Math.min(100, Math.max(0, (kpi.total / (kpi.target || kpi.total)) * 100)),
      fill: currentPalette[i % currentPalette.length],
    }));
  }, [viz.kpis, aliases, currentPalette]);

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      animation: 'fadeIn 0.5s ease-out',
    }}>
      {/* Control Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 4px',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'all', label: 'Vue Complète' },
            { id: 'trend', label: 'Tendances' },
            { id: 'category', label: 'Catégories' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setSelectedChart(btn.id)}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 800,
                background: selectedChart === btn.id 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'transparent',
                color: selectedChart === btn.id ? '#fff' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${selectedChart === btn.id ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForecast(!showForecast)}
          style={{
            padding: '10px 20px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 800,
            background: showForecast 
              ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' 
              : 'rgba(255,255,255,0.05)',
            color: showForecast ? '#000' : 'rgba(255,255,255,0.6)',
            border: `1px solid ${showForecast ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          🔮 {showForecast ? 'Prévisions Actives' : 'Activer Prévisions IA'}
        </button>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: { lg: '1fr 1fr', md: '1fr' } as any,
        gap: 24,
      }}>
        {/* Main Trend Chart - Full width */}
        {(selectedChart === 'all' || selectedChart === 'trend') && (
          <div style={{ gridColumn: { lg: '1 / -1', md: '1' } as any }}>
            <MainTrendChart
              data={viz.series}
              numCols={viz.numCols}
              showForecast={showForecast}
              height={400}
              palette={currentPalette}
              currency={currency}
              aliases={aliases}
            />
          </div>
        )}

        {/* Category Chart */}
        {(selectedChart === 'all' || selectedChart === 'category') && (
          <CategoryDistributionChart
            data={viz.bars}
            onClick={onBarClick}
            height={380}
            palette={currentPalette}
          />
        )}

        {/* Donut Chart */}
        {selectedChart === 'all' && (
          <DonutChart
            data={viz.pie}
            height={380}
            palette={currentPalette}
          />
        )}
      </div>

      {/* Performance Radial Chart */}
      {selectedChart === 'all' && performanceData.length > 0 && (
        <PerformanceRadialChart
          data={performanceData}
          height={280}
          palette={currentPalette}
        />
      )}
    </div>
  );
}
