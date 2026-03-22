import mongoose from 'mongoose';

const heroSectionSchema = new mongoose.Schema({
  mainTitle: {
    type: String,
    required: [true, 'Main title (English) is required'],
    trim: true
  },
  mainTitleMarathi: {
    type: String,
    trim: true
  },
  accentTitle: {
    type: String,
    trim: true
  },
  accentTitleMarathi: {
    type: String,
    trim: true
  },
  subTitle: {
    type: String,
    trim: true
  },
  subTitleMarathi: {
    type: String,
    trim: true
  },
  festivalTitle: {
    type: String,
    trim: true,
    default: 'Next Festival: Kartiki Ekadashi'
  },
  festivalTitleMarathi: {
    type: String,
    trim: true,
    default: 'पुढील उत्सव: कार्तिकी एकादशी'
  },
  backgroundUrl: {
    type: String,
    default: ''
  },
  publicId: {
    type: String,
    default: ''
  },
  resourceType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware to ensure only one hero section is active at a time if isActive is true
heroSectionSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

const HeroSection = mongoose.model('HeroSection', heroSectionSchema);

export { HeroSection };
