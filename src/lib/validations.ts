/**
 * API Validation Schemas using Zod
 * Provides runtime validation for all API inputs
 */

import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const IdSchema = z.string().cuid();
export const EmailSchema = z.string().email();
export const UrlSchema = z.string().url();

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================
// Auth Schemas
// ============================================

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const PasswordResetSchema = z.object({
  email: EmailSchema,
});

export const PasswordUpdateSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

// ============================================
// Workspace Schemas
// ============================================

export const WorkspaceCreateSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
});

export const WorkspaceUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  settings: z.record(z.unknown()).optional(),
});

// ============================================
// Dashboard Schemas
// ============================================

export const DashboardCreateSchema = z.object({
  workspaceId: IdSchema,
  name: z.string().min(1, 'Dashboard name is required').max(200),
  description: z.string().max(1000).optional(),
  sourceType: z.enum(['upload', 'google_sheets', 'api', 'kobo', 'dhis2', 'db']).default('upload'),
  config: z.record(z.unknown()).optional(),
});

export const DashboardUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  config: z.record(z.unknown()).optional(),
  isPublic: z.boolean().optional(),
});

export const DashboardQuerySchema = PaginationSchema.extend({
  workspaceId: IdSchema,
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// Dataset Schemas
// ============================================

export const DatasetCreateSchema = z.object({
  workspaceId: IdSchema,
  name: z.string().min(1).max(200),
  sourceType: z.enum(['upload', 'google_sheets', 'api']).default('upload'),
  objectKey: z.string().optional(),
  originalName: z.string().optional(),
  contentType: z.string().optional(),
  sizeBytes: z.number().optional(),
});

export const DatasetQuerySchema = PaginationSchema.extend({
  workspaceId: IdSchema,
});

// ============================================
// Chart Schemas
// ============================================

export const ChartTypeSchema = z.enum([
  'line',
  'area',
  'bar',
  'pie',
  'scatter',
  'radar',
  'treemap',
]);

export const ChartCreateSchema = z.object({
  datasetVersionId: IdSchema,
  name: z.string().min(1).max(200),
  type: ChartTypeSchema,
  configJson: z.record(z.unknown()),
});

export const ChartUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: ChartTypeSchema.optional(),
  configJson: z.record(z.unknown()).optional(),
});

// ============================================
// Share Schemas
// ============================================

export const ShareCreateSchema = z.object({
  dashboardId: IdSchema,
  expiresIn: z.number().int().positive().max(365 * 24 * 60 * 60).optional(), // Max 1 year in seconds
});

// ============================================
// AI Analysis Schemas
// ============================================

export const AIAnalyzeSchema = z.object({
  datasetVersionId: IdSchema,
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000),
  context: z.record(z.unknown()).optional(),
});

// ============================================
// Upload Schemas
// ============================================

export const PresignUploadSchema = z.object({
  workspaceId: IdSchema,
  filename: z.string().min(1).max(255),
  contentType: z.enum(['text/csv', 'application/vnd.ms-excel', 'application/json']).default('text/csv'),
});

// ============================================
// Helper Functions
// ============================================

/**
 * Validate data against a Zod schema
 * Returns the validated data or throws a ValidationError
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }

  return result.data;
}

/**
 * Create a partial validator for PATCH operations
 */
export function partial<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial();
}

/**
 * Validate query parameters from URL search params
 */
export function validateQuery<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return validate(schema, params);
}

/**
 * Validate request body
 */
export async function validateBody<T extends z.ZodSchema>(
  schema: T,
  request: Request
): Promise<z.infer<T>> {
  const body = await request.json();
  return validate(schema, body);
}
