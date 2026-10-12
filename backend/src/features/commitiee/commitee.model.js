import mongoose from "mongoose";

const committeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    nameMarathi: {
      type: String,
      trim: true,
      default: "",
    },
    position: {
      type: String,
      trim: true,
      default: "Member",
    },
    role: {
      type: String,
      trim: true,
      default: "Member",
    },
    positionMarathi: {
      type: String,
      trim: true,
      default: "",
    },
    roleMarathi: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    publicId: {
      type: String,
      default: "",
    },
    resourceType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    committeeType: {
      type: String,
      enum: ["register", "utsav", "mahila"],
      default: "register",
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      default: () => new Date().getFullYear(),
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
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (!ret.role && ret.position) ret.role = ret.position;
        if (!ret.position && ret.role) ret.position = ret.role;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        if (!ret.role && ret.position) ret.role = ret.position;
        if (!ret.position && ret.role) ret.position = ret.role;
        return ret;
      },
    },
  },
);

committeeSchema.pre("save", function () {
  const finalPos = this.position || this.role || "Member";
  this.position = finalPos;
  this.role = finalPos;

  const finalPosMr = this.positionMarathi || this.roleMarathi || "";
  this.positionMarathi = finalPosMr;
  this.roleMarathi = finalPosMr;
});

export const Committee =
  mongoose.models.Committee || mongoose.model("Committee", committeeSchema);
