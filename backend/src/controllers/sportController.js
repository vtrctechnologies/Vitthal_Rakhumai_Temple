import Sport from "../models/Sport.js";
import SportWinner from "../models/SportWinner.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
  deleteFile,
  processTeamMembers,
  VALID_POSITIONS,
} from "../utils/helpers.js";

// ==============================================================================
// SPORT LOGIC
// ==============================================================================

// @desc    Get all sports
// @route   GET /api/sports
export const getSports = asyncHandler(async (req, res, next) => {
  const { active, year } = req.query;
  const query = {};

  if (year) {
    const yearNum = parseInt(year);
    if (!isNaN(yearNum)) query.year = yearNum;
  }

  if (active === "false") {
    query.isActive = false;
  } else if (active !== "all") {
    query.isActive = true;
  }

  let sports = await Sport.find(query)
    .populate("createdBy", "username email")
    .select("-__v")
    .lean(); // Performance Optimization

  // Custom JS sort since we have complex logic (year exists vs not, order, etc)
  sports.sort((a, b) => {
    // 1. Year comparison (Descending)
    if (a.year && b.year && a.year !== b.year) return b.year - a.year;
    if (a.year && !b.year) return -1;
    if (!a.year && b.year) return 1;

    // 2. Order comparison (Ascending)
    if (a.order !== b.order) return (a.order || 0) - (b.order || 0);

    // 3. Date fallback (Newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json({
    status: "success",
    count: sports.length,
    data: sports,
  });
});

// @desc    Get single sport
// @route   GET /api/sports/:id
export const getSport = asyncHandler(async (req, res, next) => {
  const sport = await Sport.findById(req.params.id)
    .populate("createdBy", "username email")
    .select("-__v")
    .lean();

  if (!sport) return next(new AppError("Sport not found", 404));

  res.json({ status: "success", data: sport });
});

// @desc    Get sport with winners
// @route   GET /api/sports/:id/winners
export const getSportWithWinners = asyncHandler(async (req, res, next) => {
  const sport = await Sport.findById(req.params.id).select("-__v").lean();

  if (!sport) return next(new AppError("Sport not found", 404));

  const winners = await SportWinner.find({
    sport: req.params.id,
    isActive: true,
  })
    .sort({ position: 1 })
    .select("-__v")
    .lean();

  const winnersByPosition = { first: null, second: null, third: null };
  winners.forEach((winner) => {
    winnersByPosition[winner.position] = winner;
  });

  res.json({
    status: "success",
    data: { sport, winners: winnersByPosition },
  });
});

// @desc    Create sport
// @route   POST /api/sports
export const createSport = asyncHandler(async (req, res, next) => {
  const { name, title, description, heroColor, order, year, isActive } =
    req.body;

  if (!name || !title) {
    if (req.file) deleteFile("sports", req.file.filename);
    return next(new AppError("Name and title are required", 400));
  }

  const sportYear = year ? parseInt(year) : new Date().getFullYear();

  // Duplicate Check
  const existingSport = await Sport.findOne({
    name: name.trim(),
    year: sportYear,
  });
  if (existingSport) {
    if (req.file) deleteFile("sports", req.file.filename);
    return next(
      new AppError(
        `Sport "${name.trim()}" already exists for year ${sportYear}.`,
        400
      )
    );
  }

  try {
    const sport = await Sport.create({
      name: name.trim(),
      title: title.trim(),
      description: description || "",
      heroColor: heroColor || "bg-orange-100",
      order: order || 0,
      year: sportYear,
      isActive: isActive !== undefined ? isActive : true,
      image: req.file ? req.file.filename : "",
      imageUrl: req.file ? `/uploads/sports/${req.file.filename}` : "",
      createdBy: req.admin._id,
    });

    res.status(201).json({
      status: "success",
      message: "Sport created successfully",
      data: sport,
    });
  } catch (error) {
    if (req.file) deleteFile("sports", req.file.filename);
    if (error.code === 11000)
      return next(
        new AppError("Sport with this name already exists for this year", 400)
      );
    throw error;
  }
});

