import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Preset } from '../../types/preset';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const usePresetsRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<Preset[]>>) => {
  const asyncFn = useCallback(() => getApi().getAllPresets(filter), [filter]);
  const { data: presets, execute } = useAsyncAction<Response<Preset[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  return { presets: presets?.data ?? [], execute };
};
