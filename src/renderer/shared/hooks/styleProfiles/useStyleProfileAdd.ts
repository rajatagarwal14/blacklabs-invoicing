import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import type { StyleProfile, StyleProfileAdd } from '../../types/styleProfiles';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseStyleProfileParams extends RequestHook<Response<StyleProfile>> {
  styleProfile?: StyleProfileAdd;
}

export const useStyleProfileAdd = ({
  styleProfile,
  immediate = true,
  showLoader = true,
  onDone
}: UseStyleProfileParams) => {
  const asyncFn = useCallback(() => {
    if (!styleProfile) return Promise.resolve({ success: false });
    return getApi().addStyleProfile(styleProfile);
  }, [styleProfile]);

  const { data, loading, execute } = useAsyncAction<Response<StyleProfile>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
