import express from "express";
import {
  createDonation,
  verifyPayment,
  getLeaderboard,
  getAllDonations,
  getDonation,
} from "./donation.controller.js";
import {
  getActiveTopDonors,
  getAdminTopDonors,
  createTopDonor,
  updateTopDonor,
  deleteTopDonor,
} from "./topDonor.controller.js";
import { protect, admin } from "../auth/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/create", createDonation);
router.post("/verify", verifyPayment);
router.get("/leaderboard", getLeaderboard);
router.get("/top-donors", getActiveTopDonors);

// Protected top-donors routes (admin only - placed before /:id)
router.get("/top-donors/admin", protect, admin, getAdminTopDonors);
router.post("/top-donors", protect, admin, createTopDonor);
router.put("/top-donors/:id", protect, admin, updateTopDonor);
router.delete("/top-donors/:id", protect, admin, deleteTopDonor);

// Protected donation routes (admin only)
router.get("/", protect, admin, getAllDonations);
router.get("/:id", protect, admin, getDonation);

export default router;
