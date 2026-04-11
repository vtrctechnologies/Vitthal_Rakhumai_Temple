import LiveProgramCategory from "../models/LiveProgramCategory.js";
import LiveProgram from "../models/LiveProgram.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { generateSlug } from "../utils/helpers.js";

// @desc    Get all live program categories (public - active only)
// @route   GET /api/live-programs/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await LiveProgramCategory.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .populate("createdBy", "username email")
    .select("-__v");

  res.json({
    status: "success",
    count: categories.length,
    data: categories,
  });
});

// @desc    Get all live program categories (admin - includes inactive)
// @route   GET /api/live-programs/categories/admin/all
// @access  Protected (Admin only)
export const getCategoriesAdmin = asyncHandler(async (req, res, next) => {
  const categories = await LiveProgramCategory.find()
    .sort({ order: 1, createdAt: 1 })
    .populate("createdBy", "username email")
    .select("-__v");

  res.json({
    status: "success",
    count: categories.length,
    data: categories,
  });
});

// @desc    Get single category by ID
// @route   GET /api/live-programs/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid category ID format", 400));
  }

  const category = await LiveProgramCategory.findById(req.params.id)
    .populate("createdBy", "username email")
    .select("-__v");

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.json({
    status: "success",
    data: category,
  });
});

// @desc    Create new category
// @route   POST /api/live-programs/categories
// @access  Protected (Admin only)
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, order } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError("Category name is required", 400));
  }

  // Check uniqueness
  const existingCategory = await LiveProgramCategory.findOne({ name: name.trim() });
  if (existingCategory) {
    return next(new AppError("Category with this name already exists", 400));
  }

  const slug = generateSlug(name);

  // Check slug uniqueness
  const existingSlug = await LiveProgramCategory.findOne({ slug });
  if (existingSlug) {
    return next(
      new AppError(
        "Generated slug already exists, please choose a different name",
        400
      )
    );
  }

  const category = await LiveProgramCategory.create({
    name: name.trim(),
    slug,
    description: description || "",
    order: order || 0,
    createdBy: req.admin._id,
  });

  const populatedCategory = await LiveProgramCategory.findById(category._id)
    .populate("createdBy", "username email")
    .select("-__v");

  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: populatedCategory,
  });
});

// @desc    Update category
// @route   PUT /api/live-programs/categories/:id
// @access  Protected (Admin only)
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description, order, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid category ID format", 400));
  }

  const category = await LiveProgramCategory.findById(req.params.id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  // Handle Name Change
  if (name && name.trim() !== category.name) {
    const existingCategory = await LiveProgramCategory.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id },
    });

    if (existingCategory) {
      return next(new AppError("Category with this name already exists", 400));
    }

    category.name = name.trim();
    category.slug = generateSlug(name);
  }

  // Update other fields
  if (description !== undefined) category.description = description;
  if (order !== undefined) category.order = order;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  const updatedCategory = await LiveProgramCategory.findById(category._id)
    .populate("createdBy", "username email")
    .select("-__v");

  res.json({
    status: "success",
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

// @desc    Delete category
// @route   DELETE /api/live-programs/categories/:id
// @access  Protected (Admin only)
export const deleteCategory = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid category ID format", 400));
  }

  const category = await LiveProgramCategory.findById(req.params.id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  // Check for associated programs
  const programCount = await LiveProgram.countDocuments({
    category: req.params.id,
  });
  if (programCount > 0) {
    return next(
      new AppError(
        `Cannot delete category. It has ${programCount} associated program(s). Please delete or reassign the programs first.`,
        400
      )
    );
  }

  await LiveProgramCategory.findByIdAndDelete(req.params.id);

  res.json({
    status: "success",
    message: "Category deleted successfully",
  });
});

export default {
  getCategories,
  getCategoriesAdmin,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
