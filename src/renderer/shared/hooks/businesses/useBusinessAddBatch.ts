import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Business, BusinessAdd } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseBusinessAddParams extends RequestHook<Response<BusinessAdd[]>> {
  businesses?: BusinessAdd[];
}

export const useBusinessAddBatch = ({
  businesses,
  immediate = true,
  showLoader = true,
  onDone
}: UseBusinessAddParams) => {
  const asyncFn = useCallback(() => {
    if (!businesses) return Promise.resolve({ success: false });
    return getApi().addBatchBusiness(businesses);
  }, [businesses]);

  const { data, loading, execute } = useAsyncAction<Response<Business[]>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
