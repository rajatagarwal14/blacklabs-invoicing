import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import type { StyleProfile } from '../../types/styleProfiles';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const useStyleProfilesRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<StyleProfile[]>>) => {
  const asyncFn = useCallback(() => getApi().getAllStyleProfiles(filter), [filter]);
  const { data: styleProfiles, execute } = useAsyncAction<Response<StyleProfile[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  return { styleProfiles: styleProfiles?.data ?? [], execute };
};
