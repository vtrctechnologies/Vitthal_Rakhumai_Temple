import axios from "axios";

// Base URL for all admin API requests
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Shared axios instance for admin app
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach auth token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("temple_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Standardized error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = "An error occurred";

    if (error.response) {
      message =
        error.response.data?.message ||
        error.response.data?.error ||
        error.message ||
        "Server error";
    } else if (error.request) {
      message = "No response from server. Please check your connection.";
    } else {
      message = error.message || "Request setup error";
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;


