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
  console.log('📋 Configuration:');
  console.log(`   NODE_ENV: ${ENV.NODE_ENV}`);
  console.log(`   PORT: ${ENV.PORT}`);
  console.log(`   DATABASE_URL: ${ENV.DATABASE_URL}`);
  
  try {
    // Test database connection (don't block startup if it fails)
    console.log('\n🔄 Attempting to connect to Neon database...');
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:');
    if (error instanceof Error) {
      console.error('   Error:', error.message);
      console.error('   Code:', (error as any).code);
    } else {
      console.error('   Error:', String(error));
    }
    console.warn('⚠️ Continuing without database...');
  }

  app.listen(ENV.PORT, () => {
    console.log(`\n✅ DevPulse API running on http://localhost:${ENV.PORT} [${ENV.NODE_ENV}]`);
  });
}

start();

export default app;
