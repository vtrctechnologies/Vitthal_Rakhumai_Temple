import Admin from "../models/Admin.js";
import { generateToken } from "../utils/jwt.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// @desc    Register a new admin
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res, next) => {
  const { username, email, password, phone } = req.body;

  if (!username || !email || !password || !phone) {
    return next(new AppError("Please provide all required fields (username, email, password, phone)", 400));
  }

  // Check if an admin already exists (Singleton Admin Logic)
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) {
    return next(new AppError("Only one admin account is allowed.", 403));
  }

  // Double check specifically for email/username/phone collision just in case
  const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }, { phone }] });
  if (existingAdmin) {
    return next(
      new AppError("Admin with this email, username, or phone number already exists", 400)
    );
  }

  const admin = await Admin.create({ username, email, password, phone });
  const token = generateToken(admin._id);

  // Remove password from output
  admin.password = undefined;

  res.status(201).json({
    status: "success",
    message: "Admin registered successfully",
    data: {
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
      },
    },
  });
});

// @desc    Login admin
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Explicitly select password since it's usually set to select: false in schema
  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin || !(await admin.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (!admin.isActive) {
    return next(new AppError("Your account has been deactivated", 401));
  }

  const token = generateToken(admin._id);

  res.json({
    status: "success",
    message: "Login successful",
    data: {
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});

// @desc    Get current logged-in admin
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res, next) => {
  res.json({
    status: "success",
    data: {
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        phone: req.admin.phone,
        role: req.admin.role,
        createdAt: req.admin.createdAt,
      },
    },
  });
});

// @desc    Resend OTP - Send OTP to admin phone via SMS
// @route   POST /api/auth/resend-otp
export const resendOTP = asyncHandler(async (req, res, next) => {
  const { username, email, phone } = req.body;

  // Support username, email, or phone
  if (!email && !username && !phone) {
    return next(new AppError("Please provide username, email, or phone number", 400));
  }

  // Find admin by username (primary), email, or phone
  let admin;
  if (username) {
    admin = await Admin.findOne({ username }).select("+otp +otpExpires");
  } else if (phone) {
    // Format phone number for search
    let searchPhone = phone.trim();
    if (!searchPhone.startsWith("+")) {
      searchPhone = `+${searchPhone}`;
    }
    admin = await Admin.findOne({ phone: searchPhone }).select("+otp +otpExpires");
  } else {
    admin = await Admin.findOne({ email }).select("+otp +otpExpires");
  }

  if (!admin) {
    // Don't reveal if account exists for security
    return res.json({
      status: "success",
      message: "If an account exists, an OTP has been sent to your registered phone number.",
    });
  }

  if (!admin.isActive) {
    return next(new AppError("Your account has been deactivated", 401));
  }

  // Check if OTP exists and is still valid
  if (!admin.otp || !admin.otpExpires) {
    return next(new AppError("No OTP found. Please request a new password reset.", 400));
  }

  // Check if OTP is expired
  if (new Date() > admin.otpExpires) {
    // Generate new OTP if expired
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    admin.otp = otp;
    admin.otpExpires = otpExpires;
    await admin.save({ validateBeforeSave: false });
  }

  // Import SMS service dynamically to avoid errors if not configured
  try {
    const { sendOtpSMS } = await import("../utils/smsService.js");
    await sendOtpSMS(admin.phone, admin.otp, admin.username);
    
    res.json({
      status: "success",
      message: `OTP has been sent to your registered phone number (${admin.phone}).`,
    });
  } catch (error) {
    console.error("\n❌ Error sending OTP:", error);
    // Still return success so user can see OTP in console
    res.json({
      status: "success",
      message: `OTP: ${admin.otp} (Check server console if SMS not configured)`,
    });
  }
});

// @desc    Check admin email by username (for debugging)
// @route   GET /api/auth/check-email/:username
export const checkAdminEmail = asyncHandler(async (req, res, next) => {
  const { username } = req.params;

  if (!username) {
    return next(new AppError("Please provide username", 400));
  }

  const admin = await Admin.findOne({ username }).select("email username phone");

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  res.json({
    status: "success",
    data: {
      username: admin.username,
      email: admin.email,
      phone: admin.phone,
      message: "This is the phone number where OTP will be sent via SMS",
    },
  });
});

// @desc    Change Password (requires old password)
// @route   PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError("Please provide currentPassword and newPassword", 400)
    );
  }

  if (newPassword.length < 6) {
    return next(
      new AppError("New password must be at least 6 characters", 400)
    );
  }

  // Get admin with password field
  const admin = await Admin.findById(req.admin._id).select("+password");

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  // Verify current password
  const isPasswordMatch = await admin.comparePassword(currentPassword);
  if (!isPasswordMatch) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // Check if new password is same as current (Optional security practice)
  const isSamePassword = await admin.comparePassword(newPassword);
  if (isSamePassword) {
    return next(
      new AppError("New password must be different from current password", 400)
    );
  }

  // Set new password - pre('save') hook in model will hash it
  admin.password = newPassword;
  await admin.save();

  res.json({
    status: "success",
    message: "Password changed successfully",
  });
});

// @desc    Reset Password (forces new password without old one - be careful using this)
// @route   PUT /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return next(new AppError("Please provide newPassword", 400));
  }

  if (newPassword.length < 6) {
    return next(
      new AppError("New password must be at least 6 characters", 400)
    );
  }

  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  admin.password = newPassword;
  await admin.save();

  res.json({
    status: "success",
    message: "Password reset successfully",
  });
});

