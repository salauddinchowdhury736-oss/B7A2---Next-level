import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? 'fallback_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};

export default ENV;
