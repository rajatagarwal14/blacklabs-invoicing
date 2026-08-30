import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { InvoiceType } from '../../enums/invoiceType';
import type { CustomFieldMeta } from '../../types/invoice';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseHeadersParams extends RequestHook<Response<CustomFieldMeta[]>> {
  type: InvoiceType;
}

export const useHeadersRetrieve = ({ immediate = true, showLoader = true, type, onDone }: UseHeadersParams) => {
  const asyncFn = useCallback(() => getApi().getCustomHeaders(type), [type]);
  const { data: headers, execute } = useAsyncAction<Response<CustomFieldMeta[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  return { invoices: headers?.data ?? [], execute };
};
