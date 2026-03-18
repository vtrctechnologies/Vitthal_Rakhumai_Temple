import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Toast Notifications */}
        <Toaster />
        <Sonner />

        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* 1. Redirect Root (/) to /admin 
              This ensures users land on the admin panel by default.
            */}
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* 2. Admin Route 
              AdminPage.jsx handles the logic for:
              - Checking Authentication
              - Showing AuthPage (Login/Register)
              - Showing DashboardView (Sidebar + Content)
            */}
            <Route path="/admin" element={<AdminPage />} />

            {/* 3. 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
