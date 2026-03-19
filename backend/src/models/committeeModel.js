import mongoose from 'mongoose';

const committeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String },
  bio: { type: String }
}, { timestamps: true });

export const Committee = mongoose.models.Committee || mongoose.model('Committee', committeeSchema);
