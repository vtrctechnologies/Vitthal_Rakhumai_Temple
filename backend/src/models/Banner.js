import mongoose from "mongoose";
const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    position: {
      type: String,
      enum: ["hero", "top-right", "middle-right", "bottom-right"],
      required: [true, "Banner position is required"],
      default: "hero",
    },
    order: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      required: [true, "Banner year is required"],
      default: () => new Date().getFullYear(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    link: {
      type: String,
      trim: true,
      default: "",
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
bannerSchema.index({ position: 1, isActive: 1 });
bannerSchema.index({ order: 1 });
bannerSchema.index({ year: 1, isActive: 1 });
bannerSchema.index({ year: -1 });

export default mongoose.model("Banner", bannerSchema);
