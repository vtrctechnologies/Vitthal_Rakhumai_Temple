import { Banner } from "./banner.model.js";
import AppError from "../../shared/utils/AppError.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryFolderPath,
} from "../../shared/config/cloudinary.js";

// Helper to sanitize year
const parseYear = (val) => {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? new Date().getFullYear() : parsed;
};

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res, next) => {
  try {
    const { title, description, position, order, year, isActive, active, link } =
      req.body;

    if (!title || !title.trim()) {
      return next(new AppError("Title is required", 400));
    }

    const targetYear = parseYear(year);

    let uploadedImageUrl = req.body.imageUrl || req.body.mediaUrl || "";
    let uploadedPublicId = req.body.publicId || "";
    let resourceType = req.body.resourceType || "image";

    if (req.file) {
      resourceType = req.file.mimetype.startsWith("video") ? "video" : "image";
      const folderPath = getCloudinaryFolderPath("banners", targetYear);
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        folderPath,
        resourceType
      );
      uploadedImageUrl = uploadResult.secure_url;
      uploadedPublicId = uploadResult.public_id;
    }

    if (!uploadedImageUrl) {
      return next(new AppError("Banner image or video file is required", 400));
    }

    const activeState =
      isActive !== undefined
        ? isActive === "true" || isActive === true
        : active !== undefined
        ? active === "true" || active === true
        : true;

    const banner = await Banner.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      imageUrl: uploadedImageUrl,
      publicId: uploadedPublicId,
      resourceType,
      position: position || "hero",
      order: order !== undefined ? parseInt(order, 10) : 0,
      year: targetYear,
      isActive: activeState,
      link: link || "",
    });

    res.status(201).json({
      success: true,
      status: "success",
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all banners with optional filters
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res, next) => {
  try {
    const { position, year, isActive, active, page = 1, limit = 100 } = req.query;

    const query = {};

    if (position && position !== "all") query.position = position;
    if (year && year !== "all") query.year = parseYear(year);

    if (isActive !== undefined) {
      query.isActive = isActive === "true" || isActive === true;
    } else if (active !== undefined) {
      query.isActive = active === "true" || active === true;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [total, banners] = await Promise.all([
      Banner.countDocuments(query),
      Banner.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success: true,
      status: "success",
      count: banners.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active banners by position (for frontend display)
// @route   GET /api/banners/active
// @access  Public
export const getActiveBanners = async (req, res, next) => {
  try {
    const { position, year } = req.query;

    const query = { isActive: true };
    if (position && position !== "all") query.position = position;
    if (year && year !== "all") query.year = parseYear(year);

    const banners = await Banner.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      status: "success",
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available banner years
// @route   GET /api/banners/years
// @access  Public
export const getBannerYears = async (req, res, next) => {
  try {
    const years = await Banner.distinct("year");
    const currentYear = new Date().getFullYear();

    // Include DB years + current year + 5 future years (e.g. 2027, 2028, 2029...) + past 2 years
    const defaultRange = [
      currentYear + 5,
      currentYear + 4,
      currentYear + 3,
      currentYear + 2,
      currentYear + 1,
      currentYear,
      currentYear - 1,
      currentYear - 2,
    ];

    const allYears = new Set([...years.filter(Boolean), ...defaultRange]);
    const sortedYears = Array.from(allYears).sort((a, b) => b - a);

    res.json({
      success: true,
      status: "success",
      data: sortedYears,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single banner by ID
// @route   GET /api/banners/:id
// @access  Public
export const getBannerById = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return next(new AppError("Banner not found", 404));
    }

    res.json({
      success: true,
      status: "success",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res, next) => {
  try {
    const { title, description, position, order, year, isActive, active, link } =
      req.body;

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return next(new AppError("Banner not found", 404));
    }

    // Update text & config fields
    if (title !== undefined) banner.title = title.trim();
    if (description !== undefined) banner.description = description.trim();
    if (position !== undefined) banner.position = position;
    if (order !== undefined) banner.order = parseInt(order, 10);
    if (year !== undefined) banner.year = parseYear(year);

    if (isActive !== undefined) {
      banner.isActive = isActive === "true" || isActive === true;
    } else if (active !== undefined) {
      banner.isActive = active === "true" || active === true;
    }

    if (link !== undefined) banner.link = link;

    // Replace media file if a new one is uploaded
    if (req.file) {
      if (banner.publicId) {
        await deleteFromCloudinary(banner.publicId, banner.resourceType || "image");
      }

      const targetYear = parseYear(year || banner.year);
      const resourceType = req.file.mimetype.startsWith("video")
        ? "video"
        : "image";
      const folderPath = getCloudinaryFolderPath("banners", targetYear);

      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        folderPath,
        resourceType
      );

      banner.imageUrl = uploadResult.secure_url;
      banner.publicId = uploadResult.public_id;
      banner.resourceType = resourceType;
    }

    const updatedBanner = await banner.save();

    res.json({
      success: true,
      status: "success",
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder banners (bulk update of order field)
// @route   PATCH /api/banners/reorder
// @access  Private/Admin
export const reorderBanners = async (req, res, next) => {
  try {
    const { banners } = req.body;

    if (!Array.isArray(banners) || banners.length === 0) {
      return next(
        new AppError("An array of banners with id and order is required", 400)
      );
    }

    const updateOps = banners.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: parseInt(order, 10) } },
      },
    }));

    await Banner.bulkWrite(updateOps);

    res.json({
      success: true,
      status: "success",
      message: "Banners reordered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return next(new AppError("Banner not found", 404));
    }

    if (banner.publicId) {
      await deleteFromCloudinary(banner.publicId, banner.resourceType || "image");
    }

    await banner.deleteOne();

    res.json({
      success: true,
      status: "success",
      message: "Banner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
