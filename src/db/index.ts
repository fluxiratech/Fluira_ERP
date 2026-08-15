import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import dotenv from 'dotenv';

dotenv.config();

// Global connection pool caching to persist across hot-reloads and requests
declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = (): Pool => {
  if (!global._postgresPool) {
    const isProduction = process.env.NODE_ENV === 'production';
    const databaseUrl = process.env.DATABASE_URL;
    const hasSqlHost = Boolean(process.env.SQL_HOST);

    // If running in environment with explicit SQL_HOST (Cloud SQL in AI Studio), use SQL_HOST
    if (hasSqlHost) {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
        user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres',
        password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || 'postgres',
        database: process.env.SQL_DB_NAME || 'postgres',
        ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        max: 15,
        connectionTimeoutMillis: 20000,
        idleTimeoutMillis: 30000,
      });
    } else if (databaseUrl) {
      // Running on Render or external hosting where DATABASE_URL is provided
      const isRender = databaseUrl.includes('render.com') || databaseUrl.includes('dpg-');
      const needsSsl = isProduction || isRender || databaseUrl.includes('sslmode=require') || databaseUrl.includes('ssl=true');

      global._postgresPool = new Pool({
        connectionString: databaseUrl,
        ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
        max: 15,
        connectionTimeoutMillis: 20000,
        idleTimeoutMillis: 30000,
      });
    } else {
      // Local fallback
      global._postgresPool = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'postgres',
        ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        max: 15,
        connectionTimeoutMillis: 20000,
        idleTimeoutMillis: 30000,
      });
    }

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('[PostgreSQL Pool] Unexpected error on idle client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance
const pool = createPool();

// Initialize Drizzle with the pool and schema
export const db = drizzle(pool, { schema });
export { pool, schema };

