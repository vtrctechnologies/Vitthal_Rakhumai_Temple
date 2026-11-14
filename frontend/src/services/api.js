import apiClient from "./axiosClient";

// Gallery API functions
export const galleryAPI = {
  getImages: async (params = {}) => {
    return apiClient.get("/gallery", { params });
  },

  getCategories: async () => {
    return apiClient.get("/categories");
  },
};

// Events Page API functions
export const eventsPageAPI = {
  getFeaturedEvent: async () => {
    return apiClient.get("/events/featured");
  },

  getUpcomingEvents: async () => {
    return apiClient.get("/events/upcoming");
  },

  getAllEvents: async (params = {}) => {
    return apiClient.get("/events", { params });
  },

  getEventById: async (id) => {
    return apiClient.get(`/events/${id}`);
  },

  getUpcomingEvent: async (id) => {
    return apiClient.get(`/events/${id}`);
  },

  getEventYears: async () => {
    return apiClient.get("/events/years");
  },
};

// Banner API functions
export const bannerAPI = {
  getBanners: async (params = {}) => {
    return apiClient.get("/banners", { params });
  },

  getActiveBanners: async (params = {}) => {
    return apiClient.get("/banners/active", { params });
  },

  getBanner: async (id) => {
    return apiClient.get(`/banners/${id}`);
  },

  getBannerYears: async () => {
    return apiClient.get("/banners/years");
  },
};

// Sports API functions
export const sportsAPI = {
  // Get all sports (public)
  getSports: async (params = {}) => {
    return apiClient.get("/sports", { params });
  },

  // Get single sport (public)
  getSport: async (id) => {
    return apiClient.get(`/sports/${id}`);
  },

  // Get sport with winners (public)
  getSportWithWinners: async (id) => {
    return apiClient.get(`/sports/${id}`);
  },

  // Get available sport years (public)
  getSportYears: async () => {
    return apiClient.get("/sports/years");
  },
};

// Hero Section API functions
export const heroSectionAPI = {
  // Get active banner for hero (public)
  getHeroSection: async () => {
    return apiClient.get("/banners/active");
  },
};

// Live Programs API functions
export const liveProgramsAPI = {
  // Get all live programs (public)
  getLivePrograms: async (params = {}) => {
    return apiClient.get("/live-programs", { params });
  },

  getPrograms: async (params = {}) => {
    return apiClient.get("/live-programs", { params });
  },

  // Get single live program (public)
  getLiveProgram: async (id) => {
    return apiClient.get(`/live-programs/${id}`);
  },

  getProgram: async (id) => {
    return apiClient.get(`/live-programs/${id}`);
  },

  // Get available years
  getLiveProgramYears: async () => {
    return apiClient.get("/live-programs/years");
  },

  getProgramYears: async () => {
    return apiClient.get("/live-programs/years");
  },
};

// Committee API functions
export const committeeAPI = {
  getMembers: async (params = {}) => {
    return apiClient.get("/committee", { params });
  },

  getActiveMembers: async () => {
    return apiClient.get("/committee/active");
  },

  getMember: async (id) => {
    return apiClient.get(`/committee/${id}`);
  },

  getCommitteeYears: async () => {
    return apiClient.get("/committee/years");
  },
};

// Live Program Categories API functions
export const liveProgramCategoriesAPI = {
  // Get all categories (public)
  getCategories: async () => {
    return apiClient.get("/live-programs/categories");
  },

  getAllCategories: async () => {
    return apiClient.get("/live-programs/categories");
  },
};

// Donation API functions
export const donationAPI = {
  // Create donation and initiate payment
  createDonation: async (donationData) => {
    return apiClient.post("/donations/create", donationData);
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    return apiClient.post("/donations/verify", paymentData);
  },

  // Get leaderboard
  getLeaderboard: async (params = {}) => {
    return apiClient.get("/donations/leaderboard", { params });
  },
};

// Subscriber API functions
export const subscriberAPI = {
  // Request OTP for subscription
  subscribe: async (data) => {
    return apiClient.post("/subscribers/subscribe", data);
  },

  // Verify OTP and finalize subscription
  verifyOTP: async (data) => {
    return apiClient.post("/subscribers/verify", data);
  },
};

// Contact API functions
export const contactAPI = {
  // Send a new message (Public)
  sendMessage: async (data) => {
    return apiClient.post("/contact", data);
  },
};

// Guest API functions
export const guestAPI = {
  getGuests: async (params = {}) => {
    return apiClient.get("/guests", { params });
  },

  getActiveGuests: async () => {
    return apiClient.get("/guests/active");
  },
};

// Competition & Sports Registration API functions
export const sportsRegistrationAPI = {
  getOpenCompetitions: async () => {
    return apiClient.get("/sports/competitions/open");
  },

  register: async (sportId, data) => {
    return apiClient.post(`/sports/competitions/${sportId}/register`, data);
  },
};

export default galleryAPI;
