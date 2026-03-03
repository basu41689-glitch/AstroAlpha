import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  // CORS_ORIGINS should list trusted frontend domains only (e.g. https://ai-stock-frontend.onrender.com)
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
    : [],
};
