import React from "react";
import { Layout, IndianRupee, Calendar, User, Lock, Bell, Image, Timer, FileImage, Trophy, Sparkles, Video } from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Layout },
    { id: "hero-festival", label: "Hero Festival", icon: Sparkles },
    { id: "donations", label: "Donations", icon: IndianRupee },
    { id: "events", label: "Events", icon: Calendar },
    { id: "events-page", label: "Events Page", icon: Timer },
    { id: "banners", label: "Banners", icon: FileImage },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "live-programs", label: "Live Programs", icon: Video },
    { id: "members", label: "Members", icon: User },
    { id: "gallery", label: "Gallery", icon: Image },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Lock },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
        fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-100 z-40 transition-transform duration-300 ease-in-out flex flex-col justify-between pb-4
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">
            Main Menu
          </p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-orange-50 text-orange-700 border-r-4 border-orange-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
