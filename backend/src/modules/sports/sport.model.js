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
  }
}, { timestamps: true });

sportSchema.index({ year: -1, isActive: 1 });

export const Sport = mongoose.models.Sport || mongoose.model('Sport', sportSchema);
