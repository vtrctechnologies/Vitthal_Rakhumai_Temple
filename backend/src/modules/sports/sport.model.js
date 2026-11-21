import mongoose from 'mongoose';

const sportSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Sport name is required'],
    trim: true
  },
  title: { 
    type: String, 
    required: [true, 'Tournament title is required'],
    trim: true
  },
  description: { 
    type: String 
  },
  nameMarathi: { 
    type: String, 
    trim: true 
  },
  titleMarathi: { 
    type: String, 
    trim: true 
  },
  descriptionMarathi: { 
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
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isRegistrationOpen: {
    type: Boolean,
    default: false
  },
  registrationStartDate: {
    type: Date,
    default: null
  },
  registrationEndDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    default: 'Sports'
  },
  entryFee: {
    type: String,
    default: 'Free'
  },
  prizes: {
    type: String,
    default: ''
  },
  rules: {
    type: String,
    default: ''
  },
  rulesMarathi: {
    type: String,
    default: ''
  },
  prizesMarathi: {
    type: String,
    default: ''
  },
  entryFeeMarathi: {
    type: String,
    default: ''
  },
  categoryMarathi: {
    type: String,
    default: ''
  },
  maxParticipants: {
    type: Number,
    default: 0
  },
  registrationType: {
    type: String,
    enum: ['individual', 'team'],
    default: 'individual'
  }
}, { timestamps: true });

sportSchema.index({ year: -1, isActive: 1 });
sportSchema.index({ isRegistrationOpen: 1, registrationEndDate: 1 });

export const Sport = mongoose.models.Sport || mongoose.model('Sport', sportSchema);
