import express from 'express';
import authRoutes from './modules/auth/auth.routes';
import issuesRoutes from './modules/issues/issues.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();


app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});


app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

app.get('/', (_req, res) => {
  res.json({ 
    success: true, 
    message: 'Welcome to DevPulse API', 
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      issues: '/api/issues'
    }
  });
});

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'DevPulse API is running.' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});


app.use(errorHandler);

export default app;
