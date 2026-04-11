import express from "express";
import {
  getLivePrograms,
  getLiveProgram,
  getLiveProgramYears,
  createLiveProgram,
  updateLiveProgram,
  deleteLiveProgram,
} from "../controllers/liveProgramController.js";
import {
  getCategories,
  getCategoriesAdmin,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/liveProgramCategoryController.js";
import { protect } from "../middleware/auth.js";
import createUploader from "../utils/uploadFactory.js";

const router = express.Router();
const liveProgramUpload = createUploader("live-programs");

// ==================== LIVE PROGRAM CATEGORY ROUTES ====================

// 1. Static & Admin Routes (Must come before dynamic paths)
router.get("/categories/admin/all", protect, getCategoriesAdmin);

// 2. Root Category Routes
router
  .route("/categories")
  .get(getCategories)
  .post(protect, createCategory);

// 3. Dynamic Category Routes (ID-based operations)
router
  .route("/categories/:id")
  .get(getCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

// ==================== LIVE PROGRAM ROUTES ====================

// 1. Static Routes (Must come before dynamic paths)
router.get("/years", getLiveProgramYears);

// 2. Root Routes
router
  .route("/")
  .get(getLivePrograms)
  .post(protect, liveProgramUpload.single("thumbnail"), createLiveProgram);

// 2. Dynamic Routes (ID-based operations)
router
  .route("/:id")
  .get(getLiveProgram)
  .put(protect, liveProgramUpload.single("thumbnail"), updateLiveProgram)
  .delete(protect, deleteLiveProgram);

export default router;
