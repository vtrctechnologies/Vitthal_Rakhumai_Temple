import mongoose from "mongoose";

const featuredEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Featured event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    targetDate: {
      type: Date,
      required: [true, "Target date is required for countdown timer"],
    },
    eventDate: {
      type: String,
      trim: true,
      default: "",
    },
    eventTime: {
      type: String,
      trim: true,
      default: "",
    },
    eventDetails: {
      type: String,
      trim: true,
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

// Only one active featured event at a time
featuredEventSchema.index({ isActive: 1 });

export default mongoose.model("FeaturedEvent", featuredEventSchema);
