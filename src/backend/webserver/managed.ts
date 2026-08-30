/**
 * BlackLabs managed mode.
 *
 * The desktop build lets the browser choose its own database — which SQLite
 * file or Postgres server to connect to. That is correct for an app running on
 * your own machine and unsafe for a hosted one, so managed mode replaces it
 * with a single database pinned by environment configuration at boot.
 *
 * When BLACKLABS_MANAGED is on:
 *   - the database is opened once, at startup, from env vars
 *   - the /api/databases* routes are never registered
 *   - the frontend skips the database chooser entirely
 */
import fs from 'fs';
import path from 'path';
import { DatabaseType } from '../shared/enums/databaseType';
import type { PostgresConfig } from '../shared/types/postgresConfig';
import { setupDB } from './database';

const truthy = (value?: string) => {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
};

export const isManagedMode = (): boolean => truthy(process.env.BLACKLABS_MANAGED);

/**
 * Postgres identifiers are restricted to [A-Za-z0-9_] by sanitizeDatabaseName,
 * so a DATABASE_URL carrying a dashed database name fails late and cryptically.
 * Catching it here turns that into a startup error naming the offending value.
 */
const assertUsableDatabaseName = (database: string) => {
  if (!/^[A-Za-z0-9_]+$/.test(database)) {
    throw new Error(
      `Database name "${database}" is not usable: only letters, digits and underscores are supported. ` +
        'Rename the database, or set PGDATABASE to a conforming name.'
    );
  }
};

const fromConnectionString = (raw: string): PostgresConfig => {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('DATABASE_URL is not a valid URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error(`DATABASE_URL must use the postgres:// scheme, got "${url.protocol}".`);
  }

  const database = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!database) throw new Error('DATABASE_URL is missing a database name.');
  assertUsableDatabaseName(database);

  const sslMode = url.searchParams.get('sslmode');

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: url.password ? decodeURIComponent(url.password) : undefined,
    database,
    ssl: sslMode ? sslMode !== 'disable' : truthy(process.env.PGSSL)
  };
};

const fromDiscreteVars = (): PostgresConfig => {
  const host = process.env.PGHOST;
  const user = process.env.PGUSER;
  const database = process.env.PGDATABASE;

  const missing = [
    ['PGHOST', host],
    ['PGUSER', user],
    ['PGDATABASE', database]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(
      `Managed mode needs a database. Set DATABASE_URL, or all of PGHOST, PGUSER and PGDATABASE ` +
        `(missing: ${missing.join(', ')}).`
    );
  }

  assertUsableDatabaseName(database as string);

  return {
    host: host as string,
    port: Number(process.env.PGPORT ?? 5432),
    user: user as string,
    password: process.env.PGPASSWORD,
    database: database as string,
    ssl: truthy(process.env.PGSSL)
  };
};

export const resolveManagedPostgresConfig = (): PostgresConfig =>
  process.env.DATABASE_URL ? fromConnectionString(process.env.DATABASE_URL) : fromDiscreteVars();

export type ManagedTarget = { engine: 'postgres'; description: string } | { engine: 'sqlite'; description: string };

/**
 * Which engine this instance runs on.
 *
 * SQLite is the default because it is the tested path: all 26 migrations apply
 * cleanly against it. The Postgres migration chain does not
 * yet complete — see docs/POSTGRES-STATUS.md — so Postgres must be opted into
 * explicitly rather than picked up from a stray DATABASE_URL.
 */
const resolveEngine = (): 'postgres' | 'sqlite' => {
  const requested = (process.env.BLACKLABS_DB ?? 'sqlite').trim().toLowerCase();
  if (['postgres', 'postgresql', 'pg'].includes(requested)) return 'postgres';
  if (requested === 'sqlite') return 'sqlite';
  throw new Error(`BLACKLABS_DB must be "sqlite" or "postgres", got "${requested}".`);
};

export const managedSqlitePath = (): string =>
  process.env.BLACKLABS_SQLITE_PATH?.trim() || `${process.env.DB_DIRECTORY || '/data'}/blacklabs-invoicing.sqlite`;

/**
 * Opens the pinned database and brings the schema up to date.
 *
 * The createIfMissing flag is dangerous and asymmetric, so it is computed
 * rather than passed as a constant:
 *
 *   Postgres — openPostgreSql creates the database when absent and leaves an
 *   existing one alone, and initSchema is CREATE TABLE IF NOT EXISTS, so true
 *   is safe on every boot.
 *
 *   SQLite — openSqlLite UNLINKS the file when the flag is set. Passing true
 *   unconditionally would erase the client's data on every restart, so it is
 *   set only when no file exists yet.
 */
export const bootstrapManagedDatabase = async (): Promise<ManagedTarget> => {
  const engine = resolveEngine();

  if (engine === 'postgres') {
    const postgresConfig = resolveManagedPostgresConfig();
    await setupDB({ dbType: DatabaseType.postgre, createIfMissing: true, postgresConfig });
    return { engine, description: `postgres://${postgresConfig.host}/${postgresConfig.database}` };
  }

  const fullPath = managedSqlitePath();
  const isNew = !fs.existsSync(fullPath);

  if (isNew) fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  await setupDB({
    dbType: DatabaseType.sqlite,
    createIfMissing: isNew,
    sqliteConfig: { fullPath }
  });

  return { engine, description: `${fullPath}${isNew ? ' (created)' : ''}` };
};
