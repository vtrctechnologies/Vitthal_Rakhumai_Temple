import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    attendees: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "recurring", "ongoing", "completed", "cancelled"],
      default: "upcoming",
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
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ isActive: 1 });

export default mongoose.model("Event", eventSchema);
