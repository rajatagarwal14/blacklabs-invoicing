import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Bank, BankAdd } from '../../types/bank';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseBankParams extends RequestHook<Response<Bank>> {
  bank?: BankAdd;
}

export const useBankAdd = ({ bank, immediate = true, showLoader = true, onDone }: UseBankParams) => {
  const asyncFn = useCallback(() => {
    if (!bank) return Promise.resolve({ success: false });
    return getApi().addBank(bank);
  }, [bank]);

  const { data, loading, execute } = useAsyncAction<Response<Bank>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
