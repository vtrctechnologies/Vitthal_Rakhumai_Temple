import { LiveCategory, LiveProgram } from './live.model.js';
import cloudinary from '../../config/cloudinary.js';

// ==========================================
// CATEGORY CONTROLLERS
// ==========================================

// Get all categories (Public)
export const getCategories = async (req, res) => {
  try {
    const categories = await LiveCategory.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get all categories (Admin)
export const getCategoriesAdmin = async (req, res) => {
  try {
    const categories = await LiveCategory.find().sort({ order: 1, name: 1 });
    res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const category = await LiveCategory.create(req.body);
    res.status(201).json({
      status: 'success',
      data: category
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const category = await LiveCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    // Check if category is used in any programs
    const programsCount = await LiveProgram.countDocuments({ category: req.params.id });
    if (programsCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category that is assigned to programs. Reassign or delete the programs first.'
      });
    }

    const category = await LiveCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// PROGRAM CONTROLLERS
// ==========================================

// Get all programs with filtering
export const getLivePrograms = async (req, res) => {
  try {
    const { category, year, active } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (year) filter.year = parseInt(year);
    if (active === 'true') filter.isActive = true;
    else if (active === 'false') filter.isActive = false;
    // if active === 'all', we don't apply isActive filter

    const programs = await LiveProgram.find(filter)
      .populate('category', 'name')
      .sort({ startTimestamp: -1 });

    res.status(200).json({
      status: 'success',
      results: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get available years for programs
export const getLiveProgramYears = async (req, res) => {
  try {
    const years = await LiveProgram.distinct('year');
    years.sort((a, b) => b - a);
    
    res.status(200).json({
      status: 'success',
      data: years
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get single program
export const getLiveProgram = async (req, res) => {
  try {
    const program = await LiveProgram.findById(req.params.id).populate('category', 'name');
    if (!program) {
      return res.status(404).json({ status: 'error', message: 'Program not found' });
    }
    res.status(200).json({
      status: 'success',
      data: program
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create program
export const createLiveProgram = async (req, res) => {
  try {
    const programData = { ...req.body };
    
    // Parse social links if they exist as separate fields
    programData.socialLinks = {
      youtube: req.body.youtube || '',
      facebook: req.body.facebook || '',
      instagram: req.body.instagram || '',
      twitter: req.body.twitter || '',
      other: req.body.other || ''
    };

    // Parse boolean fields from FormData
    if (req.body.isActive !== undefined) {
      programData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    if (req.body.isLive !== undefined) {
      programData.isLive = req.body.isLive === 'true' || req.body.isLive === true;
    }
    if (req.body.year) {
      programData.year = parseInt(req.body.year);
    }

    if (req.file) {
      programData.thumbnailUrl = req.file.path;
      programData.publicId = req.file.filename;
    }

    const program = await LiveProgram.create(programData);
    res.status(201).json({
      status: 'success',
      data: program
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update program
export const updateLiveProgram = async (req, res) => {
  try {
    const program = await LiveProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ status: 'error', message: 'Program not found' });
    }

    const updateData = { ...req.body };
    
    // Update social links if provided
    if (req.body.youtube !== undefined || req.body.facebook !== undefined || req.body.other !== undefined) {
      updateData.socialLinks = {
        youtube: req.body.youtube !== undefined ? req.body.youtube : program.socialLinks?.youtube,
        facebook: req.body.facebook !== undefined ? req.body.facebook : program.socialLinks?.facebook,
        instagram: req.body.instagram !== undefined ? req.body.instagram : program.socialLinks?.instagram,
        twitter: req.body.twitter !== undefined ? req.body.twitter : program.socialLinks?.twitter,
        other: req.body.other !== undefined ? req.body.other : program.socialLinks?.other
      };
    }

    // Parse boolean fields from FormData
    if (req.body.isActive !== undefined) {
      updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    if (req.body.isLive !== undefined) {
      updateData.isLive = req.body.isLive === 'true' || req.body.isLive === true;
    }
    if (req.body.year) {
      updateData.year = parseInt(req.body.year);
    }

    // Handle Image Upload
    if (req.file) {
      // Delete old image if exists
      if (program.publicId) {
        await cloudinary.uploader.destroy(program.publicId);
      }
      updateData.thumbnailUrl = req.file.path;
      updateData.publicId = req.file.filename;
    } else if (req.body.deleteThumbnail === 'true') {
      if (program.publicId) {
        await cloudinary.uploader.destroy(program.publicId);
      }
      updateData.thumbnailUrl = '';
      updateData.publicId = '';
    }

    const updatedProgram = await LiveProgram.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: updatedProgram
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete program
export const deleteLiveProgram = async (req, res) => {
  try {
    const program = await LiveProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ status: 'error', message: 'Program not found' });
    }

    // Delete image from Cloudinary
    if (program.publicId) {
      await cloudinary.uploader.destroy(program.publicId);
    }

    await LiveProgram.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Program deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
