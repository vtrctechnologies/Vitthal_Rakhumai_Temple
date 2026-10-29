import express from 'express';
import * as ctrl from './subscriber.controller.js';
import { protect, admin } from '../auth/auth.middleware.js';
import {
  otpRequestLimiter,
  otpVerifyLimiter,
} from '../../shared/middlewares/rateLimiter.js';

const router = express.Router();

// Public routes (Protected against OTP flooding and brute force)
router.post('/subscribe', otpRequestLimiter, ctrl.requestOTP);
router.post('/verify', otpVerifyLimiter, ctrl.verifyOTP);

// Admin routes (Protected - Admin only)
router.get('/', protect, admin, ctrl.getSubscribers);

export default router;
