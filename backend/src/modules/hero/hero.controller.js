import { HeroSection } from './hero.model.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../../shared/config/cloudinary.js';

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
      const isVideo = req.file.mimetype.startsWith('video');
      const resourceType = isVideo ? 'video' : 'image';
      const uploadResult = await uploadToCloudinary(
        req.file.path || req.file.buffer || req.file,
        'vitthal_rakhumai_hero',
        resourceType
      );
      heroData.backgroundUrl = uploadResult.secure_url;
      heroData.publicId = uploadResult.public_id;
      heroData.resourceType = resourceType;
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
      if (hero.publicId) {
        await deleteFromCloudinary(hero.publicId, hero.resourceType || 'image');
      }
      const isVideo = req.file.mimetype.startsWith('video');
      const resourceType = isVideo ? 'video' : 'image';
      const uploadResult = await uploadToCloudinary(
        req.file.path || req.file.buffer || req.file,
        'vitthal_rakhumai_hero',
        resourceType
      );
      updateData.backgroundUrl = uploadResult.secure_url;
      updateData.publicId = uploadResult.public_id;
      updateData.resourceType = resourceType;
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

    if (hero.publicId) {
      await deleteFromCloudinary(hero.publicId, hero.resourceType || 'image');
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
