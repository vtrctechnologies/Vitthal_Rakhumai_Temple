import AppError from "../utils/AppError.js";

/**
 * Middleware for 404 Not Found handling
 */
export const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Handle Mongoose CastError (Invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Duplicate Key Error (Error Code 11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const fields = err.keyValue ? Object.keys(err.keyValue).join(", ") : "field";
  const message = `Duplicate value entered for: ${fields}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose ValidationError
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT Invalid Signature Error
 */
const handleJWTError = () =>
  new AppError("Invalid authentication token. Please log in again.", 401);

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please log in again.", 401);

/**
 * Handle Multer File Upload Errors
 */
const handleMulterError = (err) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return new AppError("File size is too large. Maximum size allowed is 50MB.", 400);
  }
  return new AppError(`Upload error: ${err.message}`, 400);
};

/**
 * Centralized Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Mongoose & JWT Specific Error Normalization
  if (err.name === "CastError") error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
  if (err.name === "MulterError") error = handleMulterError(err);
  if (err.name === "UnexpectedResponse" || err.http_code === 403) {
    error.message = "Media service temporarily unavailable or restricted. Please retry.";
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || (`${statusCode}`.startsWith("4") ? "fail" : "error");

  // Log non-operational (system/bugs) errors in development/server logs
  if (process.env.NODE_ENV !== "production" || !error.isOperational) {
    console.error("ERROR 💥:", err);
  }

  res.status(statusCode).json({
    success: false,
    status: status,
    statusCode: statusCode,
    message: error.message || "Something went wrong on the server",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
