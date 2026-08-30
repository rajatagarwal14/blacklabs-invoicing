import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Currency, CurrencyAdd } from '../../types/currency';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseCurrencyAddParams extends RequestHook<Response<Currency>> {
  currency?: CurrencyAdd;
}

export const useCurrencyAdd = ({ currency, immediate = true, showLoader = true, onDone }: UseCurrencyAddParams) => {
  const asyncFn = useCallback(() => {
    if (!currency) return Promise.resolve({ success: false });
    return getApi().addCurrency(currency);
  }, [currency]);

  const { data, loading, execute } = useAsyncAction<Response<Currency>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
