/**
 * Sentry Client Configuration
 * This file is loaded on the client side
 */

import * as Sentry from '@sentry/nextjs';
import { initSentry } from '@/lib/sentry';

initSentry();

// Global error handler for uncaught errors
if (typeof window !== 'undefined') {
  window.onerror = (message, source, lineno, colno, error) => {
    Sentry.captureException(error || new Error(String(message)));
    return false;
  };

  window.onunhandledrejection = (event) => {
    Sentry.captureException(event.reason);
  };
}

export { Sentry };
