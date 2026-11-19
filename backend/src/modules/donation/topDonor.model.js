import mongoose from "mongoose";

const topDonorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
    },
    marathiName: {
      type: String,
      trim: true,
      default: "",
    },
    tag: {
      type: String,
      trim: true,
      default: "दानशूर",
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

topDonorSchema.index({ isActive: 1, order: 1, createdAt: -1 });

export const TopDonor =
  mongoose.models.TopDonor || mongoose.model("TopDonor", topDonorSchema);

export default TopDonor;
