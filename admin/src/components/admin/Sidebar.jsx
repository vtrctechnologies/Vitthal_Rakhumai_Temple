import {
  Layout,
  IndianRupee,
  Calendar,
  User,
  Lock,
  Bell,
  Image,
  Timer,
  FileImage,
  Trophy,
  Video,
  Users,
  MessageSquare,
  Folder,
  X,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar, activeTab, setActiveTab }) => {
  const menuGroups = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: Layout },
        { id: "donations", label: "Donations", icon: IndianRupee },
      ],
    },
    {
      title: "Temple & Events",
      items: [
        { id: "events", label: "Events", icon: Calendar },
        { id: "events-page", label: "Events Page", icon: Timer },
        { id: "banners", label: "Banners", icon: FileImage },
        { id: "sports", label: "Sports", icon: Trophy },
        { id: "sports-registrations", label: "Registrations", icon: Trophy },
        { id: "live-programs", label: "Live Programs", icon: Video },
      ],
    },
    {
      title: "Community & Media",
      items: [
        { id: "gallery", label: "Gallery", icon: Image },
        { id: "categories", label: "Categories", icon: Folder },
        { id: "guests", label: "Guests", icon: User },
        { id: "members", label: "Members", icon: User },
        { id: "subscribers", label: "Subscribers", icon: Users },
        { id: "messages", label: "Messages", icon: MessageSquare },
      ],
    },
    {
      title: "System",
      items: [
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "settings", label: "Settings", icon: Lock },
      ],
    },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile & Tablet Overlay */}
      <div
        className={`fixed inset-0 bg-[#2c1a0e]/55 z-40 lg:hidden transition-opacity duration-200 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-4rem)] w-72 lg:w-64 z-50 lg:z-40
          transition-transform duration-300 ease-out flex flex-col justify-between temple-hero-pattern
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          borderRight: "1px solid rgba(212,175,55,0.28)",
          boxShadow: "4px 0 24px rgba(44,26,14,0.22)",
        }}
      >
        {/* Decorative top gold border */}
        <div
          className="h-1 w-full flex-shrink-0"
          style={{
            background:
              "linear-gradient(90deg, #4a0f0f, #d4af37, #e8650a, #d4af37, #4a0f0f)",
          }}
        />

        {/* Mobile/Tablet Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#d4af37]/20 lg:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-full border border-[#d4af37]/65 p-[1.5px] bg-[#180303]">
              <img
                src="/temple-logo-optimized.png"
                alt="Shree Vitthal Rakhumai Mandir Logo"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold tracking-wide text-[#f0d060] font-display-temple truncate">
                Shree Vitthal Rakhumai
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-[#f5a623]">
                Mandir Admin
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-[#f0d060]/80 hover:text-[#f0d060] hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="px-3 py-4 space-y-5 overflow-y-auto flex-1">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <p
                className="px-3.5 text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
                style={{ color: "rgba(212,175,55,0.58)" }}
              >
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "text-[#f0d060] shadow-sm"
                          : "text-[#ffebc8]/70 hover:text-[#fef6e4] hover:bg-white/[0.06] hover:translate-x-1"
                      }`}
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(90deg, rgba(212,175,55,0.22) 0%, rgba(232,101,10,0.12) 100%)",
                              borderLeft: "3px solid #d4af37",
                              paddingLeft: "11px",
                            }
                          : {
                              borderLeft: "3px solid transparent",
                            }
                      }
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <item.icon
                          size={17}
                          className={`flex-shrink-0 transition-transform duration-200 ${
                            isActive
                              ? "text-[#f0d060] scale-105"
                              : "opacity-75 group-hover:opacity-100 group-hover:text-[#f0d060]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {isActive && (
                        <ChevronRight
                          size={14}
                          className="text-[#d4af37] flex-shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Ornament */}
        <div className="px-5 py-3.5 text-center flex-shrink-0">
          <div
            className="h-px w-full mb-3"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
            }}
          />
          <p
            className="text-[11px] tracking-[0.2em] uppercase"
            style={{
              fontFamily: '"Cinzel", serif',
              color: "rgba(240,208,96,0.55)",
            }}
          >
            || जय हरी विठ्ठल ||
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
