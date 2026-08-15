import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const hasSqlHost = Boolean(process.env.SQL_HOST);
const connectionString = process.env.DATABASE_URL;

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  schemaFilter: ['public'],
  dbCredentials:
    hasSqlHost
      ? {
          host: process.env.SQL_HOST || 'localhost',
          port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
          user: process.env.SQL_ADMIN_USER || process.env.SQL_USER || 'postgres',
          password: process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || 'postgres',
          database: process.env.SQL_DB_NAME || 'postgres',
          ssl: false,
        }
      : connectionString
      ? {
          url: connectionString,
          ssl:
            process.env.NODE_ENV === 'production' || connectionString.includes('render.com') || connectionString.includes('sslmode=require')
              ? { rejectUnauthorized: false }
              : false,
        }
      : {
          host: process.env.PGHOST || 'localhost',
          port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || 'postgres',
          database: process.env.PGDATABASE || 'postgres',
          ssl: false,
        },
  verbose: true,
});

