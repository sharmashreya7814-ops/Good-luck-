import express, { Express } from 'express';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Global Error Handler for all routes
  app.use(errorHandler);

  return app;
}

export const app = createApp();
