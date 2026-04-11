import mongoose from "mongoose";

const heroFestivalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Festival title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    titleMarathi: {
      type: String,
      trim: true,
      maxlength: [200, "Marathi title cannot exceed 200 characters"],
      default: "",
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

// Only allow one active festival at a time
heroFestivalSchema.index({ isActive: 1 });

export default mongoose.model("HeroFestival", heroFestivalSchema);
