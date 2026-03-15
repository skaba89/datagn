import { z } from 'zod';

// ============================================
// User Schemas
// ============================================

export const UserRoleSchema = z.enum(['ADMIN', 'EDITOR', 'VIEWER']);
export const DashboardRoleSchema = z.enum(['OWNER', 'EDITOR', 'VIEWER']);

export const CreateUserSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Nom trop court').max(100, 'Nom trop long'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
  role: UserRoleSchema.default('VIEWER'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional(),
  role: UserRoleSchema.optional(),
});

// ============================================
// Dashboard Schemas
// ============================================

export const LayoutSchema = z.enum(['grid', 'bento', 'flex']);
export const IconSchema = z.string().emoji().or(z.string().max(10));

export const CreateDashboardSchema = z.object({
  name: z.string()
    .min(2, 'Nom minimum 2 caractères')
    .max(100, 'Nom maximum 100 caractères'),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).default('📊'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale invalide').default('#10B981'),
  layout: LayoutSchema.default('grid'),
  isPublic: z.boolean().default(false),
});

export const UpdateDashboardSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  layout: LayoutSchema.optional(),
  isPublic: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// ============================================
// KPI Schemas
// ============================================

export const VizTypeSchema = z.enum([
  'sparkline', 'gauge', 'trend', 'progress', 
  'bullet', 'scorecard', 'comparison'
]);

export const KPISizeSchema = z.enum(['small', 'medium', 'large', 'xlarge']);

export const CreateKPISchema = z.object({
  name: z.string()
    .min(2, 'Nom minimum 2 caractères')
    .max(100, 'Nom maximum 100 caractères'),
  description: z.string().max(500).optional(),
  
  // Value configuration
  value: z.number().finite(),
  previousValue: z.number().finite().optional(),
  target: z.number().finite().positive().optional(),
  unit: z.string().max(20).optional(),
  decimals: z.number().int().min(0).max(10).default(0),
  
  // Thresholds
  warningThreshold: z.number().finite().optional(),
  criticalThreshold: z.number().finite().optional(),
  
  // Display
  category: z.string().max(50).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#10B981'),
  size: KPISizeSchema.default('medium'),
  vizType: VizTypeSchema.default('sparkline'),
  
  // Layout
  columnSpan: z.number().int().min(1).max(4).default(1),
  rowSpan: z.number().int().min(1).max(4).default(1),
  
  // Prediction
  showPrediction: z.boolean().default(true),
  predictionPeriods: z.number().int().min(1).max(24).default(6),
  
  // Data source
  dataSource: z.enum(['static', 'api', 'database', 'formula']).default('static'),
  dataSourceConfig: z.string().optional(),
  refreshInterval: z.number().int().min(1000).optional(), // milliseconds
  
  // Dashboard relation
  dashboardId: z.string().cuid(),
});

export const UpdateKPISchema = CreateKPISchema.partial().omit({ dashboardId: true });

export const KPIValueSchema = z.object({
  kpiId: z.string().cuid(),
  value: z.number().finite(),
  previousValue: z.number().finite().optional(),
  recordedAt: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});

// ============================================
// Widget Schemas
// ============================================

export const WidgetTypeSchema = z.enum([
  'line-chart', 'bar-chart', 'pie-chart', 'area-chart',
  'table', 'metric', 'gauge', 'map', 'funnel', 'radar'
]);

export const CreateWidgetSchema = z.object({
  type: WidgetTypeSchema,
  title: z.string().min(2).max(100),
  subtitle: z.string().max(200).optional(),
  config: z.record(z.any()).default({}),
  dataSource: z.string().optional(),
  
  // Layout
  order: z.number().int().min(0).default(0),
  columnSpan: z.number().int().min(1).max(4).default(1),
  rowSpan: z.number().int().min(1).max(4).default(1),
  
  // Styling
  colorScheme: z.string().optional(),
  showLegend: z.boolean().default(true),
  showGrid: z.boolean().default(true),
  
  dashboardId: z.string().cuid(),
});

export const UpdateWidgetSchema = CreateWidgetSchema.partial().omit({ dashboardId: true });

// ============================================
// Alert Schemas
// ============================================

export const AlertSeveritySchema = z.enum(['info', 'warning', 'critical']);
export const AlertTypeSchema = z.enum(['threshold', 'anomaly', 'prediction']);

export const CreateAlertSchema = z.object({
  type: AlertTypeSchema,
  condition: z.string().min(1),
  message: z.string().min(1).max(500),
  severity: AlertSeveritySchema.default('warning'),
  dashboardId: z.string().cuid(),
  kpiId: z.string().cuid().optional(),
});

// ============================================
// Filter Schemas
// ============================================

export const FilterConfigSchema = z.object({
  search: z.string().max(100).default(''),
  categories: z.array(z.string().max(50)).default([]),
  dateRange: z.enum(['week', 'month', 'quarter', 'year', 'custom']).default('month'),
  customDateStart: z.date().optional(),
  customDateEnd: z.date().optional(),
  sortBy: z.enum(['name', 'value', 'trend', 'order']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  showPredictions: z.boolean().default(true),
  minValue: z.number().finite().optional(),
  maxValue: z.number().finite().optional(),
});

// ============================================
// Pagination Schemas
// ============================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const SortSchema = z.object({
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// Response Schemas
// ============================================

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => 
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    }),
  });

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  statusCode: z.number().int(),
});

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any().optional(),
  message: z.string().optional(),
});

// ============================================
// Type exports
// ============================================

export type UserRole = z.infer<typeof UserRoleSchema>;
export type DashboardRole = z.infer<typeof DashboardRoleSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateDashboardInput = z.infer<typeof CreateDashboardSchema>;
export type UpdateDashboardInput = z.infer<typeof UpdateDashboardSchema>;
export type CreateKPIInput = z.infer<typeof CreateKPISchema>;
export type UpdateKPIInput = z.infer<typeof UpdateKPISchema>;
export type CreateWidgetInput = z.infer<typeof CreateWidgetSchema>;
export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;
export type FilterConfig = z.infer<typeof FilterConfigSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
