import mongoose from "mongoose";

const liveProgramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Program title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Program description is required"],
      trim: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    startTimestamp: {
      type: Date,
      required: [true, "Start timestamp is required"],
    },
    endTimestamp: {
      type: Date,
      required: [true, "End timestamp is required"],
    },
    socialLinks: {
      youtube: {
        type: String,
        trim: true,
        default: "",
      },
      facebook: {
        type: String,
        trim: true,
        default: "",
      },
      instagram: {
        type: String,
        trim: true,
        default: "",
      },
      twitter: {
        type: String,
        trim: true,
        default: "",
      },
      other: {
        type: String,
        trim: true,
        default: "",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveProgramCategory",
      required: [true, "Category is required"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      validate: {
        validator: function (value) {
          return value >= 2000 && value <= 2100;
        },
        message: "Year must be between 2000 and 2100",
      },
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
liveProgramSchema.index({ isActive: 1, startTimestamp: 1 });
liveProgramSchema.index({ isLive: 1 });
liveProgramSchema.index({ category: 1, isActive: 1 });
liveProgramSchema.index({ year: 1, isActive: 1 });
liveProgramSchema.index({ year: -1 });

export default mongoose.model("LiveProgram", liveProgramSchema);
