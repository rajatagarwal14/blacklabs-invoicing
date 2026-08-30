import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Preset, PresetAdd } from '../../types/preset';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UsePresetParams extends RequestHook<Response<Preset>> {
  preset?: PresetAdd;
}

export const usePresetAdd = ({ preset, immediate = true, showLoader = true, onDone }: UsePresetParams) => {
  const asyncFn = useCallback(() => {
    if (!preset) return Promise.resolve({ success: false });
    return getApi().addPreset(preset);
  }, [preset]);

  const { data, loading, execute } = useAsyncAction<Response<Preset>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
