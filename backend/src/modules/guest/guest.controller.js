import { Guest } from "./guest.model.js";
import AppError from "../../shared/utils/AppError.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryFolderPath,
} from "../../shared/config/cloudinary.js";

// @desc    Create a new guest
// @route   POST /api/guests
// @access  Private/Admin
export const createGuest = async (req, res, next) => {
  try {
    const {
      name,
      nameMarathi,
      prize,
      prizeMarathi,
      description,
      descriptionMarathi,
      year,
      order,
      isActive,
    } = req.body;

    if (!name || !name.trim()) {
      return next(new AppError("Guest name is required", 400));
    }

    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

    let uploadedImageUrl = req.body.imageUrl || "";
    let uploadedPublicId = req.body.publicId || "";

    if (req.file) {
      const folderPath = getCloudinaryFolderPath("guests", targetYear);
      const uploadResult = await uploadToCloudinary(
        req.file.path || req.file.buffer || req.file,
        folderPath,
        "image"
      );
      uploadedImageUrl = uploadResult.secure_url;
      uploadedPublicId = uploadResult.public_id;
    }

    if (!uploadedImageUrl) {
      return next(new AppError("Guest image file is required", 400));
    }

    const guest = await Guest.create({
      name: name.trim(),
      nameMarathi: nameMarathi ? nameMarathi.trim() : "",
      prize: prize ? prize.trim() : "",
      prizeMarathi: prizeMarathi ? prizeMarathi.trim() : "",
      description: description ? description.trim() : "",
      descriptionMarathi: descriptionMarathi ? descriptionMarathi.trim() : "",
      imageUrl: uploadedImageUrl,
      publicId: uploadedPublicId,
      year: targetYear,
      order: order !== undefined ? parseInt(order, 10) : 0,
      isActive: isActive === "false" || isActive === false ? false : true,
    });

    res.status(201).json({
      success: true,
      status: "success",
      message: "Guest created successfully",
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all guests with optional filters
// @route   GET /api/guests
// @access  Public
export const getGuests = async (req, res, next) => {
  try {
    const { year, isActive, page = 1, limit = 100 } = req.query;

    const query = {};
    if (year && year !== "all") query.year = parseInt(year, 10);
    if (isActive !== undefined && isActive !== "all") {
      query.isActive = isActive === "true" || isActive === true;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [total, guests] = await Promise.all([
      Guest.countDocuments(query),
      Guest.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success: true,
      status: "success",
      count: guests.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: guests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active guests (for frontend display)
// @route   GET /api/guests/active
// @access  Public
export const getActiveGuests = async (req, res, next) => {
  try {
    const { year } = req.query;

    const query = { isActive: true };
    if (year && year !== "all") query.year = parseInt(year, 10);

    const guests = await Guest.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      status: "success",
      count: guests.length,
      data: guests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single guest by ID
// @route   GET /api/guests/:id
// @access  Public
export const getGuestById = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id).lean();

    if (!guest) {
      return next(new AppError("Guest not found", 404));
    }

    res.json({
      success: true,
      status: "success",
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a guest
// @route   PUT /api/guests/:id
// @access  Private/Admin
export const updateGuest = async (req, res, next) => {
  try {
    const {
      name,
      nameMarathi,
      prize,
      prizeMarathi,
      description,
      descriptionMarathi,
      year,
      order,
      isActive,
    } = req.body;

    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return next(new AppError("Guest not found", 404));
    }

    // Update text & config fields
    if (name !== undefined) guest.name = name;
    if (nameMarathi !== undefined) guest.nameMarathi = nameMarathi;
    if (prize !== undefined) guest.prize = prize;
    if (prizeMarathi !== undefined) guest.prizeMarathi = prizeMarathi;
    if (description !== undefined) guest.description = description;
    if (descriptionMarathi !== undefined)
      guest.descriptionMarathi = descriptionMarathi;
    if (order !== undefined) guest.order = parseInt(order, 10);
    if (year !== undefined) guest.year = parseInt(year, 10);
    if (isActive !== undefined)
      guest.isActive = isActive === "true" || isActive === true;

    // Replace image if a new one is uploaded
    if (req.file) {
      // Delete the old image from Cloudinary
      if (guest.publicId) {
        await deleteFromCloudinary(guest.publicId, "image");
      }

      const targetYear = year ? parseInt(year, 10) : guest.year;
      const folderPath = getCloudinaryFolderPath("guests", targetYear);

      const uploadResult = await uploadToCloudinary(
        req.file.path || req.file.buffer || req.file,
        folderPath,
        "image"
      );

      guest.imageUrl = uploadResult.secure_url;
      guest.publicId = uploadResult.public_id;
    }

    const updatedGuest = await guest.save();

    res.json({
      success: true,
      status: "success",
      message: "Guest updated successfully",
      data: updatedGuest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder guests (bulk update of order field)
// @route   PATCH /api/guests/reorder
// @access  Private/Admin
export const reorderGuests = async (req, res, next) => {
  try {
    const { guests } = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
      return next(
        new AppError("An array of guests with id and order is required", 400)
      );
    }

    const updateOps = guests.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: parseInt(order, 10) } },
      },
    }));

    await Guest.bulkWrite(updateOps);

    res.json({
      success: true,
      status: "success",
      message: "Guests reordered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a guest
// @route   DELETE /api/guests/:id
// @access  Private/Admin
export const deleteGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return next(new AppError("Guest not found", 404));
    }

    // Delete image from Cloudinary
    if (guest.publicId) {
      await deleteFromCloudinary(guest.publicId, "image");
    }

    await guest.deleteOne();

    res.json({
      success: true,
      status: "success",
      message: "Guest deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
