import { body } from 'express-validator';

export const authValidator = {
  register: [
    body('username')
      .isString().withMessage('Username must be a string')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone')
      .notEmpty().withMessage('Phone number is required')
  ],

  login: [
    body('email')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],

  forgotPassword: [
    body('username')
      .notEmpty().withMessage('Username is required')
  ],

  verifyOTP: [
    body('username')
      .notEmpty().withMessage('Username is required'),
    body('otp')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],

  resetPassword: [
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],

  updateEmail: [
    body('newEmail').isEmail().withMessage('Please provide a valid email')
  ],

  updatePhone: [
    body('newPhone').notEmpty().withMessage('Phone number is required')
  ]
};
