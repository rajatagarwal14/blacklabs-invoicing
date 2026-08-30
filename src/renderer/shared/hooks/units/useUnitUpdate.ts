import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import type { Unit, UnitUpdate } from '../../types/unit';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseUnitUpdateParams extends RequestHook<Response<Unit>> {
  unit?: UnitUpdate;
}

export const useUnitUpdate = ({ unit, immediate = true, showLoader = true, onDone }: UseUnitUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<Unit>> => {
    if (!unit) return Promise.resolve({ success: false });
    return getApi().updateUnit(unit);
  }, [unit]);

  const { data, loading, execute } = useAsyncAction<Response<Unit>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
