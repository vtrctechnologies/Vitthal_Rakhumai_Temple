import express from 'express';
import * as ctrl from './message.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/send', ctrl.sendMessage);

// Admin routes (Protected)
router.get('/messages', protect, ctrl.getMessages);
router.delete('/messages/:id', protect, ctrl.deleteMessage);

export default router;
