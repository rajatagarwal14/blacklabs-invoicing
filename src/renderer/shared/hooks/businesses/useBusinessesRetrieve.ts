import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Business } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const useBusinessesRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<Business[]>>) => {
  const asyncFn = useCallback(() => getApi().getAllBusinesses(filter), [filter]);
  const { data: businesses, execute } = useAsyncAction<Response<Business[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  return { businesses: businesses?.data ?? [], execute };
};
