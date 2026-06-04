import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ENV } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import issuesRoutes from './modules/issues/issues.routes';
import pool from './config/db';

dotenv.config();

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'DevPulse API' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Centralized error handler — must be last
app.use(errorHandler);

async function start(): Promise<void> {
  try {
    // Test database connection before accepting traffic
    await pool.query('SELECT 1');
    console.log(' PostgreSQL connected');

    app.listen(ENV.PORT, () => {
      console.log(` DevPulse API running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
    });
  } catch (error) {
    console.error(' Database connection failed:', error instanceof Error ? error.message : String(error));
    console.error(' DATABASE_URL:', process.env.DATABASE_URL);
    process.exit(1);
  }
}

start();

export default app;
