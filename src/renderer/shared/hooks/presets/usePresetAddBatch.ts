import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Preset, PresetAdd } from '../../types/preset';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UsePresetParams extends RequestHook<Response<PresetAdd[]>> {
  presets?: PresetAdd[];
}

export const usePresetAddBatch = ({ presets, immediate = true, showLoader = true, onDone }: UsePresetParams) => {
  const asyncFn = useCallback(() => {
    if (!presets) return Promise.resolve({ success: false });
    return getApi().addBatchPreset(presets);
  }, [presets]);

  const { data, loading, execute } = useAsyncAction<Response<Preset[]>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
