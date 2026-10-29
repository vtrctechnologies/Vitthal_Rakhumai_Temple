import express from 'express';
import * as heroController from './hero.controller.js';
import { protect, admin } from '../auth/auth.middleware.js';
import upload from '../../shared/middlewares/upload.middleware.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

router.get('/active', heroController.getActiveHero);

// ==========================================
// ADMIN ROUTES (Protected - Admin only)
// ==========================================

router.use(protect, admin);

router.get('/', heroController.listHeroes);
router.post('/', upload.single('background'), heroController.createHero);
router.put('/:id', upload.single('background'), heroController.updateHero);
router.delete('/:id', heroController.deleteHero);

export default router;
