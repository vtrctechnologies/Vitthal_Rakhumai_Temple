import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import AppError from "./AppError.js";

// Factory function to create Cloudinary uploaders
const createUploader = (subfolder) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `vr-temple/${subfolder}`,
      format: "webp", // Automatically convert to webp
      public_id: (req, file) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const name = file.originalname
          .split(".")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
        return `${subfolder.replace(/s$/, "")}-${name}-${uniqueSuffix}`;
      },
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Only image files (jpeg, jpg, png, gif, webp) are allowed!",
          400
        ),
        false
      );
    }
  };

  return multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter,
  });
};

export default createUploader;
