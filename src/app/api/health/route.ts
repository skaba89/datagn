import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Used by Docker HEALTHCHECK and load balancers
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    checks: {
      database: 'unknown',
      redis: 'unknown',
      storage: 'unknown',
    },
  };

  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkStorage(),
  ]);

  // Database check
  if (checks[0].status === 'fulfilled') {
    health.checks.database = 'healthy';
  } else {
    health.checks.database = 'unhealthy';
  }

  // Redis check
  if (checks[1].status === 'fulfilled') {
    health.checks.redis = 'healthy';
  } else {
    health.checks.redis = 'unhealthy';
  }

  // Storage check
  if (checks[2].status === 'fulfilled') {
    health.checks.storage = 'healthy';
  } else {
    health.checks.storage = 'unhealthy';
  }

  // Determine overall health
  const isHealthy = Object.values(health.checks).every((status) => status !== 'unhealthy');

  return NextResponse.json(
    { ...health, status: isHealthy ? 'healthy' : 'degraded' },
    { status: isHealthy ? 200 : 503 }
  );
}

async function checkDatabase(): Promise<boolean> {
  try {
    // Dynamic import to avoid build errors if Prisma is not available
    const { default: prisma } = await import('@/lib/db');
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    const { default: redis } = await import('@/lib/redis');
    if (redis && typeof redis.ping === 'function') {
      await redis.ping();
    }
    return true;
  } catch {
    return false;
  }
}

async function checkStorage(): Promise<boolean> {
  try {
    const { S3Client, ListBucketsCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
    });
    await client.send(new ListBucketsCommand({}));
    return true;
  } catch {
    // If S3 is not configured, consider it healthy
    if (!process.env.S3_ENDPOINT) {
      return true;
    }
    return false;
  }
}
