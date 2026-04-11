import LiveProgram from "../models/LiveProgram.js";
import path from "path";
import fs from "fs";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { deleteFile } from "../utils/helpers.js";

// @desc    Get all live programs (public)
// @route   GET /api/live-programs
// @access  Public
export const getLivePrograms = asyncHandler(async (req, res, next) => {
  const { active, live, category, year } = req.query;

  const query = {};

  // Default: return only active programs unless "all" is requested
  if (active === "all") {
    // No filter on isActive
  } else if (active === "false") {
    query.isActive = false;
  } else {
    // Default to true
    query.isActive = true;
  }

  if (live === "true") {
    query.isLive = true;
  }

  if (category) {
    query.category = category;
  }

  if (year) {
    query.year = parseInt(year);
  }

  const programs = await LiveProgram.find(query)
    .populate("createdBy", "username email")
    .populate("category", "name slug")
    .select("-__v")
    .sort({ year: -1, startTimestamp: -1 }); // Sort by year descending, then start time descending

  res.json({
    status: "success",
    count: programs.length,
    data: programs,
  });
});

// @desc    Get available years for live programs
// @route   GET /api/live-programs/years
// @access  Public
export const getLiveProgramYears = asyncHandler(async (req, res, next) => {
  // Get years from all programs (active and inactive) so users can see old programs
  const years = await LiveProgram.distinct("year", {});
  // Sort descending (newest first)
  const sortedYears = years
    .filter((y) => y != null && !isNaN(y))
    .map((y) => parseInt(y))
    .sort((a, b) => b - a);

  // Ensure current year and next year are included
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const allYears = new Set([...sortedYears, currentYear, nextYear]);
  const finalYears = Array.from(allYears).sort((a, b) => b - a);

  res.json({
    status: "success",
    data: finalYears,
  });
});

// @desc    Get single live program by ID (public)
// @route   GET /api/live-programs/:id
// @access  Public
export const getLiveProgram = asyncHandler(async (req, res, next) => {
  const program = await LiveProgram.findById(req.params.id)
    .populate("createdBy", "username email")
    .populate("category", "name slug")
    .select("-__v");

  if (!program) {
    return next(new AppError("Live program not found", 404));
  }

  res.json({
    status: "success",
    data: program,
  });
});

// @desc    Create live program
// @route   POST /api/live-programs
// @access  Protected (Admin only)
export const createLiveProgram = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    startTimestamp,
    endTimestamp,
    youtube,
    facebook,
    instagram,
    twitter,
    other,
    isActive,
    isLive,
    category,
    year,
  } = req.body;

  // 1. Validation
  if (!title || !description || !startTimestamp || !endTimestamp || !category) {
    if (req.file) deleteFile("live-programs", req.file.filename);
    return next(
      new AppError(
        "Please provide title, description, start timestamp, end timestamp, and category",
        400
      )
    );
  }

  const start = new Date(startTimestamp);
  const end = new Date(endTimestamp);
  // Auto-detect year from startTimestamp if not provided
  const programYear = year ? parseInt(year) : start.getFullYear();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    if (req.file) deleteFile("live-programs", req.file.filename);
    return next(new AppError("Invalid timestamp format", 400));
  }

  if (end <= start) {
    if (req.file) deleteFile("live-programs", req.file.filename);
    return next(
      new AppError("End timestamp must be after start timestamp", 400)
    );
  }

  if (isNaN(programYear) || programYear < 2000 || programYear > 2100) {
    if (req.file) deleteFile("live-programs", req.file.filename);
    return next(new AppError("Invalid year. Year must be between 2000 and 2100", 400));
  }

  try {
    // 2. Create Program
    const program = await LiveProgram.create({
      title: title.trim(),
      description: description.trim(),
      thumbnail: req.file ? req.file.filename : "",
      thumbnailUrl: req.file
        ? `/uploads/live-programs/${req.file.filename}`
        : "",
      startTimestamp: start,
      endTimestamp: end,
      socialLinks: {
        youtube: youtube || "",
        facebook: facebook || "",
        instagram: instagram || "",
        twitter: twitter || "",
        other: other || "",
      },
      isActive: isActive !== undefined ? isActive : true,
      isLive: isLive !== undefined ? isLive : false,
      category: category,
      year: programYear,
      createdBy: req.admin._id,
    });

    const populatedProgram = await LiveProgram.findById(program._id)
      .populate("createdBy", "username email")
      .populate("category", "name slug")
      .select("-__v");

    res.status(201).json({
      status: "success",
      message: "Live program created successfully",
      data: populatedProgram,
    });
  } catch (error) {
    if (req.file) deleteFile("live-programs", req.file.filename);
    throw error;
  }
});

