import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.resolve(__dirname, '../../drizzle');

const directUrl = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

if (!directUrl) {
  console.error('Error: DATABASE_URL_DIRECT or DATABASE_URL is not set.');
  process.exit(1);
}

function maskUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    return `${u.protocol}//${u.username ? '***:***@' : ''}${u.hostname}${u.port ? `:${u.port}` : ''}${u.pathname}`;
  } catch {
    return '***';
  }
}

async function runMigrations() {
  console.log(`Connecting to database for migrations: ${maskUrl(directUrl)}`);

  const maxRetries = 3;
  let pool: pg.Pool | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      pool = new Pool({
        connectionString: directUrl,
        ssl: directUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 15000,
        max: 2,
      });

      // Test connection
      const client = await pool.connect();
      client.release();
      break;
    } catch (err: any) {
      if (pool) {
        await pool.end().catch(() => {});
        pool = null;
      }
      console.warn(`Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        console.log('Retrying in 2 seconds (waking up database)...');
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        console.error('All connection attempts failed.');
        process.exit(1);
      }
    }
  }

  if (!pool) {
    console.error('Failed to initialize database connection pool.');
    process.exit(1);
  }

  try {
    const db = drizzle(pool);
    console.log(`Running migrations from: ${migrationsFolder}`);
    await migrate(db, { migrationsFolder });
    console.log('Migrations completed successfully.');
  } catch (err: any) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

runMigrations().catch((err) => {
  console.error('Unexpected migration error:', err);
  process.exit(1);
});
