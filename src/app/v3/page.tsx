'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Plus, Settings, Bell, Search, Filter, Download,
  TrendingUp, TrendingDown, Minus, MoreVertical, Star, StarOff,
  BarChart3, LineChart as LineChartIcon, PieChart, Target, Zap,
  AlertTriangle, CheckCircle, Clock, Users, Shield, Eye, Edit, Trash2,
  ChevronDown, ChevronRight, Grid3X3, LayoutList, Layers, RefreshCw,
  Sparkles, ArrowUpRight, ArrowDownRight, Activity, Gauge, BoxSelect
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  RadialBarChart, RadialBar, ScatterChart, Scatter, ZAxis, Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';

// ============================================
// TYPES
// ============================================

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
type DashboardRole = 'OWNER' | 'EDITOR' | 'VIEWER';

interface KPI {
  id: string;
  name: string;
  description?: string;
  value: number;
  previousValue: number;
  target?: number;
  unit: string;
  trend: number;
  category?: string;
  icon?: string;
  color: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  columnSpan: number;
  rowSpan: number;
  order: number;
  vizType: 'sparkline' | 'gauge' | 'trend' | 'progress' | 'bullet' | 'scorecard' | 'comparison';
  showPrediction?: boolean;
  confidence?: number;
  prediction?: number[];
  sparkline: number[];
  alerts?: { type: string; message: string }[];
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  layout: 'grid' | 'flex' | 'bento';
  isPublic: boolean;
  isFavorite: boolean;
  order: number;
  kpis: KPI[];
  userRole: DashboardRole;
}

interface FilterConfig {
  search: string;
  categories: string[];
  dateRange: string;
  sortBy: 'name' | 'value' | 'trend';
  sortOrder: 'asc' | 'desc';
  showPredictions: boolean;
}

// ============================================
// CONSTANTS & CONFIG
// ============================================

const COLORS = {
  primary: '#10B981',
  secondary: '#F59E0B',
  tertiary: '#3B82F6',
  quaternary: '#8B5CF6',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#06B6D4',
  palette: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1']
};

const CATEGORIES = ['Finance', 'Ventes', 'Marketing', 'Opérations', 'RH', 'IT', 'Produit', 'Support'];
const KPI_SIZES = ['small', 'medium', 'large', 'xlarge'] as const;
const VIZ_TYPES = ['sparkline', 'gauge', 'trend', 'progress', 'bullet', 'scorecard', 'comparison'] as const;

// ============================================
// MOCK DATA GENERATOR
// ============================================

const generateKPIs = (count: number = 8): KPI[] => {
  const kpiTemplates = [
    { name: 'Chiffre d\'Affaires', unit: 'M GNF', category: 'Finance', vizType: 'sparkline' as const, size: 'large' as const, columnSpan: 2 },
    { name: 'Clients Actifs', unit: '', category: 'Ventes', vizType: 'trend' as const, size: 'medium' as const, columnSpan: 1 },
    { name: 'Taux de Conversion', unit: '%', category: 'Marketing', vizType: 'gauge' as const, size: 'medium' as const, columnSpan: 1 },
    { name: 'Panier Moyen', unit: 'K GNF', category: 'Ventes', vizType: 'comparison' as const, size: 'medium' as const, columnSpan: 1 },
    { name: 'Satisfaction Client', unit: '%', category: 'Support', vizType: 'progress' as const, size: 'medium' as const, columnSpan: 1 },
    { name: 'Efficacité Opérationnelle', unit: '%', category: 'Opérations', vizType: 'bullet' as const, size: 'medium' as const, columnSpan: 1 },
    { name: 'Rétention Client', unit: '%', category: 'Ventes', vizType: 'scorecard' as const, size: 'small' as const, columnSpan: 1 },
    { name: 'Coût par Acquisition', unit: 'K GNF', category: 'Marketing', vizType: 'trend' as const, size: 'small' as const, columnSpan: 1 },
    { name: 'NPS Score', unit: '', category: 'Support', vizType: 'gauge' as const, size: 'small' as const, columnSpan: 1 },
    { name: 'Temps de Réponse', unit: 'min', category: 'IT', vizType: 'progress' as const, size: 'small' as const, columnSpan: 1 },
    { name: 'Taux d\'Erreur', unit: '%', category: 'IT', vizType: 'comparison' as const, size: 'small' as const, columnSpan: 1 },
    { name: 'Productivité', unit: '%', category: 'RH', vizType: 'sparkline' as const, size: 'medium' as const, columnSpan: 1 },
  ];

  return kpiTemplates.slice(0, count).map((template, i) => ({
    id: `kpi-${i}`,
    name: template.name,
    value: Math.random() * 100 + 50,
    previousValue: Math.random() * 100 + 40,
    target: 100,
    unit: template.unit,
    trend: (Math.random() - 0.3) * 30,
    category: template.category,
    color: COLORS.palette[i % COLORS.palette.length],
    size: template.size,
    columnSpan: template.columnSpan,
    rowSpan: 1,
    order: i,
    vizType: template.vizType,
    showPrediction: true,
    confidence: 0.75 + Math.random() * 0.2,
    prediction: Array.from({ length: 6 }, () => Math.random() * 100 + 50),
    sparkline: Array.from({ length: 12 }, () => Math.random() * 100 + 30),
    alerts: Math.random() > 0.8 ? [{ type: 'warning', message: 'Seuil proche' }] : [],
  }));
};

