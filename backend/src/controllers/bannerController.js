import Banner from "../models/Banner.js";
import path from "path";
import fs from "fs";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { deleteFile } from "../utils/helpers.js";

// @desc    Get all banners (public)
// @route   GET /api/banners
// @access  Public
export const getBanners = asyncHandler(async (req, res, next) => {
  const { position, active, year } = req.query;

  const query = {};

  if (position) query.position = position;
  if (year) query.year = parseInt(year);

  // Handle active status (default to true unless explicitly "false")
  if (active === "false") {
    query.isActive = false;
  } else {
    query.isActive = true;
  }

  const banners = await Banner.find(query)
    .sort({ year: -1, order: 1, createdAt: -1 })
    .populate("createdBy", "username email")
    .select("-__v");

  res.json({
    status: "success",
    count: banners.length,
    data: banners,
  });
});

// @desc    Get available years for banners
// @route   GET /api/banners/years
// @access  Public
export const getBannerYears = asyncHandler(async (req, res, next) => {
  const years = await Banner.distinct("year", { isActive: true });
  // Sort descending (newest first)
  const sortedYears = years.sort((a, b) => b - a);

  res.json({
    status: "success",
    data: sortedYears,
  });
});

// @desc    Get single banner by ID (public)
// @route   GET /api/banners/:id
// @access  Public
export const getBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id)
    .populate("createdBy", "username email")
    .select("-__v");

  if (!banner) {
    return next(new AppError("Banner not found", 404));
  }

  res.json({
    status: "success",
    data: banner,
  });
});

// @desc    Create banner
// @route   POST /api/banners
// @access  Protected (Admin only)
export const createBanner = asyncHandler(async (req, res, next) => {
  const { title, description, position, order, year, isActive, link } =
    req.body;

  // 1. Validation
  if (!title || !position) {
    // If file was uploaded but validation failed, delete the file
    if (req.file) deleteFile("banners", req.file.filename);
    return next(new AppError("Title and position are required", 400));
  }

  if (!req.file) {
    return next(new AppError("Banner image is required", 400));
  }

  const bannerYear = year ? parseInt(year) : new Date().getFullYear();
  if (isNaN(bannerYear) || bannerYear < 2000 || bannerYear > 2100) {
    if (req.file) deleteFile("banners", req.file.filename);
    return next(
      new AppError("Invalid year. Year must be between 2000 and 2100", 400)
    );
  }

  try {
    // 2. Create Banner
    const banner = await Banner.create({
      title,
      description: description || "",
      position,
      order: order || 0,
      year: bannerYear,
      isActive: isActive !== undefined ? isActive : true,
      link: link || "",
      image: req.file.filename,
      imageUrl: `/uploads/banners/${req.file.filename}`,
      createdBy: req.admin._id,
    });

    const populatedBanner = await Banner.findById(banner._id)
      .populate("createdBy", "username email")
      .select("-__v");

    res.status(201).json({
      status: "success",
      message: "Banner created successfully",
      data: populatedBanner,
    });
  } catch (error) {
    // Rollback: Delete uploaded file if DB creation failed
    if (req.file) deleteFile("banners", req.file.filename);
    throw error; // Pass to global error handler
  }
});

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Protected (Admin only)
export const updateBanner = asyncHandler(async (req, res, next) => {
  const { title, description, position, order, year, isActive, link } =
    req.body;

  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    // If a new file was uploaded but banner doesn't exist, clean up the new file
    if (req.file) deleteFile("banners", req.file.filename);
    return next(new AppError("Banner not found", 404));
  }

  // Handle Image Update
  if (req.file) {
    // Delete old image
    deleteFile("banners", banner.image);
    // Set new image
    banner.image = req.file.filename;
    banner.imageUrl = `/uploads/banners/${req.file.filename}`;
  }

  // Update Fields
  if (title) banner.title = title;
  if (description !== undefined) banner.description = description;
  if (position) banner.position = position;
  if (order !== undefined) banner.order = order;
  if (isActive !== undefined) banner.isActive = isActive;
  if (link !== undefined) banner.link = link;

  if (year !== undefined) {
    const bannerYear = parseInt(year);
    if (isNaN(bannerYear) || bannerYear < 2000 || bannerYear > 2100) {
      // If we uploaded a file but fail here, we shouldn't delete the *new* file
      // because we haven't saved the document yet, but we should probably
      // warn or handle this edge case. For now, strict validation:
      if (req.file) deleteFile("banners", req.file.filename);
      return next(new AppError("Invalid year", 400));
    }
    banner.year = bannerYear;
  }

  await banner.save();

  const updatedBanner = await Banner.findById(banner._id)
    .populate("createdBy", "username email")
    .select("-__v");

  res.json({
    status: "success",
    message: "Banner updated successfully",
    data: updatedBanner,
  });
});

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Protected (Admin only)
export const deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new AppError("Banner not found", 404));
  }

  // Delete associated image file
  deleteFile(banner.image);

  await Banner.findByIdAndDelete(req.params.id);

  res.json({
    status: "success",
    message: "Banner deleted successfully",
  });
});

export default {
  getBanners,
  getBanner,
  getBannerYears,
  createBanner,
  updateBanner,
  deleteBanner,
};
