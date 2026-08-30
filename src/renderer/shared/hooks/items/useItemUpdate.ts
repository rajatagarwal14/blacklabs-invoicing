import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Item, ItemUpdate } from '../../types/item';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseItemUpdateParams extends RequestHook<Response<Item>> {
  item?: ItemUpdate;
}

export const useItemUpdate = ({ item, immediate = true, showLoader = true, onDone }: UseItemUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<Item>> => {
    if (!item) return Promise.resolve({ success: false });
    return getApi().updateItem(item);
  }, [item]);

  const { data, loading, execute } = useAsyncAction<Response<Item>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
