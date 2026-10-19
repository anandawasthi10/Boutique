import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import { newDb } from 'pg-mem';

const { Pool } = pg;

export type AppDatabase = NodePgDatabase<typeof schema>;

let poolInstance: pg.Pool | null = null;
let dbInstance: AppDatabase | null = null;

function patchQueryMethod(originalQuery: Function) {
  return function (this: any, queryTextOrConfig: any, valuesOrCallback?: any, callback?: any) {
    let cb = typeof valuesOrCallback === 'function' ? valuesOrCallback : callback;
    let values = typeof valuesOrCallback !== 'function' ? valuesOrCallback : undefined;

    let isArrayMode = false;
    if (typeof queryTextOrConfig === 'object' && queryTextOrConfig !== null) {
      if (queryTextOrConfig.rowMode === 'array') {
        isArrayMode = true;
        delete queryTextOrConfig.rowMode;
      }
      if ('types' in queryTextOrConfig) {
        delete queryTextOrConfig.types;
      }
    }

    if (cb) {
      const wrappedCb = (err: any, res: any) => {
        if (!err && res && Array.isArray(res.rows) && isArrayMode) {
          res.rows = res.rows.map((r: any) => Object.values(r));
        }
        cb(err, res);
      };
      return originalQuery.call(this, queryTextOrConfig, values, wrappedCb);
    }

    const promise = originalQuery.call(this, queryTextOrConfig, values);
    if (promise && typeof promise.then === 'function') {
      return promise.then((res: any) => {
        if (res && Array.isArray(res.rows) && isArrayMode) {
          res.rows = res.rows.map((r: any) => Object.values(r));
        }
        return res;
      });
    }
    return promise;
  };
}

export async function createTestDatabase(): Promise<{ db: AppDatabase; pool: pg.Pool }> {
  const mem = newDb({
    autoCreateForeignKeyIndices: true,
  });

  const adapter = mem.adapters.createPg();
  const pool = new adapter.Pool() as unknown as pg.Pool;

  const origPoolQuery = pool.query;
  (pool as any).query = patchQueryMethod(origPoolQuery);

  const origConnect = pool.connect;
  (pool as any).connect = async function (...args: any[]) {
    const client = await (origConnect as any).apply(this, args);
    const origClientQuery = client.query;
    client.query = patchQueryMethod(origClientQuery);
    return client;
  };

  // Create tables DDL for in-memory testing
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(64) PRIMARY KEY,
      session_id_hash TEXT NOT NULL UNIQUE,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id VARCHAR(64) PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(64) PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id VARCHAR(64) REFERENCES categories(id) ON DELETE RESTRICT,
      base_price INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      images JSONB NOT NULL DEFAULT '[]'::jsonb,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS option_groups (
      id VARCHAR(64) NOT NULL,
      product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'swatch',
      required BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      default_option_id VARCHAR(64),
      PRIMARY KEY (product_id, id)
    );

    CREATE TABLE IF NOT EXISTS options (
      id VARCHAR(64) NOT NULL,
      product_id VARCHAR(64) NOT NULL,
      group_id VARCHAR(64) NOT NULL,
      label TEXT NOT NULL,
      price_delta INTEGER NOT NULL DEFAULT 0,
      swatch_image_url TEXT,
      colour_value TEXT,
      preview_image_url TEXT,
      detail TEXT,
      available BOOLEAN NOT NULL DEFAULT TRUE,
      unavailable_reason TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (product_id, group_id, id)
    );

    CREATE TABLE IF NOT EXISTS option_compatibility_rules (
      id VARCHAR(64) PRIMARY KEY,
      product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      primary_option_id VARCHAR(64) NOT NULL,
      incompatible_option_id VARCHAR(64) NOT NULL,
      message TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS carts (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
      guest_token TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id VARCHAR(64) PRIMARY KEY,
      cart_id VARCHAR(64) NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      selected_options JSONB NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price_at_add INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      line1 TEXT NOT NULL,
      line2 TEXT,
      landmark TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      address_snapshot JSONB NOT NULL,
      subtotal INTEGER NOT NULL,
      shipping INTEGER NOT NULL DEFAULT 0,
      tax INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'placed',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id VARCHAR(64) NOT NULL,
      product_name TEXT NOT NULL,
      selected_options_text TEXT NOT NULL,
      selected_options JSONB NOT NULL,
      unit_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      line_total INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      gateway TEXT NOT NULL,
      gateway_order_id TEXT,
      gateway_payment_id TEXT,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'pending',
      raw_response JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_events (
      id VARCHAR(64) PRIMARY KEY,
      gateway TEXT NOT NULL,
      event_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (gateway, event_id)
    );

    CREATE TABLE IF NOT EXISTS idempotency_keys (
      id VARCHAR(64) PRIMARY KEY,
      key TEXT NOT NULL,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL,
      request_hash TEXT NOT NULL,
      response_status INTEGER NOT NULL,
      response_body JSONB NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (key, user_id, endpoint)
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id VARCHAR(64) PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      from_status TEXT NOT NULL,
      to_status TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const db = drizzle(pool, { schema });
  return { db, pool };
}

export async function initDatabase(connectionString?: string): Promise<{ db: AppDatabase; pool: pg.Pool }> {
  if (dbInstance && poolInstance) {
    return { db: dbInstance, pool: poolInstance };
  }

  const url = connectionString || process.env.DATABASE_URL;

  // Use test database when in test mode without real DATABASE_URL
  if (!url || url.startsWith('memory://') || process.env.NODE_ENV === 'test') {
    const testDb = await createTestDatabase();
    dbInstance = testDb.db;
    poolInstance = testDb.pool;
    return testDb;
  }

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });

  const db = drizzle(pool, { schema });
  dbInstance = db;
  poolInstance = pool;
  return { db, pool };
}

export function getDb(): AppDatabase {
  if (!dbInstance) {
    throw new Error('Database has not been initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

export function getPool(): pg.Pool {
  if (!poolInstance) {
    throw new Error('Database pool has not been initialized. Call initDatabase() first.');
  }
  return poolInstance;
}
