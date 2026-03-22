import express from 'express';
import * as guestController from './guest.controller.js';
import upload from '../../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', guestController.getGuests);
router.get('/admin/all', guestController.getGuestsAdmin);
router.post('/', upload.single('image'), guestController.createGuest);
router.put('/:id', upload.single('image'), guestController.updateGuest);
router.delete('/:id', guestController.deleteGuest);

export default router;
