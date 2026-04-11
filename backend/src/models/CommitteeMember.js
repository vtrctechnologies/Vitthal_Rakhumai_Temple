import mongoose from "mongoose";
const committeeMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Member name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    role: {
      type: String,
      required: [true, "Member role is required"],
      trim: true,
      maxlength: [100, "Role cannot exceed 100 characters"],
    },
    committeeType: {
      type: String,
      enum: ["register", "utsav", "mahila"],
      required: [true, "Committee type is required"],
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
committeeMemberSchema.index({ committeeType: 1, isActive: 1 });
committeeMemberSchema.index({ committeeType: 1, order: 1 });

export default mongoose.model("CommitteeMember", committeeMemberSchema);
