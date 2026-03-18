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
import { eventsAPI } from "../../services/api"; // Adjust path
import { Button, StatCard } from "../customUi/AdminShared";
import Sidebar from "./Sidebar";
import EventsView from "./EventsView";
import EventsPageView from "./EventsPageView";
import SettingsView from "./SettingsView";
import MembersView from "./MembersView";
import GalleryView from "./GalleryView";
import BannerView from "./BannerView";
import SportsView from "./SportsView";
import HeroFestivalView from "./HeroFestivalView";
import LiveProgramsView from "./LiveProgramsView";

const DashboardView = ({ user, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [timeRange, setTimeRange] = useState("12h"); // State for graph time range
  const [events, setEvents] = useState([]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "New donation received: ₹501",
      time: "2 mins ago",
      read: false,
    },
    {
      id: 2,
      text: "Evening Aarti scheduled for 7 PM",
      time: "1 hour ago",
      read: false,
    },
    { id: 3, text: "Staff meeting at 4 PM", time: "3 hours ago", read: true },
  ]);

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

  // Simulate receiving a notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          text: "VIP Darshan request pending",
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"
              >
                <Menu size={24} />
              </button>
              <Landmark className="text-orange-600 hidden md:block" size={28} />
              <span className="font-bold lg:text-xl text-gray-800">
                Vitthal Rakhumai Seva Mandal
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          Notifications
                        </h3>
                        <p className="text-xs text-gray-500">
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
                            key={n.id}
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.map((item) =>
                                  item.id === n.id
                                    ? { ...item, read: true }
                                    : item
                                )
                              );
                            }}
                            className={`px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer transition-colors relative group ${
                              n.read
                                ? "bg-white hover:bg-gray-50"
                                : "bg-orange-50/30 hover:bg-orange-50/60"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                  n.read ? "bg-gray-200" : "bg-orange-500"
                                }`}
                              />
                              <div className="flex-1 pr-4">
                                <p
                                  className={`text-sm ${
                                    n.read
                                      ? "text-gray-600"
                                      : "text-gray-800 font-semibold"
                                  }`}
                                >
                                  {n.text}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 font-medium">
                                  {n.time}
                                </p>
                              </div>
                              <button
                                onClick={(e) => removeNotification(n.id, e)}
                                className="absolute right-2 top-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-gray-100"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="hidden md:flex items-center gap-3 pl-4 border-l">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-700">
                    {user.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role || "Volunteer"}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
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
          setActiveTab={setActiveTab}
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
          ) : activeTab === "hero-festival" ? (
            <HeroFestivalView />
          ) : activeTab === "events" ? (
            <EventsView />
          ) : activeTab === "events-page" ? (
            <EventsPageView />
          ) : activeTab === "members" ? (
            <MembersView />
          ) : activeTab === "gallery" ? (
            <GalleryView />
          ) : activeTab === "banners" ? (
            <BannerView />
          ) : activeTab === "sports" ? (
            <SportsView />
          ) : activeTab === "live-programs" ? (
            <LiveProgramsView />
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
