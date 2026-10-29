import rateLimit from "express-rate-limit";

/**
 * Factory helper for standard JSON-returning rate limiters
 */
const createLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: "fail",
        message,
      });
    },
  });
};

// Global API Limiter: 300 requests per 15 minutes per IP
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests from this IP address. Please try again later.",
});

// Authentication Limiter (Login & Register): 10 requests per 15 minutes per IP
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
});

// OTP Request Limiter (Subscription OTP): 5 requests per 10 minutes per IP
export const otpRequestLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many OTP requests from this IP address. Please try again after 10 minutes.",
});

// OTP Verification Limiter: 10 verification attempts per 10 minutes per IP
export const otpVerifyLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many OTP verification attempts. Please wait before trying again.",
});

// Contact & Public Form Submission Limiter: 10 submissions per 15 minutes per IP
export const contactLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many message submissions from this IP. Please try again later.",
});

// Public Competition Registration Limiter: 10 registrations per 15 minutes per IP
export const competitionRegisterLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many competition registration attempts from this IP. Please try again later.",
});

export default {
  globalLimiter,
  authLimiter,
  otpRequestLimiter,
  otpVerifyLimiter,
  contactLimiter,
  competitionRegisterLimiter,
};

