import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { DBSelector } from '../../types/dbSelector';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const useDBSelector = ({ showLoader = true, immediate = true, onDone }: RequestHook<Response<DBSelector>>) => {
  const asyncFn = useCallback(() => getApi().selectDatabase(), []);
  const { data, execute } = useAsyncAction<Response<DBSelector>>(asyncFn, { showLoader, immediate, onDone });

  return { data, execute };
};
