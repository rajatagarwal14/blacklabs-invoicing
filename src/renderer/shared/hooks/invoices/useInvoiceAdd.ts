import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Invoice, InvoiceAdd } from '../../types/invoice';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseInvoiceAddParams extends RequestHook<Response<Invoice>> {
  invoice?: InvoiceAdd;
}

export const useInvoiceAdd = ({ invoice, immediate = true, showLoader = true, onDone }: UseInvoiceAddParams) => {
  const asyncFn = useCallback(() => {
    if (!invoice) return Promise.resolve({ success: false });
    return getApi().addInvoice(invoice);
  }, [invoice]);

  const { data, loading, execute } = useAsyncAction<Response<Invoice>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
