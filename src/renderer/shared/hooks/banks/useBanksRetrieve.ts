import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Bank } from '../../types/bank';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const useBanksRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<Bank[]>>) => {
  const asyncFn = useCallback(() => getApi().getAllBanks(filter), [filter]);
  const { data: banks, execute } = useAsyncAction<Response<Bank[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  return { banks: banks?.data ?? [], execute };
};
