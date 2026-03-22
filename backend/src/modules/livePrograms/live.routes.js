import express from 'express';
import * as liveController from './live.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import upload from '../../middleware/upload.middleware.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Category routes
router.get('/categories', liveController.getCategories);

// Program routes
router.get('/', liveController.getLivePrograms);
router.get('/years', liveController.getLiveProgramYears);
router.get('/:id', liveController.getLiveProgram);

// ==========================================
// ADMIN ROUTES (Protected)
// ==========================================

router.use(protect);

// Admin Category routes
router.get('/categories/admin/all', liveController.getCategoriesAdmin);
router.post('/categories', liveController.createCategory);
router.put('/categories/:id', liveController.updateCategory);
router.delete('/categories/:id', liveController.deleteCategory);

// Admin Program routes
router.post('/', upload.single('thumbnail'), liveController.createLiveProgram);
router.put('/:id', upload.single('thumbnail'), liveController.updateLiveProgram);
router.delete('/:id', liveController.deleteLiveProgram);

export default router;
