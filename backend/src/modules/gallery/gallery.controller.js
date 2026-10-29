import mongoose from "mongoose";
import Gallery from "./gallery.model.js";
import Category from "../category/category.model.js";
import { escapeRegex } from "../../shared/utils/escapeRegex.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryFolderPath,
} from "../../shared/config/cloudinary.js";

// @desc    Create / Upload new gallery item
// @route   POST /api/gallery
// @access  Private/Admin
export const createGalleryItem = async (req, res, next) => {
  try {
    const { title, description, category, mediaType, year, tags } = req.body;

    if (!title) {
      res.status(400);
      throw new Error("Title is required");
    }

    let uploadedMediaUrl = req.body.mediaUrl || req.body.imageUrl || "";
    let uploadedPublicId = req.body.publicId || "";

    if (!req.file && !uploadedMediaUrl) {
      res.status(400);
      throw new Error("Media file (image or video) is required");
    }

    // Resilient category resolution (by ObjectId, slug, or name)
    let categoryDoc = null;
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDoc = await Category.findById(category);
      }
      if (!categoryDoc) {
        categoryDoc = await Category.findOne({
          $or: [
            { slug: category.toString().toLowerCase() },
            { name: new RegExp(`^${escapeRegex(category.toString())}$`, "i") },
          ],
        });
      }
    }
    if (!categoryDoc) {
      // Default to "general" category or create it
      categoryDoc = await Category.findOne({ slug: "general" });
      if (!categoryDoc) {
        categoryDoc = await Category.create({
          name: category || "General",
          description: "General gallery items",
        });
      }
    }

    // Determine resource type
    let detectedType = mediaType;
    if (!detectedType) {
      detectedType = req.file?.mimetype?.startsWith("video") ? "video" : "image";
    }

    // Determine target year & dynamic subfolder path
    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
    const folderPath = getCloudinaryFolderPath(
      categoryDoc.slug || categoryDoc.name,
      targetYear
    );

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.path || req.file.buffer || req.file,
        folderPath,
        detectedType === "video" ? "video" : "image"
      );
      uploadedMediaUrl = uploadResult.secure_url;
      uploadedPublicId = uploadResult.public_id;
    }

    // Parse tags array if string passed
    let parsedTags = [];
    if (tags) {
      parsedTags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim());
    }

    const { order, isActive } = req.body;
    const galleryItem = await Gallery.create({
      title,
      description: description || "",
      category: categoryDoc._id,
      mediaUrl: uploadedMediaUrl,
      imageUrl: uploadedMediaUrl,
      publicId: uploadedPublicId,
      mediaType: detectedType,
      year: year ? parseInt(year, 10) : new Date().getFullYear(),
      order: order !== undefined ? parseInt(order, 10) : 0,
      isActive: isActive === undefined ? true : (isActive === true || isActive === "true"),
      tags: parsedTags,
      uploadedBy: req.user ? req.user._id : null,
    });

    const populatedItem = await Gallery.findById(galleryItem._id).populate(
      "category",
      "name slug"
    );

    const populatedObj = populatedItem.toObject ? populatedItem.toObject() : populatedItem;
    populatedObj.imageUrl = populatedObj.imageUrl || populatedObj.mediaUrl;
    populatedObj.mediaUrl = populatedObj.mediaUrl || populatedObj.imageUrl;

    res.status(201).json({
      success: true,
      status: "success",
      message: "Gallery item uploaded successfully",
      data: populatedObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all gallery items with filter & pagination
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = async (req, res, next) => {
  try {
    const { category, year, mediaType, search, page = 1, limit = 100 } = req.query;

    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (year && year !== "all") {
      query.year = parseInt(year, 10);
    }

    if (mediaType && mediaType !== "all") {
      query.mediaType = mediaType;
    }

    const sanitizedSearch = escapeRegex(search);
    if (sanitizedSearch) {
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: "i" } },
        { description: { $regex: sanitizedSearch, $options: "i" } },
        { tags: { $regex: sanitizedSearch, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [total, items] = await Promise.all([
      Gallery.countDocuments(query),
      Gallery.find(query)
        .populate("category", "name slug")
        .populate("uploadedBy", "name email")
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const normalizedItems = items.map((item) => {
      item.imageUrl = item.imageUrl || item.mediaUrl;
      item.mediaUrl = item.mediaUrl || item.imageUrl;
      return item;
    });

    res.json({
      success: true,
      status: "success",
      count: normalizedItems.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: normalizedItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single gallery item by ID
// @route   GET /api/gallery/:id
// @access  Public
export const getGalleryItemById = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id)
      .populate("category", "name slug")
      .populate("uploadedBy", "name email");

    if (!item) {
      res.status(404);
      throw new Error("Gallery item not found");
    }

    res.json({
      success: true,
      status: "success",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update gallery item metadata & optional file replacement
// @route   PUT /api/gallery/:id
// @access  Private/Admin
export const updateGalleryItem = async (req, res, next) => {
  try {
    const { title, description, category, mediaType, year, tags } = req.body;

    const item = await Gallery.findById(req.params.id);

    if (!item) {
      res.status(404);
      throw new Error("Gallery item not found");
    }

    // Update text fields
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        res.status(404);
        throw new Error("Invalid Category ID");
      }
      item.category = category;
    }
    if (year) item.year = parseInt(year, 10);
    if (mediaType) item.mediaType = mediaType;
    if (req.body.order !== undefined) item.order = parseInt(req.body.order, 10);
    if (req.body.isActive !== undefined) {
      item.isActive = req.body.isActive === true || req.body.isActive === "true";
    }
    if (tags) {
      item.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim());
    }

    // If new file is uploaded, replace existing file on Cloudinary
    if (req.file) {
      // Delete old file from Cloudinary
      if (item.publicId) {
        await deleteFromCloudinary(item.publicId, item.mediaType || "image");
      }

      const targetCategoryId = category || item.category;
      const targetCategoryDoc = await Category.findById(targetCategoryId);
      const categorySlug = targetCategoryDoc
        ? targetCategoryDoc.slug || targetCategoryDoc.name
        : "general";
      const targetYear = year
        ? parseInt(year, 10)
        : item.year || new Date().getFullYear();

      const folderPath = getCloudinaryFolderPath(categorySlug, targetYear);

      const detectedType =
        mediaType || (req.file.mimetype.startsWith("video") ? "video" : "image");

      // Upload new file to Cloudinary in subfolder
      const uploadResult = await uploadToCloudinary(
        req.file.path || req.file.buffer || req.file,
        folderPath,
        detectedType === "video" ? "video" : "image"
      );

      item.mediaUrl = uploadResult.secure_url;
      item.imageUrl = uploadResult.secure_url;
      item.publicId = uploadResult.public_id;
      item.mediaType = detectedType;
    }

    const updatedItem = await item.save();
    const populatedItem = await Gallery.findById(updatedItem._id).populate(
      "category",
      "name slug"
    );

    const populatedObj = populatedItem.toObject ? populatedItem.toObject() : populatedItem;
    populatedObj.imageUrl = populatedObj.imageUrl || populatedObj.mediaUrl;
    populatedObj.mediaUrl = populatedObj.mediaUrl || populatedObj.imageUrl;

    res.json({
      success: true,
      status: "success",
      message: "Gallery item updated successfully",
      data: populatedObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gallery item and remove Cloudinary asset
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      res.status(404);
      throw new Error("Gallery item not found");
    }

    // Delete asset from Cloudinary
    if (item.publicId) {
      await deleteFromCloudinary(item.publicId, item.mediaType || "image");
    }

    // Delete item from Database
    await item.deleteOne();

    res.json({
      success: true,
      status: "success",
      message: "Gallery item and associated media deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
