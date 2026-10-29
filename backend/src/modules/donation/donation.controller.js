import Donation from "./donation.model.js";
import crypto from "crypto";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import AppError from "../../shared/utils/AppError.js";

// Lazily load Razorpay if installed and configured
let RazorpayClass = null;
let razorpayClient = null;

const getRazorpayClient = async () => {
  if (razorpayClient) return razorpayClient;
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      if (!RazorpayClass) {
        const mod = await import("razorpay");
        RazorpayClass = mod.default || mod;
      }
      razorpayClient = new RazorpayClass({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      return razorpayClient;
    } catch (error) {
      console.warn("Razorpay initialization warning:", error.message);
      return null;
    }
  }
  return null;
};

// @desc    Create donation and initiate payment
// @route   POST /api/donations/create
export const createDonation = asyncHandler(async (req, res, next) => {
  const { name, email, phone, amount, message, isAnonymous } = req.body;

  // Validation
  if (!name || !email || !phone || amount === undefined || amount === null) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount < 1) {
    return next(new AppError("Donation amount must be at least ₹1", 400));
  }

  // Check if Razorpay is configured
  const razorpay = await getRazorpayClient();
  if (!razorpay) {
    return next(
      new AppError(
        "Payment gateway is not configured. Please contact administrator.",
        500
      )
    );
  }

  // Create donation record
  const donation = await Donation.create({
    name,
    email,
    phone,
    amount: parsedAmount,
    message: message || "",
    isAnonymous: isAnonymous || false,
    paymentStatus: "pending",
  });

  try {
    // Create Razorpay order
    const options = {
      amount: Math.round(parsedAmount * 100), // Convert to paise (Razorpay expects amount in smallest currency unit)
      currency: "INR",
      receipt: `donation_${donation._id}`,
      notes: {
        donationId: donation._id.toString(),
        name: name,
        email: email,
        phone: phone,
      },
    };

    const order = await razorpay.orders.create(options);

    // Update donation with order ID
    donation.razorpayOrderId = order.id;
    await donation.save();

    res.json({
      status: "success",
      message: "Payment order created successfully",
      data: {
        donation: {
          id: donation._id,
          name: donation.name,
          amount: donation.amount,
          paymentStatus: donation.paymentStatus,
        },
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
        },
      },
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    console.error("Error details:", {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error,
    });
    
    donation.paymentStatus = "failed";
    await donation.save();

    // Provide more specific error message
    const errorMessage = error.error?.description || 
                        error.message || 
                        "Failed to create payment order. Please check Razorpay configuration.";

    return next(
      new AppError(
        errorMessage,
        error.statusCode || 500
      )
    );
  }
});

// @desc    Verify payment and update donation status
// @route   POST /api/donations/verify
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !donationId) {
    return next(new AppError("Payment verification data is missing", 400));
  }

  // Find donation
  const donation = await Donation.findById(donationId);
  if (!donation) {
    return next(new AppError("Donation not found", 404));
  }

  // Prevent replay: do not allow re-verifying already successful donations
  if (donation.paymentStatus === "success") {
    return next(new AppError("Payment has already been verified and processed", 400));
  }

  // Verify that the donation record actually has an associated order ID
  if (!donation.razorpayOrderId) {
    return next(new AppError("Donation record has no associated order ID", 400));
  }

  // CRITICAL SECURITY FIX (SEC-003): Ensure order ID matches the donation record
  if (donation.razorpayOrderId !== razorpay_order_id) {
    return next(
      new AppError(
        "Order ID mismatch: The payment order ID does not match this donation record",
        400
      )
    );
  }

  // Check if Razorpay is configured
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return next(
      new AppError("Payment gateway is not configured. Please contact administrator.", 500)
    );
  }

  // Replay attack prevention: verify payment ID hasn't been used for another donation
  const existingDonationWithPayment = await Donation.findOne({
    razorpayPaymentId: razorpay_payment_id,
    _id: { $ne: donation._id },
  });
  if (existingDonationWithPayment) {
    return next(
      new AppError("Payment ID has already been utilized for another donation record", 400)
    );
  }

  // Verify HMAC SHA256 signature using timing-safe comparison
  const text = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest("hex");

  const isSignatureValid =
    typeof razorpay_signature === "string" &&
    generatedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf8"),
      Buffer.from(razorpay_signature, "utf8")
    );

  if (!isSignatureValid) {
    donation.paymentStatus = "failed";
    await donation.save();
    return next(new AppError("Payment verification failed: Invalid signature", 400));
  }

  // Query Razorpay API directly if available to verify captured payment amount & order
  const razorpay = await getRazorpayClient();
  if (razorpay) {
    try {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      if (paymentDetails) {
        if (paymentDetails.order_id && paymentDetails.order_id !== donation.razorpayOrderId) {
          donation.paymentStatus = "failed";
          await donation.save();
          return next(new AppError("Payment gateway order mismatch", 400));
        }
        const expectedPaise = Math.round(donation.amount * 100);
        if (paymentDetails.amount && paymentDetails.amount !== expectedPaise) {
          donation.paymentStatus = "failed";
          await donation.save();
          return next(new AppError("Payment gateway amount mismatch", 400));
        }
      }
    } catch (gatewayError) {
      console.warn("Razorpay payments.fetch gateway check warning:", gatewayError.message);
    }
  }

  // Update donation with payment details
  donation.paymentStatus = "success";
  donation.razorpayPaymentId = razorpay_payment_id;
  donation.razorpaySignature = razorpay_signature;
  await donation.save();

  res.json({
    status: "success",
    message: "Payment verified successfully",
    data: {
      donation: {
        id: donation._id,
        name: donation.name,
        amount: donation.amount,
        paymentStatus: donation.paymentStatus,
        createdAt: donation.createdAt,
      },
    },
  });
});

// @desc    Get leaderboard of donors (sorted by amount)
// @route   GET /api/donations/leaderboard
export const getLeaderboard = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 100;
  const skip = parseInt(req.query.skip) || 0;

  // Get all successful donations, sorted by amount (descending), then by date
  const donations = await Donation.find({ paymentStatus: "success" })
    .sort({ amount: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select("name amount message createdAt isAnonymous")
    .lean();

  // Calculate total raised
  const totalRaised = await Donation.aggregate([
    { $match: { paymentStatus: "success" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Calculate total donors
  const totalDonors = await Donation.countDocuments({ paymentStatus: "success" });

  res.json({
    status: "success",
    data: {
      leaderboard: donations,
      stats: {
        totalRaised: totalRaised[0]?.total || 0,
        totalDonors: totalDonors,
      },
    },
  });
});

// @desc    Get all donations (admin only - for future use)
// @route   GET /api/donations
export const getAllDonations = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 50;
  const skip = parseInt(req.query.skip) || 0;
  const status = req.query.status;

  const query = {};
  if (status) {
    query.paymentStatus = status;
  }

  const donations = await Donation.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select("-razorpaySignature");

  res.json({
    status: "success",
    results: donations.length,
    data: {
      donations,
    },
  });
});

// @desc    Get single donation
// @route   GET /api/donations/:id
export const getDonation = asyncHandler(async (req, res, next) => {
  const donation = await Donation.findById(req.params.id).select("-razorpaySignature");

  if (!donation) {
    return next(new AppError("Donation not found", 404));
  }

  res.json({
    status: "success",
    data: {
      donation,
    },
  });
});
