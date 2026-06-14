import { User } from '../../models/userModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

export const authService = {
  /**
   * Register a new user
   */
  registerUser: async (userData) => {
    const { username, email, password, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      phone,
      role: 'admin' // Default to admin for now as requested for integration
    });

    // Generate token
    const token = generateToken(user._id);

    return {
      status: 'success',
      data: {
        token,
        admin: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      }
    };
  },

  /**
   * Login user
   */
  loginUser: async (email, password) => {
    // 1) Check if email and password exist
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Incorrect email or password');
    }

    // 3) Generate token
    const token = generateToken(user._id);

    return {
      status: 'success',
      data: {
        token,
        admin: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      }
    };
  },

  /**
   * Forgot password - Generate OTP
   */
  forgotPassword: async (username) => {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('There is no user with this username.');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save({ validateBeforeSave: false });

    // Log OTP to console in a plain, simple format
    console.log('\n----------------------------------------');
    console.log('--- AUTHENTICATION OTP REQUEST ---');
    console.log(`User: ${username}`);
    console.log(`OTP:  ${otp}  <-- USE THIS`);
    console.log('----------------------------------------\n');

    return {
      status: 'success',
      message: 'OTP sent to your registered phone number',
      otp: otp // TEMPORARY: For testing on Render
    };
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (username, otp) => {
    const user = await User.findOne({
      username,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('OTP is invalid or has expired');
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // Note: The frontend expects token and admin directly for verifyOTP according to AuthPage.jsx
    return {
      status: 'success',
      token,
      admin: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    };
  },

  /**
   * Get Current User
   */
  getMe: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User no longer exists');
    }

    return {
      status: 'success',
      data: {
        admin: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      }
    };
  },

  /**
   * Change Password (requires current password)
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      throw new Error('Incorrect current password');
    }

    user.password = newPassword;
    await user.save();

    return { status: 'success', message: 'Password updated successfully' };
  },

  /**
   * Reset Password (admin reset without current password)
   */
  resetPassword: async (userId, newPassword) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword;
    await user.save();

    return { status: 'success', message: 'Password reset successfully' };
  },

  /**
   * Update Email
   */
  updateEmail: async (userId, newEmail) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error('Email is already in use');
    }

    user.email = newEmail;
    await user.save({ validateBeforeSave: false });

    return {
      status: 'success',
      data: {
        admin: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      }
    };
  },

  /**
   * Update Phone
   */
  updatePhone: async (userId, newPhone) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.phone = newPhone;
    await user.save({ validateBeforeSave: false });

    return {
      status: 'success',
      data: {
        admin: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      }
    };
  }
};

/**
 * Generate JWT Token
 */
function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
}
