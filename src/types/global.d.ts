/// <reference types="node" />

// ============================================
// Global Type Augmentations
// ============================================

namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string;

    // Authentication
    AUTH_SECRET: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;

    // AI
    ANTHROPIC_API_KEY: string;

    // Storage
    S3_ENDPOINT: string;
    S3_ACCESS_KEY: string;
    S3_SECRET_KEY: string;
    S3_BUCKET: string;
    S3_REGION: string;

    // Redis
    REDIS_URL: string;

    // Keycloak (optional)
    KEYCLOAK_ISSUER?: string;
    KEYCLOAK_CLIENT_ID?: string;
    KEYCLOAK_CLIENT_SECRET?: string;

    // Stripe
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;

    // Email
    RESEND_API_KEY: string;
    EMAIL_FROM: string;

    // Sentry (optional)
    NEXT_PUBLIC_SENTRY_DSN?: string;
    SENTRY_AUTH_TOKEN?: string;

    // Application
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_APP_NAME: string;
  }
}

// ============================================
// Global Interfaces
// ============================================

declare global {
  // Prisma client singleton
  var prismaGlobal: undefined | import('@prisma/client').PrismaClient;

  // Workspace ID for RLS context
  interface Window {
    __DATAGN_WORKSPACE_ID__?: string;
  }

  // User session augmentation
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    externalId?: string;
  }
}

// ============================================
// Module Augmentations
// ============================================

// Next.js Image - Make alt required
declare module 'next/image' {
  interface ImageProps {
    alt: string;
  }
}

// Export empty to make this a module
export {};
