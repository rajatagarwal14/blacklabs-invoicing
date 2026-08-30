import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const useDBListSelector = ({ immediate = true, showLoader = true, onDone }: RequestHook<Response<string[]>>) => {
  const asyncFn = useCallback(() => getApi().getDatabaseList(), []);
  const { data: list, execute } = useAsyncAction<Response<string[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  return { businesses: list?.data ?? [], execute };
};
