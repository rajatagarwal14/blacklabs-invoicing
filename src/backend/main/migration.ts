import { app } from 'electron';
import { join, resolve } from 'path';
import { runMigrations as runMigrationsShared } from '../shared/db/migrationRunner';
import type { DatabaseAdapter } from '../shared/types/DatabaseAdapter';

const isDev = !app.isPackaged;
const migrationsPath = isDev
  ? join(resolve(), 'dist-be/backend/migrations')
  : join(app.getAppPath(), 'dist-be/backend/migrations');

export const runMigrations = async (db: DatabaseAdapter) => {
  return runMigrationsShared(db, migrationsPath);
};
