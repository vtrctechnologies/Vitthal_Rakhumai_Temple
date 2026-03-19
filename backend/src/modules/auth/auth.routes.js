import express from 'express';
import { authController } from './auth.controller.js';
import { authValidator } from './auth.validator.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', authValidator.register, authController.register);
router.post('/login', authValidator.login, authController.login);
router.post('/forgot-password', authValidator.forgotPassword, authController.forgotPassword);
router.post('/verify-otp', authValidator.verifyOTP, authController.verifyOTP);
router.post('/resend-otp', authValidator.forgotPassword, authController.resendOTP);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, authValidator.changePassword, authController.changePassword);
router.put('/reset-password', protect, authValidator.resetPassword, authController.resetPassword);
router.put('/update-email', protect, authValidator.updateEmail, authController.updateEmail);
router.put('/update-phone', protect, authValidator.updatePhone, authController.updatePhone);

export default router;
