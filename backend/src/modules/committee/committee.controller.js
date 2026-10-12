import { Committee } from '../committee/committee.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../shared/config/cloudinary.js';

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
    const {
      name,
      nameMarathi,
      role,
      bio,
      position,
      designation,
      post,
      positionMarathi,
      roleMarathi,
      designationMarathi,
      committeeType,
      year,
      order,
      isActive,
    } = req.body;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const finalPos = (position || role || designation || post || 'Member').trim();
    const finalPosMr = (positionMarathi || roleMarathi || designationMarathi || '').trim();

    const memberData = {
      name: (name || '').trim(),
      nameMarathi: (nameMarathi || '').trim(),
      role: finalPos,
      position: finalPos,
      positionMarathi: finalPosMr,
      roleMarathi: finalPosMr,
      bio,
      committeeType: committeeType || 'register',
      year: targetYear,
      order: parseInt(order) || 0,
      isActive: isActive === 'false' || isActive === false ? false : true,
    };

    if (req.file) {
      const folder = `vrtemple/committee/${targetYear}`;
      const uploadResult = await uploadToCloudinary(req.file.buffer, folder, 'image');
      memberData.imageUrl = uploadResult.secure_url;
      memberData.publicId = uploadResult.public_id;
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
      if (member.publicId) {
        await deleteFromCloudinary(member.publicId, 'image');
      }
      const targetYear = parseInt(updateData.year) || member.year || new Date().getFullYear();
      const folder = `vrtemple/committee/${targetYear}`;
      const uploadResult = await uploadToCloudinary(req.file.buffer, folder, 'image');
      updateData.imageUrl = uploadResult.secure_url;
      updateData.publicId = uploadResult.public_id;
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

    if (member.publicId) {
      await deleteFromCloudinary(member.publicId, 'image');
    }

    await Committee.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
