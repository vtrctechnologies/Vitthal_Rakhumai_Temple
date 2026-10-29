import Category from "./category.model.js";
import { escapeRegex } from "../../shared/utils/escapeRegex.js";

// @desc    Create a new category
// @route   POST /api/categories or /api/gallery/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, order, isActive } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error("Category name is required");
    }

    const trimmedName = name.trim();
    const categoryExists = await Category.findOne({
      name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
    });
    if (categoryExists) {
      res.status(400);
      throw new Error("Category with this name already exists");
    }

    const category = await Category.create({
      name: trimmedName,
      description: description ? description.trim() : "",
      order: order !== undefined && order !== null ? Number(order) : 0,
      isActive: isActive !== undefined ? (isActive === true || isActive === "true") : true,
    });

    res.status(201).json({
      success: true,
      status: "success",
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories (public or admin)
// @route   GET /api/categories or /api/gallery/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    // If all=true or admin route, return all; otherwise return active
    const isAll = req.query.all === "true" || req.originalUrl.includes("/admin");
    const query = isAll ? {} : { isActive: true };

    const categories = await Category.find(query).sort({ order: 1, name: 1 });

    res.json({
      success: true,
      status: "success",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories for admin (alias)
// @route   GET /api/categories/admin/all or /api/gallery/categories/admin/all
// @access  Private/Admin
export const getCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });

    res.json({
      success: true,
      status: "success",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id or /api/gallery/categories/:id
// @access  Public
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    res.json({
      success: true,
      status: "success",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id or /api/gallery/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, order, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    if (name && name.trim()) {
      category.name = name.trim();
      category.slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
    if (description !== undefined) category.description = description ? description.trim() : "";
    if (order !== undefined && order !== null) category.order = Number(order);
    if (isActive !== undefined) {
      category.isActive = isActive === true || isActive === "true";
    }

    const updatedCategory = await category.save();

    res.json({
      success: true,
      status: "success",
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id or /api/gallery/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    await category.deleteOne();

    res.json({
      success: true,
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
