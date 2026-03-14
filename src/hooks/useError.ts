'use client';

import { useCallback, useState } from 'react';
import { captureException, addBreadcrumb } from '@/lib/sentry';

export interface UseErrorResult {
  error: Error | null;
  isError: boolean;
  errorMessage: string;
  handleError: (error: Error | unknown, context?: Record<string, unknown>) => void;
  clearError: () => void;
  retry: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

/**
 * Custom hook for error handling
 * Provides consistent error management with Sentry integration
 */
export function useError(context?: Record<string, unknown>): UseErrorResult {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback(
    (err: Error | unknown, additionalContext?: Record<string, unknown>) => {
      const normalizedError =
        err instanceof Error ? err : new Error(String(err));

      setError(normalizedError);

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[Error]', normalizedError);
      }

      // Send to Sentry
      captureException(normalizedError, {
        ...context,
        ...additionalContext,
      });
    },
    [context]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        clearError();
        addBreadcrumb('retry', 'Retrying operation');
        return await fn();
      } catch (err) {
        handleError(err, { operation: 'retry' });
        return null;
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    isError: error !== null,
    errorMessage: error?.message || '',
    handleError,
    clearError,
    retry,
  };
}

/**
 * Async error boundary wrapper
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    captureException(error, context);
    return { data: null, error };
  }
}