// @desc    Forgot Password - Send OTP to admin phone via SMS
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email, username, phone } = req.body;

  // Support username, email, or phone
  if (!email && !username && !phone) {
    return next(new AppError("Please provide username, email, or phone number", 400));
  }

  // Find admin by username (primary), email, or phone
  let admin;
  if (username) {
    admin = await Admin.findOne({ username }).select("+otp +otpExpires");
  } else if (phone) {
    // Format phone number for search
    let searchPhone = phone.trim();
    if (!searchPhone.startsWith("+")) {
      searchPhone = `+${searchPhone}`;
    }
    admin = await Admin.findOne({ phone: searchPhone }).select("+otp +otpExpires");
  } else {
    admin = await Admin.findOne({ email }).select("+otp +otpExpires");
  }

  if (!admin) {
    // Don't reveal if account exists for security
    return res.json({
      status: "success",
      message: "If an account exists, an OTP has been sent to your registered phone number.",
    });
  }

  if (!admin.isActive) {
    return next(new AppError("Your account has been deactivated", 401));
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save OTP to admin
  admin.otp = otp;
  admin.otpExpires = otpExpires;
  await admin.save({ validateBeforeSave: false });

  // Log admin details for debugging
  console.log("\n" + "=".repeat(70));
  console.log("🔐 FORGOT PASSWORD REQUEST");
  console.log("=".repeat(70));
  console.log(`Username: ${admin.username}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Phone: ${admin.phone}`);
  console.log(`OTP Generated: ${otp}`);
  console.log(`OTP Expires: ${otpExpires}`);
  console.log("=".repeat(70));

  // OTP is generated and saved, but not automatically sent
  // User must click "Resend OTP" button to send it
  res.json({
    status: "success",
    message: "OTP has been generated. Click 'Resend OTP' to receive it on your registered phone number.",
    data: {
      username: admin.username,
    },
  });
});

// @desc    Verify OTP and grant access
// @route   POST /api/auth/verify-otp
export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, username, otp } = req.body;

  if (!otp) {
    return next(new AppError("Please provide OTP", 400));
  }

  if (!email && !username) {
    return next(new AppError("Please provide email or username", 400));
  }

  // Find admin with OTP fields by username (primary) or email
  let admin;
  if (username) {
    admin = await Admin.findOne({ username }).select("+otp +otpExpires");
  } else {
    admin = await Admin.findOne({ email }).select("+otp +otpExpires");
  }

  if (!admin) {
    return next(new AppError("Invalid email or OTP", 401));
  }

  if (!admin.isActive) {
    return next(new AppError("Your account has been deactivated", 401));
  }

  // Check if OTP exists and is valid
  if (!admin.otp || !admin.otpExpires) {
    return next(new AppError("OTP not found. Please request a new OTP.", 400));
  }

  // Check if OTP is expired
  if (new Date() > admin.otpExpires) {
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save({ validateBeforeSave: false });
    return next(new AppError("OTP has expired. Please request a new one.", 400));
  }

  // Verify OTP
  if (admin.otp !== otp) {
    return next(new AppError("Invalid OTP", 401));
  }

  // Clear OTP after successful verification
  admin.otp = undefined;
  admin.otpExpires = undefined;
  await admin.save({ validateBeforeSave: false });

  // Generate token for access
  const token = generateToken(admin._id);

  res.json({
    status: "success",
    message: "OTP verified successfully",
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
  });
});

// @desc    Update Admin Email
// @route   PUT /api/auth/update-email
export const updateEmail = asyncHandler(async (req, res, next) => {
  const { newEmail } = req.body;

  if (!newEmail) {
    return next(new AppError("Please provide newEmail", 400));
  }

  // Validate email format
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(newEmail)) {
    return next(new AppError("Please enter a valid email address", 400));
  }

  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  // Check if new email is same as current
  if (admin.email.toLowerCase() === newEmail.toLowerCase()) {
    return next(new AppError("New email must be different from current email", 400));
  }

  // Check if email already exists
  const existingAdmin = await Admin.findOne({ email: newEmail.toLowerCase() });
  if (existingAdmin) {
    return next(new AppError("Email already in use", 400));
  }

  // Update email
  admin.email = newEmail.toLowerCase();
  await admin.save();

  res.json({
    status: "success",
    message: "Email updated successfully",
    data: {
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
      },
    },
  });
});

// @desc    Update Admin Phone Number
// @route   PUT /api/auth/update-phone
export const updatePhone = asyncHandler(async (req, res, next) => {
  const { newPhone } = req.body;

  if (!newPhone) {
    return next(new AppError("Please provide newPhone", 400));
  }

  // Validate phone format (E.164 format)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  let formattedPhone = newPhone.trim();
  if (!formattedPhone.startsWith("+")) {
    formattedPhone = `+${formattedPhone}`;
  }

  if (!phoneRegex.test(formattedPhone)) {
    return next(new AppError("Please enter a valid phone number with country code (e.g., +1234567890)", 400));
  }

  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  // Check if new phone is same as current
  if (admin.phone === formattedPhone) {
    return next(new AppError("New phone number must be different from current phone number", 400));
  }

  // Check if phone already exists
  const existingAdmin = await Admin.findOne({ phone: formattedPhone });
  if (existingAdmin) {
    return next(new AppError("Phone number already in use", 400));
  }

  // Update phone
  admin.phone = formattedPhone;
  await admin.save();

  res.json({
    status: "success",
    message: "Phone number updated successfully",
    data: {
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
      },
    },
  });
});
