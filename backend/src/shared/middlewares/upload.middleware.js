import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import AppError from "../utils/AppError.js";

// Dedicated temporary upload folder for streaming files to disk to prevent memory exhaustion (SEC-014)
const tempUploadDir = path.join(os.tmpdir(), "vrtemple_uploads");
if (!fs.existsSync(tempUploadDir)) {
  try {
    fs.mkdirSync(tempUploadDir, { recursive: true });
  } catch (err) {
    console.warn("Notice: Failed to create temp upload directory:", err.message);
  }
}

// Multer diskStorage streams upload chunks directly to temporary files on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase() || ".tmp";
    cb(null, `upload_${Date.now()}_${uniqueSuffix}${ext}`);
  },
});

// Allowed MIME types
const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const allowedVideoTypes = [
  "video/mp4",
  "video/mkv",
  "video/avi",
  "video/mov",
  "video/webm",
  "video/quicktime",
];

// File filter checking client-reported MIME type
const fileFilter = (req, file, cb) => {
  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only JPG, JPEG, PNG, WEBP, GIF images and MP4, MKV, AVI, MOV, WEBM videos are allowed!",
        400
      ),
      false
    );
  }
};

/**
 * Validates initial file magic bytes to prevent MIME spoofing / disguised payload attacks (SEC-014).
 * @param {string} filePath - Absolute path to temporary uploaded file
 * @returns {boolean} True if magic bytes match allowed image/video signatures
 */
export const verifyMagicBytes = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return false;
  try {
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(16);
    const bytesRead = fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    if (bytesRead < 4) return false;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return true;
    }

    // PNG: 89 50 4E 47
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return true;
    }

    // GIF: 47 49 46 38 ("GIF8")
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return true;
    }

    // WEBP: "RIFF" .... "WEBP"
    if (
      bytesRead >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      return true;
    }

    // MP4 / MOV: bytes 4..8 === "ftyp"
    if (bytesRead >= 8 && buffer.toString("ascii", 4, 8) === "ftyp") {
      return true;
    }

    // Matroska / WebM: 1A 45 DF A3
    if (
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB ceiling streamed to disk, avoiding V8 heap OOM
  },
});

/**
 * Robust single file middleware that accepts requested field or common aliases
 * ('image', 'file', 'thumbnail', etc.) and validates magic bytes on disk.
 */
upload.single = (primaryField = "file") => {
  const candidateFields = Array.from(
    new Set([primaryField, "image", "file", "thumbnail", "background", "photo"])
  ).map((name) => ({ name, maxCount: 1 }));

  const fieldsMiddleware = upload.fields(candidateFields);

  return (req, res, next) => {
    fieldsMiddleware(req, res, (err) => {
      if (err) return next(err);

      if (req.files) {
        if (primaryField && req.files[primaryField]?.[0]) {
          req.file = req.files[primaryField][0];
        } else {
          for (const key of Object.keys(req.files)) {
            if (req.files[key]?.[0]) {
              req.file = req.files[key][0];
              break;
            }
          }
        }
      }

      if (req.file) {
        // Backward-compatible lazy buffer getter (only reads disk if code accesses .buffer)
        if (!req.file.buffer) {
          Object.defineProperty(req.file, "buffer", {
            get() {
              if (this.path && fs.existsSync(this.path)) {
                return fs.readFileSync(this.path);
              }
              return undefined;
            },
            configurable: true,
          });
        }

        // Attach safe cleanup method to request
        req.file.cleanup = () => {
          if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
              fs.unlinkSync(req.file.path);
            } catch {}
          }
        };

        // Guarantee temp file cleanup on response completion or abort
        res.on("finish", () => req.file?.cleanup?.());
        res.on("close", () => req.file?.cleanup?.());

        // Validate actual file signature (magic bytes) to prevent spoofing attacks
        if (req.file.path && !verifyMagicBytes(req.file.path)) {
          req.file.cleanup();
          return next(
            new AppError(
              "Invalid file content. Uploaded file signature does not match allowed image or video formats.",
              400
            )
          );
        }
      }

      next();
    });
  };
};

export default upload;
