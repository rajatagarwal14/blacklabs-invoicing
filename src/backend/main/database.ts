import type { BrowserWindow } from 'electron';
import { initInitialData, initSchema, openPostgreSql, openSqlLite } from '../shared/db/setup';
import { DatabaseType } from '../shared/enums/databaseType';
import type { DatabaseAdapter } from '../shared/types/DatabaseAdapter';
import type { PostgresConfig } from '../shared/types/postgresConfig';
import type { SqLiteConfig } from '../shared/types/sqliteConfig';
import { initIpcHandler } from './ipc';
import { runMigrations } from './migration';

let dbInstance: DatabaseAdapter | null = null;

const setupDB = async (opts: {
  dbType: DatabaseType;
  createIfMissing?: boolean;
  postgresConfig?: PostgresConfig;
  sqliteConfig?: SqLiteConfig;
  mainWindow: BrowserWindow;
}) => {
  const { sqliteConfig, createIfMissing = true, mainWindow, dbType, postgresConfig } = opts;

  if (dbInstance) {
    await (dbInstance as DatabaseAdapter).close();
    dbInstance = null;
  }

  if (dbType === DatabaseType.postgre) {
    if (!postgresConfig) throw new Error('error.postgresConfig');
    const { db: newDb } = await openPostgreSql(postgresConfig);
    dbInstance = newDb;
  } else if (dbType === DatabaseType.sqlite) {
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

  initIpcHandler(dbInstance, mainWindow);
};

export { dbInstance as db, setupDB };
