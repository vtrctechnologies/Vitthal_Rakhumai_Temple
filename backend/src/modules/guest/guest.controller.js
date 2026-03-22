import { Guest } from './guest.model.js';
import cloudinary from '../../config/cloudinary.js';

export const getGuests = async (req, res) => {
  try {
    const { year, limit = 100 } = req.query;
    const filter = { isActive: true };

    if (year) filter.year = parseInt(year);

    const guests = await Guest.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: guests.length,
      data: guests
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getGuestsAdmin = async (req, res) => {
  try {
    const { year } = req.query;
    const filter = {};

    if (year) filter.year = parseInt(year);

    const guests = await Guest.find(filter)
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: guests.length,
      data: guests
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createGuest = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Please upload an image' });
    }

    const { name, prize, description, year, order, isActive } = req.body;

    const newGuest = await Guest.create({
      name,
      prize,
      description,
      imageUrl: req.file.path,
      publicId: req.file.filename,
      year: parseInt(year) || new Date().getFullYear(),
      order: parseInt(order) || 0,
      isActive: isActive === 'true' || isActive === true
    });

    res.status(201).json({ status: 'success', data: newGuest });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateGuest = async (req, res) => {
  try {
    let guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ status: 'error', message: 'Guest not found' });

    const updateData = { ...req.body };

    if (req.file) {
      if (guest.publicId) {
        await cloudinary.uploader.destroy(guest.publicId);
      }
      updateData.imageUrl = req.file.path;
      updateData.publicId = req.file.filename;
    }

    if (updateData.year) updateData.year = parseInt(updateData.year);
    if (updateData.order) updateData.order = parseInt(updateData.order);
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    }

    const updatedGuest = await Guest.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: updatedGuest });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ status: 'error', message: 'Guest not found' });

    if (guest.publicId) {
      await cloudinary.uploader.destroy(guest.publicId);
    }

    await Guest.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
