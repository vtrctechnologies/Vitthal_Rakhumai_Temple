import mongoose from "mongoose";

const subscriberSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "newsletter",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isDisabled: {
      type: Boolean,
      default: true,
    },
    disabledMessage: {
      type: String,
      trim: true,
      default: "Temporarily Disabled",
    },
    disabledMessageMr: {
      type: String,
      trim: true,
      default: "तात्पुरते बंद आहे",
    },
  },
  { timestamps: true }
);

export const SubscriberSettings =
  mongoose.models.SubscriberSettings ||
  mongoose.model("SubscriberSettings", subscriberSettingsSchema);

export default SubscriberSettings;
