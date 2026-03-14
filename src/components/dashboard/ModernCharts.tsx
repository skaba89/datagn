'use client';

import { memo, useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { VizData } from '@/lib/parser';
import { useI18n } from '@/i18n/I18nContext';

// ============================================
// Types
// ============================================

interface ModernChartsProps {
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
// Constants
// ============================================

const COLORS = [
  '#10B981', '#FBBF24', '#3B82F6', '#8B5CF6', 
  '#EF4444', '#F97316', '#06B6D4', '#EC4899'
];

const GRADIENTS = [
  { start: '#10B981', end: '#059669' },
  { start: '#FBBF24', end: '#D97706' },
  { start: '#3B82F6', end: '#1D4ED8' },
  { start: '#8B5CF6', end: '#7C3AED' },
];

// ============================================
// Custom Tooltip
// ============================================

const CustomTooltip = memo(function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: 'rgba(10, 20, 15, 0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: '12px 16px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>
        {label}
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: entry.color,
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            {entry.name}:
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
});

// ============================================
// Chart Card Wrapper
// ============================================

const ChartCard = memo(function ChartCard({
  title,
  children,
  height = 300,
  onExpand,
}: {
  title: string;
  children: React.ReactNode;
  height?: number;
  onExpand?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
        borderRadius: 28,
        border: `1px solid ${isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
        overflow: 'hidden',
        transition: 'all 0.4s ease',
        boxShadow: isHovered ? '0 20px 50px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 800,
          color: '#fff',
          margin: 0,
          letterSpacing: '-0.3px',
        }}>
          {title}
        </h3>
        {onExpand && (
          <button
            onClick={onExpand}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
          >
            Agrandir
          </button>
        )}
      </div>
      <div style={{ padding: '20px', height }}>
        {children}
      </div>
    </div>
  );
});

// ============================================
// Area Chart Component
// ============================================

function TrendChart({ data, numCols, height = 300 }: { data: any[]; numCols: string[]; height?: number }) {
  const { language } = useI18n();

  return (
    <ChartCard title="Évolution Temporelle" height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {numCols.slice(0, 4).map((col, i) => (
              <linearGradient key={col} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS[i]} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="_label" 
            stroke="rgba(255,255,255,0.3)"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {numCols.slice(0, 4).map((col, i) => (
            <Area
              key={col}
              type="monotone"
              dataKey={col}
              stroke={COLORS[i]}
              strokeWidth={3}
              fill={`url(#gradient-${i})`}
              style={{ filter: `drop-shadow(0 0 8px ${COLORS[i]}50)` }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ============================================
// Bar Chart Component
// ============================================

function CategoryChart({ 
  data, 
  onClick,
  height = 300 
}: { 
  data: { name: string; value: number }[];
  onClick?: (name: string, value: number) => void;
  height?: number;
}) {
  return (
    <ChartCard title="Distribution par Catégorie" height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            type="number" 
            stroke="rgba(255,255,255,0.3)"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
          />
          <YAxis 
            type="category" 
            dataKey="name"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            radius={[0, 8, 8, 0]}
            onClick={(data) => onClick?.(data.name, data.value)}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                style={{ filter: `drop-shadow(0 0 10px ${COLORS[index % COLORS.length]}40)` }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ============================================
// Pie Chart Component
// ============================================

function PieChartCard({ 
  data,
  height = 300 
}: { 
  data: { name: string; value: number; color: string }[];
  height?: number;
}) {
  return (
    <ChartCard title="Répartition" height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.1))' }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ============================================
// Main Component
// ============================================

export default function ModernCharts({
  viz,
  palette,
  onBarClick,
  currency,
  aliases = {},
  onCrossFilter,
  activeKPI,
  onActiveKPIChange,
}: ModernChartsProps) {
  const { t, language } = useI18n();

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: { lg: '1fr 1fr', md: '1fr' } as any,
      gap: 20,
      animation: 'fadeIn 0.5s ease-out',
    }}>
      {/* Trend Chart - Full Width */}
      <div style={{ gridColumn: { lg: '1 / -1', md: '1' } as any }}>
        <TrendChart 
          data={viz.series} 
          numCols={viz.numCols}
          height={350}
        />
      </div>

      {/* Category Chart */}
      <CategoryChart 
        data={viz.bars}
        onClick={onBarClick}
        height={300}
      />

      {/* Pie Chart */}
      <PieChartCard 
        data={viz.pie}
        height={300}
      />
    </div>
  );
}
