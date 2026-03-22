import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema({
  sportId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sport', 
    required: [true, 'Sport reference is required'] 
  },
  teamName: { 
    type: String, 
    required: [true, 'Team name is required'],
    trim: true
  },
  captain: { 
    type: String,
    trim: true
  },
  members: [{
    type: String,
    trim: true
  }],
  position: { 
    type: String, 
    enum: ['first', 'second', 'third'], 
    required: [true, 'Winner position is required'] 
  },
  imageUrl: { 
    type: String 
  },
  publicId: { 
    type: String 
  }
}, { timestamps: true });

winnerSchema.index({ sportId: 1, position: 1 });

export const Winner = mongoose.models.Winner || mongoose.model('Winner', winnerSchema);
