import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Category, CategoryAdd } from '../../types/category';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseCategoryAddParams extends RequestHook<Response<CategoryAdd[]>> {
  categories?: CategoryAdd[];
}

export const useCategoryAddBatch = ({
  categories,
  immediate = true,
  showLoader = true,
  onDone
}: UseCategoryAddParams) => {
  const asyncFn = useCallback(() => {
    if (!categories) return Promise.resolve({ success: false });
    return getApi().addBatchCategory(categories);
  }, [categories]);

  const { data, loading, execute } = useAsyncAction<Response<Category[]>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
