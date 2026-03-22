import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Guest Name is required'],
        trim: true
    },
    prize: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    publicId: {
        type: String,
        required: [true, 'Cloudinary Public ID is required']
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

guestSchema.index({ year: 1, isActive: 1, order: 1 });

export const Guest = mongoose.models.Guest || mongoose.model('Guest', guestSchema);
