import mongoose from 'mongoose';

const liveCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  nameMarathi: {
    type: String,
    trim: true
  },
  descriptionMarathi: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const liveProgramSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Program title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Program description is required'],
    trim: true
  },
  titleMarathi: {
    type: String,
    trim: true
  },
  descriptionMarathi: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveCategory',
    required: [true, 'Category is required']
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  publicId: {
    type: String,
    default: ''
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    default: () => new Date().getFullYear()
  },
  startTimestamp: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTimestamp: {
    type: Date,
    required: [true, 'End time is required']
  },
  socialLinks: {
    youtube: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    other: { type: String, default: '' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isLive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for common queries
liveProgramSchema.index({ category: 1, year: 1, isActive: 1 });
liveProgramSchema.index({ startTimestamp: 1 });

const LiveCategory = mongoose.model('LiveCategory', liveCategorySchema);
const LiveProgram = mongoose.model('LiveProgram', liveProgramSchema);

export { LiveCategory, LiveProgram };
