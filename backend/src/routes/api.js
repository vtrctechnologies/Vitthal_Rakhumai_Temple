import express from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import bannerRoutes from '../modules/banner/banner.routes.js';
import galleryRoutes from '../modules/gallery/gallery.routes.js';
import committeeRoutes from '../modules/committee/committee.routes.js';
import eventsRoutes from '../modules/events/events.routes.js';
import sportsRoutes from '../modules/sports/sports.routes.js';
import liveProgramsRoutes from '../modules/livePrograms/live.routes.js';
import heroRoutes from '../modules/hero/hero.routes.js';
import subscriberRoutes from '../modules/subscriber/subscriber.routes.js';
import contactRoutes from '../modules/contact/contact.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import guestRoutes from '../modules/guest/guest.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/banners', bannerRoutes);
router.use('/gallery', galleryRoutes);
router.use('/committee', committeeRoutes);
router.use('/events', eventsRoutes);
router.use('/sports', sportsRoutes);
router.use('/live-programs', liveProgramsRoutes);
router.use('/hero', heroRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/contact', contactRoutes);
router.use('/notifications', notificationRoutes);
router.use('/guests', guestRoutes);

router.get('/health', (req, res) => res.json({ status: 'ok' }));

export default router;
