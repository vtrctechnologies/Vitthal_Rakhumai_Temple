import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image/Video URL is required']
  },
  publicId: {
    type: String,
    required: [true, 'Cloudinary Public ID is required']
  },
  resourceType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    default: () => new Date().getFullYear()
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

// Index for filtering
gallerySchema.index({ category: 1, year: 1, isActive: 1, order: 1 });

export const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
