import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseClientDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

export const useClientDelete = ({ id, immediate = true, showLoader = true, onDone }: UseClientDeleteParams) => {
  const asyncFn = useCallback(() => getApi().deleteClient(id), [id]);
  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
