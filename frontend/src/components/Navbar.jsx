import { useState, useEffect, memo, useMemo, useCallback, useRef } from "react";
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

/* ─────────────────────────────────────────────────────────────
   DesktopNavItem – each nav link that may have a dropdown.
   Uses a ref-based close timer so the dropdown stays open for
   150 ms after the cursor leaves the trigger, giving the user
   enough time to move the mouse down into the dropdown menu.
───────────────────────────────────────────────────────────── */
const DesktopNavItem = memo(({ link, active, isActive, isMarathi }) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const handleMouseEnter = useCallback(() => {
    // Cancel any pending close and open immediately
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (link.dropdown) setOpen(true);
  }, [link.dropdown]);

  const handleMouseLeave = useCallback(() => {
    // Delay closing so the user can move the mouse into the dropdown
    if (link.dropdown) {
      closeTimer.current = setTimeout(() => setOpen(false), 150);
    }
  }, [link.dropdown]);

  // Clean up timer on unmount
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={link.path}
        className={`flex items-center gap-[7px] py-2 px-3.5 rounded-sm font-heading text-[0.72rem] font-semibold tracking-widest uppercase border border-transparent transition-all duration-200 whitespace-nowrap relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 hover:after:w-[80%] after:h-[1px] after:bg-gold after:-translate-x-1/2 after:transition-all after:duration-250 ${
          active
            ? "text-gold bg-gold/10 border-gold-dim after:w-[80%]"
            : "text-cream/75 hover:text-gold-lt"
        }`}
      >
        <link.icon
          size={13}
          className={`transition-opacity duration-200 ${
            active || open ? "opacity-100" : "opacity-70"
          }`}
        />
        {isMarathi ? link.mr : link.name}
        {link.dropdown && (
          <ChevronDown
            size={11}
            className={`opacity-60 transition-transform duration-300 ${
              open ? "rotate-180 opacity-100" : ""
            }`}
          />
        )}
      </Link>

      {/* Dropdown panel */}
      {link.dropdown && (
        <div
          // pt-[8px] creates an invisible hover bridge between the trigger and panel
          className={`absolute top-full left-1/2 -translate-x-1/2 min-w-[210px] pt-[8px] transition-[opacity,transform,visibility] duration-200 ease-out origin-top ${
            open
              ? "opacity-100 visible pointer-events-auto scale-y-100"
              : "opacity-0 invisible pointer-events-none scale-y-95"
          }`}
        >
          <div className="bg-maroon-dk border border-gold-dim border-t-[2px] border-t-gold relative shadow-[0_12px_40px_rgba(44,10,10,0.65)]">
            {/* Diamond tip */}
            <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 rotate-45 w-[11px] h-[11px] bg-gold border-l border-t border-gold-dim z-[1]" />
            <div className="flex flex-col relative z-10">
              {link.dropdown.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  onClick={() => setOpen(false)}
                  className={`block px-[18px] py-[13px] font-heading text-[0.7rem] font-semibold tracking-widest uppercase border-b border-gold/15 last:border-b-0 transition-all duration-200 hover:bg-gold/10 hover:text-gold-lt hover:pl-[26px] ${
                    isActive(sub.path)
                      ? "text-gold bg-gold/5"
                      : "text-cream/75"
                  }`}
                >
                  {isMarathi ? sub.mr : sub.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
DesktopNavItem.displayName = "DesktopNavItem";

const Navbar = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isMarathi } = useLanguage();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = useMemo(
    () => [
      { name: "Home", mr: "मुख्यपान", path: "/", icon: Home },
      {
        name: "About",
        mr: "आमच्याबद्दल",
        path: "/about",
        icon: Info,
        dropdown: [
          { name: "Committee", mr: "समिती", path: "/about/committee" },
        ],
      },
      { name: "Gallery", mr: "गॅलरी", path: "/gallery", icon: Image },
      {
        name: "Events",
        mr: "कार्यक्रम",
        path: "/events",
        icon: Calendar,
        dropdown: [
          { name: "Banners", mr: "आगामी", path: "/events/banners" },
          { name: "Sports", mr: "संपन्न", path: "/events/sports" },
          {
            name: "Live Programs",
            mr: "थेट कार्यक्रम",
            path: "/events/live-programs",
          },
          {
            name: "Registration",
            mr: "नोंदणी",
            path: "/events/sports-registration",
          },
        ],
      },
      { name: "Donation", mr: "देणगी", path: "/donation", icon: Heart },
      { name: "Contact", mr: "संपर्क", path: "/contact", icon: Phone },
    ],
    [],
  );

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname],
  );
  const isParActive = useCallback(
    (path) => path !== "/" && location.pathname.startsWith(path),
    [location.pathname],
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] bg-maroon-dk border-b border-gold-dim font-heading transition-shadow duration-300 ${scrolled ? "shadow-[0_4px_32px_rgba(44,10,10,0.55)]" : ""
          }`}
      >
        {/* Multi-stripe top bar (temple arch color band) */}
        <div className="h-1 w-full bg-gradient-to-r from-maroon via-saffron to-maroon via-40% via-gold-lt via-60%" />

        {/* Max-width container */}
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 shrink-0"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative w-11 h-11 shrink-0">
              <div className="absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,var(--color-gold),var(--color-saffron),var(--color-gold),var(--color-maroon-lt),var(--color-gold))] animate-spin-slow z-0" />
              <div className="absolute inset-[2px] rounded-full bg-maroon-dk z-10" />
              <img
                src="/temple-logo-optimized.png"
                alt="Temple logo"
                loading="lazy"
                className="absolute inset-[3px] rounded-full object-cover z-20 w-[calc(100%-6px)] h-[calc(100%-6px)]"
              />
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="font-marathi text-[0.78rem] font-semibold text-gold-lt tracking-wide leading-tight whitespace-nowrap">
                {isMarathi ? "श्री विठ्ठल रखुमाई" : "Shree Vitthal Rakhumai"}
              </span>
              <span className="font-heading text-[0.82rem] font-bold text-cream tracking-wide leading-tight transition-colors group-hover:text-gold-lt whitespace-nowrap">
                {isMarathi ? "मंदिर ट्रस्ट" : "Mandir Trust"}
              </span>
              {/* <span className="font-body italic text-[0.72rem] text-gold-dim tracking-widest uppercase whitespace-nowrap">
                {isMarathi
                  ? "आंबेकरवाडी · रत्नागिरी"
                  : "Amberkarwadi · Ratnagiri"}
              </span> */}
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-1">
            {navLinks.map((link) => (
              <DesktopNavItem
                key={link.path}
                link={link}
                active={isActive(link.path) || isParActive(link.path)}
                isActive={isActive}
                isMarathi={isMarathi}
              />
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3.5 shrink-0 z-[1010]">
            <div className="hidden lg:block">
              <Switch />
            </div>

            {/* Mobile menu toggle */}
            <button
              className="flex lg:hidden items-center justify-center w-10 h-10 border border-gold-dim rounded-sm bg-transparent cursor-pointer transition-colors duration-200 hover:bg-gold/10 hover:border-gold"
              onClick={() => setIsOpen((p) => !p)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X size={20} className="text-gold-lt" />
              ) : (
                <Menu size={20} className="text-gold-lt" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay Navigation */}
      <div
        className={`fixed inset-0 z-[999] bg-maroon-dk flex flex-col transition-transform duration-500 overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(212,175,55,0.04) 0, rgba(212,175,55,0.04) 1px, transparent 0, transparent 50%)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between p-5 pb-4 border-b border-gold-dim">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative w-9 h-9 shrink-0">
              <div className="absolute inset-[2px] rounded-full bg-maroon-dk z-10" />
              <img
                src="/temple-logo-optimized.png"
                alt=""
                loading="lazy"
                className="absolute inset-[3px] rounded-full object-cover z-20 w-[calc(100%-6px)] h-[calc(100%-6px)]"
              />
            </div>
            <span className="font-marathi text-[0.9rem] font-semibold text-gold-lt tracking-wide">
              {isMarathi
                ? "श्री विठ्ठल रखुमाई मंदिर"
                : "Shree Vitthal Rakhumai Mandir"}
            </span>
          </Link>
        </div>

        <div className="flex-1 px-6 pt-6 flex flex-col">
          {navLinks.map((link, i) => {
            const active = isActive(link.path) || isParActive(link.path);
            return (
              <div
                key={link.path}
                className="border-b border-gold/15 first:border-t"
                style={{
                  transitionDelay: isOpen ? `${i * 55}ms` : "0ms",
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? "translateX(0)" : "translateX(20px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              >
                <Link
                  to={link.path}
                  className={`flex items-center gap-4 py-4 px-1 font-heading text-xl font-semibold tracking-wide uppercase transition-all duration-200 w-full hover:text-gold-lt hover:pl-2 ${active ? "text-gold" : "text-cream/80"
                    }`}
                  onClick={() => !link.dropdown && setIsOpen(false)}
                >
                  <link.icon
                    size={20}
                    className={`shrink-0 ${active ? "opacity-100" : "opacity-60"}`}
                  />
                  {isMarathi ? link.mr : link.name}
                </Link>

                {link.dropdown && (
                  <div className="pl-13 pb-3.5 flex flex-col gap-1 border-l border-gold-dim ml-[18px]">
                    {link.dropdown.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`block py-[7px] px-3 font-heading text-[0.8rem] font-semibold tracking-widest uppercase transition-all duration-200 hover:text-gold-lt hover:pl-4 ${isActive(sub.path) ? "text-gold" : "text-cream/55"
                          }`}
                        onClick={() => setIsOpen(false)}
                      >
                        — {isMarathi ? sub.mr : sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-7 border-t border-gold-dim flex items-center justify-between">
          <span className="font-marathi text-[0.9rem] text-gold-lt/50 italic tracking-wide">
            || राम कृष्ण हरी ||
          </span>
          <Switch />
        </div>
      </div>
    </>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
