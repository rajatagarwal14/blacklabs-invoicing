import path from 'path';
import { runMigrations as runMigrationsShared } from '../shared/db/migrationRunner';
import type { DatabaseAdapter } from '../shared/types/DatabaseAdapter';

const migrationsPath =
  process.env.MIGRATIONS_PATH || path.resolve(process.cwd(), 'src', 'backend', 'shared', 'migrations');

export const runMigrations = async (db: DatabaseAdapter) => {
  return runMigrationsShared(db, migrationsPath);
};
