import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Currency, CurrencyAdd } from '../../types/currency';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseCurrencyAddParams extends RequestHook<Response<CurrencyAdd[]>> {
  currencies?: CurrencyAdd[];
}

export const useCurrencyAddBatch = ({
  currencies,
  immediate = true,
  showLoader = true,
  onDone
}: UseCurrencyAddParams) => {
  const asyncFn = useCallback(() => {
    if (!currencies) return Promise.resolve({ success: false });
    return getApi().addBatchCurrency(currencies);
  }, [currencies]);

  const { data, loading, execute } = useAsyncAction<Response<Currency[]>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
