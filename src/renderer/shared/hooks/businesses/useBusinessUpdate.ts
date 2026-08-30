import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Business, BusinessUpdate } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseBusinessUpdateParams extends RequestHook<Response<Business>> {
  business?: BusinessUpdate;
}

export const useBusinessUpdate = ({
  business,
  immediate = true,
  showLoader = true,
  onDone
}: UseBusinessUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<Business>> => {
    if (!business) return Promise.resolve({ success: false });
    return getApi().updateBusiness(business);
  }, [business]);

  const { data, loading, execute } = useAsyncAction<Response<Business>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
