import express from "express";
import {
  getGalleryImages,
  getGalleryImagesAdmin,
  getGalleryImage,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from "../controllers/galleryImageController.js";
import {
  getCategories,
  getCategoriesAdmin,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/galleryCategoryController.js";
import { protect } from "../middleware/auth.js";
import createUploader from "../utils/uploadFactory.js";

const router = express.Router();
const galleryUpload = createUploader("gallery");

// ==================== GALLERY IMAGES ROUTES ====================

// 1. Static & Admin Routes (Must come before dynamic paths)
router.get("/images/admin/all", protect, getGalleryImagesAdmin);

// 2. Root Image Routes
router
  .route("/images")
  .get(getGalleryImages)
  .post(
    protect,
    (req, res, next) => {
      galleryUpload.single("image")(req, res, (err) => {
        if (err) {
          // Handle multer errors
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              status: "error",
              message: "File too large. Maximum size is 5MB.",
            });
          }
          if (err.message) {
            return res.status(400).json({
              status: "error",
              message: err.message,
            });
          }
          return res.status(400).json({
            status: "error",
            message: "File upload error",
          });
        }
        next();
      });
    },
    createGalleryImage
  );

// 3. Dynamic Image Routes (ID-based)
router
  .route("/images/:id")
  .get(getGalleryImage)
  .put(
    protect,
    (req, res, next) => {
      galleryUpload.single("image")(req, res, (err) => {
        if (err) {
          // Handle multer errors
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              status: "error",
              message: "File too large. Maximum size is 5MB.",
            });
          }
          if (err.message) {
            return res.status(400).json({
              status: "error",
              message: err.message,
            });
          }
          return res.status(400).json({
            status: "error",
            message: "File upload error",
          });
        }
        next();
      });
    },
    updateGalleryImage
  )
  .delete(protect, deleteGalleryImage);

// ==================== GALLERY CATEGORIES ROUTES ====================

// 1. Static & Admin Routes
router.get("/categories/admin/all", protect, getCategoriesAdmin);

// 2. Root Category Routes
router.route("/categories").get(getCategories).post(protect, createCategory);

// 3. Dynamic Category Routes (ID-based)
router
  .route("/categories/:id")
  .get(getCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;
