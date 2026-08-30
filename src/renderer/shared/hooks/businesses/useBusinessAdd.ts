import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Business, BusinessAdd } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';
interface UseBusinessAddParams extends RequestHook<Response<Business>> {
  business?: BusinessAdd;
}

export const useBusinessAdd = ({ business, immediate = true, showLoader = true, onDone }: UseBusinessAddParams) => {
  const asyncFn = useCallback(() => {
    if (!business) return Promise.resolve({ success: false });
    return getApi().addBusiness(business);
  }, [business]);

  const { data, loading, execute } = useAsyncAction<Response<Business>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
