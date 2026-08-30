import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Category, CategoryUpdate } from '../../types/category';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseCategoryUpdateParams extends RequestHook<Response<Category>> {
  category?: CategoryUpdate;
}

export const useCategoryUpdate = ({
  category,
  immediate = true,
  showLoader = true,
  onDone
}: UseCategoryUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<Category>> => {
    if (!category) return Promise.resolve({ success: false });
    return getApi().updateCategory(category);
  }, [category]);

  const { data, loading, execute } = useAsyncAction<Response<Category>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
