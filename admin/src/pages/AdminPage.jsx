import React, { useState, useEffect } from "react";
import { authAPI } from "../services/api";
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
          const response = await authAPI.getMe();
          if (response.success) {
            const userData = {
              id: response.data._id,
              name: response.data.name,
              email: response.data.email,
              role: response.data.role || "admin",
            };
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem("temple_admin_user", JSON.stringify(userData));
          } else {
            localStorage.removeItem("temple_admin_token");
            localStorage.removeItem("temple_admin_user");
          }
        } catch (error) {
          localStorage.removeItem("temple_admin_token");
          localStorage.removeItem("temple_admin_user");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    // Ensure 'name' is present for components that use it (like DashboardView)
    const processedUser = {
      ...userData,
      name: userData.name || userData.username
    };
    localStorage.setItem("temple_admin_user", JSON.stringify(processedUser));
    setUser(processedUser);
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
