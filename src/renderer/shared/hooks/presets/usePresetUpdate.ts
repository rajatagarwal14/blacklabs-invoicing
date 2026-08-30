import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Preset, PresetUpdate } from '../../types/preset';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UsePresetUpdateParams extends RequestHook<Response<Preset>> {
  preset?: PresetUpdate;
}

export const usePresetUpdate = ({ preset, immediate = true, showLoader = true, onDone }: UsePresetUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<Preset>> => {
    if (!preset) return Promise.resolve({ success: false });
    return getApi().updatePreset(preset);
  }, [preset]);

  const { data, loading, execute } = useAsyncAction<Response<Preset>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
