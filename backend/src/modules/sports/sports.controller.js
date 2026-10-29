import { Sport } from './sport.model.js';
import { Winner } from './winner.model.js';
import { Registration } from './registration.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../shared/config/cloudinary.js';
import { escapeRegex } from '../../shared/utils/escapeRegex.js';

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
    const {
      name,
      title,
      description,
      year,
      isRegistrationOpen,
      registrationStartDate,
      registrationEndDate,
      category,
      entryFee,
      prizes,
      rules,
      maxParticipants,
      registrationType,
    } = req.body;

    const targetYear = parseInt(year, 10) || new Date().getFullYear();
    const sportData = {
      name: name?.trim(),
      title: title?.trim(),
      description: description?.trim() || '',
      year: targetYear,
      isRegistrationOpen: isRegistrationOpen === 'true' || isRegistrationOpen === true,
      registrationStartDate: registrationStartDate ? new Date(registrationStartDate) : null,
      registrationEndDate: registrationEndDate ? new Date(registrationEndDate) : null,
      category: category?.trim() || 'Sports',
      entryFee: entryFee?.trim() || 'Free',
      prizes: prizes?.trim() || '',
      rules: rules?.trim() || '',
      maxParticipants: parseInt(maxParticipants, 10) || 0,
      registrationType: registrationType || 'individual',
    };

    if (req.file) {
      const folder = `vrtemple/sports/${targetYear}`;
      const uploadResult = await uploadToCloudinary(req.file.path || req.file.buffer || req.file, folder, 'image');
      sportData.imageUrl = uploadResult.secure_url;
      sportData.publicId = uploadResult.public_id;
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
    if (updateData.year) updateData.year = parseInt(updateData.year, 10);
    if (updateData.isRegistrationOpen !== undefined) {
      updateData.isRegistrationOpen =
        updateData.isRegistrationOpen === 'true' || updateData.isRegistrationOpen === true;
    }
    if (updateData.registrationStartDate) {
      updateData.registrationStartDate = new Date(updateData.registrationStartDate);
    }
    if (updateData.registrationEndDate) {
      updateData.registrationEndDate = new Date(updateData.registrationEndDate);
    }
    if (updateData.maxParticipants !== undefined) {
      updateData.maxParticipants = parseInt(updateData.maxParticipants, 10) || 0;
    }

    if (req.file) {
      if (sport.publicId) {
        await deleteFromCloudinary(sport.publicId, 'image');
      }
      const targetYear = updateData.year || sport.year || new Date().getFullYear();
      const folder = `vrtemple/sports/${targetYear}`;
      const uploadResult = await uploadToCloudinary(req.file.path || req.file.buffer || req.file, folder, 'image');
      updateData.imageUrl = uploadResult.secure_url;
      updateData.publicId = uploadResult.public_id;
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

    let winner = await Winner.findOne({ sportId, position });

    let membersData = members;
    if (typeof members === 'string') {
      try {
        if (members.startsWith('[')) {
          membersData = JSON.parse(members);
        } else {
          membersData = members.split(',').map(m => m.trim());
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
        await deleteFromCloudinary(winner.publicId, 'image');
      }
      const sport = await Sport.findById(sportId);
      const targetYear = sport ? sport.year : new Date().getFullYear();
      const folder = `vrtemple/sports/winners/${targetYear}`;
      const uploadResult = await uploadToCloudinary(req.file.path || req.file.buffer || req.file, folder, 'image');
      winnerData.imageUrl = uploadResult.secure_url;
      winnerData.publicId = uploadResult.public_id;
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
      await deleteFromCloudinary(sport.publicId, 'image');
    }

    const winners = await Winner.find({ sportId: id });
    for (const winner of winners) {
      if (winner.publicId) {
        await deleteFromCloudinary(winner.publicId, 'image');
      }
    }
    await Winner.deleteMany({ sportId: id });

    await Sport.findByIdAndDelete(id);
    res.status(200).json({ status: 'success', message: 'Sport and winners deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==================== COMPETITION REGISTRATION ENDPOINTS ====================

// @desc    Get all competitions with registration status and timers (Public)
// @route   GET /api/sports/competitions/open
export const getCompetitionsOpen = async (req, res) => {
  try {
    const competitions = await Sport.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Attach participant counts
    const competitionIds = competitions.map((c) => c._id);
    const counts = await Registration.aggregate([
      { $match: { sport: { $in: competitionIds } } },
      { $group: { _id: '$sport', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const now = new Date();
    const enriched = competitions.map((comp) => {
      const regCount = countMap[comp._id.toString()] || 0;
      let status = 'closed';

      if (comp.isRegistrationOpen) {
        if (comp.registrationStartDate && new Date(comp.registrationStartDate) > now) {
          status = 'scheduled'; // Opens in future
        } else if (comp.registrationEndDate && new Date(comp.registrationEndDate) < now) {
          status = 'expired'; // Closed because time ended
        } else if (comp.maxParticipants > 0 && regCount >= comp.maxParticipants) {
          status = 'full';
        } else {
          status = 'open';
        }
      }

      return {
        ...comp,
        registrationCount: regCount,
        computedStatus: status,
      };
    });

    res.status(200).json({ status: 'success', data: enriched });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Register participant for a sport / competition (Public)
// @route   POST /api/sports/competitions/:id/register
export const registerForCompetition = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      participantName,
      teamName,
      captainName,
      mobile,
      email,
      age,
      gender,
      villageOrCity,
      playersCount,
      playerNames,
      notes,
    } = req.body;

    const sport = await Sport.findById(id);
    if (!sport || !sport.isActive) {
      return res.status(404).json({ status: 'error', message: 'Competition not found or inactive' });
    }

    const isTeam = sport.registrationType === 'team';
    const resolvedName = (isTeam ? (teamName || participantName) : (participantName || teamName) || '').trim();

    if (!resolvedName) {
      return res.status(400).json({
        status: 'error',
        message: isTeam ? 'Team name is required' : 'Player name is required',
      });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ status: 'error', message: 'Contact mobile number is required' });
    }

    const now = new Date();
    if (!sport.isRegistrationOpen) {
      return res.status(400).json({ status: 'error', message: 'Registration is currently closed for this event.' });
    }
    if (sport.registrationStartDate && new Date(sport.registrationStartDate) > now) {
      return res.status(400).json({ status: 'error', message: 'Registration has not started yet.' });
    }
    if (sport.registrationEndDate && new Date(sport.registrationEndDate) < now) {
      return res.status(400).json({ status: 'error', message: 'Registration deadline has passed.' });
    }

    // Check capacity limit if set
    if (sport.maxParticipants > 0) {
      const currentCount = await Registration.countDocuments({ sport: sport._id });
      if (currentCount >= sport.maxParticipants) {
        return res.status(400).json({ status: 'error', message: 'Maximum participant limit reached for this competition.' });
      }
    }

    let parsedPlayerNames = [];
    if (playerNames) {
      if (Array.isArray(playerNames)) {
        parsedPlayerNames = playerNames;
      } else if (typeof playerNames === 'string') {
        parsedPlayerNames = playerNames.split(',').map((p) => p.trim()).filter(Boolean);
      }
    }

    const registration = await Registration.create({
      sport: sport._id,
      sportName: sport.name || sport.title,
      participantName: resolvedName,
      teamName: isTeam ? resolvedName : (teamName ? teamName.trim() : ''),
      captainName: captainName ? captainName.trim() : '',
      mobile: mobile.trim(),
      email: email ? email.trim() : '',
      age: age ? parseInt(age, 10) : null,
      gender: gender || 'male',
      villageOrCity: villageOrCity ? villageOrCity.trim() : '',
      playersCount: playersCount ? parseInt(playersCount, 10) : 1,
      playerNames: parsedPlayerNames,
      notes: notes ? notes.trim() : '',
      status: 'confirmed',
    });

    res.status(201).json({
      status: 'success',
      message: 'Registration submitted successfully!',
      data: registration,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all registrations with search & filters (Admin)
// @route   GET /api/sports/admin/registrations
export const getRegistrationsAdmin = async (req, res) => {
  try {
    const { sportId, status, search, page = 1, limit = 100 } = req.query;
    const query = {};

    if (sportId && sportId !== 'all') query.sport = sportId;
    if (status && status !== 'all') query.status = status;
    const sanitizedSearch = escapeRegex(search);
    if (sanitizedSearch) {
      query.$or = [
        { participantName: { $regex: sanitizedSearch, $options: 'i' } },
        { teamName: { $regex: sanitizedSearch, $options: 'i' } },
        { mobile: { $regex: sanitizedSearch, $options: 'i' } },
        { sportName: { $regex: sanitizedSearch, $options: 'i' } },
        { villageOrCity: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [total, registrations] = await Promise.all([
      Registration.countDocuments(query),
      Registration.find(query)
        .populate('sport', 'name title category year')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.status(200).json({
      status: 'success',
      total,
      count: registrations.length,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Toggle registration open/close and set timer (Admin)
// @route   PATCH /api/sports/admin/competitions/:id/registration-toggle
export const toggleCompetitionRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRegistrationOpen, registrationStartDate, registrationEndDate, maxParticipants } = req.body;

    const updateFields = {};
    if (isRegistrationOpen !== undefined) {
      updateFields.isRegistrationOpen =
        isRegistrationOpen === true || isRegistrationOpen === 'true';
    }
    if (registrationStartDate !== undefined) {
      updateFields.registrationStartDate = registrationStartDate ? new Date(registrationStartDate) : null;
    }
    if (registrationEndDate !== undefined) {
      updateFields.registrationEndDate = registrationEndDate ? new Date(registrationEndDate) : null;
    }
    if (maxParticipants !== undefined) {
      updateFields.maxParticipants = parseInt(maxParticipants, 10) || 0;
    }

    const updated = await Sport.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Sport not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Registration settings updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Export Registrations Report to Excel (CSV with UTF-8 BOM) (Admin)
// @route   GET /api/sports/admin/registrations/export
export const exportRegistrationsExcel = async (req, res) => {
  try {
    const { sportId } = req.query;
    const filter = {};
    if (sportId && sportId !== 'all' && sportId !== 'undefined') {
      filter.sport = sportId;
    }

    const registrations = await Registration.find(filter)
      .populate('sport', 'name title registrationType')
      .sort({ createdAt: -1 })
      .lean();

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Registrations_Report_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // UTF-8 BOM so Microsoft Excel correctly renders Marathi & English characters
    let csv = '\uFEFF';
    csv += 'Sr No,Registration ID,Competition / Sport,Registration Type,Participant / Player Name,Team Name,Contact Mobile,Email,Address / City,Notes,Status,Registration Date\n';

    registrations.forEach((r, idx) => {
      const sName = r.sport?.name || r.sportName || 'N/A';
      const isTeam = r.sport?.registrationType === 'team' || !!r.teamName;
      // Mitigate CSV / Formula Injection (CWE-1236): Prepend single quote if string starts with formula characters
      const escape = (val) => {
        if (val === undefined || val === null) return '""';
        let str = String(val).replace(/"/g, '""');
        if (/^[=+@|\-\t\r%]/.test(str)) {
          str = "'" + str;
        }
        return `"${str}"`;
      };

      const regDate = r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : '';

      csv +=
        [
          idx + 1,
          escape(r._id),
          escape(sName),
          escape(isTeam ? 'Team' : 'Individual'),
          escape(r.participantName || ''),
          escape(r.teamName || ''),
          escape(r.mobile || ''),
          escape(r.email || ''),
          escape(r.villageOrCity || ''),
          escape(r.notes || ''),
          escape(r.status || 'confirmed'),
          escape(regDate),
        ].join(',') + '\n';
    });

    return res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update registration status (Admin)
// @route   PATCH /api/sports/admin/registrations/:id/status
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'pending', 'cancelled'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    const reg = await Registration.findByIdAndUpdate(id, { status }, { new: true });
    if (!reg) return res.status(404).json({ status: 'error', message: 'Registration not found' });

    res.status(200).json({ status: 'success', message: `Status updated to ${status}`, data: reg });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Delete registration (Admin)
// @route   DELETE /api/sports/admin/registrations/:id
export const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const reg = await Registration.findByIdAndDelete(id);
    if (!reg) return res.status(404).json({ status: 'error', message: 'Registration not found' });

    res.status(200).json({ status: 'success', message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==================== ADMIN COMPETITION MANAGEMENT (Create / Edit / Delete) ====================

// @desc   Get ALL competitions for admin (including closed/inactive)
// @route  GET /api/sports/admin/competitions
export const getAllCompetitionsAdmin = async (req, res) => {
  try {
    const competitions = await Sport.find({}).sort({ createdAt: -1 }).lean();

    const competitionIds = competitions.map((c) => c._id);
    const counts = await Registration.aggregate([
      { $match: { sport: { $in: competitionIds } } },
      { $group: { _id: '$sport', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    const now = new Date();
    const enriched = competitions.map((comp) => {
      const regCount = countMap[comp._id.toString()] || 0;
      let computedStatus = 'closed';
      if (comp.isRegistrationOpen) {
        if (comp.registrationStartDate && new Date(comp.registrationStartDate) > now) {
          computedStatus = 'scheduled';
        } else if (comp.registrationEndDate && new Date(comp.registrationEndDate) < now) {
          computedStatus = 'expired';
        } else if (comp.maxParticipants > 0 && regCount >= comp.maxParticipants) {
          computedStatus = 'full';
        } else {
          computedStatus = 'open';
        }
      }
      return { ...comp, registrationCount: regCount, computedStatus };
    });

    res.status(200).json({ status: 'success', data: enriched });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc   Create a new competition/registration event (Admin)
// @route  POST /api/sports/admin/competitions
export const createCompetition = async (req, res) => {
  try {
    const {
      name, description, category, rules, entryFee, prizes,
      isRegistrationOpen, registrationStartDate, registrationEndDate,
      maxParticipants, registrationType, year,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ status: 'error', message: 'Competition name is required' });
    }

    const competition = await Sport.create({
      name: name.trim(),
      title: name.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'Sports',
      rules: rules?.trim() || '',
      entryFee: entryFee?.trim() || 'Free',
      prizes: prizes?.trim() || '',
      year: parseInt(year, 10) || new Date().getFullYear(),
      isRegistrationOpen: isRegistrationOpen === true || isRegistrationOpen === 'true',
      registrationStartDate: registrationStartDate ? new Date(registrationStartDate) : null,
      registrationEndDate: registrationEndDate ? new Date(registrationEndDate) : null,
      maxParticipants: parseInt(maxParticipants, 10) || 0,
      registrationType: registrationType || 'individual',
      isActive: true,
    });

    res.status(201).json({ status: 'success', data: competition });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc   Update a competition (Admin)
// @route  PUT /api/sports/admin/competitions/:id
export const updateCompetition = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, category, rules, entryFee, prizes,
      isRegistrationOpen, registrationStartDate, registrationEndDate,
      maxParticipants, registrationType, year,
    } = req.body;

    const updateData = {};
    if (name !== undefined) { updateData.name = name.trim(); updateData.title = name.trim(); }
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (rules !== undefined) updateData.rules = rules.trim();
    if (entryFee !== undefined) updateData.entryFee = entryFee.trim();
    if (prizes !== undefined) updateData.prizes = prizes.trim();
    if (year !== undefined) updateData.year = parseInt(year, 10);
    if (isRegistrationOpen !== undefined) {
      updateData.isRegistrationOpen = isRegistrationOpen === true || isRegistrationOpen === 'true';
    }
    if (registrationStartDate !== undefined) {
      updateData.registrationStartDate = registrationStartDate ? new Date(registrationStartDate) : null;
    }
    if (registrationEndDate !== undefined) {
      updateData.registrationEndDate = registrationEndDate ? new Date(registrationEndDate) : null;
    }
    if (maxParticipants !== undefined) {
      updateData.maxParticipants = parseInt(maxParticipants, 10) || 0;
    }
    if (registrationType !== undefined) updateData.registrationType = registrationType;

    const updated = await Sport.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ status: 'error', message: 'Competition not found' });

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc   Delete a competition and all its registrations (Admin)
// @route  DELETE /api/sports/admin/competitions/:id
export const deleteCompetition = async (req, res) => {
  try {
    const { id } = req.params;
    const sport = await Sport.findById(id);
    if (!sport) return res.status(404).json({ status: 'error', message: 'Competition not found' });

    // Delete all registrations for this competition
    await Registration.deleteMany({ sport: id });

    // Delete the sport itself
    await Sport.findByIdAndDelete(id);

    res.status(200).json({ status: 'success', message: 'Competition and all registrations deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
