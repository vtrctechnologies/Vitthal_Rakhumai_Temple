/**
 * Wrapper for async express route handlers to eliminate try-catch boilerplate
 * and catch unhandled promise rejections automatically forwarding to next(err).
 *
 * @param {Function} fn - Async controller/middleware function (req, res, next)
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
