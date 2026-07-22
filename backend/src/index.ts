import express from 'express';
import cors from 'cors';
import { config } from './config';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'ERPFlow Digital Warehouse OS API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server locally (bypass listening when running on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`🚀 ERPFlow Backend API running at http://localhost:${config.port}`);
    console.log(`📡 Health Check: http://localhost:${config.port}/health`);
  });
}

export default app;
