import HeroFestival from "../models/HeroFestival.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// @desc    Get active hero festival (public)
// @route   GET /api/hero-festival
// @access  Public
export const getHeroFestival = asyncHandler(async (req, res, next) => {
  const festival = await HeroFestival.findOne({ isActive: true })
    .populate("createdBy", "username email")
    .select("-__v")
    .sort({ createdAt: -1 });

  if (!festival) {
    // Return default if no active festival is found
    return res.json({
      status: "success",
      data: {
        title: "Next Festival: Kartiki Ekadashi",
        titleMarathi: "पुढील उत्सव: कार्तिकी एकादशी",
        isActive: false,
        isDefault: true, // Flag to let frontend know this is a fallback
      },
    });
  }

  res.json({
    status: "success",
    data: festival,
  });
});

// @desc    Get all hero festivals (for admin)
// @route   GET /api/hero-festival/all
// @access  Protected (Admin only)
export const getAllHeroFestivals = asyncHandler(async (req, res, next) => {
  const festivals = await HeroFestival.find()
    .populate("createdBy", "username email")
    .select("-__v")
    .sort({ createdAt: -1 });

  res.json({
    status: "success",
    count: festivals.length,
    data: festivals,
  });
});

// @desc    Create hero festival
// @route   POST /api/hero-festival
// @access  Protected (Admin only)
export const createHeroFestival = asyncHandler(async (req, res, next) => {
  const { title, titleMarathi, isActive } = req.body;

  // Validation
  if (!title || !title.trim()) {
    return next(new AppError("Festival title is required", 400));
  }

  // Logic: If setting as active (default true), deactivate all other festivals first
  const shouldBeActive = isActive !== undefined ? isActive : true;

  if (shouldBeActive) {
    await HeroFestival.updateMany({ isActive: true }, { isActive: false });
  }

  const festival = await HeroFestival.create({
    title: title.trim(),
    titleMarathi: titleMarathi ? titleMarathi.trim() : "",
    isActive: shouldBeActive,
    createdBy: req.admin._id,
  });

  const populatedFestival = await HeroFestival.findById(festival._id)
    .populate("createdBy", "username email")
    .select("-__v");

  res.status(201).json({
    status: "success",
    message: "Hero festival created successfully",
    data: populatedFestival,
  });
});

// @desc    Update hero festival
// @route   PUT /api/hero-festival/:id
// @access  Protected (Admin only)
export const updateHeroFestival = asyncHandler(async (req, res, next) => {
  const { title, titleMarathi, isActive } = req.body;

  const festival = await HeroFestival.findById(req.params.id);

  if (!festival) {
    return next(new AppError("Hero festival not found", 404));
  }

  // Logic: If we are switching this to Active, deactivate all others first
  if (isActive === true) {
    await HeroFestival.updateMany(
      { _id: { $ne: req.params.id }, isActive: true },
      { isActive: false }
    );
  }

  // Update fields
  if (title !== undefined) festival.title = title.trim();
  if (titleMarathi !== undefined) {
    festival.titleMarathi = titleMarathi ? titleMarathi.trim() : "";
  }
  if (isActive !== undefined) festival.isActive = isActive;

  await festival.save();

  const updatedFestival = await HeroFestival.findById(festival._id)
    .populate("createdBy", "username email")
    .select("-__v");

  res.json({
    status: "success",
    message: "Hero festival updated successfully",
    data: updatedFestival,
  });
});

// @desc    Delete hero festival
// @route   DELETE /api/hero-festival/:id
// @access  Protected (Admin only)
export const deleteHeroFestival = asyncHandler(async (req, res, next) => {
  const festival = await HeroFestival.findById(req.params.id);

  if (!festival) {
    return next(new AppError("Hero festival not found", 404));
  }

  await HeroFestival.findByIdAndDelete(req.params.id);

  res.json({
    status: "success",
    message: "Hero festival deleted successfully",
  });
});

export default {
  getHeroFestival,
  getAllHeroFestivals,
  createHeroFestival,
  updateHeroFestival,
  deleteHeroFestival,
};
