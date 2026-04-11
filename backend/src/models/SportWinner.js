import mongoose from "mongoose";

const sportWinnerSchema = new mongoose.Schema(
  {
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: [true, "Sport reference is required"],
    },
    position: {
      type: String,
      enum: ["first", "second", "third"],
      required: [true, "Winner position is required"],
    },
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      maxlength: [200, "Team name cannot exceed 200 characters"],
    },
    captain: {
      type: String,
      required: [true, "Captain name is required"],
      trim: true,
      maxlength: [100, "Captain name cannot exceed 100 characters"],
    },
    members: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        isCaptain: {
          type: Boolean,
          default: false,
        },
      },
    ],
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
sportWinnerSchema.index({ sport: 1, isActive: 1 });

// Ensure only one winner per position per sport (unique index)
sportWinnerSchema.index({ sport: 1, position: 1 }, { unique: true });

export default mongoose.model("SportWinner", sportWinnerSchema);
