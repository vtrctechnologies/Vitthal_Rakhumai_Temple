import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  category: { type: String }
}, { timestamps: true });

export const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
