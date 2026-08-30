import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Category, CategoryAdd } from '../../types/category';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseCategoryAddParams extends RequestHook<Response<Category>> {
  category?: CategoryAdd;
}

export const useCategoryAdd = ({ category, immediate = true, showLoader = true, onDone }: UseCategoryAddParams) => {
  const asyncFn = useCallback(() => {
    if (!category) return Promise.resolve({ success: false });
    return getApi().addCategory(category);
  }, [category]);

  const { data, loading, execute } = useAsyncAction<Response<Category>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
