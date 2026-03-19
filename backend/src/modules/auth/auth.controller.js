import { authService } from './auth.service.js';
import { validationResult } from 'express-validator';

export const authController = {
  /**
   * Register a new admin/user
   */
  register: async (req, res) => {
    try {
      // 1) Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'fail', errors: errors.array() });
      }

      // 2) Business logic
      const result = await authService.registerUser(req.body);
      
      // 3) Respond
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  },

  /**
   * Login user
   */
  login: async (req, res) => {
    try {
      // 1) Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'fail', errors: errors.array() });
      }

      // 2) Business logic
      const result = await authService.loginUser(req.body.email, req.body.password);
      
      // 3) Respond
      res.status(200).json(result);
    } catch (err) {
      res.status(401).json({ status: 'fail', message: err.message });
    }
  },

  /**
   * Forgot password - Generate OTP
   */
  forgotPassword: async (req, res) => {
    try {
      // 1) Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'fail', errors: errors.array() });
      }

      // 2) Business logic
      const result = await authService.forgotPassword(req.body.username);
      
      // 3) Respond
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (req, res) => {
    try {
      // 1) Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'fail', errors: errors.array() });
      }

      // 2) Business logic
      const result = await authService.verifyOTP(req.body.username, req.body.otp);
      
      // 3) Respond
      res.status(200).json(result);
    } catch (err) {
      res.status(401).json({ status: 'fail', message: err.message });
    }
  },

  /**
   * Resend OTP
   */
  resendOTP: async (req, res) => {
    try {
      const result = await authService.forgotPassword(req.body.username);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  },

  /**
   * Get Current Admin/User
   */
  getMe: async (req, res) => {
    try {
      const result = await authService.getMe(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(404).json({ status: 'fail', message: err.message });
    }
  },

  /**
   * Change Password
   */
  changePassword: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'fail', errors: errors.array() });
      }

      const result = await authService.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  },

  /**
   * Reset Password
   */
  resetPassword: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'fail', errors: errors.array() });
      }

      const result = await authService.resetPassword(req.user.id, req.body.newPassword);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  },

  /**
   * Update Email
   */
  updateEmail: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'fail', errors: errors.array() });
      }

      const result = await authService.updateEmail(req.user.id, req.body.newEmail);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  },

  /**
   * Update Phone
   */
  updatePhone: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'fail', errors: errors.array() });
      }

      const result = await authService.updatePhone(req.user.id, req.body.newPhone);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  }
};
