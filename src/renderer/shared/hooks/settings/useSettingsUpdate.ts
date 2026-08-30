import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import type { SettingsUpdate } from '../../types/settings';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseSettingsUpdateParams extends RequestHook<Response<SettingsUpdate>> {
  newSettings: SettingsUpdate;
}

export const useSettingsUpdate = ({
  newSettings,
  immediate = true,
  showLoader = true,
  onDone
}: UseSettingsUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<SettingsUpdate>> => {
    return getApi().updateSettings(newSettings);
  }, [newSettings]);

  const { data, loading, execute } = useAsyncAction<Response<SettingsUpdate>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
