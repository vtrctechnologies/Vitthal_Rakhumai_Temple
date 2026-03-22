import { Banner } from './banner.model.js';
import cloudinary from '../../config/cloudinary.js';

// Get all banners with optional filtering
export const getBanners = async (req, res) => {
  try {
    const { year, active, position } = req.query;
    const filter = {};

    if (year) filter.year = parseInt(year);
    if (active) filter.isActive = active === 'true';
    if (position) filter.position = position;

    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get available years for banners
export const getBannerYears = async (req, res) => {
  try {
    const years = await Banner.distinct('year');
    // Sort years descending
    years.sort((a, b) => b - a);
    
    res.status(200).json({
      status: 'success',
      data: years
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single banner
export const getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        status: 'error',
        message: 'Banner not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create new banner
export const createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload an image or video'
      });
    }

    const { title, description, position, order, year, isActive, link } = req.body;

    const newBanner = await Banner.create({
      title,
      description,
      imageUrl: req.file.path, // Cloudinary URL
      publicId: req.file.filename, // Cloudinary Public ID
      resourceType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      position,
      order: parseInt(order) || 0,
      year: parseInt(year) || new Date().getFullYear(),
      isActive: isActive === 'true' || isActive === true,
      link
    });

    res.status(201).json({
      status: 'success',
      data: newBanner
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    let banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        status: 'error',
        message: 'Banner not found'
      });
    }

    const updateData = { ...req.body };
    
    // If new file is uploaded, delete old one from Cloudinary
    if (req.file) {
      // Delete old file if publicId exists
      if (banner.publicId) {
        await cloudinary.uploader.destroy(banner.publicId, { 
          resource_type: banner.resourceType || 'image'
        });
      }
      
      updateData.imageUrl = req.file.path;
      updateData.publicId = req.file.filename;
      updateData.resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    // Convert types
    if (updateData.order) updateData.order = parseInt(updateData.order);
    if (updateData.year) updateData.year = parseInt(updateData.year);
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: updatedBanner
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        status: 'error',
        message: 'Banner not found'
      });
    }

    // Delete from Cloudinary if publicId exists
    if (banner.publicId) {
      await cloudinary.uploader.destroy(banner.publicId, { 
        resource_type: banner.resourceType || 'image'
      });
    }

    // Delete from Database
    await Banner.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
