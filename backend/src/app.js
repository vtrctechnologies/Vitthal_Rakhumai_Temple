import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes/api.js';
import { notFound, errorHandler } from './shared/middlewares/error.middleware.js';

const app = express();

// Allowed Origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:8080',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
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

// Static Files (for local uploaded media)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check / root
app.get('/', (req, res) => {
  res.json({
    message: 'Vitthal Rakhumai Temple API Server is running...',
    version: '1.0.0',
    status: 'ok',
  });
});

// Mount modular API routes
app.use('/api', apiRouter);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
