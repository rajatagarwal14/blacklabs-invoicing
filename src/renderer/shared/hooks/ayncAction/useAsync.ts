import { useCallback, useEffect, useState } from 'react';

type AsyncFunction<T> = (...args: unknown[]) => Promise<T>;

interface UseAsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: unknown[]) => void;
}

interface UseAsyncOptions {
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: Error) => void;
  immediate?: boolean;
}

export const useAsync = <T>(asyncFn: AsyncFunction<T>, options: UseAsyncOptions = {}): UseAsyncResult<T> => {
  const { onLoadingChange, onError, immediate = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    (...args: unknown[]) => {
      setLoading(true);
      onLoadingChange?.(true);
      setError(null);

      asyncFn(...args)
        .then(response => {
          setData(response);
        })
        .catch(err => {
          const e = err as Error;
          setError(e);
          onError?.(e);
        })
        .finally(() => {
          setLoading(false);
          onLoadingChange?.(false);
        });
    },
    [asyncFn, onLoadingChange, onError]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute };
};