const generateMockDashboards = (): Dashboard[] => [
  {
    id: 'exec',
    name: 'Vue Exécutive',
    description: 'Indicateurs stratégiques pour la direction',
    icon: '👑',
    color: COLORS.primary,
    layout: 'bento',
    isPublic: true,
    isFavorite: true,
    order: 0,
    userRole: 'OWNER',
    kpis: generateKPIs(8)
  },
  {
    id: 'sales',
    name: 'Dashboard Ventes',
    description: 'Performance commerciale et pipelines',
    icon: '💼',
    color: COLORS.tertiary,
    layout: 'grid',
    isPublic: false,
    isFavorite: true,
    order: 1,
    userRole: 'EDITOR',
    kpis: generateKPIs(6)
  },
  {
    id: 'marketing',
    name: 'Marketing Analytics',
    description: 'Campagnes, acquisition et engagement',
    icon: '📈',
    color: COLORS.quaternary,
    layout: 'grid',
    isPublic: false,
    isFavorite: false,
    order: 2,
    userRole: 'VIEWER',
    kpis: generateKPIs(5)
  },
  {
    id: 'ops',
    name: 'Opérations',
    description: 'Métriques opérationnelles et KPIs',
    icon: '⚙️',
    color: COLORS.warning,
    layout: 'flex',
    isPublic: false,
    isFavorite: false,
    order: 3,
    userRole: 'VIEWER',
    kpis: generateKPIs(4)
  }
];

// ============================================
// WORLD-CLASS KPI VISUALIZATIONS
// ============================================

