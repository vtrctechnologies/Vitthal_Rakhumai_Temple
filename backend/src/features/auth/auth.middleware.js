import jwt from "jsonwebtoken";
import User from "./user.model.js";
import AppError from "../../shared/utils/AppError.js";

// Middleware to protect routes (require valid JWT token)
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret"
      );

      const userId = decoded.id || decoded._id || decoded.userId || decoded.adminId;
      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        return next(new AppError("Not authorized, user not found", 401));
      }

      req.admin = req.user;
      next();
    } catch (error) {
      return next(new AppError("Not authorized, token invalid or expired", 401));
    }
  } else {
    return next(new AppError("Not authorized, no token provided", 401));
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
