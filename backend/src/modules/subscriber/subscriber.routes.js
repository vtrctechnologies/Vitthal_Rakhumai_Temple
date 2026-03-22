import express from 'express';
import * as ctrl from './subscriber.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/subscribe', ctrl.requestOTP);
router.post('/verify', ctrl.verifyOTP);

// Admin routes (Protected)
router.get('/', protect, ctrl.getSubscribers);

export default router;
