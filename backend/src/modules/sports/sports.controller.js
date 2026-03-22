import { Sport } from './sport.model.js';
import { Winner } from './winner.model.js';
import cloudinary from '../../config/cloudinary.js';

// Get all sports (with year filter)
export const getSports = async (req, res) => {
  try {
    const { year, active } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year);
    if (active === 'true') filter.isActive = true;

    const sports = await Sport.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: sports });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get single sport with winners
export const getSportWithWinners = async (req, res) => {
  try {
    const { id } = req.params;
    const sport = await Sport.findById(id);
    if (!sport) return res.status(404).json({ status: 'error', message: 'Sport not found' });

    const winnersList = await Winner.find({ sportId: id });
    const winners = {
      first: winnersList.find(w => w.position === 'first') || null,
      second: winnersList.find(w => w.position === 'second') || null,
      third: winnersList.find(w => w.position === 'third') || null
    };

    res.status(200).json({ status: 'success', data: { sport, winners } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get available years
export const getSportYears = async (req, res) => {
  try {
    const years = await Sport.distinct('year');
    res.status(200).json({ status: 'success', data: years.sort((a, b) => b - a) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create sport (Admin)
export const createSport = async (req, res) => {
  try {
    const { name, title, description, year } = req.body;
    const sportData = { name, title, description, year: parseInt(year) || new Date().getFullYear() };

    if (req.file) {
      sportData.imageUrl = req.file.path;
      sportData.publicId = req.file.filename;
    }

    const sport = await Sport.create(sportData);
    res.status(201).json({ status: 'success', data: sport });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update sport (Admin)
export const updateSport = async (req, res) => {
  try {
    const { id } = req.params;
    const sport = await Sport.findById(id);
    if (!sport) return res.status(404).json({ status: 'error', message: 'Sport not found' });

    const updateData = { ...req.body };
    if (updateData.year) updateData.year = parseInt(updateData.year);

    if (req.file) {
      if (sport.publicId) {
        await cloudinary.uploader.destroy(sport.publicId);
      }
      updateData.imageUrl = req.file.path;
      updateData.publicId = req.file.filename;
    }

    const updatedSport = await Sport.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ status: 'success', data: updatedSport });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Set winners (Admin)
export const setWinners = async (req, res) => {
  try {
    const { sportId } = req.params;
    const { teamName, captain, members, position } = req.body;

    // Check if winner position already exists for this sport
    let winner = await Winner.findOne({ sportId, position });

    let membersData = members;
    if (typeof members === "string") {
      try {
        if (members.startsWith("[")) {
          membersData = JSON.parse(members);
        } else {
          membersData = members.split(",").map((m) => m.trim());
        }
      } catch (e) {
        membersData = [members];
      }
    }

    const winnerData = {
      sportId,
      teamName,
      captain,
      members: Array.isArray(membersData) ? membersData : [membersData],
      position
    };

    if (req.file) {
      if (winner && winner.publicId) {
        await cloudinary.uploader.destroy(winner.publicId);
      }
      winnerData.imageUrl = req.file.path;
      winnerData.publicId = req.file.filename;
    }

    if (winner) {
      winner = await Winner.findByIdAndUpdate(winner._id, winnerData, { new: true });
    } else {
      winner = await Winner.create(winnerData);
    }

    res.status(200).json({ status: 'success', data: winner });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete sport (Admin)
export const deleteSport = async (req, res) => {
  try {
    const { id } = req.params;
    const sport = await Sport.findById(id);
    if (!sport) return res.status(404).json({ status: 'error', message: 'Sport not found' });

    if (sport.publicId) {
      await cloudinary.uploader.destroy(sport.publicId);
    }

    // Delete associated winners
    const winners = await Winner.find({ sportId: id });
    for (const winner of winners) {
      if (winner.publicId) {
        await cloudinary.uploader.destroy(winner.publicId);
      }
    }
    await Winner.deleteMany({ sportId: id });

    await Sport.findByIdAndDelete(id);
    res.status(200).json({ status: 'success', message: 'Sport and winners deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
