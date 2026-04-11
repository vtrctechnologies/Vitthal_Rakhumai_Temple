import FeaturedEvent from "../models/FeaturedEvent.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// @desc    Get active featured event (public)
// @route   GET /api/events/featured
// @access  Public
export const getFeaturedEvent = asyncHandler(async (req, res, next) => {
  const featuredEvent = await FeaturedEvent.findOne({ isActive: true })
    .populate("createdBy", "username email")
    .select("-__v")
    .sort({ createdAt: -1 });

  if (!featuredEvent) {
    return res.json({
      status: "success",
      message: "No featured event currently set",
      data: null,
    });
  }

  res.json({
    status: "success",
    data: featuredEvent,
  });
});

// @desc    Create and set new featured event (Deactivates previous ones)
// @route   POST /api/events/featured
// @access  Protected (Admin only)
export const setFeaturedEvent = asyncHandler(async (req, res, next) => {
  const { title, description, targetDate, eventDate, eventTime, eventDetails } =
    req.body;

  // 1. Validation
  if (!title || !targetDate) {
    return next(new AppError("Please provide title and targetDate", 400));
  }

  const target = new Date(targetDate);
  if (isNaN(target.getTime())) {
    return next(
      new AppError(
        "Invalid targetDate format. Use ISO format (e.g., 2025-11-02T05:00:00)",
        400
      )
    );
  }

  // 2. Deactivate ALL existing active featured events
  // This ensures only one event is active at a time
  await FeaturedEvent.updateMany({ isActive: true }, { isActive: false });

  // 3. Create new featured event
  const featuredEvent = await FeaturedEvent.create({
    title,
    description: description || "",
    targetDate: target,
    eventDate: eventDate || "",
    eventTime: eventTime || "",
    eventDetails: eventDetails || "",
    isActive: true, // Always true when setting a new one
    createdBy: req.admin._id,
  });

  const populatedEvent = await FeaturedEvent.findById(featuredEvent._id)
    .populate("createdBy", "username email")
    .select("-__v");

  res.status(201).json({
    status: "success",
    message: "Featured event set successfully",
    data: populatedEvent,
  });
});

// @desc    Update featured event
// @route   PUT /api/events/featured/:id
// @access  Protected (Admin only)
export const updateFeaturedEvent = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    targetDate,
    eventDate,
    eventTime,
    eventDetails,
    isActive,
  } = req.body;

  const featuredEvent = await FeaturedEvent.findById(req.params.id);

  if (!featuredEvent) {
    return next(new AppError("Featured event not found", 404));
  }

  // Handle Logic: If we are setting this event to Active, we must deactivate others
  if (isActive === true) {
    await FeaturedEvent.updateMany(
      { _id: { $ne: featuredEvent._id }, isActive: true },
      { isActive: false }
    );
  }

  // Update fields
  if (title) featuredEvent.title = title;
  if (description !== undefined) featuredEvent.description = description;
  if (eventDate !== undefined) featuredEvent.eventDate = eventDate;
  if (eventTime !== undefined) featuredEvent.eventTime = eventTime;
  if (eventDetails !== undefined) featuredEvent.eventDetails = eventDetails;
  if (isActive !== undefined) featuredEvent.isActive = isActive;

  if (targetDate) {
    const target = new Date(targetDate);
    if (isNaN(target.getTime())) {
      return next(new AppError("Invalid targetDate format", 400));
    }
    featuredEvent.targetDate = target;
  }

  await featuredEvent.save();

  const updatedEvent = await FeaturedEvent.findById(featuredEvent._id)
    .populate("createdBy", "username email")
    .select("-__v");

  res.json({
    status: "success",
    message: "Featured event updated successfully",
    data: updatedEvent,
  });
});

// @desc    Get all featured events history (admin)
// @route   GET /api/events/featured/all
// @access  Protected (Admin only)
export const getAllFeaturedEvents = asyncHandler(async (req, res, next) => {
  const featuredEvents = await FeaturedEvent.find()
    .populate("createdBy", "username email")
    .select("-__v")
    .sort({ createdAt: -1 });

  res.json({
    status: "success",
    count: featuredEvents.length,
    data: featuredEvents,
  });
});

export default {
  getFeaturedEvent,
  setFeaturedEvent,
  updateFeaturedEvent,
  getAllFeaturedEvents,
};