// @desc    Update sport
// @route   PUT /api/sports/:id
export const updateSport = asyncHandler(async (req, res, next) => {
  const {
    name,
    title,
    description,
    heroColor,
    order,
    year,
    isActive,
    deleteImage,
  } = req.body;
  const sport = await Sport.findById(req.params.id);

  if (!sport) {
    if (req.file) deleteFile("sports", req.file.filename);
    return next(new AppError("Sport not found", 404));
  }

  // Handle Image
  if (deleteImage === "true" || deleteImage === true) {
    deleteFile("sports", sport.image);
    sport.image = "";
    sport.imageUrl = "";
  } else if (req.file) {
    deleteFile("sports", sport.image);
    sport.image = req.file.filename;
    sport.imageUrl = `/uploads/sports/${req.file.filename}`;
  }

  // Update Fields
  if (name) sport.name = name.trim();
  if (title) sport.title = title.trim();
  if (description !== undefined) sport.description = description;
  if (heroColor) sport.heroColor = heroColor;
  if (order !== undefined) sport.order = order;
  if (year !== undefined) sport.year = parseInt(year);
  if (isActive !== undefined) sport.isActive = isActive;

  await sport.save();

  const updatedSport = await Sport.findById(sport._id).select("-__v").lean();

  res.json({
    status: "success",
    message: "Sport updated successfully",
    data: updatedSport,
  });
});

// @desc    Delete sport
// @route   DELETE /api/sports/:id
export const deleteSport = asyncHandler(async (req, res, next) => {
  const sport = await Sport.findById(req.params.id);
  if (!sport) return next(new AppError("Sport not found", 404));

  // Delete winners first
  await SportWinner.deleteMany({ sport: req.params.id });
  deleteFile(sport.image);
  await Sport.findByIdAndDelete(req.params.id);

  res.json({
    status: "success",
    message: "Sport and associated winners deleted successfully",
  });
});

// @desc    Get sport years
// @route   GET /api/sports/years
export const getSportYears = asyncHandler(async (req, res, next) => {
  const yearsFromDB = await Sport.distinct("year");
  const validYears = yearsFromDB
    .filter((y) => y != null && !isNaN(y))
    .map((y) => parseInt(y));
  const currentYear = new Date().getFullYear();
  const allYears = new Set([...validYears, currentYear, currentYear + 1]);
  const sortedYears = Array.from(allYears).sort((a, b) => b - a);

  res.json({ status: "success", data: sortedYears });
});

// ==============================================================================
// WINNER LOGIC (Formerly sportWinnerController.js)
// ==============================================================================

// @desc    Get winners for a sport
// @route   GET /api/sports/:sportId/winners/list
export const getWinners = asyncHandler(async (req, res, next) => {
  const winners = await SportWinner.find({
    sport: req.params.sportId,
    isActive: true,
  })
    .sort({ position: 1 })
    .populate("sport", "name title")
    .select("-__v")
    .lean();

  res.json({ status: "success", count: winners.length, data: winners });
});

// @desc    Get single winner
// @route   GET /api/sports/winners/:id
export const getWinner = asyncHandler(async (req, res, next) => {
  const winner = await SportWinner.findById(req.params.id)
    .populate("sport", "name title")
    .select("-__v")
    .lean();

  if (!winner) return next(new AppError("Winner not found", 404));

  res.json({ status: "success", data: winner });
});

