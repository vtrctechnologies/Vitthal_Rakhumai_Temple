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
} from "./commitee.controller.js";
import { protect, admin } from "../auth/auth.middleware.js";
import upload from "../../shared/middlewares/upload.middleware.js";

const router = express.Router();

// Public Routes – Special filters (defined before /:id to avoid conflict)
router.get("/active", getActiveCommitteeMembers);
router.get("/years", getCommitteeYears);
router.get("/admin/all", protect, admin, getCommitteeMembersAdmin);

// Admin Route – Bulk reorder
router.patch("/reorder", protect, admin, reorderCommitteeMembers);

// Public & Admin Routes – Main CRUD
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
