import app from './app';
import env from './config/env';
import pool from './config/db';

async function start(): Promise<void> {
  // Test DB connection (don't block startup if it fails)
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connected');
  } catch (err) {
    console.warn('⚠️ Database unavailable, but server starting anyway');
  }

  app.listen(env.PORT, () => {
    console.log(`✅ DevPulse API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
