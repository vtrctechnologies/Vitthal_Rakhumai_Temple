import mongoose from 'mongoose';

const committeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    nameMarathi: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        trim: true
    },
    positionMarathi: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    publicId: {
        type: String,
        required: [true, 'Public ID is required']
    },
    resourceType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    committeeType: {
        type: String,
        enum: ['register', 'utsav', 'mahila'],
        default: 'register'
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

export const Committee = mongoose.models.Committee || mongoose.model('Committee', committeeSchema);