// @desc    Update live program
// @route   PUT /api/live-programs/:id
// @access  Protected (Admin only)
export const updateLiveProgram = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    startTimestamp,
    endTimestamp,
    youtube,
    facebook,
    instagram,
    twitter,
    other,
    isActive,
    isLive,
    deleteThumbnail,
    category,
    year,
  } = req.body;

  const program = await LiveProgram.findById(req.params.id);

  if (!program) {
    if (req.file) deleteFile("live-programs", req.file.filename);
    return next(new AppError("Live program not found", 404));
  }

  // Validate timestamps if provided
  if (startTimestamp || endTimestamp) {
    const start = startTimestamp
      ? new Date(startTimestamp)
      : program.startTimestamp;
    const end = endTimestamp ? new Date(endTimestamp) : program.endTimestamp;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      if (req.file) deleteFile("live-programs", req.file.filename);
      return next(new AppError("Invalid timestamp format", 400));
    }

    if (end <= start) {
      if (req.file) deleteFile("live-programs", req.file.filename);
      return next(
        new AppError("End timestamp must be after start timestamp", 400)
      );
    }

    // Assign validated dates
    program.startTimestamp = start;
    program.endTimestamp = end;
  }

  // Handle Thumbnail Logic
  if (deleteThumbnail === "true" || deleteThumbnail === true) {
    deleteFile("live-programs", program.thumbnail);
    program.thumbnail = "";
    program.thumbnailUrl = "";
  } else if (req.file) {
    deleteFile("live-programs", program.thumbnail); // Delete old
    program.thumbnail = req.file.filename;
    program.thumbnailUrl = `/uploads/live-programs/${req.file.filename}`;
  }

  // Update other fields
  if (title) program.title = title.trim();
  if (description) program.description = description.trim();
  if (youtube !== undefined) program.socialLinks.youtube = youtube.trim();
  if (facebook !== undefined) program.socialLinks.facebook = facebook.trim();
  if (instagram !== undefined) program.socialLinks.instagram = instagram.trim();
  if (twitter !== undefined) program.socialLinks.twitter = twitter.trim();
  if (other !== undefined) program.socialLinks.other = other.trim();
  if (isActive !== undefined) program.isActive = isActive;
  if (isLive !== undefined) program.isLive = isLive;
  if (category) program.category = category;
  if (year) {
    const programYear = parseInt(year);
    if (!isNaN(programYear) && programYear >= 2000 && programYear <= 2100) {
      program.year = programYear;
    }
  }

  await program.save();

  const updatedProgram = await LiveProgram.findById(program._id)
    .populate("createdBy", "username email")
    .populate("category", "name slug")
    .select("-__v");

  res.json({
    status: "success",
    message: "Live program updated successfully",
    data: updatedProgram,
  });
});

// @desc    Delete live program
// @route   DELETE /api/live-programs/:id
// @access  Protected (Admin only)
export const deleteLiveProgram = asyncHandler(async (req, res, next) => {
  const program = await LiveProgram.findById(req.params.id);

  if (!program) {
    return next(new AppError("Live program not found", 404));
  }

  // Delete associated thumbnail file
  deleteFile(program.thumbnail);

  await LiveProgram.findByIdAndDelete(req.params.id);

  res.json({
    status: "success",
    message: "Live program deleted successfully",
  });
});

export default {
  getLivePrograms,
  getLiveProgram,
  getLiveProgramYears,
  createLiveProgram,
  updateLiveProgram,
  deleteLiveProgram,
};
