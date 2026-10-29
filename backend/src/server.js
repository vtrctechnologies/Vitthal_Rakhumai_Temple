import dotenv from 'dotenv';
dotenv.config();

import connectDB from './shared/config/db.js';
import app from './app.js';
import { getJwtSecret } from './shared/utils/generateToken.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Fail fast: Validate critical security environment variables on startup (SEC-002)
try {
  getJwtSecret();
} catch (err) {
  console.error(`\n❌ ${err.message}\n`);
  process.exit(1);
}

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});
