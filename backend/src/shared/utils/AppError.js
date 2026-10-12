/**
 * Custom Error Class for Operational Errors
 * Extends the native JavaScript Error class
 */
class AppError extends Error {
  /**
   * @param {string} message - Error description message
   * @param {number} statusCode - HTTP Status Code (e.g. 400, 401, 403, 404, 500)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