// @desc    Create or update winner (Upsert)
// @route   POST /api/sports/:sportId/winners
export const createOrUpdateWinner = asyncHandler(async (req, res, next) => {
  const { position, teamName, captain, members, deleteImage } = req.body;

  if (!position || !teamName || !captain) {
    if (req.file) deleteFile("sports", req.file.filename);
    return next(
      new AppError("Position, team name, and captain are required", 400)
    );
  }

  if (!VALID_POSITIONS.includes(position)) {
    if (req.file) deleteFile("sports", req.file.filename);
    return next(
      new AppError("Position must be 'first', 'second', or 'third'", 400)
    );
  }

  const processedMembers = processTeamMembers(members, captain);

  // Check existing
  let winner = await SportWinner.findOne({
    sport: req.params.sportId,
    position,
  });

  const isNew = !winner;

  if (winner) {
    winner.teamName = teamName.trim();
    winner.captain = captain.trim();
    winner.members = processedMembers;
    winner.isActive = true;
    
    // Handle image update
    if (deleteImage === "true" || deleteImage === true) {
      deleteFile("sports", winner.image);
      winner.image = "";
      winner.imageUrl = "";
    } else if (req.file) {
      deleteFile("sports", winner.image);
      winner.image = req.file.filename;
      winner.imageUrl = `/uploads/sports/${req.file.filename}`;
    }
    
    await winner.save();
  } else {
    winner = await SportWinner.create({
      sport: req.params.sportId,
      position,
      teamName: teamName.trim(),
      captain: captain.trim(),
      members: processedMembers,
      image: req.file ? req.file.filename : "",
      imageUrl: req.file ? `/uploads/sports/${req.file.filename}` : "",
      createdBy: req.admin._id,
    });
  }

  const populatedWinner = await SportWinner.findById(winner._id)
    .populate("sport", "name title")
    .select("-__v")
    .lean();

  res.status(isNew ? 201 : 200).json({
    status: "success",
    message: isNew
      ? "Winner created successfully"
      : "Winner updated successfully",
    data: populatedWinner,
  });
});

// @desc    Update winner by ID
// @route   PUT /api/sports/winners/:id
export const updateWinner = asyncHandler(async (req, res, next) => {
  const { teamName, captain, members, isActive, deleteImage } = req.body;
  const winner = await SportWinner.findById(req.params.id);

  if (!winner) {
    if (req.file) deleteFile("sports", req.file.filename);
    return next(new AppError("Winner not found", 404));
  }

  if (teamName) winner.teamName = teamName.trim();
  if (isActive !== undefined) winner.isActive = isActive;

  if (captain || members) {
    const targetCaptain = captain ? captain.trim() : winner.captain;
    const targetMembers = members ? members : winner.members;
    winner.members = processTeamMembers(targetMembers, targetCaptain);
    winner.captain = targetCaptain;
  }

  // Handle image update
  if (deleteImage === "true" || deleteImage === true) {
    deleteFile("sports", winner.image);
    winner.image = "";
    winner.imageUrl = "";
  } else if (req.file) {
    deleteFile("sports", winner.image);
    winner.image = req.file.filename;
    winner.imageUrl = `/uploads/sports/${req.file.filename}`;
  }

  await winner.save();
  const updatedWinner = await SportWinner.findById(winner._id)
    .populate("sport", "name title")
    .select("-__v")
    .lean();

  res.json({
    status: "success",
    message: "Winner updated successfully",
    data: updatedWinner,
  });
});

// @desc    Delete winner
// @route   DELETE /api/sports/winners/:id
export const deleteWinner = asyncHandler(async (req, res, next) => {
  const winner = await SportWinner.findById(req.params.id);
  if (!winner) return next(new AppError("Winner not found", 404));
  
  // Delete associated image file
  deleteFile("sports", winner.image);
  
  await SportWinner.findByIdAndDelete(req.params.id);
  res.json({ status: "success", message: "Winner deleted successfully" });
});

export default {
  getSports,
  getSport,
  getSportWithWinners,
  createSport,
  updateSport,
  deleteSport,
  getSportYears,
  getWinners,
  getWinner,
  createOrUpdateWinner,
  updateWinner,
  deleteWinner,
};
