import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  default: {
    dashboard: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    membership: {
      findUnique: vi.fn(),
    },
  },
}));

import { auth } from '@/auth';
import prisma from '@/lib/db';

// Helper to create mock request
function createRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
}): NextRequest {
  const { method = 'GET', url = 'http://localhost:3000/api/dashboards', body, headers = {} } = options;

  return new NextRequest(url, {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  }) as NextRequest;
}

describe('/api/dashboards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/dashboards', () => {
    it('should return 401 if not authenticated', async () => {
      (auth as any).mockResolvedValue(null);

      const req = createRequest({
        url: 'http://localhost:3000/api/dashboards?workspaceId=ws-123',
      });

      // Import the route handler dynamically
      const { GET } = await import('@/app/api/dashboards/route');
      const response = await GET(req);

      expect(response.status).toBe(401);
    });

    it('should return 400 if workspaceId is missing', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-123' } });

      const req = createRequest({ url: 'http://localhost:3000/api/dashboards' });

      const { GET } = await import('@/app/api/dashboards/route');
      const response = await GET(req);

      expect(response.status).toBe(400);
    });

    it('should return 403 if user is not a member', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-123' } });
      (prisma.membership.findUnique as any).mockResolvedValue(null);

      const req = createRequest({
        url: 'http://localhost:3000/api/dashboards?workspaceId=ws-123',
      });

      const { GET } = await import('@/app/api/dashboards/route');
      const response = await GET(req);

      expect(response.status).toBe(403);
    });

    it('should return dashboards for valid member', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-123' } });
      (prisma.membership.findUnique as any).mockResolvedValue({ role: 'viewer' });
      (prisma.dashboard.findMany as any).mockResolvedValue([
        { id: 'db-1', name: 'Dashboard 1' },
        { id: 'db-2', name: 'Dashboard 2' },
      ]);
      (prisma.dashboard.count as any).mockResolvedValue(2);

      const req = createRequest({
        url: 'http://localhost:3000/api/dashboards?workspaceId=ws-123',
      });

      const { GET } = await import('@/app/api/dashboards/route');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.dashboards).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('should handle pagination', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-123' } });
      (prisma.membership.findUnique as any).mockResolvedValue({ role: 'viewer' });
      (prisma.dashboard.findMany as any).mockResolvedValue([]);
      (prisma.dashboard.count as any).mockResolvedValue(50);

      const req = createRequest({
        url: 'http://localhost:3000/api/dashboards?workspaceId=ws-123&page=2&limit=10',
      });

      const { GET } = await import('@/app/api/dashboards/route');
      const response = await GET(req);
      const data = await response.json();

      expect(data.page).toBe(2);
      expect(data.totalPages).toBe(5);
    });
  });

  describe('POST /api/dashboards', () => {
    it('should create a dashboard with valid data', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-123' } });
      (prisma.membership.findUnique as any).mockResolvedValue({ role: 'editor' });
      (prisma.dashboard.create as any).mockResolvedValue({
        id: 'db-new',
        name: 'New Dashboard',
        workspaceId: 'ws-123',
      });

      const req = createRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/dashboards',
        body: {
          workspaceId: 'ws-123',
          name: 'New Dashboard',
          sourceType: 'csv',
        },
      });

      const { POST } = await import('@/app/api/dashboards/route');
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('db-new');
    });

    it('should return 400 if required fields are missing', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-123' } });

      const req = createRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/dashboards',
        body: { name: 'Test' }, // missing workspaceId
      });

      const { POST } = await import('@/app/api/dashboards/route');
      const response = await POST(req);

      expect(response.status).toBe(400);
    });

    it('should return 403 for viewer role', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-123' } });
      (prisma.membership.findUnique as any).mockResolvedValue({ role: 'viewer' });

      const req = createRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/dashboards',
        body: {
          workspaceId: 'ws-123',
          name: 'New Dashboard',
        },
      });

      const { POST } = await import('@/app/api/dashboards/route');
      const response = await POST(req);

      expect(response.status).toBe(403);
    });
  });
});
