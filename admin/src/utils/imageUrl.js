/**
 * Utility function to construct full image URLs from backend paths
 * @param {string} imageUrl - Image URL path from backend (e.g., "/uploads/gallery/filename.jpg")
 * @returns {string|null} - Full URL or null if no imageUrl provided
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  const trimmedUrl = imageUrl.toString().trim();
  if (!trimmedUrl) return null;

  // 1. Handle Protocol-Relative URLs (e.g., //res.cloudinary.com/...)
  if (trimmedUrl.startsWith("//")) {
    return `https:${trimmedUrl}`;
  }

  // 2. If already a full URL (http/https), return as is (force https for cloudinary)
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    if (trimmedUrl.includes("cloudinary.com")) {
      return trimmedUrl.replace("http://", "https://");
    }
    return trimmedUrl;
  }
  
  // 3. Construct full URL from backend (check multiple env patterns)
  const rawBaseUrl =
    import.meta.env.VITE_API_BASE_URL || 
    import.meta.env.VITE_API_URL || 
    "http://localhost:5000";
    
  // Clean up API base if it includes /api
  let baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  if (baseUrl.endsWith("/api")) {
    baseUrl = baseUrl.replace(/\/api$/, "");
  }
  
  // Ensure path starts with /
  const path = trimmedUrl.startsWith("/") ? trimmedUrl : `/${trimmedUrl}`;
  
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

