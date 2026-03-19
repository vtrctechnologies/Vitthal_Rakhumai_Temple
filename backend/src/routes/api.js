import express from 'express';
import { Gallery } from '../models/galleryModel.js';
import { Event } from '../models/eventModel.js';
import { Committee } from '../models/committeeModel.js';

import apiRouter from '../modules/auth/auth.routes.js';

const router = express.Router();

router.use('/auth', apiRouter);

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.get('/gallery', async (req, res) => {
  try {
    const items = await Gallery.find().limit(100);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

router.get('/events', async (req, res) => {
  try {
    const items = await Event.find().sort({ date: -1 }).limit(100);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/committee', async (req, res) => {
  try {
    const items = await Committee.find().limit(100);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch committee' });
  }
});

export default router;
