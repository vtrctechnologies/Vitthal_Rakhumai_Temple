import express from "express";
import {
  getCommitteeMembers,
  getCommitteeMember,
  createCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
} from "../controllers/committeeController.js";
import { protect } from "../middleware/auth.js";
import createUploader from "../utils/uploadFactory.js";

const router = express.Router();
const committeeUpload = createUploader("committee");
// ==================== COMMITTEE ROUTES ====================

// 1. Root Routes
router
  .route("/")
  .get(getCommitteeMembers)
  .post(protect, committeeUpload.single("image"), createCommitteeMember);

// 2. Dynamic Routes (ID-based operations)
router
  .route("/:id")
  .get(getCommitteeMember)
  .put(protect, committeeUpload.single("image"), updateCommitteeMember)
  .delete(protect, deleteCommitteeMember);

export default router;
