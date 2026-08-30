import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Item } from '../../types/item';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const useItemsRetrieve = ({ showLoader = true, filter, onDone }: RequestHook<Response<Item[]>>) => {
  const asyncFn = useCallback(() => getApi().getAllItems(filter), [filter]);
  const { data: items, execute } = useAsyncAction<Response<Item[]>>(asyncFn, { showLoader, onDone });

  return { items: items?.data ?? [], execute };
};
