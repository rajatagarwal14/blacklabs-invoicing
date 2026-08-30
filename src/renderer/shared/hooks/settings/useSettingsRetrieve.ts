import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../../state/configureStore';
import { setSettings } from '../../../state/pageSlice';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import type { Settings } from '../../types/settings';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const useSettingsRetrieve = ({
  showLoader = true,
  immediate = true,
  onDone
}: RequestHook<Response<Settings>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => getApi().getAllSettings(), []);
  const {
    data: settings,
    loading,
    execute
  } = useAsyncAction<Response<Settings>>(asyncFn, { immediate, showLoader, onDone });

  useEffect(() => {
    if (!settings || !settings.data) return;
    dispatch(setSettings(settings.data));
  }, [settings, dispatch]);

  return { settings: settings?.data, loading, execute };
};
