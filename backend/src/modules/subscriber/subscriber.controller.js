import { Subscriber } from './subscriber.model.js';

/**
 * @desc    Request OTP for subscription
 * @route   POST /api/subscribers/subscribe
 * @access  Public
 */
export const requestOTP = async (req, res) => {
  console.log('DEBUG: requestOTP function called');
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and phone number'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find if email or phone already exists in different records
    // This prevents the 500 duplicate key error when updating a record
    const existingWithEmail = await Subscriber.findOne({ email });
    const existingWithPhone = await Subscriber.findOne({ phone });

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
      subscriber.name = name;
      subscriber.email = email;
      subscriber.phone = phone;
      subscriber.otp = otp;
      subscriber.otpExpires = otpExpires;
      await subscriber.save();
    } else {
      subscriber = await Subscriber.create({
        name,
        email,
        phone,
        otp,
        otpExpires
      });
    }

    // Log OTP to console in a plain, simple format
    console.log('\n----------------------------------------');
    console.log('--- SUBSCRIPTION OTP REQUEST ---');
    console.log(`User:  ${name}`);
    console.log(`Phone: ${phone}`);
    console.log(`Email: ${email}`);
    console.log(`OTP:   ${otp}  <-- USE THIS`);
    console.log('----------------------------------------\n');

    res.status(200).json({
      status: 'success',
      message: 'OTP generated successfully (check terminal)',
      otp: otp // TEMPORARY: For testing on Render
    });
  } catch (error) {
    console.error('Error in requestOTP:', error);
    
    // Handle MongoDB Duplicate Key Error specifically
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
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

    const subscriber = await Subscriber.findOne({
      phone,
      otp,
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
    console.error('Error in verifyOTP:', error);
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
    console.error('Error in getSubscribers:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};
