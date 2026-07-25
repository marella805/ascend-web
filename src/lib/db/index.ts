import { createClient } from '@libsql/client';
import path from 'path';

export const client = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${process.env.VERCEL ? '/tmp/ascend.db' : path.join(process.cwd(), 'ascend.db')}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let _init: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!_init) {
    _init = (async () => {
      const { runMigrations } = await import('./migrate-fn');
      const { seedDb } = await import('./seed-fn');
      await runMigrations();
      await seedDb();
    })();
  }
  return _init;
}
