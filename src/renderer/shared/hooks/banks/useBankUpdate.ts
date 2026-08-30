import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Bank, BankUpdate } from '../../types/bank';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseBankUpdateParams extends RequestHook<Response<Bank>> {
  bank?: BankUpdate;
}

export const useBankUpdate = ({ bank, immediate = true, showLoader = true, onDone }: UseBankUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<Bank>> => {
    if (!bank) return Promise.resolve({ success: false });
    return getApi().updateBank(bank);
  }, [bank]);

  const { data, loading, execute } = useAsyncAction<Response<Bank>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
