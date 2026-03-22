import express from 'express';
import * as ctrl from './sports.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import upload from '../../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', ctrl.getSports);
router.get('/years', ctrl.getSportYears);
router.get('/:id', ctrl.getSportWithWinners);

// Admin routes
router.use(protect);
router.post('/', upload.single('image'), ctrl.createSport);
router.put('/:id', upload.single('image'), ctrl.updateSport);
router.delete('/:id', ctrl.deleteSport);
router.post('/:sportId/winners', upload.single('image'), ctrl.setWinners);

export default router;
