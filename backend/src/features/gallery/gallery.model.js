import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a gallery item title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please assign a category to this gallery item"],
    },
    mediaUrl: {
      type: String,
      required: [true, "Media URL is required"],
    },
    publicId: {
      type: String,
      required: [true, "Cloudinary public_id is required"],
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
      required: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      default: () => new Date().getFullYear(),
    },
    imageUrl: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize imageUrl and mediaUrl automatically
gallerySchema.pre("save", function () {
  if (this.mediaUrl && !this.imageUrl) {
    this.imageUrl = this.mediaUrl;
  }
  if (this.imageUrl && !this.mediaUrl) {
    this.mediaUrl = this.imageUrl;
  }
});

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
