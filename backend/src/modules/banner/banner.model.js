import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    titleMarathi: {
      type: String,
      trim: true,
    },
    descriptionMarathi: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image/Video URL is required"],
    },
    publicId: {
      type: String,
      default: "",
    },
    resourceType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    position: {
      type: String,
      enum: ["hero", "top-right", "middle-right", "bottom-right"],
      default: "hero",
    },
    order: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      default: () => new Date().getFullYear(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    link: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster year-based queries
bannerSchema.index({ year: 1, isActive: 1, order: 1 });

export const Banner =
  mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
