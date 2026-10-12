import express from "express";
import {
  createGalleryItem,
  getGalleryItems,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
} from "./gallery.controller.js";
import {
  getCategories,
  getCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../category/category.controller.js";
import { protect, admin } from "../auth/auth.middleware.js";
import upload from "../../shared/middlewares/upload.middleware.js";

const router = express.Router();

// Category Sub-routes
router.get("/categories/admin/all", protect, admin, getCategoriesAdmin);
router
  .route("/categories")
  .get(getCategories)
  .post(protect, admin, createCategory);

router
  .route("/categories/:id")
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

// Image Sub-routes (alias for admin)
router.get("/images/admin/all", protect, admin, getGalleryItems);
router
  .route("/images")
  .get(getGalleryItems)
  .post(protect, admin, upload.single("image"), createGalleryItem);

router
  .route("/images/:id")
  .get(getGalleryItemById)
  .put(protect, admin, upload.single("image"), updateGalleryItem)
  .delete(protect, admin, deleteGalleryItem);

// Direct root CRUD
router
  .route("/")
  .get(getGalleryItems)
  .post(protect, admin, upload.single("image"), createGalleryItem);

router
  .route("/:id")
  .get(getGalleryItemById)
  .put(protect, admin, upload.single("image"), updateGalleryItem)
  .delete(protect, admin, deleteGalleryItem);

export default router;
