import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../../state/configureStore';
import { setCategoryOptions } from '../../../state/pageSlice';
import { getApi } from '../../api/restApi';
import type { Category } from '../../types/category';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const useCategoriesRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<Category[]>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => getApi().getAllCategories(filter), [filter]);
  const { data: categories, execute } = useAsyncAction<Response<Category[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  useEffect(() => {
    if (!categories || !categories.data) return;
    dispatch(
      setCategoryOptions(
        categories.data.map(c => {
          return { label: c.name, value: c.id };
        })
      )
    );
  }, [categories, dispatch]);

  return { categories: categories?.data ?? [], execute };
};
