import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
} from "./auth.controller.js";
import { protect, admin } from "./auth.middleware.js";

const router = express.Router();

// Public Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// /me alias (used by admin panel to verify token on load)
router.get("/me", protect, getUserProfile);

// User Profile Routes (Protected - User operations)
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

// Admin User Management Routes (Protected - Admin operations)
router
  .route("/users")
  .get(protect, admin, getAllUsers)
  .post(protect, admin, createUser);

router
  .route("/users/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
