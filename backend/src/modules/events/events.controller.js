import { Event } from './events.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../shared/config/cloudinary.js';

// Set featured event (for countdown)
export const setFeaturedEvent = async (req, res) => {
  try {
    const { title, description, targetDate, eventDate, eventTime, eventDetails } = req.body;

    await Event.updateMany({ isFeatured: true }, { isFeatured: false });

    const eventData = {
      title,
      description,
      targetDate: new Date(targetDate),
      eventDate,
      eventTime,
      eventDetails,
      isFeatured: true,
      isActive: true,
      date: new Date(targetDate),
      time: eventTime || 'TBA',
      location: eventDetails || 'TBA',
      year: new Date(targetDate).getFullYear()
    };

    const event = await Event.create(eventData);
    res.status(201).json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get featured event (countdown timer)
export const getFeaturedEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ isFeatured: true, isActive: true }).sort({ date: 1 });
    
    if (!event) {
      const fallback = await Event.findOne({ date: { $gte: new Date() }, isActive: true }).sort({ date: 1 });
      return res.status(200).json({ status: 'success', data: fallback });
    }

    res.status(200).json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const events = await Event.find({ date: { $gte: new Date() }, isActive: true })
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.status(200).json({ status: 'success', data: events });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get all events (with filtering)
export const getEvents = async (req, res) => {
  try {
    const { year, upcoming, limit } = req.query;
    const filter = { isActive: true };

    if (year) filter.year = parseInt(year);
    if (upcoming === 'true') filter.date = { $gte: new Date() };

    let query = Event.find(filter).sort({ date: 1 });
    if (limit) query = query.limit(parseInt(limit));

    const events = await query.exec();
    res.status(200).json({ status: 'success', data: events });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get all events for admin
export const getEventsAdmin = async (req, res) => {
  try {
    const { year } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year);

    const events = await Event.find(filter).sort({ date: -1 });
    res.status(200).json({ status: 'success', data: events });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get available event years
export const getEventYears = async (req, res) => {
  try {
    const years = await Event.distinct('year');
    res.status(200).json({ status: 'success', data: years.sort((a, b) => b - a) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get single event
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });
    res.status(200).json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, attendees, status, year, isFeatured, isActive } = req.body;

    const eventData = {
      title,
      description,
      date: new Date(date),
      time,
      location,
      attendees,
      status: status || 'upcoming',
      year: parseInt(year) || new Date(date).getFullYear(),
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isActive: isActive === 'true' || isActive === true
    };

    if (eventData.isFeatured) {
      await Event.updateMany({ isFeatured: true }, { isFeatured: false });
    }

    if (req.file) {
      const targetYear = eventData.year;
      const folder = `vrtemple/events/${targetYear}`;
      const uploadResult = await uploadToCloudinary(req.file.buffer, folder, 'image');
      eventData.imageUrl = uploadResult.secure_url;
      eventData.publicId = uploadResult.public_id;
    }

    const event = await Event.create(eventData);
    res.status(201).json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });

    const updateData = { ...req.body };

    if (req.file) {
      if (event.publicId) {
        await deleteFromCloudinary(event.publicId, 'image');
      }
      const targetYear = parseInt(updateData.year) || event.year || new Date().getFullYear();
      const folder = `vrtemple/events/${targetYear}`;
      const uploadResult = await uploadToCloudinary(req.file.buffer, folder, 'image');
      updateData.imageUrl = uploadResult.secure_url;
      updateData.publicId = uploadResult.public_id;
    }

    if (updateData.date) updateData.date = new Date(updateData.date);
    if (updateData.year) updateData.year = parseInt(updateData.year);
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
      if (updateData.isFeatured) {
        await Event.updateMany({ isFeatured: true }, { isFeatured: false });
      }
    }
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: updatedEvent });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });

    if (event.publicId) {
      await deleteFromCloudinary(event.publicId, 'image');
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
