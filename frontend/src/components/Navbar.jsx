import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Info,
  Image,
  Calendar,
  Heart,
  Phone,
  ChevronDown,
} from "lucide-react";
import Switch from "./Switch";
import { useLanguage } from "../context/LanguageContext";

const Navbar = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isMarathi } = useLanguage();

  // Disable body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Memoize nav links to prevent recreation on every render
  const navLinks = useMemo(() => [
    { name: "Home", marathiName: "मुख्यपान", path: "/", icon: Home },
    {
      name: "About",
      marathiName: "आमच्याबद्दल",
      path: "/about",
      icon: Info,
      dropdown: [
        { name: "Committee", marathiName: "समिती", path: "/about/committee" },
      ],
    },
    { name: "Gallery", marathiName: "गॅलरी", path: "/gallery", icon: Image },
    {
      name: "Events",
      marathiName: "कार्यक्रम",
      path: "/events",
      icon: Calendar,
      dropdown: [
        { name: "Banners", marathiName: "आगामी", path: "/events/banners" },
        { name: "Sports", marathiName: "संपन्न", path: "/events/sports" },
        { name: "Live Programs", marathiName: "थेट कार्यक्रम", path: "/events/live-programs" },
      ],
    },
    { name: "Donation", marathiName: "देणगी", path: "/donation", icon: Heart },
    { name: "Contact", marathiName: "संपर्क", path: "/contact", icon: Phone },
  ], []);

  // Memoize helper functions
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);
  const isParentActive = useCallback((path) => location.pathname.startsWith(path), [location.pathname]);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-red-900 border-b-4 border-yellow-500 shadow-xl h-20 transition-all duration-300">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* 1. Left Section: Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 z-[60] group"
            onClick={closeMenu}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <img
                src="/temple-logo.png"
                alt="Logo"
                loading="lazy"
                className="relative w-11 h-11 rounded-full object-cover border-2 border-yellow-500 shadow-md"
              />
            </div>
            <div
              className={`flex flex-col justify-center ${
                isOpen ? "opacity-0 lg:opacity-100" : "opacity-100"
              } transition-opacity duration-300`}
            >
              <h1 className="text-sm font-bold font-display leading-none mb-2 tracking-tight text-white group-hover:text-yellow-200 transition-colors">
                {isMarathi
                  ? "श्री विठ्ठल रखुमाई मंदिर"
                  : "Shree Vitthal Rakhumai Mandir"}
              </h1>
              <span className="text-[10px] text-yellow-400/80 uppercase tracking-widest font-medium">
                {isMarathi
                  ? "आंबेकरवाडी, रत्नागिरी"
                  : "Amberkarwadi, Ratnagiri"}
              </span>
            </div>
          </Link>

          {/* 2. Center Section: Navigation Pills (Desktop) */}
          <div className="hidden lg:flex flex-1 items-center justify-center px-4">
            <div className="flex items-center p-1 space-x-2">
              {navLinks.map((link) => (
                <div key={link.path} className="relative group">
                  <Link
                    to={link.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                      isActive(link.path) ||
                      (link.dropdown &&
                        isParentActive(link.path) &&
                        link.path !== "/")
                        ? "bg-yellow-500 text-red-900 shadow-lg scale-105"
                        : "text-red-100 hover:text-white hover:bg-red-800"
                    }`}
                  >
                    <link.icon
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isActive(link.path)
                          ? "scale-110"
                          : "group-hover:scale-110"
                      }`}
                    />
                    <span>{isMarathi ? link.marathiName : link.name}</span>
                    {link.dropdown && (
                      <ChevronDown className="w-3 h-3 ml-1 transition-transform duration-300 group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Desktop Dropdown Menu */}
                  {link.dropdown && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="bg-red-900 border border-yellow-500/50 rounded-xl shadow-2xl overflow-hidden w-48 flex flex-col">
                        {link.dropdown.map((subLink) => (
                          <Link
                            key={subLink.path}
                            to={subLink.path}
                            className={`px-4 py-3 text-sm font-medium border-b border-white/10 last:border-0 hover:bg-yellow-500 hover:text-red-900 transition-colors ${
                              isActive(subLink.path)
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "text-red-100"
                            }`}
                          >
                            {isMarathi ? subLink.marathiName : subLink.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Right Section: Switch & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop Switch */}
            <div className="hidden lg:block">
              <Switch />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-red-800 transition-colors z-[60] relative group border border-transparent hover:border-yellow-500/50"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-7 h-7 text-yellow-400" />
              ) : (
                <Menu className="w-7 h-7 text-yellow-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Full Screen Overlay Menu */}
      <div
        className={`fixed inset-0 bg-red-900 z-50 flex flex-col justify-center items-center transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Decorative Background Element */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-transparent to-transparent"></div>

        <div className="flex flex-col items-start space-y-6 w-auto px-8 relative z-10 max-h-[80vh] overflow-y-auto">
          {navLinks.map((link, idx) => (
            <div
              key={link.path}
              className={`flex flex-col items-start transition-all duration-1000 ${
                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <Link
                to={link.path}
                onClick={closeMenu}
                className={`group flex items-center space-x-4 text-3xl font-display font-bold tracking-tight transition-all duration-300 ${
                  isActive(link.path)
                    ? "text-yellow-400 scale-105 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    : "text-red-100 hover:text-yellow-200"
                }`}
              >
                <link.icon
                  className={`w-8 h-8 ${
                    isActive(link.path)
                      ? "text-yellow-400"
                      : "text-red-300 group-hover:text-yellow-200"
                  }`}
                />
                <span>{isMarathi ? link.marathiName : link.name}</span>
              </Link>

              {/* Mobile Sub-menu */}
              {link.dropdown && (
                <div className="flex flex-col ml-12 mt-2 space-y-3 border-l-2 border-yellow-500/30 pl-4">
                  {link.dropdown.map((subLink) => (
                    <Link
                      key={subLink.path}
                      to={subLink.path}
                      onClick={closeMenu}
                      className={`text-xl font-medium tracking-wide transition-colors ${
                        isActive(subLink.path)
                          ? "text-yellow-400"
                          : "text-red-300 hover:text-yellow-200"
                      }`}
                    >
                      {isMarathi ? subLink.marathiName : subLink.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-16 h-1 bg-yellow-500/30 rounded-full mt-6"></div>

        {/* Switch inside Mobile Menu */}
        <div className="transform scale-125 pt-6 relative z-10">
          <Switch />
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
