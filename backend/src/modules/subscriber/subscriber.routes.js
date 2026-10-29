import express from 'express';
import * as ctrl from './subscriber.controller.js';
import { protect, admin } from '../auth/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/subscribe', ctrl.requestOTP);
router.post('/verify', ctrl.verifyOTP);

// Admin routes (Protected - Admin only)
router.get('/', protect, admin, ctrl.getSubscribers);

export default router;
