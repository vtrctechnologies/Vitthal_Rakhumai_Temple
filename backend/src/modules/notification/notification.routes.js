import express from 'express';
import * as ctrl from './notification.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected (Admin only)
router.use(protect);

router.get('/', ctrl.getNotifications);
router.patch('/:id/read', ctrl.markAsRead);
router.delete('/clear', ctrl.clearNotifications);

export default router;
