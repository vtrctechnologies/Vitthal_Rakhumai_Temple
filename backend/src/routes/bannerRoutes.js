import express from "express";
import {
  getBanners,
  getBanner,
  getBannerYears,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { protect } from "../middleware/auth.js";
import createUploader from "../utils/uploadFactory.js";

const router = express.Router();

const bannerUpload = createUploader("banners");

// ==================== BANNER ROUTES ====================

// 1. Static Routes (Must come before dynamic /:id)
router.get("/years", getBannerYears);

// 2. Root Routes
router
  .route("/")
  .get(getBanners)
  .post(protect, bannerUpload.single("image"), createBanner);

// 3. Dynamic Routes (ID-based operations)
router
  .route("/:id")
  .get(getBanner)
  .put(protect, bannerUpload.single("image"), updateBanner)
  .delete(protect, deleteBanner);

export default router;
