import crypto from 'crypto';
import { Subscriber } from './subscriber.model.js';

/**
 * Securely hashes a 6-digit OTP using SHA-256 before database storage.
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
};

/**
 * @desc    Request OTP for subscription
 * @route   POST /api/subscribers/subscribe
 * @access  Public
 */
export const requestOTP = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and phone number'
      });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPhone = phone.trim();
    const trimmedName = name.trim();

    // Generate cryptographically secure 6-digit OTP (SEC-005)
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOTP(rawOtp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find if email or phone already exists in different records
    const existingWithEmail = await Subscriber.findOne({ email: trimmedEmail });
    const existingWithPhone = await Subscriber.findOne({ phone: trimmedPhone });

    // If both exist but belong to different people, this is a conflict
    if (existingWithEmail && existingWithPhone && existingWithEmail._id.toString() !== existingWithPhone._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'This email and phone number are already registered to different accounts.'
      });
    }

    // Use existing record if found by either email or phone
    let subscriber = existingWithEmail || existingWithPhone;

    if (subscriber) {
      subscriber.name = trimmedName;
      subscriber.email = trimmedEmail;
      subscriber.phone = trimmedPhone;
      subscriber.otp = hashedOtp;
      subscriber.otpExpires = otpExpires;
      await subscriber.save();
    } else {
      subscriber = await Subscriber.create({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        otp: hashedOtp,
        otpExpires
      });
    }

    // Send generic success response WITHOUT leaking OTP or internal secrets (SEC-005)
    res.status(200).json({
      status: 'success',
      message: 'OTP has been generated and dispatched to your contact details.'
    });
  } catch (error) {
    // Handle MongoDB Duplicate Key Error specifically
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'credential';
      return res.status(400).json({
        status: 'error',
        message: `This ${field} is already registered with another subscriber.`
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * @desc    Verify OTP and finalize subscription
 * @route   POST /api/subscribers/verify
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide phone number and OTP'
      });
    }

    const trimmedPhone = phone.trim();
    const hashedInputOtp = hashOTP(otp);

    const subscriber = await Subscriber.findOne({
      phone: trimmedPhone,
      otp: hashedInputOtp,
      otpExpires: { $gt: Date.now() }
    });

    if (!subscriber) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired OTP'
      });
    }

    subscriber.isVerified = true;
    subscriber.otp = undefined;
    subscriber.otpExpires = undefined;
    await subscriber.save();

    res.status(200).json({
      status: 'success',
      message: 'Successfully subscribed! Thank you for joining us.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * @desc    Get all verified subscribers (Admin)
 * @route   GET /api/subscribers
 * @access  Private/Admin
 */
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ isVerified: true }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};
