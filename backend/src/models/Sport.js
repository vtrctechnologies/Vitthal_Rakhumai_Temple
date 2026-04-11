import mongoose from "mongoose";

const sportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sport name is required"],
      trim: true,
      maxlength: [100, "Sport name cannot exceed 100 characters"],
    },
    title: {
      type: String,
      required: [true, "Sport title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    heroColor: {
      type: String,
      default: "bg-orange-100",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      required: false, // Make optional for backward compatibility
      min: [2000, "Year cannot be before 2000"],
      max: [2100, "Year cannot be after 2100"],
      default: () => new Date().getFullYear(),
    },
    isActive: {
      type: Boolean,
      default: true,
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
sportSchema.index({ isActive: 1, order: 1 });
sportSchema.index({ year: 1, isActive: 1 });
sportSchema.index({ year: 1 });
// Ensure unique sport name per year
sportSchema.index({ name: 1, year: 1 }, { unique: true });

export default mongoose.model("Sport", sportSchema);
