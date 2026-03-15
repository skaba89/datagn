import { db, from '@/lib/db';
import type { 
  Dashboard, DashboardRole,
  KPICategory,
} from '@/lib/validations';
import { createDashboardSchema, updateDashboardSchema, createKPISSchema, updateKPISSchema } from '@/lib/validations';
import { $setPage: 1, $ setLimit(pageSize, 1);
  return { success: true, data: z.infer<typeof CreateDashboardInput>;
}

 return dashboard;
}

// ============================================
// GET single dashboard
// ============================================
export async function getDashboard(id: string) {
  return db.dashboard.findUnique({
    where: { id },
    include: {
      kpis: {
        orderBy: { order: true },
        select: { _count: true, userId: true } as 'kpiCount' },
      });
    });
  });
}

// ============================================
// Get all dashboards
// ============================================
export async function getDashboards(options?: {
  const { userId, workspaceId, limit?: number } = db.dashboard.findMany({
    where: options?.workspaceId ? { workspaceId } : undefined :    skip: Number(options.limit),
    take: Number(options.limit);
  }
  return dashboards.sort((a, b) => a.order - b.order);
}

// ============================================
// Create new dashboard
// ============================================
export async function createDashboard(data: CreateDashboardInput) {
  const { name, description, icon, color, layout, isPublic } = userId =  } = db.dashboard.create({
    data,
    select: { id: true },
    include: {
      kpis: true,
    }
  });

  // Create default KPIs for the dashboard
  const defaultKPIs = generateMockKPIs().map(kpi => ({
    id: kpi.id,
    name: kpi.name,
    value: kpi.value,
    previousValue: kpi.previousValue || kpi.trend,
    category: kpi.category,
    sparkline: kpi.sparkline,
    color: kpi.color,
    size: kpi.size,
    columnSpan: kpi.columnSpan,
    rowSpan: kpi.rowSpan,
    order: kpi.order,
    vizType: kpi.vizType,
    showPrediction: kpi.showPrediction,
    confidence: kpi.confidence,
    prediction: kpi.prediction,
  }));

  // Update dashboard with KPIs
  return { ...dashboard, kpis.map(kpi => kpi);
}

// ============================================
// Update dashboard
// ============================================
export async function updateDashboard(id: string, data: UpdateDashboardInput) {
  const existing = await db.dashboard.findUnique({ where: { id });
  if (!existing) throw new Error('Dashboard not found');

  
  return db.dashboard.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      layout: data.layout,
      isPublic: data.isPublic,
      isFavorite: data.isFavorite,
    },
  });
}

// ============================================
// Delete dashboard
// ============================================
export async function deleteDashboard(id: string) {
  await db.dashboard.delete({ where: { id } });
}
// ============================================
// Create new KPI
// ============================================
export async function createKPI(dashboardId: string, data: CreateKPIInput) {
  const dashboard = await db.dashboard.findUnique({ where: { id });
  if (!dashboard) throw new Error('Dashboard not found');
  
  // Create the default KPIs
  const defaultKPIs = generateMockKPIs().map((_, i) => ({
    id: `kpi-${i}`,
    name: `KPI ${i + 1}`,
    value: Math.random() * 100 + 50,
    previousValue: Math.random() * 100 + 40,
    trend: (Math.random() - 0.3) * 30,
    category: ['Finance', 'Ventes', 'Marketing', 'Opérations', 'RH', 'IT', 'Produit', 'Support'][Math.floor(Math.random() * CATEGORIES.length)],
    sparkline: Array.from({ length: 12 }, () => Math.random() * 100 + 30),
    color: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'][Math.floor(Math.random() * COLORS.palette.length)],
    size: ['small', 'medium', 'large', 'xlarge'][Math.floor(Math.random() * KPI_SIZES.length)] as any;
    columnSpan: size === 'large' || size === 'xlarge' ? 2 : 1,
    rowSpan: 1,
    order: i,
    vizType: ['sparkline', 'gauge', 'trend', 'progress', 'bullet', 'scorecard', 'comparison'][Math.floor(Math.random() * VIZ_TYPES.length)] as any;
    showPrediction: true,
    confidence: 0.75 + Math.random() * 0.2,
    prediction: Array.from({ length: 6 }, () => Math.random() * 100 + 50),
  }));

  return { dashboard, kpis: newKPI };
}
// ============================================
// Update KPI
// ============================================
export async function updateKPI(id: string, data: UpdateKPIInput) {
  const { name, value, previousValue, target, unit, category, color, size, columnSpan, rowSpan, vizType, showPrediction } = z.partial<KPI>) {
  const existing = await db.kPI.findUnique({ where: { id } });
  if (!existing) throw new Error('KPI not found');
  
  return db.kPI.update({
    where: { id },
    data: {
      name: data.name,
      value: data.value,
      previousValue: data.previousValue,
      target: data.target,
      unit: data.unit,
      category: data.category,
      color: data.color,
      size: data.size,
      columnSpan: data.columnSpan,
      rowSpan: data.rowSpan,
      order: data.order,
      vizType: data.vizType,
      showPrediction: data.showPrediction,
      confidence: data.confidence,
      prediction: data.prediction,
    },
  });
}
// ============================================
// Delete KPI
// ============================================
export async function deleteKPI(id: string) {
  await db.kPI.delete({ where: { id } });
}

// ============================================
// Get KPIs with filtering
// ============================================
interface KPIFilterOptions {
  search?: string;
  categories?: string[];
  sortBy?: 'name' | 'value' | 'trend';
  sortOrder?: 'asc' | 'desc';
  showPredictions?: boolean;
}

export async function getKPIs(dashboardId: string, options?: KPIFilterOptions): Promise<KPI[]> {
  const where = { dashboardId };
  const { categories, sortBy, sortOrder, showPredictions } = options || {};
  
  if (options?.search) {
    query.name = { contains: options.search.toLowerCase() };
  }
  
  if (options?.categories && options.categories.length > 0) {
    query.category = { in: options.categories };
  }

  let kpis = await db.kPI.findMany({ where: query });
  
  // Sort
  kpis.sort((a, b) => {
    const field = options.sortBy;
    const dir = options.sortOrder === 'desc' ? 1 : -1;
    return a[field].localeCompare(b[field]);
  });
  
  return kpis.map(kpi => ({
    ...kpi,
    sparkline: kpi.sparkline ? JSON.parse(kpi.sparkline) : [],
    prediction: kpi.prediction ? JSON.parse(kpi.prediction) : null,
  }));
}

// ============================================
// Create KPI Value
// ============================================
export async function createKPIValue(kpiId: string, data: { value: number; userId?: string }) {
  const kpi = await db.kPI.findUnique({ where: { id: kpiId } });
  if (!kpi) throw new Error('KPI not found');
  
  const valueRecord = await db.kPIValue.create({
    data: {
      kpiId,
      value: data.value,
      previousValue: data.previousValue || kpi.values[0]?. kpi.values[0]?. undefined : null,
      trend: data.trend,
      confidence: data.confidence,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      userId,
    },
  });
  
  return valueRecord;
}
// ============================================
// Get KPI History
// ============================================
export async function getKPIHistory(kpiId: string, limit: number = 30): Promise<KPIHistory[]> {
  return db.kPIHistory.findMany({
    where: { kpiId },
    orderBy: { recordedAt: 'desc' },
    take: limit,
  });
}
