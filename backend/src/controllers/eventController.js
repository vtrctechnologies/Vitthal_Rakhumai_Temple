import Event from "../models/Event.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFile } from "../utils/helpers.js";

// ==============================================================================
// UPCOMING / RECURRING EVENTS LOGIC
// ==============================================================================

// @desc    Get upcoming/recurring events (public)
// @route   GET /api/events/upcoming
export const getUpcomingEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find({
    isActive: true,
    status: { $in: ["upcoming", "recurring"] },
    date: { $gte: new Date() }, // Only future events
  })
    .sort({ date: 1 })
    .populate("createdBy", "username email")
    .select("-__v")
    .lean(); // Performance: Return plain objects

  res.json({
    status: "success",
    count: events.length,
    data: events,
  });
});

// @desc    Get single upcoming event
// @route   GET /api/events/upcoming/:id
export const getUpcomingEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate("createdBy", "username email")
    .select("-__v")
    .lean();

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  res.json({
    status: "success",
    data: event,
  });
});

// @desc    Create upcoming/recurring event
// @route   POST /api/events/upcoming
export const createUpcomingEvent = asyncHandler(async (req, res, next) => {
  const { title, description, date, time, location, attendees, status } =
    req.body;

  if (!title || !description || !date || !time || !location) {
    if (req.file) deleteFile("events", req.file.filename);
    return next(
      new AppError(
        "Please provide title, description, date, time, and location",
        400
      )
    );
  }

  // Force status to valid upcoming types
  const eventStatus = status === "recurring" ? "recurring" : "upcoming";

  try {
    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      image: req.file ? req.file.filename : "",
      imageUrl: req.file ? `/uploads/events/${req.file.filename}` : "",
      attendees: attendees || "",
      status: eventStatus,
      createdBy: req.admin._id,
    });

    res.status(201).json({
      status: "success",
      message: "Upcoming event created successfully",
      data: event,
    });
  } catch (error) {
    if (req.file) deleteFile("events", req.file.filename);
    throw error;
  }
});

// @desc    Update upcoming event
// @route   PUT /api/events/upcoming/:id
export const updateUpcomingEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    if (req.file) deleteFile("events", req.file.filename);
    return next(new AppError("Event not found", 404));
  }

  // Handle Image Update
  if (req.file) {
    deleteFile("events", event.image);
    event.image = req.file.filename;
    event.imageUrl = `/uploads/events/${req.file.filename}`;
  }

  // Update Fields
  const fields = [
    "title",
    "description",
    "date",
    "time",
    "location",
    "attendees",
    "isActive",
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) event[field] = req.body[field];
  });

  if (req.body.status && ["recurring", "upcoming"].includes(req.body.status)) {
    event.status = req.body.status;
  }

  await event.save();

  // Return updated doc
  const updatedEvent = await Event.findById(event._id)
    .populate("createdBy", "username email")
    .select("-__v")
    .lean();

  res.json({
    status: "success",
    message: "Upcoming event updated successfully",
    data: updatedEvent,
  });
});

// @desc    Delete upcoming event
// @route   DELETE /api/events/upcoming/:id
export const deleteUpcomingEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) return next(new AppError("Event not found", 404));

  deleteFile(event.image);
  await Event.findByIdAndDelete(req.params.id);

  res.json({
    status: "success",
    message: "Upcoming event deleted successfully",
  });
});

// ==============================================================================
// GENERAL EVENTS LOGIC
// ==============================================================================

// @desc    Get all events (public)
// @route   GET /api/events
export const getEvents = asyncHandler(async (req, res, next) => {
  const { status, upcoming } = req.query;
  const query = { isActive: true };

  if (status) query.status = status;
  if (upcoming === "true") query.date = { $gte: new Date() };

  const events = await Event.find(query)
    .sort({ date: 1 })
    .populate("createdBy", "username email")
    .select("-__v")
    .lean();

  res.json({
    status: "success",
    count: events.length,
    data: events,
  });
});

// @desc    Get single event by ID (public)
// @route   GET /api/events/:id
export const getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate("createdBy", "username email")
    .select("-__v")
    .lean();

  if (!event) return next(new AppError("Event not found", 404));

  res.json({ status: "success", data: event });
});

// @desc    Create new event
// @route   POST /api/events
export const createEvent = asyncHandler(async (req, res, next) => {
  const { title, description, date, time, location, attendees, status } =
    req.body;

  if (!title || !description || !date || !time || !location) {
    if (req.file) deleteFile("events", req.file.filename);
    return next(
      new AppError(
        "Please provide title, description, date, time, and location",
        400
      )
    );
  }

  try {
    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      image: req.file ? req.file.filename : "",
      imageUrl: req.file ? `/uploads/events/${req.file.filename}` : "",
      attendees: attendees || "",
      status: status || "upcoming",
      createdBy: req.admin._id,
    });

    res.status(201).json({
      status: "success",
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    if (req.file) deleteFile("events", req.file.filename);
    throw error;
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
export const updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    if (req.file) deleteFile("events", req.file.filename);
    return next(new AppError("Event not found", 404));
  }

  if (req.file) {
    deleteFile("events", event.image);
    event.image = req.file.filename;
    event.imageUrl = `/uploads/events/${req.file.filename}`;
  }

  const fields = [
    "title",
    "description",
    "date",
    "time",
    "location",
    "attendees",
    "status",
    "isActive",
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) event[field] = req.body[field];
  });

  await event.save();

  const updatedEvent = await Event.findById(event._id)
    .populate("createdBy", "username email")
    .select("-__v")
    .lean();

  res.json({
    status: "success",
    message: "Event updated successfully",
    data: updatedEvent,
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
export const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) return next(new AppError("Event not found", 404));

  deleteFile(event.image);
  await Event.findByIdAndDelete(req.params.id);

  res.json({ status: "success", message: "Event deleted successfully" });
});

export default {
  getUpcomingEvents,
  getUpcomingEvent,
  createUpcomingEvent,
  updateUpcomingEvent,
  deleteUpcomingEvent,
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
