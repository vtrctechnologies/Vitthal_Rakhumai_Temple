import express from 'express';
import * as galleryController from './gallery.controller.js';
import upload from '../../middleware/upload.middleware.js';

const router = express.Router();

// --- Image Routes ---
router.get('/images', galleryController.getImages);
router.get('/images/admin/all', galleryController.getImagesAdmin);
router.post('/images', upload.single('image'), galleryController.createImage);
router.put('/images/:id', upload.single('image'), galleryController.updateImage);
router.delete('/images/:id', galleryController.deleteImage);

// --- Category Routes ---
router.get('/categories', galleryController.getCategories);
router.get('/categories/admin/all', galleryController.getCategoriesAdmin);
router.post('/categories', galleryController.createCategory);
router.put('/categories/:id', galleryController.updateCategory);
router.delete('/categories/:id', galleryController.deleteCategory);

export default router;
