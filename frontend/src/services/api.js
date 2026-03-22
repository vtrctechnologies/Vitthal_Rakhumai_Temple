import apiClient from "./axiosClient";

// Gallery API functions
export const galleryAPI = {
  // Get all gallery images (public)
  getImages: async (params = {}) => {
    return apiClient.get("/gallery/images", { params });
  },

  // Get all gallery categories (public)
  getCategories: async () => {
    return apiClient.get("/gallery/categories");
  },
};

// Events Page API functions
export const eventsPageAPI = {
  // Get featured event (countdown timer)
  getFeaturedEvent: async () => {
    return apiClient.get("/events/featured");
  },

  // Get all upcoming events
  getUpcomingEvents: async () => {
    return apiClient.get("/events/upcoming");
  },

  // Get single upcoming event
  getUpcomingEvent: async (id) => {
    return apiClient.get(`/events/upcoming/${id}`);
  },

  // Get all events (for calendar view)
  getAllEvents: async (params = {}) => {
    return apiClient.get("/events", { params });
  },

  // Get available event years
  getEventYears: async () => {
    return apiClient.get("/events/years");
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

  // Get single banner (public)
  getBanner: async (id) => {
    return apiClient.get(`/banners/${id}`);
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
  // Get active hero section (public)
  getHeroSection: async () => {
    return apiClient.get("/hero/active");
  },
};

// Live Programs API functions
export const liveProgramsAPI = {
  // Get all live programs (public)
  getLivePrograms: async (params = {}) => {
    return apiClient.get("/live-programs", { params });
  },

  // Get single live program (public)
  getLiveProgram: async (id) => {
    return apiClient.get(`/live-programs/${id}`);
  },

  // Get available years
  getLiveProgramYears: async () => {
    return apiClient.get("/live-programs/years");
  },
};

// Committee API functions
export const committeeAPI = {
  // Get all committee members (public)
  getMembers: async (params = {}) => {
    return apiClient.get("/committee", { params });
  },

  // Get single committee member (public)
  getMember: async (id) => {
    return apiClient.get(`/committee/${id}`);
  },

  // Get available years for committee (public)
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
    return apiClient.post("/contact/send", data);
  },
};

// Guest API functions
export const guestAPI = {
  // Get all guests (public)
  getGuests: async (params = {}) => {
    return apiClient.get("/guests", { params });
  },
};

export default galleryAPI;

