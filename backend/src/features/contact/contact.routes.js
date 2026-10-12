import express from "express";
import {
  submitMessage,
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
  bulkDeleteMessages,
} from "./contact.controller.js";
import { protect, admin } from "../auth/auth.middleware.js";

const router = express.Router();

// Root route: POST (public) + GET/DELETE (admin)
router
  .route("/")
  .post(submitMessage)
  .get(protect, admin, getMessages)
  .delete(protect, admin, bulkDeleteMessages);

// Messages alias for admin panel
router
  .route("/messages")
  .get(protect, admin, getMessages)
  .delete(protect, admin, bulkDeleteMessages);

router
  .route("/messages/:id")
  .get(protect, admin, getMessageById)
  .delete(protect, admin, deleteMessage);

router
  .route("/:id")
  .get(protect, admin, getMessageById)
  .delete(protect, admin, deleteMessage);

// Admin Route – Toggle read/unread status
router.patch("/:id/status", protect, admin, updateMessageStatus);

export default router;
