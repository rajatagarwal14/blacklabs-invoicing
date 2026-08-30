import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { useAppDispatch } from '../../../state/configureStore';
import { addToast, disableLoadingCursor, enableLoadingCursor } from '../../../state/pageSlice';
import { useAsync } from './useAsync';

interface UseAsyncActionOptions<T> {
  showLoader?: boolean;
  immediate?: boolean;
  onDone?: (data: T) => void;
}

export const useAsyncAction = <T>(
  asyncFn: () => Promise<T>,
  { showLoader = true, immediate = true, onDone }: UseAsyncActionOptions<T> = {}
) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const handleLoadingChange = useCallback(
    (isLoading: boolean) => {
      if (!showLoader) return;
      if (isLoading) dispatch(enableLoadingCursor());
      else dispatch(disableLoadingCursor());
    },
    [dispatch, showLoader]
  );

  const handleError = useCallback(
    (err: Error) => {
      const message = i18n.exists(err.message) ? t(err.message) : err.message;
      dispatch(addToast({ message: message, severity: 'error' }));
    },
    [dispatch, t]
  );

  const { data, loading, execute } = useAsync<T>(asyncFn, {
    onLoadingChange: handleLoadingChange,
    onError: handleError,
    immediate
  });

  useEffect(() => {
    if (!loading && data !== null) {
      onDoneRef.current?.(data);
    }
  }, [loading, data]);

  return { data, loading, execute };
};
