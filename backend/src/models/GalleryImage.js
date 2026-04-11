import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Image title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GalleryCategory",
      required: [true, "Category is required"],
    },
    image: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
galleryImageSchema.index({ category: 1, isActive: 1 });
galleryImageSchema.index({ category: 1, order: 1 });
galleryImageSchema.index({ isActive: 1 });

export default mongoose.model("GalleryImage", galleryImageSchema);
