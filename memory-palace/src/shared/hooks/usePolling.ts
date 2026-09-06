import { useEffect, useRef } from 'react';
import { useAsync } from './useAsync';

export function usePolling<T>(
  fn: () => Promise<T>,
  interval = 30000,
  deps: unknown[] = [],
) {
  const { data, loading, error, refresh } = useAsync<T>(fn, deps, true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => void refresh(), interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, refresh]);

  return { data, loading, error, refresh };
}
