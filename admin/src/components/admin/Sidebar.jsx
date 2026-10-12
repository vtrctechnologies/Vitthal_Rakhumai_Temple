import { Layout, IndianRupee, Calendar, User, Lock, Bell, Image, Timer, FileImage, Trophy, Video, Users, MessageSquare, Folder } from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Layout },
    { id: "donations", label: "Donations", icon: IndianRupee },
    { id: "events", label: "Events", icon: Calendar },
    { id: "events-page", label: "Events Page", icon: Timer },
    { id: "banners", label: "Banners", icon: FileImage },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "sports-registrations", label: "Registrations", icon: Trophy },
    { id: "live-programs", label: "Live Programs", icon: Video },
    { id: "subscribers", label: "Subscribers", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "guests", label: "Guests", icon: User },
    { id: "members", label: "Members", icon: User },
    { id: "gallery", label: "Gallery", icon: Image },
    { id: "categories", label: "Categories", icon: Folder },
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
        fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 z-40 transition-transform duration-300 ease-in-out flex flex-col justify-between pb-4
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ background: "linear-gradient(180deg, #3d0f0f 0%, #5a1515 60%, #6b1a1a 100%)", borderRight: "1px solid rgba(212,175,55,0.25)" }}
      >
        {/* Decorative top gold border */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #6b1a1a, #d4af37, #e8650a, #d4af37, #6b1a1a)" }} />

        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-[0.25em] mb-3 mt-2" style={{ color: "rgba(212,175,55,0.55)" }}>
            Main Menu
          </p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "text-white"
                  : "hover:bg-white/5"
              }`}
              style={
                activeTab === item.id
                  ? {
                      background: "linear-gradient(90deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))",
                      borderLeft: "3px solid #d4af37",
                      color: "#f0d060",
                      paddingLeft: "13px",
                    }
                  : { color: "rgba(255,235,200,0.65)", borderLeft: "3px solid transparent" }
              }
            >
              <item.icon size={18} style={{ flexShrink: 0, opacity: activeTab === item.id ? 1 : 0.7 }} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Sidebar footer ornament */}
        <div className="px-6 py-3 text-center">
          <div className="h-px w-full mb-3" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)" }} />
          <p className="text-[10px] tracking-widest uppercase" style={{ fontFamily: '"Cinzel", serif', color: "rgba(212,175,55,0.45)" }}>
            || जय हरी विठ्ठल ||
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

