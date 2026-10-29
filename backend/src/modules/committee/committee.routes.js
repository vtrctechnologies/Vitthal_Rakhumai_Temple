import express from "express";
import {
  createCommitteeMember,
  getCommitteeMembers,
  getActiveCommitteeMembers,
  getCommitteeYears,
  getCommitteeMembersAdmin,
  getCommitteeMemberById,
  updateCommitteeMember,
  reorderCommitteeMembers,
  deleteCommitteeMember,
} from "./committee.controller.js";
import { protect, admin } from "../auth/auth.middleware.js";
import upload from "../../shared/middlewares/upload.middleware.js";

const router = express.Router();

// Public Routes – Special filters
router.get("/active", getActiveCommitteeMembers);
router.get("/years", getCommitteeYears);
router.get("/admin/all", protect, admin, getCommitteeMembersAdmin);

// Admin Route – Bulk reorder
router.patch("/reorder", protect, admin, reorderCommitteeMembers);

// Standard CRUD Routes
router
  .route("/")
  .get(getCommitteeMembers)
  .post(protect, admin, upload.single("image"), createCommitteeMember);

router
  .route("/:id")
  .get(getCommitteeMemberById)
  .put(protect, admin, upload.single("image"), updateCommitteeMember)
  .delete(protect, admin, deleteCommitteeMember);

export default router;
