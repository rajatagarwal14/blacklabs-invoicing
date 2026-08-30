import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Client, ClientUpdate } from '../../types/client';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseClientUpdateParams extends RequestHook<Response<Client>> {
  client?: ClientUpdate;
}

export const useClientUpdate = ({ client, immediate = true, showLoader = true, onDone }: UseClientUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<Client>> => {
    if (!client) return Promise.resolve({ success: false });
    return getApi().updateClient(client);
  }, [client]);

  const { data, loading, execute } = useAsyncAction<Response<Client>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
