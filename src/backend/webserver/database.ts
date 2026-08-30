import fs from 'fs';
import path from 'path';
import { initInitialData, initSchema, openPostgreSql, openSqlLite } from '../shared/db/setup';
import { DatabaseType } from '../shared/enums/databaseType';
import type { DatabaseAdapter } from '../shared/types/DatabaseAdapter';
import type { PostgresConfig } from '../shared/types/postgresConfig';
import type { SqLiteConfig } from '../shared/types/sqliteConfig';
import { runMigrations } from './migration';

export let dbInstance: DatabaseAdapter | null = null;

export const setupDB = async (opts: {
  dbType: DatabaseType;
  createIfMissing?: boolean;
  postgresConfig?: PostgresConfig;
  sqliteConfig?: SqLiteConfig;
}): Promise<void> => {
  const { sqliteConfig, createIfMissing = true, dbType, postgresConfig } = opts;

  if (dbInstance) {
    await (dbInstance as DatabaseAdapter).close();
    dbInstance = null;
  }

  if (dbType === DatabaseType.postgre) {
    if (!postgresConfig) throw new Error('error.postgresConfig');
    const { db: newDb } = await openPostgreSql(postgresConfig);
    dbInstance = newDb;
  } else if (dbType === DatabaseType.sqlite) {
    if (sqliteConfig?.fullPath) fs.mkdirSync(path.dirname(sqliteConfig?.fullPath), { recursive: true });
    const { db: newDb } = await openSqlLite({ fullPath: sqliteConfig?.fullPath, createIfMissing: createIfMissing });
    dbInstance = newDb;
  }

  if (!dbInstance) throw new Error('error.noDatabase');

  if (createIfMissing) {
    await initSchema(dbInstance);
    await initInitialData(dbInstance);
  }

  const migrationResult = await runMigrations(dbInstance);
  if (migrationResult && !migrationResult.success) {
    throw new Error(migrationResult.message ?? 'error.failedMigration');
  }
};
