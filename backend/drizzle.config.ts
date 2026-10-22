import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL_DIRECT or DATABASE_URL must be set in environment');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
});
