import React, { useState, useEffect } from "react";
import authAPI from "../services/api"; // Adjust path as needed
import AuthPage from "../components/admin/AuthPage";
import DashboardView from "../components/admin/DashboardView";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize checks - verify token and get user info
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("temple_admin_token");
      const storedUser = localStorage.getItem("temple_admin_user");

      if (token && storedUser) {
        try {
          // Verify token by fetching user info
          const response = await authAPI.getMe();
          if (response.status === "success") {
            const userData = {
              id: response.data.admin.id,
              username: response.data.admin.username,
              email: response.data.admin.email,
              role: response.data.admin.role || "admin",
            };
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem("temple_admin_user", JSON.stringify(userData));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem("temple_admin_token");
            localStorage.removeItem("temple_admin_user");
          }
        } catch (error) {
          // Token invalid or expired, clear storage
          localStorage.removeItem("temple_admin_token");
          localStorage.removeItem("temple_admin_user");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("temple_admin_user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("temple_admin_token");
    localStorage.removeItem("temple_admin_user");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <DashboardView user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage onLoginSuccess={handleLogin} />
      )}
    </>
  );
}
