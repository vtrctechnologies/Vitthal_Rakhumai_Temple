/**
 * Escapes all regular expression special metacharacters in a string to prevent
 * Regular Expression Denial of Service (ReDoS) and regex injection.
 *
 * @param {any} str - The input string to sanitize
 * @param {number} [maxLength=200] - Optional maximum string length limit (default 200) to prevent memory flooding
 * @returns {string} Sanitized string safe for RegExp construction or MongoDB $regex operators
 */
export const escapeRegex = (str, maxLength = 200) => {
  if (typeof str !== "string") return "";
  const trimmed = str.trim().slice(0, maxLength);
  if (!trimmed) return "";
  return trimmed.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
};

export default escapeRegex;

