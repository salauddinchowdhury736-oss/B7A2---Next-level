import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import issuesRoutes from './modules/issues/issues.routes';

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

// Centralized error handler
app.use(errorHandler);

export default app;