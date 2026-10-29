import express from "express";
import {
  createDonation,
  verifyPayment,
  getLeaderboard,
  getAllDonations,
  getDonation,
} from "./donation.controller.js";
import { protect, admin } from "../auth/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/create", createDonation);
router.post("/verify", verifyPayment);
router.get("/leaderboard", getLeaderboard);

// Protected routes (admin only)
router.get("/", protect, admin, getAllDonations);
router.get("/:id", protect, admin, getDonation);

export default router;
