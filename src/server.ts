import app from './app';
import env from './config/env';
import pool from './config/db';

async function start(): Promise<void> {
  // Test DB connection before accepting traffic
  await pool.query('SELECT 1');
  console.log(' PostgreSQL connected');

  app.listen(env.PORT, () => {
    console.log(` DevPulse API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

start().catch((err) => {
  console.error(' Failed to start server:', err);
  process.exit(1);
});
