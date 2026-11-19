import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  LogOut,
  Menu,
  Check,
  Settings,
  Users,
  Calendar,
  Image as ImageIcon,
  FileImage,
  Trophy,
  Video,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  MapPin,
  BarChart3,
  RefreshCw,
  Folder,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  eventsAPI,
  notificationAPI,
  bannerAPI,
  galleryAPI,
  sportsAPI,
  liveProgramsAPI,
  subscriberAPI,
  contactAPI,
  guestAPI,
  committeeAPI,
} from "../../services/api";
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
import TopDonorsView from "./TopDonorsView";

const VALID_TABS = [
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

const extractList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.registrations)) return res.registrations;
  if (Array.isArray(res?.banners)) return res.banners;
  if (Array.isArray(res?.subscribers)) return res.subscribers;
  if (Array.isArray(res?.messages)) return res.messages;
  return [];
};

const DashboardView = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize activeTab from URL sub-path if present
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.split("/").pop();
    return VALID_TABS.includes(path) ? path : "dashboard";
  });

  const [notifications, setNotifications] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [contentStats, setContentStats] = useState({
    events: [],
    banners: [],
    images: [],
    categories: [],
    sports: [],
    registrations: [],
    livePrograms: [],
    subscribers: [],
    messages: [],
    guests: [],
    members: [],
  });

  const fetchContentAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const results = await Promise.allSettled([
        eventsAPI.getEventsAdmin(),
        bannerAPI.getBanners(),
        galleryAPI.getImagesAdmin(),
        galleryAPI.getCategoriesAdmin(),
        sportsAPI.getSports(),
        sportsAPI.getRegistrations(),
        liveProgramsAPI.getLivePrograms(),
        subscriberAPI.getSubscribers(),
        contactAPI.getMessages(),
        guestAPI.getGuestsAdmin(),
        committeeAPI.getMembersAdmin(),
      ]);

      const getList = (idx) =>
        results[idx]?.status === "fulfilled" ? extractList(results[idx].value) : [];

      setContentStats({
        events: getList(0),
        banners: getList(1),
        images: getList(2),
        categories: getList(3),
        sports: getList(4),
        registrations: getList(5),
        livePrograms: getList(6),
        subscribers: getList(7),
        messages: getList(8),
        guests: getList(9),
        members: getList(10),
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching website content analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContentAnalytics();
  }, [fetchContentAnalytics]);

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
    const interval = setInterval(fetchNotifications, 30000);
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
    if (VALID_TABS.includes(path) && path !== activeTab) {
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

  const activeTabLabel = activeTab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  // Derived real website metrics
  const activeEventsCount = contentStats.events.filter(
    (e) => e.isActive !== false && e.status !== "completed"
  ).length;
  const activeBannersCount = contentStats.banners.filter(
    (b) => b.isActive !== false
  ).length;
  const activeImagesCount = contentStats.images.filter(
    (img) => img.isActive !== false
  ).length;
  const pendingRegistrationsCount = contentStats.registrations.filter(
    (r) => (r.status || "").toLowerCase() === "pending"
  ).length;

  const contentModules = [
    {
      id: "events",
      label: "Events",
      count: contentStats.events.length,
      sub: `${activeEventsCount} active`,
      icon: Calendar,
    },
    {
      id: "banners",
      label: "Banners",
      count: contentStats.banners.length,
      sub: `${activeBannersCount} live`,
      icon: FileImage,
    },
    {
      id: "gallery",
      label: "Gallery Photos",
      count: contentStats.images.length,
      sub: `${activeImagesCount} published`,
      icon: ImageIcon,
    },
    {
      id: "categories",
      label: "Gallery Categories",
      count: contentStats.categories.length,
      sub: "Organized albums",
      icon: Folder,
    },
    {
      id: "sports",
      label: "Sports Events",
      count: contentStats.sports.length,
      sub: "Tournaments & winners",
      icon: Trophy,
    },
    {
      id: "sports-registrations",
      label: "Registrations",
      count: contentStats.registrations.length,
      sub: `${pendingRegistrationsCount} pending`,
      icon: ClipboardList,
    },
    {
      id: "live-programs",
      label: "Live Programs",
      count: contentStats.livePrograms.length,
      sub: "Streams & broadcasts",
      icon: Video,
    },
    {
      id: "members",
      label: "Committee Members",
      count: contentStats.members.length,
      sub: "Trustees & seva team",
      icon: UserCheck,
    },
    {
      id: "guests",
      label: "Dignitaries / Guests",
      count: contentStats.guests.length,
      sub: "Featured guests",
      icon: Users,
    },
    {
      id: "subscribers",
      label: "Subscribers",
      count: contentStats.subscribers.length,
      sub: "Newsletter list",
      icon: Users,
    },
    {
      id: "messages",
      label: "Devotee Messages",
      count: contentStats.messages.length,
      sub: "Contact inquiries",
      icon: MessageSquare,
    },
  ];

  const maxModuleCount = Math.max(
    1,
    ...contentModules.map((m) => m.count)
  );

  const totalContentRecords = contentModules.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const quickLinks = [
    {
      id: "events",
      label: "Events",
      desc: "Schedule & manage utsavs",
      count: contentStats.events.length,
      icon: Calendar,
    },
    {
      id: "banners",
      label: "Banners",
      desc: "Update homepage & event banners",
      count: contentStats.banners.length,
      icon: FileImage,
    },
    {
      id: "sports-registrations",
      label: "Registrations",
      desc: "Review tournament entries",
      count: contentStats.registrations.length,
      icon: ClipboardList,
    },
    {
      id: "gallery",
      label: "Gallery",
      desc: "Upload sacred darshan photos",
      count: contentStats.images.length,
      icon: ImageIcon,
    },
    {
      id: "live-programs",
      label: "Live Programs",
      desc: "Manage live stream & schedule",
      count: contentStats.livePrograms.length,
      icon: Video,
    },
    {
      id: "messages",
      label: "Messages",
      desc: "Read devotee inquiries",
      count: contentStats.messages.length,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fef6e4] text-[#2c1a0e]">
      {/* Top Navbar */}
      <nav
        className="sticky top-0 z-40 temple-hero-pattern"
        style={{
          borderBottom: "2px solid rgba(212,175,55,0.42)",
          boxShadow: "0 4px 22px rgba(44,26,14,0.28)",
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl text-[#f0d060]/85 hover:text-[#f0d060] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu size={22} />
              </button>

              <button
                onClick={() => handleTabChange("dashboard")}
                className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0 group cursor-pointer"
              >
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full border-2 border-[#d4af37]/65 p-[2px] bg-gradient-to-tr from-[#e8650a]/30 via-[#220707] to-[#d4af37]/30 group-hover:border-[#f0d060] transition-all duration-300 shadow-md">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#180303]">
                    <img
                      src="/temple-logo-optimized.png"
                      alt="Shree Vitthal Rakhumai Mandir Trust Logo"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="block font-bold text-sm sm:text-base lg:text-lg text-[#f0d060] font-display-temple tracking-wide truncate group-hover:text-amber-200 transition-colors">
                      Shree Vitthal Rakhumai
                    </span>
                    <span
                      aria-hidden="true"
                      className="hidden sm:inline-block font-marathi font-bold text-[#f0d060]/80 text-xs shrink-0"
                    >
                      ॐ
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#f5a623]">
                    <span className="font-semibold font-heading-temple">Mandir</span>
                    <span className="text-[#d4af37]/45">•</span>
                    <span className="hidden md:inline-flex items-center gap-1 text-[#fef6e4]/75 tracking-wider normal-case font-medium">
                      <MapPin size={10} className="text-[#f0d060] shrink-0" />
                      Ambekarwadi · Ratnagiri
                    </span>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl relative text-[#f0d060]/80 hover:text-[#f0d060] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#e8650a] border-2 border-[#4a0f0f] rounded-full animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div
                    className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-3 w-[calc(100vw-1.5rem)] sm:w-96 bg-[#fffdf8] rounded-2xl shadow-2xl overflow-hidden z-50 animate-subtle-pop origin-top-right"
                    style={{ border: "1px solid rgba(212,175,55,0.45)" }}
                  >
                    <div
                      className="px-4 py-3 border-b flex justify-between items-center gap-2"
                      style={{
                        background:
                          "linear-gradient(135deg, #fef6e4 0%, #f5e6c8 100%)",
                        borderColor: "rgba(212,175,55,0.3)",
                      }}
                    >
                      <div>
                        <h3 className="font-bold text-[#6b1a1a] text-sm font-heading-temple">
                          Notifications
                        </h3>
                        <p className="text-xs text-[#8b5e3c]">
                          {unreadCount} unread messages
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-[#e8650a] hover:text-[#6b1a1a] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Check size={12} /> Mark all
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-[#8b5e3c] hover:text-[#c0392b] font-semibold transition-colors cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-[340px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-[#8b5e3c]">
                          <Bell size={32} className="mx-auto mb-2 opacity-25" />
                          <p className="text-sm font-medium">No notifications</p>
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
                            className={`px-4 py-3 border-b border-[#d4af37]/15 last:border-0 cursor-pointer transition-colors relative group ${
                              n.isRead
                                ? "bg-[#fffdf8] hover:bg-[#fef6e4]"
                                : "bg-[#f5e6c8]/40 hover:bg-[#f5e6c8]/70"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                  n.isRead ? "bg-[#d4af37]/40" : "bg-[#e8650a]"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm break-words ${
                                    n.isRead
                                      ? "text-[#5c3317]"
                                      : "text-[#2c1a0e] font-semibold"
                                  }`}
                                >
                                  {n.text}
                                </p>
                                <p className="text-xs text-[#8b5e3c] mt-1 font-medium">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
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
              <div
                className="hidden sm:flex items-center gap-2.5 pl-3"
                style={{ borderLeft: "1px solid rgba(212,175,55,0.3)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm font-heading-temple"
                  style={{
                    background: "rgba(212,175,55,0.2)",
                    color: "#f0d060",
                    border: "1px solid rgba(212,175,55,0.45)",
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="text-xs leading-tight">
                  <p className="font-semibold text-[#f0d060] max-w-[110px] truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-[#ffebc8]/55">
                    {user?.role || "Admin"}
                  </p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-[#f0d060]/85 hover:text-[#fef6e4] hover:bg-white/10 border border-transparent hover:border-[#d4af37]/30 active:scale-95 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Logout</span>
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
          <div key={activeTab} className="max-w-7xl mx-auto animate-fade-in-up">
            {activeTab === "dashboard" ? (
              <div className="space-y-6 sm:space-y-8">
                {/* Sacred Welcome Header */}
                <div className="temple-hero-pattern rounded-2xl p-6 sm:p-8 text-[#fef6e4] relative overflow-hidden border border-[#d4af37]/40 shadow-lg">
                  <div
                    className="absolute top-0 inset-x-0 h-1"
                    style={{
                      background:
                        "linear-gradient(90deg, #4a0f0f, #d4af37, #e8650a, #d4af37, #4a0f0f)",
                    }}
                  />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 border border-[#d4af37]/35 text-[11px] uppercase tracking-[0.2em] text-[#f0d060] mb-3">
                        <Sparkles size={12} />
                        <span>|| जय हरी विठ्ठल ||</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#fef6e4] font-heading-temple">
                        Website Content &amp; Analytics
                      </h1>
                      <p className="text-sm sm:text-base text-[#ffebc8]/80 mt-1 font-body-temple">
                        Live content inventory across {totalContentRecords}{" "}
                        records in events, banners, gallery, sports, and
                        community modules.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={fetchContentAnalytics}
                        disabled={analyticsLoading}
                        className="!w-auto !py-2.5 !px-4 !text-sm !bg-white/10 !text-[#f0d060] !border-[#d4af37]/50 hover:!bg-white/20"
                      >
                        <RefreshCw
                          size={15}
                          className={analyticsLoading ? "animate-spin" : ""}
                        />
                        <span>{analyticsLoading ? "Refreshing..." : "Refresh Data"}</span>
                      </Button>
                      <Button
                        variant="saffron"
                        onClick={() => handleTabChange("events")}
                        className="!w-auto !py-2.5 !px-5 !text-sm"
                      >
                        <Calendar size={16} />
                        <span>Manage Events</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Real Website Content KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                  <StatCard
                    title="Total Events"
                    value={analyticsLoading ? "—" : contentStats.events.length}
                    trend={`${activeEventsCount} active / upcoming`}
                    icon={Calendar}
                    accent="maroon"
                    onClick={() => handleTabChange("events")}
                  />
                  <StatCard
                    title="Website Banners"
                    value={analyticsLoading ? "—" : contentStats.banners.length}
                    trend={`${activeBannersCount} active on site`}
                    icon={FileImage}
                    accent="saffron"
                    onClick={() => handleTabChange("banners")}
                  />
                  <StatCard
                    title="Sports Registrations"
                    value={
                      analyticsLoading ? "—" : contentStats.registrations.length
                    }
                    trend={
                      pendingRegistrationsCount > 0
                        ? `${pendingRegistrationsCount} pending review`
                        : `${contentStats.sports.length} sports events`
                    }
                    icon={ClipboardList}
                    accent="gold"
                    onClick={() => handleTabChange("sports-registrations")}
                  />
                  <StatCard
                    title="Gallery Media"
                    value={analyticsLoading ? "—" : contentStats.images.length}
                    trend={`${contentStats.categories.length} categories`}
                    icon={ImageIcon}
                    accent="saffron"
                    onClick={() => handleTabChange("gallery")}
                  />
                </div>

                {/* Live Content Distribution Breakdown */}
                <div className="temple-card p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div>
                      <h3 className="font-bold text-[#6b1a1a] text-lg flex items-center gap-2 font-heading-temple">
                        <BarChart3 size={20} className="text-[#e8650a]" />
                        Website Content Inventory
                      </h3>
                      <p className="text-xs sm:text-sm text-[#8b5e3c] mt-0.5">
                        Live record counts across every published website module
                        {lastUpdated &&
                          ` • Updated ${lastUpdated.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#f5e6c8] text-[#6b1a1a] border border-[#d4af37]/40 self-start sm:self-auto">
                      {totalContentRecords} Total Records
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {contentModules.map((mod) => {
                      const pct = Math.max(
                        mod.count > 0 ? 6 : 0,
                        Math.round((mod.count / maxModuleCount) * 100)
                      );
                      return (
                        <button
                          key={mod.id}
                          onClick={() => handleTabChange(mod.id)}
                          className="group text-left p-3 rounded-xl border border-transparent hover:border-[#d4af37]/40 hover:bg-[#fef6e4]/70 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-1.5 rounded-lg bg-[#6b1a1a]/10 text-[#6b1a1a] group-hover:bg-[#6b1a1a] group-hover:text-[#f0d060] transition-colors flex-shrink-0">
                                <mod.icon size={15} />
                              </div>
                              <span className="font-semibold text-sm text-[#2c1a0e] truncate">
                                {mod.label}
                              </span>
                              <span className="text-xs text-[#8b5e3c] hidden sm:inline">
                                ({mod.sub})
                              </span>
                            </div>
                            <span className="font-bold text-sm text-[#6b1a1a] font-heading-temple flex-shrink-0">
                              {analyticsLoading ? "—" : mod.count}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-[#f5e6c8] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-[#6b1a1a] via-[#e8650a] to-[#d4af37] transition-all duration-500"
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Events & Recent Registrations / Messages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming / Recent Events */}
                  <div className="temple-card p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#d4af37]/25">
                      <h3 className="font-bold text-[#6b1a1a] text-base sm:text-lg font-heading-temple flex items-center gap-2">
                        <Calendar size={18} className="text-[#e8650a]" />
                        Recent &amp; Upcoming Events
                      </h3>
                      <button
                        onClick={() => handleTabChange("events")}
                        className="text-xs font-semibold text-[#e8650a] hover:text-[#6b1a1a] flex items-center gap-1 cursor-pointer"
                      >
                        View all <ArrowUpRight size={14} />
                      </button>
                    </div>
                    {contentStats.events.length === 0 ? (
                      <p className="text-sm text-[#8b5e3c] py-6 text-center">
                        No events found yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {contentStats.events.slice(0, 5).map((ev) => (
                          <div
                            key={ev._id}
                            onClick={() => handleTabChange("events")}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#fef6e4]/60 border border-[#d4af37]/25 hover:border-[#d4af37]/60 transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#2c1a0e] truncate">
                                {ev.title || ev.name || "Untitled Event"}
                              </p>
                              <p className="text-xs text-[#8b5e3c] mt-0.5">
                                {ev.date
                                  ? new Date(ev.date).toLocaleDateString()
                                  : ev.year || "Scheduled"}
                              </p>
                            </div>
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#6b1a1a]/10 text-[#6b1a1a] capitalize flex-shrink-0">
                              {ev.status || (ev.isActive === false ? "inactive" : "active")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Latest Registrations & Messages */}
                  <div className="temple-card p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#d4af37]/25">
                      <h3 className="font-bold text-[#6b1a1a] text-base sm:text-lg font-heading-temple flex items-center gap-2">
                        <ClipboardList size={18} className="text-[#e8650a]" />
                        Latest Registrations &amp; Inquiries
                      </h3>
                      <button
                        onClick={() => handleTabChange("sports-registrations")}
                        className="text-xs font-semibold text-[#e8650a] hover:text-[#6b1a1a] flex items-center gap-1 cursor-pointer"
                      >
                        Registrations <ArrowUpRight size={14} />
                      </button>
                    </div>
                    {contentStats.registrations.length === 0 &&
                    contentStats.messages.length === 0 ? (
                      <p className="text-sm text-[#8b5e3c] py-6 text-center">
                        No registrations or devotee messages yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {contentStats.registrations.slice(0, 3).map((reg) => (
                          <div
                            key={reg._id}
                            onClick={() => handleTabChange("sports-registrations")}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#fef6e4]/60 border border-[#d4af37]/25 hover:border-[#d4af37]/60 transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#2c1a0e] truncate">
                                {reg.teamName || reg.participantName || reg.captainName || "Registration"}
                              </p>
                              <p className="text-xs text-[#8b5e3c] mt-0.5 truncate">
                                {reg.sportName || reg.competitionName || "Sports Entry"}
                              </p>
                            </div>
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#e8650a]/10 text-[#b8440a] capitalize flex-shrink-0">
                              {reg.status || "submitted"}
                            </span>
                          </div>
                        ))}
                        {contentStats.messages.slice(0, 2).map((msg) => (
                          <div
                            key={msg._id}
                            onClick={() => handleTabChange("messages")}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#fffaf0] border border-[#d4af37]/25 hover:border-[#d4af37]/60 transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#2c1a0e] truncate">
                                {msg.name || msg.subject || "Devotee Message"}
                              </p>
                              <p className="text-xs text-[#8b5e3c] mt-0.5 truncate">
                                {msg.message || msg.email || "Contact inquiry"}
                              </p>
                            </div>
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#d4af37]/15 text-[#7a5a12] flex-shrink-0">
                              Message
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Redirection Cards */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-[#6b1a1a] font-heading-temple">
                      Quick Seva Modules
                    </h2>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8b5e3c]">
                      Direct Navigation
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickLinks.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className="temple-card group p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="p-2.5 rounded-xl bg-[#6b1a1a]/10 border border-[#d4af37]/30 text-[#6b1a1a] group-hover:bg-[#6b1a1a] group-hover:text-[#f0d060] transition-colors flex-shrink-0">
                            <item.icon size={20} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm sm:text-base text-[#2c1a0e] group-hover:text-[#6b1a1a] transition-colors truncate font-heading-temple">
                                {item.label}
                              </h3>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f5e6c8] text-[#6b1a1a]">
                                {item.count}
                              </span>
                            </div>
                            <p className="text-xs text-[#8b5e3c] truncate mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight
                          size={18}
                          className="text-[#8b5e3c] group-hover:text-[#e8650a] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === "donations" ? (
              <TopDonorsView />
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
              <div className="temple-card flex flex-col items-center justify-center py-16 px-6 text-center max-w-lg mx-auto my-8">
                <div className="bg-[#f5e6c8]/70 border border-[#d4af37]/40 p-5 rounded-2xl mb-4 text-[#6b1a1a]">
                  <Settings size={40} />
                </div>
                <h2 className="text-xl font-bold text-[#6b1a1a] font-heading-temple">
                  {activeTabLabel} Module
                </h2>
                <p className="text-sm text-[#8b5e3c] mt-2 mb-6">
                  This temple management module is currently being prepared.
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("dashboard")}
                  className="!w-auto !px-6"
                >
                  Back to Dashboard
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardView;
