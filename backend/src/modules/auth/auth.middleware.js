import jwt from "jsonwebtoken";
import User from "./user.model.js";
import AppError from "../../shared/utils/AppError.js";
import { getJwtSecret } from "../../shared/utils/generateToken.js";

// Middleware to protect routes (require valid JWT token from header or HttpOnly cookie)
export const protect = async (req, res, next) => {
  let token;

  // 1. Extract from Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Extract from HttpOnly cookie (SEC-015: mitigates XSS token theft from browser LocalStorage)
  else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)temple_admin_token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    return next(new AppError("Not authorized, no token provided", 401));
  }

  try {
    // Verify token using strictly validated secret (no fallback)
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    const userId = decoded.id || decoded._id || decoded.userId || decoded.adminId;
    req.user = await User.findById(userId).select("-password");

    if (!req.user) {
      return next(new AppError("Not authorized, user not found", 401));
    }

    req.admin = req.user;
    next();
  } catch (error) {
    if (error.message?.startsWith("FATAL: JWT_SECRET")) {
      return next(new AppError("Server configuration error: JWT_SECRET is misconfigured", 500));
    }
    return next(new AppError("Not authorized, token invalid or expired", 401));
  }
};

// Middleware to authorize admin access
export const admin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" ||
      req.user.role === "superadmin" ||
      req.user.isAdmin === true)
  ) {
    next();
  } else {
    return next(new AppError("Not authorized as an admin", 403));
  }
};
