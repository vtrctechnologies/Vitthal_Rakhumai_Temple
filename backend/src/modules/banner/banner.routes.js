import express from 'express';
import * as bannerController from './banner.controller.js';
import upload from '../../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', bannerController.getBanners);
router.get('/years', bannerController.getBannerYears);
router.get('/:id', bannerController.getBanner);

// Admin routes (should ideally have auth middleware)
// For now keeping it simple as per user request, but usually we add authMiddleware here
router.post('/', upload.single('image'), bannerController.createBanner);
router.put('/:id', upload.single('image'), bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

export default router;
