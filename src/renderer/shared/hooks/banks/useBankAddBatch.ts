import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Bank, BankAdd } from '../../types/bank';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseBankParams extends RequestHook<Response<BankAdd[]>> {
  banks?: BankAdd[];
}

export const useBankAddBatch = ({ banks, immediate = true, showLoader = true, onDone }: UseBankParams) => {
  const asyncFn = useCallback(() => {
    if (!banks) return Promise.resolve({ success: false });
    return getApi().addBatchBank(banks);
  }, [banks]);

  const { data, loading, execute } = useAsyncAction<Response<Bank[]>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
