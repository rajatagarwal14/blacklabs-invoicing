import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Client } from '../../types/client';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

export const useClientsRetrieve = ({
  showLoader = true,
  immediate = true,
  filter,
  onDone
}: RequestHook<Response<Client[]>>) => {
  const asyncFn = useCallback(() => getApi().getAllClients(filter), [filter]);
  const { data: clients, execute } = useAsyncAction<Response<Client[]>>(asyncFn, { showLoader, immediate, onDone });

  return { clients: clients?.data ?? [], execute };
};
