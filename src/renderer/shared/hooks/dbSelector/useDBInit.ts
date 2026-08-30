import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { DatabaseType } from '../../enums/databaseType';
import { DBInitType } from '../../enums/dbInitType';
import type { PostgresConfig } from '../../types/postgresConfig';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseInitDBParams extends RequestHook<Response<unknown>> {
  fullPath?: string;
  mode?: DBInitType;
  dbType: DatabaseType;
  postgresConfig?: PostgresConfig;
}

export const useDBInit = ({
  fullPath,
  mode = DBInitType.create,
  dbType,
  postgresConfig,
  immediate = true,
  showLoader = true,
  onDone
}: UseInitDBParams) => {
  const asyncFn = useCallback(
    () => getApi().initializeDatabase({ postgresConfig, fullPath, mode, dbType }),
    [fullPath, mode, postgresConfig, dbType]
  );
  const { data, execute } = useAsyncAction<Response<unknown>>(asyncFn, { showLoader, immediate, onDone });

  return { data, execute };
};
