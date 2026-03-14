'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================
// Types
// ============================================

interface QueryState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  isValidating: boolean;
}

interface QueryOptions<T> {
  enabled?: boolean;
  initialData?: T;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retry?: number;
  retryDelay?: number;
}

interface MutationState<TData, TVariables> {
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
}

// ============================================
// useQuery Hook
// ============================================

export function useQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryState<T> & { refetch: () => Promise<void> } {
  const {
    enabled = true,
    initialData = null,
    refetchInterval,
    refetchOnWindowFocus = true,
    onSuccess,
    onError,
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<QueryState<T>>({
    data: initialData as T | null,
    error: null,
    isLoading: enabled,
    isFetching: enabled,
    isValidating: false,
  });

  const retryCount = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setState((prev) => ({ ...prev, isFetching: true, isValidating: true }));

    try {
      const data = await queryFn();
      setState({ data, error: null, isLoading: false, isFetching: false, isValidating: false });
      retryCount.current = 0;
      onSuccess?.(data);
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;

      // Retry logic
      if (retryCount.current < retry) {
        retryCount.current++;
        setTimeout(() => fetchData(), retryDelay * retryCount.current);
        return;
      }

      setState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
        isFetching: false,
        isValidating: false,
      }));
      onError?.(error as Error);
    }
  }, [queryFn, retry, retryDelay, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData, ...queryKey]);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (refetchOnWindowFocus && enabled) {
      const handleFocus = () => fetchData();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [refetchOnWindowFocus, enabled, fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

// ============================================
// useMutation Hook
// ============================================

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables> = {}
): [
  (variables: TVariables) => Promise<TData | null>,
  MutationState<TData, TVariables> & { reset: () => void }
] {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState<MutationState<TData, TVariables>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false, isSuccess: false }));

      try {
        const data = await mutationFn(variables);
        setState({ data, error: null, isLoading: false, isError: false, isSuccess: true });
        onSuccess?.(data, variables);
        onSettled?.(data, null, variables);
        return data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
          isError: true,
          isSuccess: false,
        }));
        onError?.(error as Error, variables);
        onSettled?.(null, error as Error, variables);
        return null;
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false, isError: false, isSuccess: false });
  }, []);

  return [mutate, { ...state, reset }];
}

// ============================================
// useDebounce Hook
// ============================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// useLocalStorage Hook
// ============================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// ============================================
// useCopyToClipboard Hook
// ============================================

export function useCopyToClipboard(): [(text: string) => Promise<boolean>, boolean] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      setCopied(false);
      return false;
    }
  }, []);

  return [copy, copied];
}

// ============================================
// useOnlineStatus Hook
// ============================================

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ============================================
// useIntersectionObserver Hook
// ============================================

interface IntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: IntersectionObserverOptions = {}
): [React.RefCallback<Element>, boolean] {
  const { threshold = 0, root = null, rootMargin = '0px', triggerOnce = false } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!element || (triggerOnce && hasTriggered.current)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        setIsIntersecting(intersecting);
        if (intersecting && triggerOnce) {
          hasTriggered.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold, root, rootMargin, triggerOnce]);

  return [setElement, isIntersecting];
}

// ============================================
// useKeyPress Hook
// ============================================

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) setKeyPressed(true);
    };
    const upHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) setKeyPressed(false);
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}
