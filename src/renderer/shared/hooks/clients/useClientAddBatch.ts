import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Client, ClientAdd } from '../../types/client';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseClientAddParams extends RequestHook<Response<ClientAdd[]>> {
  clients?: ClientAdd[];
}

export const useClientAddBatch = ({ clients, immediate = true, showLoader = true, onDone }: UseClientAddParams) => {
  const asyncFn = useCallback(() => {
    if (!clients) return Promise.resolve({ success: false });
    return getApi().addBatchClient(clients);
  }, [clients]);

  const { data, loading, execute } = useAsyncAction<Response<Client[]>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
