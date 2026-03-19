import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date },
  description: { type: String }
}, { timestamps: true });

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
