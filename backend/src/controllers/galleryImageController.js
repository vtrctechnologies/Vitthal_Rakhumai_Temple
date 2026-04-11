import GalleryImage from "../models/GalleryImage.js";
import GalleryCategory from "../models/GalleryCategory.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { deleteFile, resolveCategory } from "../utils/helpers.js";

// @desc    Get all gallery images (public)
// @route   GET /api/gallery/images
// @access  Public
export const getGalleryImages = asyncHandler(async (req, res, next) => {
  const { category } = req.query;
  const query = { isActive: true };

  if (category) {
    const categoryDoc = await resolveCategory(category);

    if (categoryDoc) {
      query.category = categoryDoc._id;
    } else {
      // If category param exists but no category found, return empty array immediately
      return res.json({
        status: "success",
        count: 0,
        data: [],
      });
    }
  }

  const images = await GalleryImage.find(query)
    .populate("category", "name slug")
    .populate("createdBy", "username email")
    .sort({ order: 1, createdAt: -1 })
    .select("-__v");

  res.json({
    status: "success",
    count: images.length,
    data: images,
  });
});

// @desc    Get all gallery images (admin - includes inactive)
// @route   GET /api/gallery/images/admin
// @access  Protected (Admin only)
export const getGalleryImagesAdmin = asyncHandler(async (req, res, next) => {
  const { category } = req.query;
  const query = {};

  if (category) {
    const categoryDoc = await resolveCategory(category);
    if (categoryDoc) {
      query.category = categoryDoc._id;
    }
  }

  const images = await GalleryImage.find(query)
    .populate("category", "name slug")
    .populate("createdBy", "username email")
    .sort({ order: 1, createdAt: -1 })
    .select("-__v");

  res.json({
    status: "success",
    count: images.length,
    data: images,
  });
});

// @desc    Get single gallery image by ID
// @route   GET /api/gallery/images/:id
// @access  Public
export const getGalleryImage = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid image ID format", 400));
  }

  const image = await GalleryImage.findById(req.params.id)
    .populate("category", "name slug")
    .populate("createdBy", "username email")
    .select("-__v");

  if (!image) {
    return next(new AppError("Gallery image not found", 404));
  }

  res.json({
    status: "success",
    data: image,
  });
});

// @desc    Create new gallery image
// @route   POST /api/gallery/images
// @access  Protected (Admin only)
export const createGalleryImage = asyncHandler(async (req, res, next) => {
  const { title, category, order } = req.body;

  // 1. Validation
  if (!title || !title.trim()) {
    if (req.file) deleteFile("gallery", req.file.filename);
    return next(new AppError("Image title is required", 400));
  }

  if (!category) {
    if (req.file) deleteFile("gallery", req.file.filename);
    return next(new AppError("Category is required", 400));
  }

  if (!req.file) {
    return next(new AppError("Image file is required", 400));
  }

  // 2. Resolve Category
  const categoryDoc = await resolveCategory(category);
  if (!categoryDoc) {
    if (req.file) deleteFile("gallery", req.file.filename);
    return next(
      new AppError(
        `Category not found. Please provide a valid category ID or slug.`,
        400
      )
    );
  }

  try {
    // 3. Create Image
    const image = await GalleryImage.create({
      title: title.trim(),
      category: categoryDoc._id,
      image: req.file.filename,
      imageUrl: `/uploads/gallery/${req.file.filename}`,
      order: order || 0,
      createdBy: req.admin._id,
    });

    const populatedImage = await GalleryImage.findById(image._id)
      .populate("category", "name slug")
      .populate("createdBy", "username email")
      .select("-__v");

    res.status(201).json({
      status: "success",
      message: "Gallery image created successfully",
      data: populatedImage,
    });
  } catch (error) {
    // Cleanup file if DB creation fails
    if (req.file) deleteFile("gallery", req.file.filename);
    throw error;
  }
});

// @desc    Update gallery image
// @route   PUT /api/gallery/images/:id
// @access  Protected (Admin only)
export const updateGalleryImage = asyncHandler(async (req, res, next) => {
  const { title, category, order, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    if (req.file) deleteFile("gallery", req.file.filename);
    return next(new AppError("Invalid image ID format", 400));
  }

  const image = await GalleryImage.findById(req.params.id);

  if (!image) {
    if (req.file) deleteFile("gallery", req.file.filename);
    return next(new AppError("Gallery image not found", 404));
  }

  // Handle Category Update
  if (category) {
    const categoryDoc = await resolveCategory(category);
    if (!categoryDoc) {
      if (req.file) deleteFile("gallery", req.file.filename);
      return next(new AppError("Category not found", 400));
    }
    image.category = categoryDoc._id;
  }

  // Handle Image File Update
  if (req.file) {
    deleteFile("gallery", image.image); // Delete old image
    image.image = req.file.filename;
    image.imageUrl = `/uploads/gallery/${req.file.filename}`;
  }

  // Update other fields
  if (title) image.title = title.trim();
  if (order !== undefined) image.order = order;
  if (isActive !== undefined) image.isActive = isActive;

  await image.save();

  const updatedImage = await GalleryImage.findById(image._id)
    .populate("category", "name slug")
    .populate("createdBy", "username email")
    .select("-__v");

  res.json({
    status: "success",
    message: "Gallery image updated successfully",
    data: updatedImage,
  });
});

// @desc    Delete gallery image
// @route   DELETE /api/gallery/images/:id
// @access  Protected (Admin only)
export const deleteGalleryImage = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid image ID format", 400));
  }

  const image = await GalleryImage.findById(req.params.id);

  if (!image) {
    return next(new AppError("Gallery image not found", 404));
  }

  // Delete associated image file
  deleteFile("gallery", image.image);

  await GalleryImage.findByIdAndDelete(req.params.id);

  res.json({
    status: "success",
    message: "Gallery image deleted successfully",
  });
});

export default {
  getGalleryImages,
  getGalleryImagesAdmin,
  getGalleryImage,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
};
