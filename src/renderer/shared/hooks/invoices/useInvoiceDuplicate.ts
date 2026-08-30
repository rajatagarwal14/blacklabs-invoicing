import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { InvoiceType } from '../../enums/invoiceType';
import type { Invoice } from '../../types/invoice';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseInvoiceDuplicateParams extends RequestHook<Response<Invoice>> {
  id: number;
  invoiceType: InvoiceType;
}

export const useInvoiceDuplicate = ({
  id,
  invoiceType,
  immediate = true,
  showLoader = true,
  onDone
}: UseInvoiceDuplicateParams) => {
  const asyncFn = useCallback(() => getApi().duplicateInvoice(id, invoiceType), [id, invoiceType]);
  const { data, loading, execute } = useAsyncAction<Response<Invoice>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
