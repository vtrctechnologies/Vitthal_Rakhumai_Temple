import express from "express";
import {
  createGuest,
  getGuests,
  getActiveGuests,
  getGuestById,
  updateGuest,
  reorderGuests,
  deleteGuest,
} from "./guest.controller.js";
import { protect, admin } from "../auth/auth.middleware.js";
import upload from "../../shared/middlewares/upload.middleware.js";

const router = express.Router();

// Public Routes – Special filters (defined before /:id to avoid conflict)
router.get("/active", getActiveGuests);
router.get("/admin/all", protect, admin, getGuests);

// Admin Route – Bulk reorder
router.patch("/reorder", protect, admin, reorderGuests);

// Public & Admin Routes – Main CRUD
router
  .route("/")
  .get(getGuests)
  .post(protect, admin, upload.single("image"), createGuest);

router
  .route("/:id")
  .get(getGuestById)
  .put(protect, admin, upload.single("image"), updateGuest)
  .delete(protect, admin, deleteGuest);

export default router;
