import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { EInvoice } from '../../enums/einvoice';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseEInvoiceParams extends RequestHook<Response<Uint8Array | undefined>> {
  params?: { invoiceId: number; einvoice: EInvoice };
}

export const useGetEInvoiceXML = ({ immediate = true, showLoader = true, params, onDone }: UseEInvoiceParams) => {
  const asyncFn = useCallback(() => {
    if (!params) return Promise.resolve({ success: false });

    return getApi().getEInvoiceXML(params);
  }, [params]);
  const { data: result, execute } = useAsyncAction<Response<Uint8Array | undefined>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  return { data: result?.data, execute };
};
