import { initializeDatabase } from './dbOperations';
import { pool } from './index';

async function runSeed() {
  console.log('==============================================');
  console.log('[PostgreSQL Seed] Starting database seeding...');
  console.log('==============================================');
  const startTime = Date.now();

  try {
    await initializeDatabase();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('==============================================');
    console.log(`[PostgreSQL Seed] Successfully seeded ERP data in ${duration}s!`);
    console.log('==============================================');
  } catch (error) {
    console.error('[PostgreSQL Seed] Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runSeed();
