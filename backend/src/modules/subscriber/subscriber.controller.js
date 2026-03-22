import { Subscriber } from './subscriber.model.js';

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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create subscriber
    let subscriber = await Subscriber.findOne({ $or: [{ email }, { phone }] });

    if (subscriber) {
      // If already verified, decide if we want to allow re-subscription or just update info
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

    // Log OTP to console as requested
    console.log('--------------------------------------------------');
    console.log(`[OTP] Subscription for ${name} (${phone}): ${otp}`);
    console.log('--------------------------------------------------');

    res.status(200).json({
      status: 'success',
      message: 'OTP sent to your mobile number (check console)'
    });
  } catch (error) {
    console.error('Error in requestOTP:', error);
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
