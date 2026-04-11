import { verifyToken } from "../utils/jwt.js";
import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized, no token", 401));
  }

  try {
    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return next(new AppError("Not authorized, user not found", 401));
    }

    if (!admin.isActive) {
      return next(new AppError("Admin account is deactivated", 401));
    }

    req.admin = admin;
    next();
  } catch (error) {
    return next(new AppError("Not authorized, token failed", 401));
  }
});
