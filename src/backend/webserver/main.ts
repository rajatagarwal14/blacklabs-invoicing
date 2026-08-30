import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { APP_CONFIG } from './config';
import { initControllers } from './controllers';
import { initDatabaseController } from './controllers/database';
import { dbInstance } from './database';
import { bootstrapManagedDatabase, isManagedMode } from './managed';
import { resyncIdentitySequences } from './resyncSequences';
import { applyLocaleSeed } from './seedLocale';

const port = Number(process.env.PORT) || Number(APP_CONFIG.PORT);
const server = process.env.DEV_SERVER_URL || APP_CONFIG.DEV_SERVER_URL;
const feServer = process.env.FE_SERVER_URL || APP_CONFIG.FE_SERVER_URL;
const host = process.env.NODE_ENV === 'docker' ? 'localhost' : server;
const version = APP_CONFIG.VERSION;
const managed = isManagedMode();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(
  cors({
    origin: feServer,
    credentials: true
  })
);
app.set('trust proxy', 1);

const main = async () => {
  if (managed) {
    // Pin the database from the environment before any route can serve a
    // request, and leave the database-selection routes unregistered.
    const target = await bootstrapManagedDatabase();
    console.log(`Managed mode: ${target.engine} — ${target.description}`);
    if (dbInstance) {
      const resynced = await resyncIdentitySequences(dbInstance);
      if (resynced) console.log(`Resynced ${resynced} identity sequences.`);
      await applyLocaleSeed(dbInstance);
    }
  } else {
    initDatabaseController(app);
  }

  initControllers(app);

  app.listen(port, server, () => {
    console.log(`Server listening at http://${host}:${port}${managed ? ' (managed)' : ''}`);
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    const ready = Boolean(dbInstance);
    res.status(ready ? 200 : 503).json({ ok: ready, managed, database: ready ? 'connected' : 'unavailable' });
  });
  app.get('/api/version', (_req: Request, res: Response) => {
    res.json({ version: version });
  });
};

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
