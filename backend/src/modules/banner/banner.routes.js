import express from "express";
import {
  createBanner,
  getBanners,
  getActiveBanners,
  getBannerYears,
  getBannerById,
  updateBanner,
  reorderBanners,
  deleteBanner,
} from "./banner.controller.js";
import { protect, admin } from "../auth/auth.middleware.js";
import upload from "../../shared/middlewares/upload.middleware.js";

const router = express.Router();

// Public Routes - Special filters (defined before /:id to avoid conflict)
router.get("/active", getActiveBanners);
router.get("/years", getBannerYears);

// Admin Route - Bulk reorder
router.patch("/reorder", protect, admin, reorderBanners);

// Public & Admin Routes - Main CRUD
router
  .route("/")
  .get(getBanners)
  .post(protect, admin, upload.single("image"), createBanner);

router
  .route("/:id")
  .get(getBannerById)
  .put(protect, admin, upload.single("image"), updateBanner)
  .delete(protect, admin, deleteBanner);

export default router;
