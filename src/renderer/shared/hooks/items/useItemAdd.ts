import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Item, ItemAdd } from '../../types/item';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseItemAddParams extends RequestHook<Response<Item>> {
  item?: ItemAdd;
}

export const useItemAdd = ({ item, immediate = true, showLoader = true, onDone }: UseItemAddParams) => {
  const asyncFn = useCallback(() => {
    if (!item) return Promise.resolve({ success: false });
    return getApi().addItem(item);
  }, [item]);

  const { data, loading, execute } = useAsyncAction<Response<Item>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