// Gauge Component (inspired by Looker/Tableau)
function KPIGauge({ value, target, color, size = 'medium' }: { 
  value: number; 
  target?: number; 
  color: string;
  size?: 'small' | 'medium' | 'large';
}) {
  const normalizedValue = Math.min(100, Math.max(0, (value / (target || 100)) * 100));
  const sizeMap = { small: 80, medium: 120, large: 160 };
  const dimension = sizeMap[size];
  const strokeWidth = dimension / 10;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = radius * Math.PI * 1.5;
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="relative" style={{ width: dimension, height: dimension * 0.75 }}>
      <svg viewBox={`0 0 ${dimension} ${dimension * 0.75}`} className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M ${strokeWidth/2} ${dimension * 0.7} 
              A ${radius} ${radius} 0 1 1 ${dimension - strokeWidth/2} ${dimension * 0.7}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-muted/20"
        />
        {/* Value arc with gradient */}
        <defs>
          <linearGradient id={`gauge-grad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
          <filter id={`gauge-glow-${color}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={`M ${strokeWidth/2} ${dimension * 0.7} 
              A ${radius} ${radius} 0 1 1 ${dimension - strokeWidth/2} ${dimension * 0.7}`}
          fill="none"
          stroke={`url(#gauge-grad-${color})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={`url(#gauge-glow-${color})`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Center value */}
        <text
          x={dimension / 2}
          y={dimension * 0.6}
          textAnchor="middle"
          className="fill-foreground font-bold"
          style={{ fontSize: dimension / 5 }}
        >
          {value.toFixed(0)}%
        </text>
      </svg>
    </div>
  );
}

// Sparkline Component (inspired by Tableau)
function KPISparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map((v, i) => ({ value: v, index: i }))}>
          <defs>
            <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-grad-${color})`}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Bullet Chart (inspired by Stephen Few / Power BI)
function KPIBullet({ value, target, previousValue, color }: {
  value: number;
  target?: number;
  previousValue?: number;
  color: string;
}) {
  const maxValue = Math.max(value, target || 100, previousValue || 0) * 1.2;

  return (
    <div className="space-y-2">
      {/* Quantitative scale */}
      <div className="relative h-8 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 rounded">
        {/* Poor zone */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-red-500/10 rounded-l" />
        {/* Average zone */}
        <div className="absolute left-1/3 top-0 bottom-0 w-1/3 bg-yellow-500/10" />
        {/* Good zone */}
        <div className="absolute left-2/3 top-0 bottom-0 w-1/3 bg-green-500/10 rounded-r" />
        
        {/* Previous value bar */}
        {previousValue && (
          <div
            className="absolute top-2 bottom-2 bg-muted/50 rounded"
            style={{ width: `${(previousValue / maxValue) * 100}%`, left: 0 }}
          />
        )}
        
        {/* Value bar */}
        <div
          className="absolute top-1 bottom-1 rounded transition-all duration-500"
          style={{
            width: `${(value / maxValue) * 100}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}40`
          }}
        />
        
        {/* Target marker */}
        {target && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-foreground"
            style={{ left: `${(target / maxValue) * 100}%` }}
          />
        )}
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>{(maxValue / 2).toFixed(0)}</span>
        <span>{maxValue.toFixed(0)}</span>
      </div>
    </div>
  );
}

// Comparison Card (inspired by Mixpanel/Amplitude)
function KPIComparison({ value, previousValue, unit, trend, color }: {
  value: number;
  previousValue: number;
  unit: string;
  trend: number;
  color: string;
}) {
  const formatValue = (v: number) => {
    if (unit === 'M GNF') return `${(v / 1000000).toFixed(1)}M`;
    if (unit === 'K GNF') return `${(v / 1000).toFixed(1)}K`;
    if (unit === '%') return `${v.toFixed(1)}%`;
    return v.toLocaleString();
  };

  const isPositive = trend >= 0;

  return (
    <div className="flex items-center gap-4">
      {/* Comparison bar */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-xs text-muted-foreground">Précédent</span>
          <span className="text-xs font-medium ml-auto">{formatValue(previousValue)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-xs text-muted-foreground">Actuel</span>
          <span className="text-xs font-medium ml-auto">{formatValue(value)}</span>
        </div>
      </div>
      
      {/* Trend indicator */}
      <div className={`flex flex-col items-center p-3 rounded-lg ${
        isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'
      }`}>
        {isPositive ? (
          <ArrowUpRight className="h-5 w-5 text-emerald-500" />
        ) : (
          <ArrowDownRight className="h-5 w-5 text-red-500" />
        )}
        <span className={`text-lg font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{trend.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// Scorecard (inspired by Google Data Studio)
function KPIScorecard({ kpi }: { kpi: KPI }) {
  const formatValue = (v: number, unit: string) => {
    if (unit === 'M GNF') return `${(v / 1000000).toFixed(2)}M`;
    if (unit === 'K GNF') return `${(v / 1000).toFixed(1)}K`;
    if (unit === '%') return `${v.toFixed(1)}%`;
    return v.toLocaleString();
  };

  const isPositive = kpi.trend >= 0;
  const progress = kpi.target ? (kpi.value / kpi.target) * 100 : null;

  return (
    <div className="text-center space-y-3">
      <div className="text-5xl font-bold tracking-tight" style={{ color: kpi.color }}>
        {formatValue(kpi.value, kpi.unit)}
      </div>
      {kpi.unit && kpi.unit !== '%' && (
        <div className="text-sm text-muted-foreground">{kpi.unit}</div>
      )}
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
        isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
      }`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {isPositive ? '+' : ''}{kpi.trend.toFixed(1)}%
      </div>
      {progress !== null && (
        <div className="w-full max-w-xs mx-auto">
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {progress.toFixed(0)}% de l'objectif
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN KPI CARD (WORLD-CLASS)
// ============================================

function KPICard({ kpi, onEdit, onDelete, canEdit }: { 
  kpi: KPI; 
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isPositive = kpi.trend >= 0;

  const renderVisualization = () => {
    switch (kpi.vizType) {
      case 'gauge':
        return <KPIGauge value={kpi.value} target={kpi.target} color={kpi.color} />;
      case 'bullet':
        return <KPIBullet value={kpi.value} target={kpi.target} previousValue={kpi.previousValue} color={kpi.color} />;
      case 'comparison':
        return <KPIComparison value={kpi.value} previousValue={kpi.previousValue} unit={kpi.unit} trend={kpi.trend} color={kpi.color} />;
      case 'scorecard':
        return <KPIScorecard kpi={kpi} />;
      case 'progress':
        return (
          <div className="space-y-3">
            <Progress value={(kpi.value / (kpi.target || 100)) * 100} className="h-4" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Actuel</span>
              <span className="font-medium">{kpi.value.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Objectif</span>
              <span className="font-medium">{kpi.target}%</span>
            </div>
          </div>
        );
      case 'trend':
        return (
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">{kpi.value.toFixed(1)}</div>
            <div className="flex-1">
              <KPISparkline data={kpi.sparkline} color={kpi.color} height={50} />
            </div>
          </div>
        );
      default: // sparkline
        return <KPISparkline data={kpi.sparkline} color={kpi.color} height={60} />;
    }
  };

  return (
    <Card 
      className={`
        group relative overflow-hidden transition-all duration-300 
        hover:shadow-2xl hover:-translate-y-1 hover:border-primary/30
        ${kpi.size === 'xlarge' ? 'col-span-2 row-span-2' : ''}
        ${kpi.size === 'large' ? 'col-span-2' : ''}
        ${kpi.columnSpan === 2 ? 'col-span-2' : ''}
      `}
      style={{ 
        borderLeftWidth: 4, 
        borderLeftColor: kpi.color,
        gridColumn: kpi.columnSpan === 2 ? 'span 2' : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Action buttons */}
      {canEdit && isHovered && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button variant="secondary" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button variant="secondary" size="icon" className="h-7 w-7" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ borderColor: kpi.color, color: kpi.color }}
          >
            {kpi.category}
          </Badge>
          <div className="flex items-center gap-2">
            {kpi.alerts?.map((alert, i) => (
              <AlertTriangle key={i} className="h-4 w-4 text-amber-500" />
            ))}
            {kpi.showPrediction && (
              <Badge variant="secondary" className="text-[10px]">
                <Sparkles className="h-3 w-3 mr-1" />
                {((kpi.confidence || 0) * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-sm font-medium text-muted-foreground mt-2">
          {kpi.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main value display for non-scorecard types */}
        {kpi.vizType !== 'scorecard' && (
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {kpi.unit === 'M GNF' ? `${(kpi.value / 1000000).toFixed(1)}M` :
                 kpi.unit === 'K GNF' ? `${(kpi.value / 1000).toFixed(1)}K` :
                 kpi.unit === '%' ? `${kpi.value.toFixed(1)}%` :
                 kpi.value.toLocaleString()}
              </span>
              {kpi.unit && kpi.unit !== '%' && kpi.unit !== 'M GNF' && kpi.unit !== 'K GNF' && (
                <span className="text-sm text-muted-foreground">{kpi.unit}</span>
              )}
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              isPositive ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositive ? '+' : ''}{kpi.trend.toFixed(1)}%
            </div>
          </div>
        )}

        {/* Visualization */}
        {renderVisualization()}

        {/* Prediction preview */}
        {kpi.showPrediction && kpi.prediction && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">
              Prévision: {kpi.prediction[kpi.prediction.length - 1].toFixed(1)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// DASHBOARD SIDEBAR
// ============================================

function DashboardSidebar({ 
  dashboards, 
  activeId, 
  onSelect, 
  onAdd, 
  onEdit, 
  onDelete,
  userRole 
}: {
  dashboards: Dashboard[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (dashboard: Dashboard) => void;
  onDelete: (id: string) => void;
  userRole: UserRole;
}) {
  const canCreate = userRole === 'ADMIN' || userRole === 'EDITOR';

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-sm flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Dashboards</h2>
          {canCreate && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Favorites section */}
          {dashboards.filter(d => d.isFavorite).length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                Favoris
              </div>
              {dashboards.filter(d => d.isFavorite).map(dashboard => (
                <DashboardListItem
                  key={dashboard.id}
                  dashboard={dashboard}
                  isActive={activeId === dashboard.id}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
              <Separator className="my-2" />
            </>
          )}

          {/* All dashboards */}
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Tous
          </div>
          {dashboards.sort((a, b) => a.order - b.order).map(dashboard => (
            <DashboardListItem
              key={dashboard.id}
              dashboard={dashboard}
              isActive={activeId === dashboard.id}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </ScrollArea>

      {/* User info */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Admin User</div>
            <Badge variant="outline" className="text-[10px]">
              <Shield className="h-3 w-3 mr-1" />
              {userRole}
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DashboardListItem({ 
  dashboard, 
  isActive, 
  onSelect, 
  onEdit, 
  onDelete 
}: {
  dashboard: Dashboard;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (dashboard: Dashboard) => void;
  onDelete: (id: string) => void;
}) {
  const canEdit = dashboard.userRole === 'OWNER' || dashboard.userRole === 'EDITOR';

  return (
    <div
      className={`
        group flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer
        transition-all duration-200
        ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}
      `}
      onClick={() => onSelect(dashboard.id)}
    >
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
        style={{ backgroundColor: `${dashboard.color}20` }}
      >
        {dashboard.icon || '📊'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{dashboard.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {dashboard.kpis.length} KPIs
        </div>
      </div>
      {canEdit && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(dashboard)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={() => onDelete(dashboard.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// ============================================
// DASHBOARD HEADER & ACTIONS
// ============================================

function DashboardHeader({ 
  dashboard, 
  filterConfig, 
  onFilterChange,
  onAddKPI,
  onToggleFavorite,
  canEdit 
}: {
  dashboard: Dashboard;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  onAddKPI: () => void;
  onToggleFavorite: () => void;
  canEdit: boolean;
}) {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onToggleFavorite} className="hover:scale-110 transition-transform">
              {dashboard.isFavorite ? (
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              ) : (
                <StarOff className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{dashboard.name}</h1>
              {dashboard.description && (
                <p className="text-sm text-muted-foreground">{dashboard.description}</p>
              )}
            </div>
            <Badge variant="outline" className="ml-2">
              {dashboard.userRole === 'OWNER' ? '👑 Propriétaire' : 
               dashboard.userRole === 'EDITOR' ? '✏️ Éditeur' : '👁️ Lecteur'}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher KPIs..."
                className="pl-9 w-64"
                value={filterConfig.search}
                onChange={(e) => onFilterChange({ ...filterConfig, search: e.target.value })}
              />
            </div>

            {/* Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                  {(filterConfig.categories.length > 0 || filterConfig.showPredictions) && (
                    <Badge variant="secondary" className="ml-2">
                      {filterConfig.categories.length + (filterConfig.showPredictions ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                  <SheetDescription>Personnalisez l'affichage des KPIs</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Catégories</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <Badge
                          key={cat}
                          variant={filterConfig.categories.includes(cat) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newCats = filterConfig.categories.includes(cat)
                              ? filterConfig.categories.filter(c => c !== cat)
                              : [...filterConfig.categories, cat];
                            onFilterChange({ ...filterConfig, categories: newCats });
                          }}
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Tri</Label>
                    <Select 
                      value={filterConfig.sortBy} 
                      onValueChange={(v) => onFilterChange({ ...filterConfig, sortBy: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nom</SelectItem>
                        <SelectItem value="value">Valeur</SelectItem>
                        <SelectItem value="trend">Tendance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Afficher prédictions</Label>
                    <Switch
                      checked={filterConfig.showPredictions}
                      onCheckedChange={(checked) => onFilterChange({ ...filterConfig, showPredictions: checked })}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Add KPI */}
            {canEdit && (
              <Button onClick={onAddKPI}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter KPI
              </Button>
            )}

            {/* Export */}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================
// KPI EDITOR DIALOG
// ============================================

function KPIEditorDialog({ 
  open, 
  onClose, 
  onSave, 
  kpi 
}: {
  open: boolean;
  onClose: () => void;
  onSave: (kpi: Partial<KPI>) => void;
  kpi?: KPI;
}) {
  const [form, setForm] = useState<Partial<KPI>>({
    name: '',
    category: 'Finance',
    vizType: 'sparkline',
    size: 'medium',
    color: COLORS.palette[0],
    ...kpi
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{kpi ? 'Modifier le KPI' : 'Nouveau KPI'}</DialogTitle>
          <DialogDescription>
            Configurez les paramètres de votre indicateur
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Chiffre d'affaires"
            />
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Type de visualisation</Label>
            <Select value={form.vizType} onValueChange={(v) => setForm({ ...form, vizType: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sparkline">📈 Sparkline</SelectItem>
                <SelectItem value="gauge">⭕ Jauge</SelectItem>
                <SelectItem value="bullet">📊 Bullet Chart</SelectItem>
                <SelectItem value="progress">📋 Progression</SelectItem>
                <SelectItem value="comparison">🔄 Comparaison</SelectItem>
                <SelectItem value="scorecard">🎯 Scorecard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Taille</Label>
            <Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Petit</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="large">Grand</SelectItem>
                <SelectItem value="xlarge">Très grand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Unité</Label>
            <Input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="Ex: %, M GNF, K"
            />
          </div>

          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex gap-2">
              {COLORS.palette.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                    form.color === color ? 'ring-2 ring-offset-2 ring-foreground' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setForm({ ...form, color })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valeur actuelle</Label>
            <Input
              type="number"
              value={form.value || ''}
              onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Objectif</Label>
            <Input
              type="number"
              value={form.target || ''}
              onChange={(e) => setForm({ ...form, target: parseFloat(e.target.value) || undefined })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={() => onSave(form)}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// DASHBOARD EDITOR DIALOG
// ============================================

function DashboardEditorDialog({
  open,
  onClose,
  onSave,
  dashboard
}: {
  open: boolean;
  onClose: () => void;
  onSave: (dashboard: Partial<Dashboard>) => void;
  dashboard?: Dashboard;
}) {
  const [form, setForm] = useState<Partial<Dashboard>>({
    name: '',
    description: '',
    icon: '📊',
    color: COLORS.palette[0],
    layout: 'grid',
    ...dashboard
  });

  const icons = ['📊', '💼', '📈', '⚙️', '👑', '🎯', '💰', '🚀', '📱', '🔧'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dashboard ? 'Modifier le Dashboard' : 'Nouveau Dashboard'}</DialogTitle>
          <DialogDescription>
            Configurez votre tableau de bord
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Vue Exécutive"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description courte"
            />
          </div>

          <div className="space-y-2">
            <Label>Icône</Label>
            <div className="flex gap-2">
              {icons.map(icon => (
                <button
                  key={icon}
                  className={`w-10 h-10 rounded-lg text-xl transition-all ${
                    form.icon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => setForm({ ...form, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex gap-2">
              {COLORS.palette.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                    form.color === color ? 'ring-2 ring-offset-2 ring-foreground' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setForm({ ...form, color })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Layout</Label>
            <Select value={form.layout} onValueChange={(v) => setForm({ ...form, layout: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Grille
                  </div>
                </SelectItem>
                <SelectItem value="bento">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Bento
                  </div>
                </SelectItem>
                <SelectItem value="flex">
                  <div className="flex items-center gap-2">
                    <LayoutList className="h-4 w-4" />
                    Flexible
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={() => onSave(form)}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function DashboardPage() {
  // Initialize data with first dashboard active
  const initialDashboards = useMemo(() => generateMockDashboards(), []);
  const [dashboards, setDashboards] = useState<Dashboard[]>(initialDashboards);
  const [activeDashboardId, setActiveDashboardId] = useState<string>(initialDashboards[0]?.id || '');
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    search: '',
    categories: [],
    dateRange: 'month',
    sortBy: 'name',
    sortOrder: 'asc',
    showPredictions: true
  });
  const [userRole] = useState<UserRole>('ADMIN');
  const [kpiEditorOpen, setKpiEditorOpen] = useState(false);
  const [dashboardEditorOpen, setDashboardEditorOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | undefined>();
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Get active dashboard
  const activeDashboard = useMemo(() => {
    return dashboards.find(d => d.id === activeDashboardId);
  }, [dashboards, activeDashboardId]);

  // Filter KPIs
  const filteredKPIs = useMemo(() => {
    if (!activeDashboard) return [];
    
    return activeDashboard.kpis
      .filter(kpi => {
        if (filterConfig.search && !kpi.name.toLowerCase().includes(filterConfig.search.toLowerCase())) {
          return false;
        }
        if (filterConfig.categories.length > 0 && !filterConfig.categories.includes(kpi.category || '')) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (filterConfig.sortBy) {
          case 'value': return b.value - a.value;
          case 'trend': return b.trend - a.trend;
          default: return a.name.localeCompare(b.name);
        }
      });
  }, [activeDashboard, filterConfig]);

  // Handlers
  const handleAddKPI = useCallback(() => {
    setEditingKPI(undefined);
    setKpiEditorOpen(true);
  }, []);

  const handleEditKPI = useCallback((kpi: KPI) => {
    setEditingKPI(kpi);
    setKpiEditorOpen(true);
  }, []);

  const handleSaveKPI = useCallback((kpiData: Partial<KPI>) => {
    if (!activeDashboard) return;

    const newKPI: KPI = {
      id: editingKPI?.id || `kpi-${Date.now()}`,
      name: kpiData.name || 'Nouveau KPI',
      value: kpiData.value || 0,
      previousValue: editingKPI?.previousValue || 0,
      target: kpiData.target,
      unit: kpiData.unit || '',
      trend: editingKPI?.trend || 0,
      category: kpiData.category,
      color: kpiData.color || COLORS.palette[0],
      size: kpiData.size || 'medium',
      columnSpan: kpiData.size === 'large' || kpiData.size === 'xlarge' ? 2 : 1,
      rowSpan: 1,
      order: editingKPI?.order || activeDashboard.kpis.length,
      vizType: kpiData.vizType || 'sparkline',
      showPrediction: true,
      confidence: 0.85,
      prediction: Array.from({ length: 6 }, () => Math.random() * 100 + 50),
      sparkline: Array.from({ length: 12 }, () => Math.random() * 100 + 30),
    };

    setDashboards(prev => prev.map(d => {
      if (d.id !== activeDashboardId) return d;
      
      const existingIndex = d.kpis.findIndex(k => k.id === newKPI.id);
      const newKPIs = existingIndex >= 0
        ? d.kpis.map((k, i) => i === existingIndex ? newKPI : k)
        : [...d.kpis, newKPI];
      
      return { ...d, kpis: newKPIs };
    }));

    setKpiEditorOpen(false);
    setEditingKPI(undefined);
  }, [activeDashboard, activeDashboardId, editingKPI]);

  const handleDeleteKPI = useCallback((kpiId: string) => {
    setDashboards(prev => prev.map(d => {
      if (d.id !== activeDashboardId) return d;
      return { ...d, kpis: d.kpis.filter(k => k.id !== kpiId) };
    }));
  }, [activeDashboardId]);

  const handleAddDashboard = useCallback(() => {
    setEditingDashboard(undefined);
    setDashboardEditorOpen(true);
  }, []);

  const handleEditDashboard = useCallback((dashboard: Dashboard) => {
    setEditingDashboard(dashboard);
    setDashboardEditorOpen(true);
  }, []);

  const handleSaveDashboard = useCallback((dashboardData: Partial<Dashboard>) => {
    const newDashboard: Dashboard = {
      id: editingDashboard?.id || `dash-${Date.now()}`,
      name: dashboardData.name || 'Nouveau Dashboard',
      description: dashboardData.description,
      icon: dashboardData.icon || '📊',
      color: dashboardData.color || COLORS.palette[0],
      layout: dashboardData.layout || 'grid',
      isPublic: false,
      isFavorite: false,
      order: editingDashboard?.order || dashboards.length,
      userRole: 'OWNER',
      kpis: editingDashboard?.kpis || []
    };

    if (editingDashboard) {
      setDashboards(prev => prev.map(d => d.id === newDashboard.id ? newDashboard : d));
    } else {
      setDashboards(prev => [...prev, newDashboard]);
      setActiveDashboardId(newDashboard.id);
    }

    setDashboardEditorOpen(false);
    setEditingDashboard(undefined);
  }, [dashboards.length, editingDashboard]);

  const handleDeleteDashboard = useCallback((id: string) => {
    setDashboards(prev => {
      const filtered = prev.filter(d => d.id !== id);
      if (activeDashboardId === id && filtered.length > 0) {
        setActiveDashboardId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeDashboardId]);

  const handleToggleFavorite = useCallback(() => {
    if (!activeDashboard) return;
    setDashboards(prev => prev.map(d => 
      d.id === activeDashboardId ? { ...d, isFavorite: !d.isFavorite } : d
    ));
  }, [activeDashboard, activeDashboardId]);

  // Permissions
  const canEditDashboard = activeDashboard?.userRole === 'OWNER' || activeDashboard?.userRole === 'EDITOR';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar
        dashboards={dashboards}
        activeId={activeDashboardId}
        onSelect={setActiveDashboardId}
        onAdd={handleAddDashboard}
        onEdit={handleEditDashboard}
        onDelete={handleDeleteDashboard}
        userRole={userRole}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeDashboard ? (
          <>
            <DashboardHeader
              dashboard={activeDashboard}
              filterConfig={filterConfig}
              onFilterChange={setFilterConfig}
              onAddKPI={handleAddKPI}
              onToggleFavorite={handleToggleFavorite}
              canEdit={canEditDashboard}
            />

            {/* KPI Grid */}
            <ScrollArea className="flex-1 p-6">
              <div className={`
                grid gap-4 
                ${activeDashboard.layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}
                ${activeDashboard.layout === 'bento' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : ''}
                ${activeDashboard.layout === 'flex' ? 'grid-cols-1 sm:grid-cols-2' : ''}
              `}>
                {filteredKPIs.map((kpi) => (
                  <KPICard
                    key={kpi.id}
                    kpi={kpi}
                    onEdit={() => handleEditKPI(kpi)}
                    onDelete={() => handleDeleteKPI(kpi.id)}
                    canEdit={canEditDashboard}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredKPIs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Aucun KPI trouvé</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filterConfig.search || filterConfig.categories.length > 0
                      ? 'Essayez de modifier vos filtres'
                      : canEditDashboard ? 'Commencez par ajouter votre premier KPI' : 'Aucun KPI disponible'}
                  </p>
                  {canEditDashboard && !filterConfig.search && filterConfig.categories.length === 0 && (
                    <Button className="mt-4" onClick={handleAddKPI}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un KPI
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-medium">Aucun Dashboard</h2>
              <p className="text-muted-foreground mt-2">
                Créez votre premier tableau de bord pour commencer
              </p>
              <Button className="mt-4" onClick={handleAddDashboard}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <KPIEditorDialog
        open={kpiEditorOpen}
        onClose={() => setKpiEditorOpen(false)}
        onSave={handleSaveKPI}
        kpi={editingKPI}
      />

      <DashboardEditorDialog
        open={dashboardEditorOpen}
        onClose={() => setDashboardEditorOpen(false)}
        onSave={handleSaveDashboard}
        dashboard={editingDashboard}
      />
    </div>
  );
}
