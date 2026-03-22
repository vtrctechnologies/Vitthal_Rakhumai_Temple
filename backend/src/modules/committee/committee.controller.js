import { Committee } from '../committee/committee.model.js';
import cloudinary from '../../config/cloudinary.js';

// Get all committee members (public)
export const getMembers = async (req, res) => {
  try {
    const { year, committeeType, active = true } = req.query;
    const filter = {};
    if (active === 'true' || active === true) filter.isActive = true;
    if (year) filter.year = parseInt(year);
    if (committeeType) filter.committeeType = committeeType;

    const members = await Committee.find(filter).sort({ order: 1, name: 1 });
    res.status(200).json({ status: 'success', data: members });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get all committee members (admin)
export const getMembersAdmin = async (req, res) => {
  try {
    const { year, committeeType } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year);
    if (committeeType) filter.committeeType = committeeType;

    const members = await Committee.find(filter).sort({ order: 1, name: 1 });
    res.status(200).json({ status: 'success', data: members });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get available years for committee
export const getCommitteeYears = async (req, res) => {
  try {
    const years = await Committee.distinct('year');
    res.status(200).json({ status: 'success', data: years.sort((a, b) => b - a) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get single member
export const getMember = async (req, res) => {
  try {
    const member = await Committee.findById(req.params.id);
    if (!member) return res.status(404).json({ status: 'error', message: 'Member not found' });
    res.status(200).json({ status: 'success', data: member });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create committee member
export const createMember = async (req, res) => {
  try {
    const { name, role, bio, position, committeeType, year, order, isActive } = req.body;

    const memberData = {
      name,
      role,
      bio,
      position,
      committeeType,
      year: parseInt(year) || new Date().getFullYear(),
      order: parseInt(order) || 0,
      isActive: isActive === 'true' || isActive === true
    };

    if (req.file) {
      memberData.imageUrl = req.file.path;
      memberData.publicId = req.file.filename;
    }

    const member = await Committee.create(memberData);
    res.status(201).json({ status: 'success', data: member });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update committee member
export const updateMember = async (req, res) => {
  try {
    const member = await Committee.findById(req.params.id);
    if (!member) return res.status(404).json({ status: 'error', message: 'Member not found' });

    const updateData = { ...req.body };

    if (req.file) {
      // Delete old image if exists
      if (member.publicId) {
        await cloudinary.uploader.destroy(member.publicId);
      }
      updateData.imageUrl = req.file.path;
      updateData.publicId = req.file.filename;
    }

    if (updateData.year) updateData.year = parseInt(updateData.year);
    if (updateData.order) updateData.order = parseInt(updateData.order);
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    }

    const updatedMember = await Committee.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: updatedMember });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete committee member
export const deleteMember = async (req, res) => {
  try {
    const member = await Committee.findById(req.params.id);
    if (!member) return res.status(404).json({ status: 'error', message: 'Member not found' });

    // Delete image from Cloudinary
    if (member.publicId) {
      await cloudinary.uploader.destroy(member.publicId);
    }

    await Committee.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
