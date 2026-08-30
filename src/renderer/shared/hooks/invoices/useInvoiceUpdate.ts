import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Invoice, InvoiceUpdate } from '../../types/invoice';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseInvoiceUpdateParams extends RequestHook<Response<Invoice>> {
  invoice?: InvoiceUpdate;
}

export const useInvoiceUpdate = ({ invoice, immediate = true, showLoader = true, onDone }: UseInvoiceUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<Invoice>> => {
    if (!invoice) return Promise.resolve({ success: false });
    return getApi().updateInvoice(invoice);
  }, [invoice]);

  const { data, loading, execute } = useAsyncAction<Response<Invoice>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
