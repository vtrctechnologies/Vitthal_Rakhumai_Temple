import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  titleMarathi: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  descriptionMarathi: {
    type: String
  },
  date: {
    type: Date,
    required: [false, 'Date is required']
  },
  time: {
    type: String,
    required: [false, 'Time is required']
  },
  timeMarathi: {
    type: String
  },
  location: {
    type: String,
    required: [false, 'Location is required'] // Making it optional for featured
  },
  locationMarathi: {
    type: String
  },
  imageUrl: {
    type: String
  },
  publicId: {
    type: String
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    default: () => new Date().getFullYear()
  },
  attendees: {
    type: String,
    trim: true
  },
  // Featured Event specific fields
  targetDate: {
    type: Date
  },
  eventDate: {
    type: String
  },
  eventTime: {
    type: String
  },
  eventDetails: {
    type: String
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for common queries
eventSchema.index({ date: 1, isActive: 1 });
eventSchema.index({ year: 1, isActive: 1 });
eventSchema.index({ isFeatured: 1, date: 1 });

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
