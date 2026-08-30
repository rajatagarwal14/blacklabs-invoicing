import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseItemDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

export const useItemDelete = ({ id, immediate = true, showLoader = true, onDone }: UseItemDeleteParams) => {
  const asyncFn = useCallback(() => getApi().deleteItem(id), [id]);
  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
