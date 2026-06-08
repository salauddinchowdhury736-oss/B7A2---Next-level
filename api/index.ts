import app from '../src/app';
import env from '../src/config/env';
import pool from '../src/config/db';

// Test DB connection
pool.query('SELECT 1').catch((err) => {
  console.error('Database connection failed:', err);
});

export default app;
