import { Event } from "./events.model.js";
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

// @desc    Create a new event
// @route   POST /api/events or POST /api/events/upcoming
// @access  Private/Admin
export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      titleMarathi,
      description,
      descriptionMarathi,
      date,
      time,
      timeMarathi,
      location,
      locationMarathi,
      year,
      attendees,
      targetDate,
      eventDate,
      eventTime,
      eventDetails,
      status,
      isFeatured,
    } = req.body;

    const eventTitle = (title || req.body.name || "").trim();
    const eventDescription = (
      description ||
      req.body.details ||
      req.body.desc ||
      ""
    ).trim();

    if (!eventTitle) {
      return next(new AppError("Title is required", 400));
    }

    const targetYear = parseYear(year);

    let imageUrl = req.body.imageUrl || "";
    let publicId = req.body.publicId || "";

    // Upload event image to Cloudinary if file provided
    if (req.file) {
      const folderPath = getCloudinaryFolderPath("events", targetYear);
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        folderPath,
        "image"
      );
      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    const event = await Event.create({
      title: eventTitle,
      titleMarathi: titleMarathi ? titleMarathi.trim() : "",
      description: eventDescription || eventTitle,
      descriptionMarathi: descriptionMarathi ? descriptionMarathi.trim() : "",
      date: date || undefined,
      time: time || "",
      timeMarathi: timeMarathi || "",
      location: location || "",
      locationMarathi: locationMarathi || "",
      imageUrl,
      publicId,
      year: targetYear,
      attendees: attendees || "",
      targetDate: targetDate || undefined,
      eventDate: eventDate || "",
      eventTime: eventTime || "",
      eventDetails: eventDetails || "",
      status: status || "upcoming",
      isFeatured: isFeatured === "true" || isFeatured === true,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      status: "success",
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// Alias for upcoming event creation
export const createUpcomingEvent = createEvent;

// @desc    Get all events with optional filters & pagination
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const {
      status,
      upcoming,
      year,
      isFeatured,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };

    if (status) {
      query.status = status;
    } else if (upcoming === "true") {
      query.status = "upcoming";
    }

    if (year && year !== "all") query.year = parseYear(year);
    if (isFeatured !== undefined) query.isFeatured = isFeatured === "true";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { titleMarathi: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [total, events] = await Promise.all([
      Event.countDocuments(query),
      Event.find(query)
        .sort({ date: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success: true,
      status: "success",
      count: events.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured event(s) for homepage / countdown
// @route   GET /api/events/featured
// @access  Public
export const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isFeatured: true, isActive: true })
      .sort({
        targetDate: 1,
        date: 1,
      })
      .lean();

    // Provide single primary featured object as data (with array fallback on allFeatured)
    let primaryFeatured = events.length > 0 ? events[0] : null;

    // If no event has isFeatured=true, fallback to the next upcoming event
    if (!primaryFeatured) {
      primaryFeatured = await Event.findOne({
        status: "upcoming",
        isActive: true,
      })
        .sort({ date: 1 })
        .lean();
    }

    res.json({
      success: true,
      status: "success",
      count: events.length,
      data: primaryFeatured,
      allFeatured: events,
    });
  } catch (error) {
    next(error);
  }
};

// Alias: get single featured event
export const getFeaturedEvent = getFeaturedEvents;

// @desc    Get all featured events (admin/list)
// @route   GET /api/events/featured/all
// @access  Public
export const getAllFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isFeatured: true, isActive: true })
      .sort({
        date: 1,
      })
      .lean();

    res.json({
      success: true,
      status: "success",
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update featured event (Countdown Timer)
// @route   POST /api/events/featured
// @access  Private/Admin
export const setFeaturedEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      targetDate,
      eventDate,
      eventTime,
      eventDetails,
      date,
      time,
      location,
    } = req.body;

    const eventTitle = (title || "Annual Temple Festival").trim();

    // Check if an existing featured event exists to update, or create a new one
    let event = await Event.findOne({ isFeatured: true });

    if (event) {
      event.title = eventTitle;
      if (description !== undefined) event.description = description;
      if (targetDate !== undefined) event.targetDate = targetDate;
      if (eventDate !== undefined) event.eventDate = eventDate;
      if (eventTime !== undefined) event.eventTime = eventTime;
      if (eventDetails !== undefined) event.eventDetails = eventDetails;
      if (date !== undefined) event.date = date;
      if (time !== undefined) event.time = time;
      if (location !== undefined) event.location = location;
      event.isFeatured = true;
      event.isActive = true;
      await event.save();
    } else {
      event = await Event.create({
        title: eventTitle,
        description: description || eventTitle,
        targetDate: targetDate || undefined,
        eventDate: eventDate || "",
        eventTime: eventTime || "",
        eventDetails: eventDetails || "",
        date: date || undefined,
        time: time || "",
        location: location || "Temple Grounds",
        status: "upcoming",
        isFeatured: true,
        isActive: true,
        year: parseYear(req.body.year),
      });
    }

    res.status(200).json({
      success: true,
      status: "success",
      message: "Featured event set successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update featured event by ID
// @route   PUT /api/events/featured/:id
// @access  Private/Admin
export const updateFeaturedEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new AppError("Featured event not found", 404));
    }

    const {
      title,
      description,
      targetDate,
      eventDate,
      eventTime,
      eventDetails,
      date,
      time,
      location,
      isActive,
    } = req.body;

    if (title !== undefined) event.title = title.trim();
    if (description !== undefined) event.description = description;
    if (targetDate !== undefined) event.targetDate = targetDate;
    if (eventDate !== undefined) event.eventDate = eventDate;
    if (eventTime !== undefined) event.eventTime = eventTime;
    if (eventDetails !== undefined) event.eventDetails = eventDetails;
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (location !== undefined) event.location = location;
    if (isActive !== undefined) event.isActive = isActive;
    event.isFeatured = true;

    await event.save();

    res.json({
      success: true,
      status: "success",
      message: "Featured event updated successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
export const getUpcomingEvents = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const events = await Event.find({
      status: "upcoming",
      isActive: true,
    })
      .sort({ date: 1, createdAt: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    res.json({
      success: true,
      status: "success",
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// Alias for upcoming event by ID
export const getUpcomingEvent = async (req, res, next) => {
  return getEventById(req, res, next);
};

// @desc    Get all distinct event years
// @route   GET /api/events/years
// @access  Public
export const getEventYears = async (req, res, next) => {
  try {
    const years = await Event.distinct("year");
    const currentYear = new Date().getFullYear();
    const allYears = new Set([
      ...years.filter(Boolean),
      currentYear,
      currentYear + 1,
    ]);
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

// @desc    Get all events for admin (including inactive)
// @route   GET /api/events/admin/all
// @access  Private/Admin
export const getEventsAdmin = async (req, res, next) => {
  try {
    const { year, search } = req.query;
    const query = {};

    if (year && year !== "all") query.year = parseYear(year);
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { titleMarathi: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      status: "success",
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError("Event not found", 404));
    }

    res.json({
      success: true,
      status: "success",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id or PUT /api/events/upcoming/:id
// @access  Private/Admin
export const updateEvent = async (req, res, next) => {
  try {
    const {
      title,
      titleMarathi,
      description,
      descriptionMarathi,
      date,
      time,
      timeMarathi,
      location,
      locationMarathi,
      year,
      attendees,
      targetDate,
      eventDate,
      eventTime,
      eventDetails,
      status,
      isFeatured,
      isActive,
    } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new AppError("Event not found", 404));
    }

    // Update text fields
    if (title !== undefined) event.title = title.trim();
    if (titleMarathi !== undefined) event.titleMarathi = titleMarathi.trim();
    if (description !== undefined) event.description = description;
    if (descriptionMarathi !== undefined) event.descriptionMarathi = descriptionMarathi;
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (timeMarathi !== undefined) event.timeMarathi = timeMarathi;
    if (location !== undefined) event.location = location;
    if (locationMarathi !== undefined) event.locationMarathi = locationMarathi;
    if (year !== undefined) event.year = parseYear(year);
    if (attendees !== undefined) event.attendees = attendees;
    if (targetDate !== undefined) event.targetDate = targetDate;
    if (eventDate !== undefined) event.eventDate = eventDate;
    if (eventTime !== undefined) event.eventTime = eventTime;
    if (eventDetails !== undefined) event.eventDetails = eventDetails;
    if (status !== undefined) event.status = status;
    if (isFeatured !== undefined)
      event.isFeatured = isFeatured === "true" || isFeatured === true;
    if (isActive !== undefined)
      event.isActive = isActive === "true" || isActive === true;

    // Replace image if a new file is uploaded
    if (req.file) {
      if (event.publicId) {
        await deleteFromCloudinary(event.publicId, "image");
      }

      const targetYear = parseYear(year || event.year);
      const folderPath = getCloudinaryFolderPath("events", targetYear);
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        folderPath,
        "image"
      );
      event.imageUrl = uploadResult.secure_url;
      event.publicId = uploadResult.public_id;
    }

    const updatedEvent = await event.save();

    res.json({
      success: true,
      status: "success",
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// Alias for upcoming event update
export const updateUpcomingEvent = updateEvent;

// @desc    Delete an event
// @route   DELETE /api/events/:id or DELETE /api/events/upcoming/:id
// @access  Private/Admin
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError("Event not found", 404));
    }

    // Delete image from Cloudinary if it exists
    if (event.publicId) {
      await deleteFromCloudinary(event.publicId, "image");
    }

    await event.deleteOne();

    res.json({
      success: true,
      status: "success",
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Alias for upcoming event deletion
export const deleteUpcomingEvent = deleteEvent;
