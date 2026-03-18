/**
 * Utility function to construct full image URLs from backend paths
 * @param {string} imageUrl - Image URL path from backend (e.g., "/uploads/gallery/filename.jpg")
 * @returns {string|null} - Full URL or null if no imageUrl provided
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If already a full URL (http/https), return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  
  // Construct full URL from backend
  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";
  
  // Ensure imageUrl starts with /
  const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  
  return `${baseUrl}${path}`;
};

/**
 * Check if an image URL is valid
 * @param {string} imageUrl - Image URL to check
 * @returns {boolean} - True if URL is valid
 */
export const isValidImageUrl = (imageUrl) => {
  return imageUrl && imageUrl.trim() !== "";
};

