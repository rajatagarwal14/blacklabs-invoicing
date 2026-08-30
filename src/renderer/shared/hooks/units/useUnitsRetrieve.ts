import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../../state/configureStore';
import { setUnitOptions } from '../../../state/pageSlice';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import type { Unit } from '../../types/unit';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const useUnitsRetrieve = ({ showLoader = true, filter, onDone }: RequestHook<Response<Unit[]>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => getApi().getAllUnits(filter), [filter]);
  const { data: units, execute } = useAsyncAction<Response<Unit[]>>(asyncFn, { showLoader, onDone });

  useEffect(() => {
    if (!units || !units.data) return;

    dispatch(
      setUnitOptions(
        units.data.map(c => {
          return { label: c.name, value: c.id };
        })
      )
    );
  }, [units, dispatch]);

  return { units: units?.data ?? [], execute };
};
