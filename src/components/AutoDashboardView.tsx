'use client';

import { useState, useMemo } from 'react';
import {
  AutoDashboardConfig,
  GeneratedKPI,
  GeneratedChart,
  GeneratedInsight,
  calculateKPIValue,
  prepareChartData,
} from '@/lib/auto-dashboard';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface Props {
  data: any[];
  config: AutoDashboardConfig | null;
  loading?: boolean;
  error?: string | null;
  onRegenerate?: () => void;
}

// KPI Card
function KPICard({ kpi, value, trend }: { kpi: GeneratedKPI; value: number; trend?: number }) {
  const formatValue = (val: number) => {
    switch (kpi.format) {
      case 'currency': return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(val);
      case 'percent': return `${val.toFixed(1)}%`;
      default: return new Intl.NumberFormat('fr-FR').format(val);
    }
  };

  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
      borderRadius: 20, padding: 24, border: `1px solid ${kpi.color}30`,
    }}>
      <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 10, background: `${kpi.color}20`, color: kpi.color, fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
        {kpi.label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
        {formatValue(value)}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
        {kpi.description}
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
          <span style={{ transform: isPositive ? 'rotate(0deg)' : 'rotate(180deg)' }}>↑</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: isPositive ? '#10B981' : '#EF4444' }}>
            {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Insight Card
function InsightCard({ insight }: { insight: GeneratedInsight }) {
  const styles: Record<string, { bg: string; icon: string }> = {
    positive: { bg: 'rgba(16, 185, 129, 0.1)', icon: '✓' },
    negative: { bg: 'rgba(239, 68, 68, 0.1)', icon: '⚠' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', icon: '⚡' },
    neutral: { bg: 'rgba(59, 130, 246, 0.1)', icon: '💡' },
  };
  const style = styles[insight.type] || styles.neutral;

  return (
    <div style={{ background: style.bg, borderRadius: 16, padding: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 20 }}>{style.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: '#fff' }}>{insight.title}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{insight.description}</div>
          {insight.recommendation && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, fontSize: 12 }}>
              💡 {insight.recommendation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Chart View
function ChartView({ chart, data }: { chart: GeneratedChart; data: any[] }) {
  const chartData = useMemo(() => prepareChartData(data, chart), [data, chart]);
  const palette = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="x" stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: 10, color: '#fff' }} />
              <Bar dataKey="y" fill={chart.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="x" stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: 10, color: '#fff' }} />
              <Line type="monotone" dataKey="y" stroke={chart.color} strokeWidth={3} dot={{ fill: chart.color }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        const pieData = chartData.slice(0, 8);
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="y" nameKey="x" cx="50%" cy="50%" outerRadius={100} label={({ x, percent }) => `${x} (${(percent * 100).toFixed(0)}%)`}>
                {pieData.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: 10, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="x" stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: 10, color: '#fff' }} />
              <Area type="monotone" dataKey="y" stroke={chart.color} fill={chart.color} fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="x" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip />
              <Bar dataKey="y" fill={chart.color} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: 24 }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, color: '#fff' }}>{chart.title}</div>
      {renderChart()}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>{chart.description}</div>
    </div>
  );
}

// Main Component
export default function AutoDashboardView({ data, config, loading, error, onRegenerate }: Props) {
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{ width: 60, height: 60, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>🤖 Kadi IA analyse vos données...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 20, border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontWeight: 700, marginBottom: 8, color: '#fff' }}>Erreur de génération</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>{error}</div>
        {onRegenerate && <button onClick={onRegenerate} style={{ padding: '12px 24px', background: '#10B981', border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>}
      </div>
    );
  }

  if (!config) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Aucune configuration</div>;

  const kpiValues = useMemo(() => config.kpis.map(kpi => calculateKPIValue(data, kpi)), [data, config.kpis]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{config.title}</h1>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{config.description}</div>
        </div>
        {onRegenerate && <button onClick={onRegenerate} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>🔄 Régénérer</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${config.layout.kpiColumns}, 1fr)`, gap: 16, marginBottom: 32 }}>
        {config.kpis.map((kpi, i) => <KPICard key={kpi.id} kpi={kpi} {...kpiValues[i]} />)}
      </div>

      {config.insights.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#fff' }}>💡 Insights</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {config.insights.map((insight, i) => <InsightCard key={i} insight={insight} />)}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {config.charts.map(chart => <ChartView key={chart.id} chart={chart} data={data} />)}
      </div>
    </div>
  );
}
