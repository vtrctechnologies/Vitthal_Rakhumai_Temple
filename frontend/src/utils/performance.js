/**
 * Performance optimization utilities
 */

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if device is low-end
export const isLowEndDevice = () => {
  return (
    navigator.hardwareConcurrency <= 2 ||
    (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
};

// Optimize image loading
export const optimizeImage = (src, width = 800) => {
  // If using a CDN or image service, add optimization parameters
  if (src.includes('unsplash.com') || src.includes('placeholder')) {
    return `${src}?w=${width}&q=80&auto=format&fit=crop`;
  }
  return src;
};

// Request animation frame wrapper
export const raf = (callback) => {
  return requestAnimationFrame(callback);
};

// Cancel animation frame wrapper
export const caf = (id) => {
  return cancelAnimationFrame(id);
};

