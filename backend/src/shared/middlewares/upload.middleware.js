import multer from "multer";

// Use memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage();

// File filter to allow images and videos
const fileFilter = (req, file, cb) => {
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

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPG, JPEG, PNG, WEBP, GIF images and MP4, MKV, AVI, MOV, WEBM videos are allowed!"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for media files
  },
});

// Robust single file middleware that accepts requested field or common aliases ('image', 'file', 'thumbnail', etc.)
const defaultSingle = upload.single.bind(upload);
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
      next();
    });
  };
};

export default upload;
