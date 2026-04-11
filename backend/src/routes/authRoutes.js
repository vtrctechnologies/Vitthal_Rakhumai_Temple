import express from "express";
import {
  register,
  login,
  getMe,
  changePassword,
  resetPassword,
  forgotPassword,
  verifyOTP,
  resendOTP,
  updateEmail,
  updatePhone,
  checkAdminEmail,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.get("/check-email/:username", checkAdminEmail);

// ==================== PROTECTED ROUTES ====================
// All routes below require the 'protect' middleware

router.get("/me", protect, getMe);

router.put("/change-password", protect, changePassword);

// Note: If this is an admin resetting a user's password, 'protect' is correct.
// If this is a user resetting via email token, this might need to be public/token-based.
router.put("/reset-password", protect, resetPassword);

router.put("/update-email", protect, updateEmail);
router.put("/update-phone", protect, updatePhone);

export default router;
