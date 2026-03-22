import { HeroSection } from './hero.model.js';
import cloudinary from '../../config/cloudinary.js';

// Get active hero section (Public)
export const getActiveHero = async (req, res) => {
  try {
    const hero = await HeroSection.findOne({ isActive: true }).sort({ updatedAt: -1 });
    res.status(200).json({
      status: 'success',
      data: hero
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// List all hero sections (Admin)
export const listHeroes = async (req, res) => {
  try {
    const heroes = await HeroSection.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: heroes.length,
      data: heroes
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create hero section
export const createHero = async (req, res) => {
  try {
    const heroData = { ...req.body };

    // Parse boolean fields from FormData
    if (req.body.isActive !== undefined) {
      heroData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }

    if (req.file) {
      heroData.backgroundUrl = req.file.path;
      heroData.publicId = req.file.filename;
      heroData.resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    const hero = await HeroSection.create(heroData);
    res.status(201).json({
      status: 'success',
      data: hero
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update hero section
export const updateHero = async (req, res) => {
  try {
    const hero = await HeroSection.findById(req.params.id);
    if (!hero) {
      return res.status(404).json({ status: 'error', message: 'Hero section not found' });
    }

    const updateData = { ...req.body };

    // Parse boolean fields from FormData
    if (req.body.isActive !== undefined) {
      updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }

    if (req.file) {
      // Delete old media
      if (hero.publicId) {
        await cloudinary.uploader.destroy(hero.publicId, {
          resource_type: hero.resourceType || 'image'
        });
      }
      updateData.backgroundUrl = req.file.path;
      updateData.publicId = req.file.filename;
      updateData.resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    const updatedHero = await HeroSection.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: updatedHero
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete hero section
export const deleteHero = async (req, res) => {
  try {
    const hero = await HeroSection.findById(req.params.id);
    if (!hero) {
      return res.status(404).json({ status: 'error', message: 'Hero section not found' });
    }

    // Delete media from Cloudinary
    if (hero.publicId) {
      await cloudinary.uploader.destroy(hero.publicId, {
        resource_type: hero.resourceType || 'image'
      });
    }

    await HeroSection.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Hero section deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
