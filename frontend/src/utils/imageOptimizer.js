/**
 * Image optimization utilities for better performance
 */

/**
 * Optimize image URL with query parameters for better performance
 * @param {string} src - Image source URL
 * @param {number} width - Desired width
 * @param {number} quality - Image quality (1-100)
 * @returns {string} Optimized image URL
 */
export const optimizeImageUrl = (src, width = 800, quality = 80) => {
  if (!src) return '';
  
  // If already has query params, don't modify
  if (src.includes('?')) return src;
  
  // For local images, return as is
  if (src.startsWith('/') || src.startsWith('./')) return src;
  
  // For external images, add optimization params if supported
  if (src.includes('unsplash.com') || src.includes('placeholder')) {
    return `${src}?w=${width}&q=${quality}&auto=format&fit=crop`;
  }
  
  return src;
};

/**
 * Get responsive image srcset
 * @param {string} baseUrl - Base image URL
 * @param {number[]} widths - Array of widths
 * @returns {string} Srcset string
 */
export const getSrcSet = (baseUrl, widths = [400, 800, 1200, 1600]) => {
  if (!baseUrl) return '';
  return widths.map(w => `${optimizeImageUrl(baseUrl, w)} ${w}w`).join(', ');
};

/**
 * Lazy load image with intersection observer
 * @param {HTMLElement} img - Image element
 * @param {string} src - Image source
 */
export const lazyLoadImage = (img, src) => {
  if ('loading' in HTMLImageElement.prototype) {
    img.loading = 'lazy';
    img.src = src;
  } else {
    // Fallback for older browsers
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  }
};

/**
 * Preload critical images
 * @param {string[]} urls - Array of image URLs to preload
 */
export const preloadImages = (urls) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Get image dimensions for aspect ratio
 * @param {string} src - Image source
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = src;
  });
};

