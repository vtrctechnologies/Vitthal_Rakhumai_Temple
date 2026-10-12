import React, { useState, useEffect } from "react";
import {
  Landmark,
  Bell,
  LogOut,
  Menu,
  Activity,
  X,
  Check,
  Settings,
  Users,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { eventsAPI, notificationAPI } from "../../services/api"; // Adjust path
import { Button, StatCard } from "../customUi/AdminShared";
import Sidebar from "./Sidebar";
import EventsView from "./EventsView";
import EventsPageView from "./EventsPageView";
import SettingsView from "./SettingsView";
import MembersView from "./MembersView";
import GalleryView from "./GalleryView";
import BannerView from "./BannerView";
import SportsView from "./SportsView";
import LiveProgramsView from "./LiveProgramsView";
import SubscribersView from "./SubscribersView";
import MessagesView from "./MessagesView";
import GuestView from "./GuestView";
import SportsRegistrationView from "./SportsRegistrationView";

const DashboardView = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize activeTab from URL sub-path if present
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.split("/").pop();
    const validTabs = [
      "dashboard",
      "donations",
      "events",
      "events-page",
      "members",
      "gallery",
      "categories",
      "banners",
      "sports",
      "sports-registrations",
      "live-programs",
      "subscribers",
      "messages",
      "guests",
      "notifications",
      "settings",
    ];
    return validTabs.includes(path) ? path : "dashboard";
  });
  
  const [timeRange, setTimeRange] = useState("12h"); // State for graph time range
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Graph Data Configuration
  const graphData = {
    "12h": {
      values: [450, 620, 580, 800, 950, 1200, 1100, 850, 600, 500, 450, 300],
      labels: ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"],
      max: 1500,
      label: "Last 12 Hours",
    },
    "7d": {
      values: [1200, 1450, 1300, 1600, 1900, 2400, 2800],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      max: 3000,
      label: "Last 7 Days",
    },
    "30d": {
      values: [
        2100, 2300, 2000, 2500, 2700, 3100, 3400, 3000, 2800, 2600, 2400, 2900,
        3200, 3500, 3100,
      ],
      labels: ["1st", "5th", "10th", "15th", "20th", "25th", "30th"],
      max: 4000,
      label: "Last 30 Days",
    },
  };

  const currentGraph = graphData[timeRange];

  // Fetch events for dashboard stats
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsAPI.getEvents({ upcoming: "true" });
        if (response && response.status === "success") {
          setEvents(Array.isArray(response.data) ? response.data : []);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      if (response && response.status === "success") {
        setNotifications(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Pulse every 30s
    return () => clearInterval(interval);
  }, []);

  // Sync state with URL when activeTab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "dashboard") {
      navigate("/admin");
    } else {
      navigate(`/admin/${tab}`);
    }
  };

  // Sync state with URL when browser Back/Forward is used
  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const validTabs = [
      "dashboard",
      "donations",
      "events",
      "events-page",
      "members",
      "gallery",
      "categories",
      "banners",
      "sports",
      "sports-registrations",
      "live-programs",
      "subscribers",
      "messages",
      "guests",
      "notifications",
      "settings",
    ];
    if (validTabs.includes(path) && path !== activeTab) {
      setActiveTab(path);
    } else if (location.pathname === "/admin" && activeTab !== "dashboard") {
      setActiveTab("dashboard");
    }
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // For now, we'll mark them locally as read and we could call an API to mark all as read if it exists
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationAPI.clearNotifications();
      setNotifications([]);
      setShowNotifications(false);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: "#f9f3e8" }}>
      {/* Top Navbar */}
      <nav style={{ background: "linear-gradient(135deg, #3d0f0f 0%, #5a1515 60%, #6b1a1a 100%)", borderBottom: "2px solid rgba(212,175,55,0.4)", boxShadow: "0 2px 20px rgba(44,26,14,0.3)" }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md transition-colors"
                style={{ color: "rgba(240,208,96,0.7)" }}
              >
                <Menu size={24} />
              </button>
              <Landmark style={{ color: "#d4af37" }} className="hidden md:block" size={28} />
              <span className="font-bold lg:text-xl" style={{ fontFamily: '"Cinzel", serif', color: "#f0d060", letterSpacing: "0.04em" }}>
                Vitthal Rakhumai Seva Mandal
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full relative transition-colors"
                  style={{ color: "rgba(240,208,96,0.75)" }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-saffron border-2 border-maroon rounded-full animate-pulse" style={{ backgroundColor: "#e8650a" }}></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right" style={{ border: "1px solid rgba(212,175,55,0.3)" }}>
                    <div className="px-4 py-3 border-b flex justify-between items-center" style={{ background: "linear-gradient(135deg, #f9f0e0, #fff8ee)", borderColor: "rgba(212,175,55,0.2)" }}>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          Notifications
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: "#8b5e3c" }}>
                          {unreadCount} unread messages
                        </p>
                      </div>
                          {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                        >
                          <Check size={12} /> Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-gray-400 hover:text-red-500 font-semibold"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="max-h-[350px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <Bell size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n._id);
                              if (n.link) handleTabChange(n.link.split("/").pop());
                              setShowNotifications(false);
                            }}
                            className={`px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer transition-colors relative group ${
                              n.isRead
                                ? "bg-white hover:bg-gray-50"
                                : "bg-orange-50/30 hover:bg-orange-50/60"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                  n.isRead ? "bg-gray-200" : "bg-orange-500"
                                }`}
                              />
                              <div className="flex-1 pr-4">
                                <p
                                  className={`text-sm ${
                                    n.isRead
                                      ? "text-gray-600"
                                      : "text-gray-800 font-semibold"
                                  }`}
                                >
                                  {n.text}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 font-medium">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="hidden md:flex items-center gap-3 pl-4" style={{ borderLeft: "1px solid rgba(212,175,55,0.3)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ background: "rgba(212,175,55,0.2)", color: "#d4af37", border: "1px solid rgba(212,175,55,0.4)" }}>
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <div className="text-sm">
                  <p className="font-medium" style={{ color: "rgba(240,208,96,0.9)" }}>
                    {user.name || "Admin"}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,235,200,0.45)" }}>
                    {user.role || "Volunteer"}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 transition-colors"
                style={{ color: "rgba(240,208,96,0.6)" }}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex mx-auto">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === "dashboard" ? (
            <div className="space-y-8 animate-fade-in-up">
              {/* Welcome Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Dashboard Overview
                  </h1>
                  <p className="text-gray-500">
                    Jai Hari! Here is the temple status for today.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="!w-auto !py-2 !px-4 !text-sm"
                  >
                    Download Report
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Total Devotees"
                  value="12,450"
                  trend="+12% vs yesterday"
                  icon={Users}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Donations (Today)"
                  value="₹ 85,200"
                  trend="+5% vs last week"
                  icon={IndianRupee}
                  color="bg-green-500"
                />
                <StatCard
                  title="Upcoming Events"
                  value={
                    events && Array.isArray(events)
                      ? events.length.toString()
                      : "0"
                  }
                  trend={
                    events && Array.isArray(events)
                      ? `${
                          events.filter((e) => e.status === "upcoming").length
                        } upcoming`
                      : "0 upcoming"
                  }
                  icon={Calendar}
                  color="bg-purple-500"
                />
              </div>

              {/* Website Visits Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <Activity size={20} className="text-blue-500" />
                      Website Visits & Online Darshan
                    </h3>
                    <p className="text-sm text-gray-400">
                      Traffic analytics for {currentGraph.label}
                    </p>
                  </div>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-sm border-gray-200 rounded-md text-gray-500 bg-gray-50 px-2 py-1 cursor-pointer outline-none focus:border-orange-500"
                  >
                    <option value="12h">Last 12 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>

                {/* Visual Chart - Website Visits */}
                <div className="h-72 flex items-end justify-between space-x-1 sm:space-x-2 md:space-x-3 px-2 border-b border-gray-100 pb-2">
                  {currentGraph.values.map((visitors, i) => {
                    const heightPercent = (visitors / currentGraph.max) * 100;
                    return (
                      <div
                        key={i}
                        className="w-full relative group cursor-pointer flex flex-col justify-end h-full"
                      >
                        <div className="w-full bg-blue-50 rounded-t-sm relative h-full overflow-hidden">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-sm transition-all duration-700 ease-out group-hover:from-blue-500 group-hover:to-blue-700 shadow-sm"
                          ></div>
                        </div>

                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                          {visitors} Visits
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-4 font-medium uppercase tracking-wider">
                  {currentGraph.labels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === "events" ? (
            <EventsView />
          ) : activeTab === "events-page" ? (
            <EventsPageView />
          ) : activeTab === "members" ? (
            <MembersView />
          ) : activeTab === "gallery" ? (
            <GalleryView />
          ) : activeTab === "categories" ? (
            <GalleryView initialTab="categories" />
          ) : activeTab === "banners" ? (
            <BannerView />
          ) : activeTab === "sports" ? (
            <SportsView />
          ) : activeTab === "live-programs" ? (
            <LiveProgramsView />
          ) : activeTab === "subscribers" ? (
            <SubscribersView />
          ) : activeTab === "messages" ? (
            <MessagesView />
          ) : activeTab === "guests" ? (
            <GuestView />
          ) : activeTab === "sports-registrations" ? (
            <SportsRegistrationView />
          ) : activeTab === "settings" ? (
            <SettingsView user={user} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in-up">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Settings size={48} className="text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-600">
                Work in Progress
              </h2>
              <p>
                The {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                module is coming soon.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardView;
