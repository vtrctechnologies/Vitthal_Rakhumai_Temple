import express from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import categoryRoutes from '../modules/category/category.routes.js';
import galleryRoutes from '../modules/gallery/gallery.routes.js';
import eventsRoutes from '../modules/events/events.routes.js';
import bannerRoutes from '../modules/banner/banner.routes.js';
import committeeRoutes from '../modules/committee/committee.routes.js';
import contactRoutes from '../modules/contact/contact.routes.js';
import guestRoutes from '../modules/guest/guest.routes.js';
import heroRoutes from '../modules/hero/hero.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import sportsRoutes from '../modules/sports/sports.routes.js';
import liveProgramsRoutes from '../modules/livePrograms/live.routes.js';
import subscriberRoutes from '../modules/subscriber/subscriber.routes.js';
import donationRoutes from '../modules/donation/donation.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/gallery', galleryRoutes);
router.use('/events', eventsRoutes);
router.use('/banners', bannerRoutes);
router.use('/committee', committeeRoutes);
router.use('/contact', contactRoutes);
router.use('/guests', guestRoutes);
router.use('/hero', heroRoutes);
router.use('/notifications', notificationRoutes);
router.use('/sports', sportsRoutes);
router.use('/live-programs', liveProgramsRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/donations', donationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
