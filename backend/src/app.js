import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import apiRouter from './routes/api.js';
import { notFound, errorHandler } from './shared/middlewares/error.middleware.js';
import { globalLimiter } from './shared/middlewares/rateLimiter.js';

const app = express();

// Trust reverse proxy (e.g. Render, Vercel, AWS ALB) for accurate client IP detection & rate limiting
app.set('trust proxy', 1);

// HTTP Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Environment-Aware CORS Configuration
const devOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:8080',
];

const prodOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
].filter(Boolean);

const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction ? prodOrigins : [...devOrigins, ...prodOrigins];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS policy'));
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development mode)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check / root
app.get('/', (req, res) => {
  res.json({
    message: 'Vitthal Rakhumai Temple API Server is running...',
    version: '1.0.0',
    status: 'ok',
  });
});

// Mount modular API routes with global rate limiting protection
app.use('/api', globalLimiter, apiRouter);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
