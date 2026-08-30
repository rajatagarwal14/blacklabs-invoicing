import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseCurrencyDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

export const useCurrencyDelete = ({ id, immediate = true, showLoader = true, onDone }: UseCurrencyDeleteParams) => {
  const asyncFn = useCallback(() => getApi().deleteCurrency(id), [id]);
  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
