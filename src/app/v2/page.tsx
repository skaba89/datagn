'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, 
  LineChart, Filter, Download, RefreshCw, Settings, Bell,
  ChevronDown, Search, Calendar, Clock, Target, Zap, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Minus, Layers, Database, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// ============================================
// Types
// ============================================

interface KPIData {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  trend: number;
  category: string;
  sparkline: number[];
  prediction?: number[];
  confidence?: number;
}

interface FilterConfig {
  dateRange: { start: Date; end: Date };
  categories: string[];
  minValue: number;
  maxValue: number;
  compareMode: boolean;
  showPredictions: boolean;
  predictionPeriods: number;
}

// ============================================
// Mock Data Generator
// ============================================

const generateMockData = () => {
  const categories = ['Ventes', 'Marketing', 'Finance', 'Opérations', 'RH'];
  const kpis: KPIData[] = [
    {
      id: 'revenue',
      name: 'Chiffre d\'Affaires',
      value: 284750000,
      previousValue: 256280000,
      target: 300000000,
      unit: 'GNF',
      trend: 11.1,
      category: 'Finance',
      sparkline: [220, 235, 248, 260, 275, 285, 290, 280, 285],
      prediction: [285, 295, 310, 325, 340, 360],
      confidence: 0.87
    },
    {
      id: 'customers',
      name: 'Clients Actifs',
      value: 12847,
      previousValue: 11234,
      target: 15000,
      unit: '',
      trend: 14.4,
      category: 'Ventes',
      sparkline: [10, 10.5, 11, 11.8, 12.2, 12.5, 12.9, 12.7, 12.8],
      prediction: [13, 13.5, 14.2, 15, 15.8, 16.5],
      confidence: 0.82
    },
    {
      id: 'conversion',
      name: 'Taux de Conversion',
      value: 3.42,
      previousValue: 2.89,
      target: 4.0,
      unit: '%',
      trend: 18.3,
      category: 'Marketing',
      sparkline: [2.5, 2.6, 2.8, 2.9, 3.1, 3.3, 3.4, 3.35, 3.42],
      prediction: [3.5, 3.6, 3.8, 4.0, 4.1, 4.3],
      confidence: 0.79
    },
    {
      id: 'avg_order',
      name: 'Panier Moyen',
      value: 22150,
      previousValue: 19850,
      target: 25000,
      unit: 'GNF',
      trend: 11.6,
      category: 'Ventes',
      sparkline: [18, 19, 19.5, 20, 21, 21.5, 22, 21.8, 22.15],
      prediction: [22.5, 23, 24, 25, 26, 27],
      confidence: 0.85
    },
    {
      id: 'satisfaction',
      name: 'Satisfaction Client',
      value: 87.5,
      previousValue: 82.3,
      target: 90,
      unit: '%',
      trend: 6.3,
      category: 'Opérations',
      sparkline: [78, 80, 81, 83, 85, 86, 87, 88, 87.5],
      prediction: [88, 89, 90, 91, 92, 93],
      confidence: 0.91
    },
    {
      id: 'efficiency',
      name: 'Efficacité Opérationnelle',
      value: 94.2,
      previousValue: 91.8,
      target: 95,
      unit: '%',
      trend: 2.6,
      category: 'Opérations',
      sparkline: [88, 89, 90, 91, 92, 93, 93.5, 94, 94.2],
      prediction: [94.5, 95, 95.5, 96, 96.5, 97],
      confidence: 0.94
    },
    {
      id: 'retention',
      name: 'Rétention Client',
      value: 78.4,
      previousValue: 72.1,
      target: 85,
      unit: '%',
      trend: 8.7,
      category: 'Ventes',
      sparkline: [68, 70, 71, 73, 75, 76, 77, 78, 78.4],
      prediction: [79, 80, 82, 84, 86, 88],
      confidence: 0.81
    },
    {
      id: 'cost_per_acquisition',
      name: 'Coût par Acquisition',
      value: 15420,
      previousValue: 18500,
      target: 12000,
      unit: 'GNF',
      trend: -16.6,
      category: 'Marketing',
      sparkline: [20, 19, 18.5, 18, 17, 16.5, 16, 15.5, 15.42],
      prediction: [15, 14.5, 14, 13.5, 13, 12.5],
      confidence: 0.77
    }
  ];

  // Generate time series data
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const timeSeriesData = months.map((month, i) => ({
    month,
    revenue: 200000000 + Math.random() * 100000000 + i * 10000000,
    customers: 10000 + Math.random() * 3000 + i * 300,
    conversion: 2 + Math.random() * 1.5 + i * 0.1,
    prediction: i >= 9 ? 220000000 + Math.random() * 50000000 + i * 15000000 : null,
    lowerBound: i >= 9 ? 200000000 + i * 10000000 : null,
    upperBound: i >= 9 ? 250000000 + i * 20000000 : null,
  }));

  // Category distribution
  const categoryData = categories.map(cat => ({
    name: cat,
    value: Math.floor(Math.random() * 30) + 10,
    growth: (Math.random() * 30 - 10).toFixed(1)
  }));

  // Radar data for performance
  const radarData = [
    { metric: 'Croissance', value: 85 },
    { metric: 'Rentabilité', value: 78 },
    { metric: 'Innovation', value: 92 },
    { metric: 'Satisfaction', value: 88 },
    { metric: 'Efficacité', value: 94 },
    { metric: 'Fidélité', value: 76 },
  ];

  return { kpis, timeSeriesData, categoryData, radarData, categories };
};

