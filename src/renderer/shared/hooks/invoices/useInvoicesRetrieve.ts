import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../../state/configureStore';
import { setBusinessSnapshotOptions, setClientSnapshotOptions } from '../../../state/pageSlice';
import { getApi } from '../../api/restApi';
import type { InvoiceType } from '../../enums/invoiceType';
import type { Invoice } from '../../types/invoice';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseInvoicesParams extends RequestHook<Response<Invoice[]>> {
  type?: InvoiceType;
}

export const useInvoicesRetrieve = ({
  immediate = true,
  showLoader = true,
  type,
  filter,
  onDone
}: UseInvoicesParams) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => getApi().getAllInvoices(type, filter), [filter, type]);
  const { data: invoices, execute } = useAsyncAction<Response<Invoice[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  useEffect(() => {
    if (!invoices || !invoices.data) return;

    const uniqueBusinessSnapshots = [
      ...new Set(invoices.data.map(c => c.invoiceBusinessSnapshot?.businessName ?? 'N/A'))
    ];
    dispatch(
      setBusinessSnapshotOptions(
        uniqueBusinessSnapshots.map(c => {
          return { label: c, value: c };
        })
      )
    );

    const uniqueClientsSnapshots = [...new Set(invoices.data.map(c => c.invoiceClientSnapshot?.clientName ?? 'N/A'))];
    dispatch(
      setClientSnapshotOptions(
        uniqueClientsSnapshots.map(c => {
          return { label: c, value: c };
        })
      )
    );
  }, [invoices, dispatch]);

  return { invoices: invoices?.data ?? [], execute };
};
