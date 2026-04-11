import express from "express";
import {
  createDonation,
  verifyPayment,
  getLeaderboard,
  getAllDonations,
  getDonation,
} from "../controllers/donationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/create", createDonation);
router.post("/verify", verifyPayment);
router.get("/leaderboard", getLeaderboard);

// Protected routes (admin only)
// Note: Specific routes must come before parameterized routes
router.get("/", protect, getAllDonations);
router.get("/:id", protect, getDonation);

export default router;
