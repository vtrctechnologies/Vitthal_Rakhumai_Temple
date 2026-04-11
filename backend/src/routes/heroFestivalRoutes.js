import express from "express";
import {
  getHeroFestival,
  getAllHeroFestivals,
  createHeroFestival,
  updateHeroFestival,
  deleteHeroFestival,
} from "../controllers/heroFestivalController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ==================== HERO FESTIVAL ROUTES ====================

// 1. Static & Admin Routes (Must come before dynamic paths if any existed)
router.get("/all", protect, getAllHeroFestivals);

// 2. Root Routes
router
  .route("/")
  .get(getHeroFestival) // Public: Get the current/active festival
  .post(protect, createHeroFestival); // Admin: Create new

// 3. Dynamic Routes (ID-based operations)
router
  .route("/:id")
  .put(protect, updateHeroFestival)
  .delete(protect, deleteHeroFestival);

export default router;
