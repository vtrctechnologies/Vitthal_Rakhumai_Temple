import express from 'express';
import * as ctrl from './sports.controller.js';
import { protect, admin } from '../auth/auth.middleware.js';
import upload from '../../shared/middlewares/upload.middleware.js';
import { competitionRegisterLimiter } from '../../shared/middlewares/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/', ctrl.getSports);
router.get('/years', ctrl.getSportYears);
router.get('/competitions/open', ctrl.getCompetitionsOpen);
router.post('/competitions/:id/register', competitionRegisterLimiter, ctrl.registerForCompetition);
router.get('/:id', ctrl.getSportWithWinners);

// Admin routes (Protected - Admin only)
router.use(protect, admin);
router.post('/', upload.single('image'), ctrl.createSport);
router.put('/:id', upload.single('image'), ctrl.updateSport);
router.delete('/:id', ctrl.deleteSport);
router.post('/:sportId/winners', upload.single('image'), ctrl.setWinners);

// Admin Registration Management routes
router.get('/admin/competitions', ctrl.getAllCompetitionsAdmin);
router.post('/admin/competitions', ctrl.createCompetition);
router.put('/admin/competitions/:id', ctrl.updateCompetition);
router.delete('/admin/competitions/:id', ctrl.deleteCompetition);
router.get('/admin/registrations', ctrl.getRegistrationsAdmin);
router.get('/admin/registrations/export', ctrl.exportRegistrationsExcel);
router.patch('/admin/competitions/:id/registration-toggle', ctrl.toggleCompetitionRegistration);
router.patch('/admin/registrations/:id/status', ctrl.updateRegistrationStatus);
router.delete('/admin/registrations/:id', ctrl.deleteRegistration);

export default router;
