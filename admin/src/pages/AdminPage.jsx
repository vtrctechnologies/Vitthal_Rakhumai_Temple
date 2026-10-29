import React, { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import AuthPage from "../components/admin/AuthPage";
import DashboardView from "../components/admin/DashboardView";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize checks - verify authentication via secure HttpOnly cookie or token (SEC-015)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getMe();
        const userRole = response?.data?.role;
        if (
          response.success &&
          (userRole === "admin" || userRole === "superadmin")
        ) {
          const userData = {
            id: response.data._id,
            name: response.data.name,
            email: response.data.email,
            role: userRole,
          };
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem("temple_admin_user", JSON.stringify(userData));
        } else {
          // Disallow standard non-admin users from admin dashboard
          localStorage.removeItem("temple_admin_token");
          localStorage.removeItem("temple_admin_user");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        localStorage.removeItem("temple_admin_token");
        localStorage.removeItem("temple_admin_user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        // Securely purge any legacy raw JWT token from LocalStorage to prevent XSS exfiltration (SEC-015)
        localStorage.removeItem("temple_admin_token");
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    if (userData.role !== "admin" && userData.role !== "superadmin") {
      localStorage.removeItem("temple_admin_token");
      localStorage.removeItem("temple_admin_user");
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    // Securely purge any raw token from LocalStorage (handled via HttpOnly cookie)
    localStorage.removeItem("temple_admin_token");

    // Ensure 'name' is present for components that use it (like DashboardView)
    const processedUser = {
      ...userData,
      name: userData.name || userData.username,
    };
    localStorage.setItem("temple_admin_user", JSON.stringify(processedUser));
    setUser(processedUser);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {}
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
