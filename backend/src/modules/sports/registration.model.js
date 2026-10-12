import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
      required: [true, 'Sport/Competition is required'],
    },
    sportName: {
      type: String,
      required: true,
      trim: true,
    },
    participantName: {
      type: String,
      required: [true, 'Participant Name is required'],
      trim: true,
    },
    teamName: {
      type: String,
      trim: true,
      default: '',
    },
    captainName: {
      type: String,
      trim: true,
      default: '',
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    villageOrCity: {
      type: String,
      trim: true,
      default: '',
    },
    playersCount: {
      type: Number,
      default: 1,
    },
    playerNames: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

registrationSchema.index({ sport: 1, createdAt: -1 });
registrationSchema.index({ mobile: 1 });

export const Registration =
  mongoose.models.Registration ||
  mongoose.model('Registration', registrationSchema);
