import express from 'express';
import * as committeeController from './committee.controller.js';
import upload from '../../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', committeeController.getMembers);
router.get('/years', committeeController.getCommitteeYears);
router.get('/:id', committeeController.getMember);

// Admin routes (should be protected by auth middleware in production)
router.get('/admin/all', committeeController.getMembersAdmin);
router.post('/', upload.single('image'), committeeController.createMember);
router.put('/:id', upload.single('image'), committeeController.updateMember);
router.delete('/:id', committeeController.deleteMember);

export default router;
