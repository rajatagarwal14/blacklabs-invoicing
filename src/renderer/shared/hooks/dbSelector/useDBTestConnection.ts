import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { PostgresConfig } from '../../types/postgresConfig';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseTestConnectionDBParams extends RequestHook<Response<unknown>> {
  postgresConfig: PostgresConfig;
}

export const useTestConnection = ({
  postgresConfig,
  immediate = true,
  showLoader = true,
  onDone
}: UseTestConnectionDBParams) => {
  const asyncFn = useCallback(() => getApi().testConnection(postgresConfig), [postgresConfig]);
  const { data, execute } = useAsyncAction<Response<unknown>>(asyncFn, { showLoader, immediate, onDone });

  return { data, execute };
};
