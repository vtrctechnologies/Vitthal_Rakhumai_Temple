/**
 * URL Security Utilities to prevent Cross-Site Scripting (XSS) and
 * pseudo-protocol execution (e.g. javascript:, data:, vbscript:) (SEC-016).
 */

/**
 * Validates that a URL strictly uses standard HTTP/HTTPS protocols.
 * Rejects pseudo-protocols (javascript:, data:, vbscript:, etc.).
 *
 * @param {string} url - Target URL to check
 * @returns {boolean} True if safe, false otherwise
 */
export const isSafeUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();

  // Fast check: Must start strictly with http:// or https:// (case-insensitive)
  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Safely opens an external URL in a new browser tab with noopener,noreferrer.
 * Blocks execution if the URL fails protocol validation.
 *
 * @param {string} url - Target URL to open
 * @returns {Window|null} The opened window or null if blocked/invalid
 */
export const openSafeUrl = (url) => {
  if (!isSafeUrl(url)) {
    console.warn(`[Security Alert] Blocked attempt to open unsafe URL: "${url}"`);
    return null;
  }
  return window.open(url.trim(), "_blank", "noopener,noreferrer");
};

export default openSafeUrl;

