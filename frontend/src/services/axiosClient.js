  import axios from "axios";

// Base URL for all public-site API requests
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://vrtemple-backend.onrender.com/api";

// Shared axios instance for frontend app
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Unified response / error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;


