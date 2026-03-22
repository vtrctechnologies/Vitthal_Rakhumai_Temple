import { Gallery } from '../gallery/gallery.model.js';
import { Category } from '../gallery/category.model.js';
import cloudinary from '../../config/cloudinary.js';

// --- Category Controllers ---

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ status: 'success', data: category });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    // Check if category has images
    const imagesCount = await Gallery.countDocuments({ category: req.params.id });
    if (imagesCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category that has images. Move or delete images first.'
      });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- Gallery Controllers ---

export const getImages = async (req, res) => {
  try {
    const { category, year, limit = 100 } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'all') filter.category = category;
    if (year) filter.year = parseInt(year);

    const images = await Gallery.find(filter)
      .populate('category', 'name')
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: images.length,
      data: images
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getImagesAdmin = async (req, res) => {
  try {
    const { category, year } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (year) filter.year = parseInt(year);

    const images = await Gallery.find(filter)
      .populate('category', 'name')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: images.length,
      data: images
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Please upload an image or video' });
    }

    const { title, description, category, year, order, isActive } = req.body;

    const newImage = await Gallery.create({
      title,
      description,
      imageUrl: req.file.path,
      publicId: req.file.filename,
      resourceType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      category,
      year: parseInt(year) || new Date().getFullYear(),
      order: parseInt(order) || 0,
      isActive: isActive === 'true' || isActive === true
    });

    res.status(201).json({ status: 'success', data: newImage });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateImage = async (req, res) => {
  try {
    let image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ status: 'error', message: 'Image not found' });

    const updateData = { ...req.body };

    if (req.file) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId, {
          resource_type: image.resourceType || 'image'
        });
      }
      updateData.imageUrl = req.file.path;
      updateData.publicId = req.file.filename;
      updateData.resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    if (updateData.year) updateData.year = parseInt(updateData.year);
    if (updateData.order) updateData.order = parseInt(updateData.order);
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    }

    const updatedImage = await Gallery.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('category', 'name');

    res.status(200).json({ status: 'success', data: updatedImage });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ status: 'error', message: 'Image not found' });

    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId, {
        resource_type: image.resourceType || 'image'
      });
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
