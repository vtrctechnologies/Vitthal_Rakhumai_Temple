import apiClient from "./axiosClient";

// Auth API functions
export const authAPI = {
  // Register a new admin
  register: async (username, email, password, phone) => {
    return apiClient.post("/auth/register", { username, email, password, phone });
  },

  // Login admin
  login: async (email, password) => {
    return apiClient.post("/auth/login", { email, password });
  },

  // Get current admin info
  getMe: async () => {
    return apiClient.get("/auth/me");
  },

  // Change password (requires current password)
  changePassword: async (currentPassword, newPassword) => {
    return apiClient.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  // Reset password (admin can reset without current password)
  resetPassword: async (newPassword) => {
    return apiClient.put("/auth/reset-password", { newPassword });
  },

  // Forgot password - generate OTP (using username)
  forgotPassword: async (email, username) => {
    return apiClient.post("/auth/forgot-password", { email, username });
  },

  // Resend OTP - send OTP via SMS (using username)
  resendOTP: async (email, username) => {
    return apiClient.post("/auth/resend-otp", { email, username });
  },

  // Verify OTP and get access token (using username)
  verifyOTP: async (email, username, otp) => {
    return apiClient.post("/auth/verify-otp", { email, username, otp });
  },

  // Update admin email
  updateEmail: async (newEmail) => {
    return apiClient.put("/auth/update-email", { newEmail });
  },

  // Update admin phone number
  updatePhone: async (newPhone) => {
    return apiClient.put("/auth/update-phone", { newPhone });
  },
};

// Events API functions
export const eventsAPI = {
  // Get all events
  getEvents: async (params = {}) => {
    return apiClient.get("/events", { params });
  },

  // Get single event
  getEvent: async (id) => {
    return apiClient.get(`/events/${id}`);
  },

  // Create event (with file upload)
  createEvent: async (formData) => {
    return apiClient.post("/events", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update event (with optional file upload)
  updateEvent: async (id, formData) => {
    return apiClient.put(`/events/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete event
  deleteEvent: async (id) => {
    return apiClient.delete(`/events/${id}`);
  },

  // Get all events for admin (includes inactive)
  getEventsAdmin: async (params = {}) => {
    return apiClient.get("/events/admin/all", { params });
  },

  // Get available years for events
  getEventYears: async () => {
    return apiClient.get("/events/years");
  },

  // Featured Event (Countdown Timer) APIs
  getFeaturedEvent: async () => {
    return apiClient.get("/events/featured");
  },

  getAllFeaturedEvents: async () => {
    return apiClient.get("/events/featured/all");
  },

  setFeaturedEvent: async (data) => {
    return apiClient.post("/events/featured", data);
  },

  updateFeaturedEvent: async (id, data) => {
    return apiClient.put(`/events/featured/${id}`, data);
  },

  // Upcoming Events APIs (for Events page)
  getUpcomingEvents: async () => {
    return apiClient.get("/events/upcoming");
  },

  getUpcomingEvent: async (id) => {
    return apiClient.get(`/events/upcoming/${id}`);
  },

  createUpcomingEvent: async (formData) => {
    return apiClient.post("/events/upcoming", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateUpcomingEvent: async (id, formData) => {
    return apiClient.put(`/events/upcoming/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteUpcomingEvent: async (id) => {
    return apiClient.delete(`/events/upcoming/${id}`);
  },
};

// Committee Members API functions
export const committeeAPI = {
  // Get all committee members
  getMembers: async (params = {}) => {
    return apiClient.get("/committee", { params });
  },

  // Get single committee member
  getMember: async (id) => {
    return apiClient.get(`/committee/${id}`);
  },

  // Create committee member (with file upload)
  createMember: async (formData) => {
    return apiClient.post("/committee", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update committee member (with optional file upload)
  updateMember: async (id, formData) => {
    return apiClient.put(`/committee/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get all committee members (admin - includes inactive)
  getMembersAdmin: async (params = {}) => {
    return apiClient.get("/committee/admin/all", { params });
  },

  // Get available years for committee
  getCommitteeYears: async () => {
    return apiClient.get("/committee/years");
  },

  // Delete committee member
  deleteMember: async (id) => {
    return apiClient.delete(`/committee/${id}`);
  },
};

// Gallery API functions
export const galleryAPI = {
  // Get all gallery images (public)
  getImages: async (params = {}) => {
    return apiClient.get("/gallery/images", { params });
  },

  // Get all gallery images (admin - includes inactive)
  getImagesAdmin: async (params = {}) => {
    return apiClient.get("/gallery/images/admin/all", { params });
  },

  // Get single gallery image
  getImage: async (id) => {
    return apiClient.get(`/gallery/images/${id}`);
  },

  // Create gallery image (with file upload)
  createImage: async (formData) => {
    return apiClient.post("/gallery/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update gallery image (with optional file upload)
  updateImage: async (id, formData) => {
    return apiClient.put(`/gallery/images/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete gallery image
  deleteImage: async (id) => {
    return apiClient.delete(`/gallery/images/${id}`);
  },

  // Get all categories (public)
  getCategories: async () => {
    return apiClient.get("/gallery/categories");
  },

  // Get all categories (admin - includes inactive)
  getCategoriesAdmin: async () => {
    return apiClient.get("/gallery/categories/admin/all");
  },

  // Get single category
  getCategory: async (id) => {
    return apiClient.get(`/gallery/categories/${id}`);
  },

  // Create category
  createCategory: async (data) => {
    return apiClient.post("/gallery/categories", data);
  },

  // Update category
  updateCategory: async (id, data) => {
    return apiClient.put(`/gallery/categories/${id}`, data);
  },

  // Delete category
  deleteCategory: async (id) => {
    return apiClient.delete(`/gallery/categories/${id}`);
  },
};

// Banner API functions
export const bannerAPI = {
  // Get all banners (public)
  getBanners: async (params = {}) => {
    return apiClient.get("/banners", { params });
  },

  // Get available years
  getBannerYears: async () => {
    return apiClient.get("/banners/years");
  },

  // Get single banner
  getBanner: async (id) => {
    return apiClient.get(`/banners/${id}`);
  },

  // Create banner (with file upload)
  createBanner: async (formData) => {
    return apiClient.post("/banners", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update banner (with optional file upload)
  updateBanner: async (id, formData) => {
    return apiClient.put(`/banners/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete banner
  deleteBanner: async (id) => {
    return apiClient.delete(`/banners/${id}`);
  },
};

// Sports API functions
export const sportsAPI = {
  // Get all sports
  getSports: async (params = {}) => {
    return apiClient.get("/sports", { params });
  },

  // Get single sport
  getSport: async (id) => {
    return apiClient.get(`/sports/${id}`);
  },

  // Get sport with winners
  getSportWithWinners: async (id) => {
    return apiClient.get(`/sports/${id}`);
  },

  // Get available sport years
  getSportYears: async () => {
    return apiClient.get("/sports/years");
  },

  // Create sport (with optional file upload)
  createSport: async (formData) => {
    return apiClient.post("/sports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update sport (with optional file upload)
  updateSport: async (id, formData) => {
    return apiClient.put(`/sports/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete sport
  deleteSport: async (id) => {
    return apiClient.delete(`/sports/${id}`);
  },

  // Get winners for a sport
  getWinners: async (sportId) => {
    return apiClient.get(`/sports/${sportId}/winners/list`);
  },

  // Get single winner
  getWinner: async (id) => {
    return apiClient.get(`/sports/winners/${id}`);
  },

  // Create or update winner (with optional file upload)
  createOrUpdateWinner: async (sportId, formData) => {
    return apiClient.post(`/sports/${sportId}/winners`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update winner (with optional file upload)
  updateWinner: async (id, formData) => {
    return apiClient.put(`/sports/winners/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete winner
  deleteWinner: async (id) => {
    return apiClient.delete(`/sports/winners/${id}`);
  },
};

// Hero Section API functions
export const heroSectionAPI = {
  // Get active hero section
  getActiveHero: async () => {
    return apiClient.get("/hero/active");
  },

  // Get all hero sections (admin)
  getAllHeroes: async () => {
    return apiClient.get("/hero");
  },

  // Create hero section
  createHero: async (formData) => {
    return apiClient.post("/hero", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update hero section
  updateHero: async (id, formData) => {
    return apiClient.put(`/hero/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete hero section
  deleteHero: async (id) => {
    return apiClient.delete(`/hero/${id}`);
  },
};

// Live Programs API functions
export const liveProgramsAPI = {
  // Get all live programs
  getLivePrograms: async (params = {}) => {
    return apiClient.get("/live-programs", { params });
  },

  // Get single live program
  getLiveProgram: async (id) => {
    return apiClient.get(`/live-programs/${id}`);
  },

  // Create live program (with file upload)
  createLiveProgram: async (formData) => {
    return apiClient.post("/live-programs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update live program (with optional file upload)
  updateLiveProgram: async (id, formData) => {
    return apiClient.put(`/live-programs/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete live program
  deleteLiveProgram: async (id) => {
    return apiClient.delete(`/live-programs/${id}`);
  },

  // Category APIs
  // Get all categories (public)
  getCategories: async () => {
    return apiClient.get("/live-programs/categories");
  },

  // Get all categories (admin - includes inactive)
  getCategoriesAdmin: async () => {
    return apiClient.get("/live-programs/categories/admin/all");
  },

  // Get single category
  getCategory: async (id) => {
    return apiClient.get(`/live-programs/categories/${id}`);
  },

  // Create category
  createCategory: async (data) => {
    return apiClient.post("/live-programs/categories", data);
  },

  // Update category
  updateCategory: async (id, data) => {
    return apiClient.put(`/live-programs/categories/${id}`, data);
  },

  // Delete category
  deleteCategory: async (id) => {
    return apiClient.delete(`/live-programs/categories/${id}`);
  },
};

// Subscriber API functions
export const subscriberAPI = {
  // Get all verified subscribers (Admin)
  getSubscribers: async () => {
    return apiClient.get("/subscribers");
  },
};

// Contact API functions
export const contactAPI = {
  // Get all messages (Admin)
  getMessages: async () => {
    return apiClient.get("/contact/messages");
  },

  // Delete a message (Admin)
  deleteMessage: async (id) => {
    return apiClient.delete(`/contact/messages/${id}`);
  },
};

// Notification API functions
export const notificationAPI = {
  // Get all notifications (Admin)
  getNotifications: async () => {
    return apiClient.get("/notifications");
  },

  // Mark notification as read (Admin)
  markAsRead: async (id) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  // Clear all notifications (Admin)
  clearNotifications: async () => {
    return apiClient.delete("/notifications/clear");
  },
};

export default authAPI;