// ============================================
// Color Palette
// ============================================

const COLORS = {
  primary: '#10B981',
  secondary: '#F59E0B',
  tertiary: '#3B82F6',
  quaternary: '#8B5CF6',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  palette: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16']
};

// ============================================
// KPI Card Component
// ============================================

function KPICard({ kpi, onClick }: { kpi: KPIData; onClick?: () => void }) {
  const progress = (kpi.value / kpi.target) * 100;
  const isPositive = kpi.trend >= 0;
  
  const formatValue = (val: number, unit: string) => {
    if (unit === 'GNF') return `${(val / 1000000).toFixed(1)}M`;
    if (unit === '%') return val.toFixed(1) + '%';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toLocaleString();
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 bg-gradient-to-br from-card to-card/95"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className="text-xs font-medium"
            style={{ borderColor: COLORS.primary, color: COLORS.primary }}
          >
            {kpi.category}
          </Badge>
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            isPositive ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(kpi.trend).toFixed(1)}%
          </div>
        </div>
        <CardTitle className="text-sm font-medium text-muted-foreground mt-2">
          {kpi.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">
            {formatValue(kpi.value, kpi.unit)}
          </span>
          {kpi.unit && kpi.unit !== '%' && (
            <span className="text-sm text-muted-foreground">{kpi.unit}</span>
          )}
        </div>
        
        {/* Mini Sparkline */}
        <div className="h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={kpi.sparkline.map((v, i) => ({ value: v, index: i }))}>
              <defs>
                <linearGradient id={`gradient-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? COLORS.primary : COLORS.danger} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={isPositive ? COLORS.primary : COLORS.danger} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? COLORS.primary : COLORS.danger}
                fill={`url(#gradient-${kpi.id})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Target Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Objectif</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Prediction Badge */}
        {kpi.prediction && (
          <div className="flex items-center gap-2 pt-1">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="text-xs text-muted-foreground">
              Prévision: {formatValue(kpi.prediction[0] * (kpi.unit === 'GNF' ? 1000000 : kpi.unit === '%' ? 1 : 1000), kpi.unit)}
            </span>
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {((kpi.confidence || 0) * 100).toFixed(0)}% confiance
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Enterprise Filter Panel
// ============================================

function EnterpriseFilterPanel({ 
  config, 
  onChange, 
  categories 
}: { 
  config: FilterConfig; 
  onChange: (config: FilterConfig) => void;
  categories: string[];
}) {
  const updateConfig = (updates: Partial<FilterConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtres Avancés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher des KPIs..." 
            className="pl-9"
          />
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Période</Label>
          <div className="flex gap-2">
            <Select defaultValue="month">
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Ce mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Catégories</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Badge 
                key={cat}
                variant={config.categories.includes(cat) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => {
                  const newCats = config.categories.includes(cat)
                    ? config.categories.filter(c => c !== cat)
                    : [...config.categories, cat];
                  updateConfig({ categories: newCats });
                }}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Value Range */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Plage de valeurs: {config.minValue.toLocaleString()} - {config.maxValue.toLocaleString()}
          </Label>
          <Slider
            value={[config.minValue, config.maxValue]}
            onValueChange={([min, max]) => updateConfig({ minValue: min, maxValue: max })}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Toggle Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="compare" className="text-sm">Mode comparaison</Label>
            <Switch
              id="compare"
              checked={config.compareMode}
              onCheckedChange={(checked) => updateConfig({ compareMode: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="predictions" className="text-sm">Afficher prévisions</Label>
            <Switch
              id="predictions"
              checked={config.showPredictions}
              onCheckedChange={(checked) => updateConfig({ showPredictions: checked })}
            />
          </div>
          {config.showPredictions && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label className="text-xs text-muted-foreground">Périodes de prévision</Label>
              <Select 
                value={config.predictionPeriods.toString()}
                onValueChange={(v) => updateConfig({ predictionPeriods: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 mois</SelectItem>
                  <SelectItem value="6">6 mois</SelectItem>
                  <SelectItem value="12">12 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" size="sm">
            <RefreshCw className="h-3 w-3 mr-2" />
            Réinitialiser
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            <Download className="h-3 w-3 mr-2" />
            Exporter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Trend Chart with Predictions
// ============================================

function TrendChartWithPredictions({ 
  data, 
  showPredictions 
}: { 
  data: any[];
  showPredictions: boolean;
}) {
  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Évolution & Prédictions</CardTitle>
            <CardDescription>Analyse temporelle avec projections IA</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 rounded-full bg-primary mr-1" />
              Réel
            </Badge>
            {showPredictions && (
              <Badge variant="outline" className="text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1" />
                Prévision
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => value ? `${(value/1000000).toFixed(1)}M GNF` : 'N/A'}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="Chiffre d'affaires"
                stroke={COLORS.primary} 
                fill="url(#colorRevenue)"
                strokeWidth={3}
              />
              {showPredictions && (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="prediction" 
                    name="Prévision"
                    stroke={COLORS.warning} 
                    fill="url(#colorPrediction)"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="upperBound" 
                    name="Limite sup."
                    stroke={COLORS.warning}
                    strokeOpacity={0.3}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lowerBound" 
                    name="Limite inf."
                    stroke={COLORS.warning}
                    strokeOpacity={0.3}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Category Distribution Chart
// ============================================

function CategoryDistributionChart({ data }: { data: any[] }) {
  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Distribution par Catégorie</CardTitle>
        <CardDescription>Répartition et croissance par secteur</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.palette[index % COLORS.palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Performance Radar
// ============================================

function PerformanceRadar({ data }: { data: any[] }) {
  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Performance Globale</CardTitle>
        <CardDescription>Indicateurs clés de performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Radar
                name="Performance"
                dataKey="value"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Prediction Summary Card
// ============================================

function PredictionSummaryCard({ kpis }: { kpis: KPIData[] }) {
  const avgConfidence = kpis.reduce((sum, k) => sum + (k.confidence || 0), 0) / kpis.length;
  const growthKPIs = kpis.filter(k => k.trend > 0).length;
  const declineKPIs = kpis.filter(k => k.trend < 0).length;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Insights Prédictifs
        </CardTitle>
        <CardDescription>Analyse IA basée sur {kpis.length} indicateurs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{(avgConfidence * 100).toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Confiance moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500">{growthKPIs}</div>
            <div className="text-xs text-muted-foreground">En croissance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{declineKPIs}</div>
            <div className="text-xs text-muted-foreground">En baisse</div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>Projection: croissance de +12% attendue</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-amber-500" />
            <span>3 KPIs proches de leur objectif</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>1 KPI nécessite une attention</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Dashboard Page
// ============================================

export default function DashboardPage() {
  const { kpis, timeSeriesData, categoryData, radarData, categories } = useMemo(() => generateMockData(), []);
  
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    dateRange: { start: new Date(), end: new Date() },
    categories: [],
    minValue: 0,
    maxValue: 100,
    compareMode: false,
    showPredictions: true,
    predictionPeriods: 6
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedKPI, setSelectedKPI] = useState<KPIData | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter KPIs based on config
  const filteredKPIs = useMemo(() => {
    return kpis.filter(kpi => {
      if (filterConfig.categories.length > 0 && !filterConfig.categories.includes(kpi.category)) {
        return false;
      }
      return true;
    });
  }, [kpis, filterConfig]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">DataGN</h1>
                  <p className="text-xs text-muted-foreground">Analytics Platform</p>
                </div>
              </div>
              <Badge variant="secondary" className="hidden sm:flex">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Temps réel
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 mr-4">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtres
                    {filterConfig.categories.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {filterConfig.categories.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtres Enterprise</SheetTitle>
                    <SheetDescription>
                      Configurez vos filtres pour personnaliser l'affichage
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <EnterpriseFilterPanel 
                      config={filterConfig}
                      onChange={setFilterConfig}
                      categories={categories}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <Layers className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <LineChart className="h-4 w-4" />
              Analyses
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-2">
              <Zap className="h-4 w-4" />
              Prédictions
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Données
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">KPIs Actifs</p>
                      <p className="text-3xl font-bold">{kpis.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Target className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Croissance Moy.</p>
                      <p className="text-3xl font-bold text-emerald-500">+8.4%</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Confiance IA</p>
                      <p className="text-3xl font-bold">87%</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Alertes</p>
                      <p className="text-3xl font-bold">2</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KPIs Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Indicateurs Clés</h2>
                <Button variant="ghost" size="sm" className="gap-2">
                  Voir tout
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredKPIs.map(kpi => (
                  <KPICard 
                    key={kpi.id} 
                    kpi={kpi} 
                    onClick={() => setSelectedKPI(kpi)}
                  />
                ))}
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <TrendChartWithPredictions 
                  data={timeSeriesData} 
                  showPredictions={filterConfig.showPredictions}
                />
              </div>
              <div>
                <PerformanceRadar data={radarData} />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <CategoryDistributionChart data={categoryData} />
              <PredictionSummaryCard kpis={filteredKPIs} />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChartWithPredictions 
                data={timeSeriesData} 
                showPredictions={filterConfig.showPredictions}
              />
              <CategoryDistributionChart data={categoryData} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceRadar data={radarData} />
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Analyse Comparative</CardTitle>
                  <CardDescription>Comparaison période vs période précédente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredKPIs.slice(0, 4).map(kpi => (
                      <div key={kpi.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{kpi.name}</p>
                          <p className="text-sm text-muted-foreground">{kpi.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{kpi.value.toLocaleString()}</p>
                          <p className={`text-sm ${kpi.trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {kpi.trend >= 0 ? '+' : ''}{kpi.trend.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TrendChartWithPredictions 
                data={timeSeriesData} 
                showPredictions={true}
              />
              <PredictionSummaryCard kpis={filteredKPIs} />
            </div>
            
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Prévisions Détaillées par KPI</CardTitle>
                <CardDescription>Projections sur {filterConfig.predictionPeriods} mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredKPIs.map(kpi => (
                    <Card key={kpi.id} className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{kpi.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {((kpi.confidence || 0) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Actuel:</span>
                            <span className="font-medium">{kpi.value.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Prévision:</span>
                            <span className="font-medium text-amber-500">
                              {kpi.prediction ? kpi.prediction[kpi.prediction.length - 1].toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <Progress 
                            value={(kpi.confidence || 0) * 100} 
                            className="h-1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Données Brutes</CardTitle>
                    <CardDescription>Accédez à vos données complètes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter CSV
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredKPIs.map((kpi, i) => (
                      <div 
                        key={kpi.id}
                        className="grid grid-cols-6 gap-4 p-3 rounded-lg bg-muted/30 text-sm"
                      >
                        <div className="font-medium">{kpi.name}</div>
                        <div>{kpi.category}</div>
                        <div className="text-right">{kpi.value.toLocaleString()}</div>
                        <div className="text-right">{kpi.previousValue.toLocaleString()}</div>
                        <div className={`text-right ${kpi.trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {kpi.trend >= 0 ? '+' : ''}{kpi.trend.toFixed(1)}%
                        </div>
                        <div className="text-right">{kpi.target.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-auto">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>DataGN - Sécurisé & Chiffré</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Version 2.0.0</span>
            <span>•</span>
            <span>Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
