import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [1, "Donation amount must be at least ₹1"],
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "success", "failed", "cancelled"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "other"],
      default: "upi",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for leaderboard queries and payment lookups
donationSchema.index({ amount: -1, createdAt: -1 });
donationSchema.index({ paymentStatus: 1 });

export const Donation =
  mongoose.models.Donation || mongoose.model("Donation", donationSchema);

export default Donation;
