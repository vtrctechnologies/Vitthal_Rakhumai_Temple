import express from 'express';
import * as ctrl from './events.controller.js';
import upload from '../../middleware/upload.middleware.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/featured', ctrl.getFeaturedEvent);
router.get('/upcoming', ctrl.getUpcomingEvents);
router.get('/years', ctrl.getEventYears);
router.get('/', ctrl.getEvents);
router.get('/:id', ctrl.getEvent);
router.get('/upcoming/:id', ctrl.getEvent); // Mapping for existing frontend calls

// Admin routes (Protected)
router.use(protect);

router.get('/admin/all', ctrl.getEventsAdmin);
router.post('/featured', ctrl.setFeaturedEvent); // Updated to dedicated function
router.put('/featured/:id', ctrl.updateEvent); // Simple mapping for now
router.post('/', upload.single('image'), ctrl.createEvent);
router.post('/upcoming', upload.single('image'), ctrl.createEvent); // Mapping
router.put('/:id', upload.single('image'), ctrl.updateEvent);
router.put('/upcoming/:id', upload.single('image'), ctrl.updateEvent); // Mapping
router.delete('/:id', ctrl.deleteEvent);
router.delete('/upcoming/:id', ctrl.deleteEvent); // Mapping

export default router;
