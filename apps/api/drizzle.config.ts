import { defineConfig } from 'drizzle-kit';
import { join } from 'node:path';
import * as dotenv from 'dotenv';

// Load from root .env file
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

export default defineConfig({
  schema: './src/db/migrations/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'user',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'library_db',
  },
});
