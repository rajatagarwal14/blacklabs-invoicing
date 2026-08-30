import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import type { StyleProfile, StyleProfileUpdate } from '../../types/styleProfiles';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseStyleProfileUpdateParams extends RequestHook<Response<StyleProfile>> {
  styleProfile?: StyleProfileUpdate;
}

export const useStyleProfileUpdate = ({
  styleProfile,
  immediate = true,
  showLoader = true,
  onDone
}: UseStyleProfileUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<StyleProfile>> => {
    if (!styleProfile) return Promise.resolve({ success: false });
    return getApi().updateStyleProfile(styleProfile);
  }, [styleProfile]);

  const { data, loading, execute } = useAsyncAction<Response<StyleProfile>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
