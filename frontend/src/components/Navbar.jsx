import { useState, useEffect, memo, useMemo, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Users,
  Radio,
  Trophy,
  Flag,
  Clock,
  Sparkles,
  MapPin,
  ClipboardList,
} from "lucide-react";
import Switch from "./Switch";
import { useLanguage } from "../context/LanguageContext";

/* ─────────────────────────────────────────────────────────────
   DesktopNavItem – Rich modern dropdown navigation item
   Features:
   - Elevated glassmorphic flyout card
   - Card items with micro-icons and rich devotional subtext
   - Hover bridge with debounce timer to prevent accidental close
   - Bottom darshan timing chip inside dropdown
───────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   DesktopNavItem – Clean, high-performance dropdown item
   Features:
   - Light gradients for fast GPU compositing
   - Debounced hover transition
   - Crisp legibility with gold accents
───────────────────────────────────────────────────────────── */
const DesktopNavItem = memo(({ link, active, isActive, isMarathi }) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (link.dropdown) setOpen(true);
  }, [link.dropdown]);

  const handleMouseLeave = useCallback(() => {
    if (link.dropdown) {
      closeTimer.current = setTimeout(() => setOpen(false), 160);
    }
  }, [link.dropdown]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={link.path}
        className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full font-heading text-[0.72rem] font-semibold tracking-[0.12em] uppercase transition-colors duration-200 select-none ${
          active
            ? "text-amber-200 bg-gradient-to-r from-amber-400/20 to-amber-500/10 border border-amber-400/35 shadow-xs"
            : "text-cream/80 hover:text-amber-200 hover:bg-white/5 border border-transparent"
        }`}
        aria-expanded={link.dropdown ? open : undefined}
      >
        <link.icon
          size={13}
          className={`transition-colors duration-200 ${
            active
              ? "text-amber-300"
              : "text-amber-300/70 group-hover:text-amber-300"
          }`}
        />

        <span>{isMarathi ? link.mr : link.name}</span>

        {/* Live badge for events */}
        {link.hasLive && (
          <span className="relative flex h-2 w-2 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron" />
          </span>
        )}

        {/* Dropdown Chevron */}
        {link.dropdown && (
          <ChevronDown
            size={11}
            className={`text-amber-300/70 transition-transform duration-200 ${
              open ? "rotate-180 text-amber-300" : ""
            }`}
          />
        )}
      </Link>

      {/* Modern Clean Mega Dropdown Card */}
      <AnimatePresence>
        {link.dropdown && open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 min-w-[300px] pt-2 z-50 origin-top"
          >
            <div className="relative rounded-xl bg-gradient-to-b from-[#240808] to-[#180404] border border-gold/30 shadow-xl p-2 overflow-hidden">
              {/* Decorative top accent diamond */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 rotate-45 w-2.5 h-2.5 bg-[#240808] border-l border-t border-gold/40 z-20" />

              <div className="flex flex-col gap-1 relative z-10">
                {link.dropdown.map((sub) => {
                  const SubIcon = sub.icon || Sparkles;
                  const isSubActive = isActive(sub.path);

                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center justify-between p-2 rounded-lg transition-colors duration-150 border ${
                        isSubActive
                          ? "bg-amber-400/15 border-amber-400/35 text-amber-200"
                          : "border-transparent hover:bg-white/5 hover:border-gold/20 text-cream/80 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isSubActive
                              ? "bg-amber-400 text-maroon-dk"
                              : "bg-gold/10 text-amber-300 group-hover:bg-amber-400 group-hover:text-maroon-dk"
                          }`}
                        >
                          <SubIcon size={14} />
                        </div>

                        <div className="flex flex-col text-left">
                          <span className="font-heading text-[0.74rem] font-semibold tracking-wider uppercase text-cream group-hover:text-amber-200 transition-colors">
                            {isMarathi ? sub.mr : sub.name}
                          </span>
                          <span className="font-marathi text-[0.65rem] text-gold-lt/60 group-hover:text-gold-lt/80 transition-colors leading-tight">
                            {isMarathi ? sub.descMr : sub.desc}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        size={13}
                        className={`text-gold-lt/40 group-hover:text-amber-300 transition-transform duration-150 transform group-hover:translate-x-0.5 ${
                          isSubActive ? "text-amber-300 opacity-100" : ""
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Dropdown Auxiliary Footer: Darshan Times */}
              <div className="mt-1.5 pt-1.5 border-t border-gold/15 px-2.5 py-1 flex items-center justify-between bg-gold/5 rounded-md text-[0.66rem] text-gold-lt/75">
                <span className="flex items-center gap-1.5 font-marathi">
                  <Clock size={11} className="text-amber-400 shrink-0" />
                  {isMarathi ? "दर्शन: स. ६ ते रा. ९" : "Darshan: 6 AM – 9 PM"}
                </span>
                <span className="font-marathi font-medium text-gold-lt/90">
                  || ॐ ||
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
DesktopNavItem.displayName = "DesktopNavItem";

/* ─────────────────────────────────────────────────────────────
   Main Navbar Component
───────────────────────────────────────────────────────────── */
const Navbar = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const location = useLocation();
  const { isMarathi } = useLanguage();

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Track window scroll for light dock effect
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMobileSubmenu = useCallback((key) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const navLinks = useMemo(
    () => [
      { name: "Home", mr: "मुख्यपान", path: "/", icon: Home },
      {
        name: "About",
        mr: "आमच्याबद्दल",
        path: "/about",
        icon: Info,
        dropdown: [
          {
            name: "Sanctum History",
            mr: "मंदिराचा इतिहास",
            path: "/about",
            desc: "History, architecture & legacy",
            descMr: "मंदिर स्थापत्य व पवित्र वारसा",
            icon: Info,
          },
          {
            name: "Committee",
            mr: "विश्वस्त समिती",
            path: "/about/committee",
            desc: "Managing board & sevadharis",
            descMr: "कार्यकारणी व व्यवस्थापक मंडळ",
            icon: Users,
          },
        ],
      },
      { name: "Gallery", mr: "गॅलरी", path: "/gallery", icon: Image },
      {
        name: "Events",
        mr: "कार्यक्रम",
        path: "/events",
        icon: Calendar,
        hasLive: true,
        dropdown: [
          {
            name: "All Events",
            mr: "सर्व कार्यक्रम",
            path: "/events",
            desc: "Annual calendar & festivals",
            descMr: "वार्षिक दिनदर्शिका व उत्सव",
            icon: Calendar,
          },
          {
            name: "Banners",
            mr: "आगामी उत्सव",
            path: "/events/banners",
            desc: "Announcements & circulars",
            descMr: "आगामी सण व परिपत्रके",
            icon: Flag,
          },
          {
            name: "Live Programs",
            mr: "थेट कार्यक्रम (Live)",
            path: "/events/live-programs",
            desc: "Daily Aarti & Bhajan stream",
            descMr: "थेट दर्शन, आरती व भजन",
            icon: Radio,
          },
          {
            name: "Sports Utsav",
            mr: "क्रीडा स्पर्धा",
            path: "/events/sports",
            desc: "Youth tournament highlights",
            descMr: "युवा सामने व निकाल",
            icon: Trophy,
          },
          {
            name: "Registration",
            mr: "स्पर्धा नोंदणी",
            path: "/events/sports-registration",
            desc: "Participant entry portal",
            descMr: "स्पर्धा प्रवेश व अर्ज",
            icon: ClipboardList,
          },
        ],
      },
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
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? "py-2 bg-[#1e0404]/98 backdrop-blur-md border-b border-gold/25 shadow-sm"
            : "py-2 sm:py-2.5 bg-gradient-to-b from-[#240808]/95 to-[#190404]/95 backdrop-blur-md border-b border-gold/15"
        }`}
      >
        {/* Subtle Light Gold Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent opacity-80" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
          {/* ── Brand / Temple Logo ── */}
          <Link
            to="/"
            className="group flex items-center gap-2 sm:gap-3 shrink-0 py-0.5 min-w-0"
            onClick={() => setIsOpen(false)}
            aria-label="Home"
          >
            {/* Medallion with light gold rim */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full border-2 border-amber-400/50 group-hover:border-amber-300 transition-colors overflow-hidden bg-[#1a0303] shadow-xs">
              <img
                src="/temple-logo-optimized.png"
                alt="Shree Vitthal Rakhumai Mandir Trust Logo"
                loading="eager"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            {/* Typography Stack */}
            <div className="flex flex-col text-left min-w-0">
              <span className="font-marathi text-[0.82rem] sm:text-[0.95rem] font-bold text-amber-100 tracking-wide leading-tight truncate">
                {isMarathi ? "श्री विठ्ठल रखुमाई" : "Shree Vitthal Rakhumai"}
              </span>
              <span className="font-heading text-[0.6rem] sm:text-[0.68rem] font-semibold text-cream/80 tracking-[0.16em] uppercase leading-tight group-hover:text-amber-200 transition-colors">
                {isMarathi ? "मंदिर ट्रस्ट" : "Mandir Trust"}
              </span>
              <span className="hidden md:flex items-center gap-1 font-body text-[0.6rem] text-gold-lt/70 tracking-wider">
                <MapPin size={9} className="text-amber-400 shrink-0" />
                {isMarathi ? "आंबेकरवाडी · रत्नागिरी" : "Amberkarwadi · Ratnagiri"}
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation Capsule Bar ── */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 px-3 py-1 rounded-full bg-black/20 border border-gold/20 backdrop-blur-sm"
          >
            {navLinks.map((link) => (
              <DesktopNavItem
                key={link.path}
                link={link}
                active={isActive(link.path) || isParActive(link.path)}
                isActive={isActive}
                isMarathi={isMarathi}
              />
            ))}
          </nav>

          {/* ── Right Action Hub (Donation CTA + Switch + Hamburger) ── */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Primary Spiritual CTA: Donate / देणगी (Responsive, Light Radiant Gradient) */}
            <Link
              to="/donation"
              className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full font-heading text-[0.66rem] sm:text-[0.74rem] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-maroon-dk shadow-xs hover:shadow-sm active:scale-95 transition-all duration-150 select-none"
            >
              <Heart
                size={12}
                className="fill-maroon-dk text-maroon-dk shrink-0 sm:w-3.5 sm:h-3.5"
              />
              <span className="whitespace-nowrap">
                {isMarathi ? "देणगी" : "Donate"}
              </span>
            </Link>

            {/* Language Switcher on larger screens */}
            <div className="hidden sm:block">
              <Switch />
            </div>

            {/* Mobile Menu Trigger Button */}
            <button
              type="button"
              className="flex lg:hidden items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gold/10 border border-gold/30 hover:border-gold/60 hover:bg-gold/20 text-amber-200 transition-all active:scale-90 cursor-pointer shrink-0"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay (lightweight, zero GPU-heavy blur) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[340px] bg-gradient-to-b from-[#220707] to-[#140303] border-l border-gold/25 shadow-xl flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              {/* Mobile Drawer Header */}
              <div>
                <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-gold/15 bg-black/20">
                  <Link
                    to="/"
                    className="flex items-center gap-2.5"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full border border-amber-400/50 p-0.5 shrink-0 bg-[#1a0303]">
                      <img
                        src="/temple-logo-optimized.png"
                        alt="Logo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-marathi text-[0.84rem] font-bold text-amber-200 leading-tight">
                        {isMarathi ? "श्री विठ्ठल रखुमाई" : "Shree Vitthal Rakhumai"}
                      </span>
                      <span className="font-heading text-[0.58rem] text-cream/70 tracking-widest uppercase">
                        {isMarathi ? "मंदिर ट्रस्ट" : "Mandir Trust"}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center text-amber-200 hover:bg-gold/20 transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Devotional Shloka Banner with Language Switcher */}
                <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-gold/10 border-b border-gold/15 flex items-center justify-between">
                  <span className="font-marathi text-xs text-amber-200 font-semibold tracking-wide">
                    || राम कृष्ण हरी ||
                  </span>
                  <div className="sm:hidden">
                    <Switch />
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="p-3 flex flex-col gap-1.5">
                  {navLinks.map((link) => {
                    const active =
                      isActive(link.path) || isParActive(link.path);
                    const isExpanded = mobileExpanded[link.name];

                    return (
                      <div
                        key={link.path}
                        className="rounded-xl overflow-hidden border border-gold/15 bg-white/[0.02]"
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            to={link.path}
                            onClick={() => !link.dropdown && setIsOpen(false)}
                            className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 font-heading text-[0.78rem] font-semibold tracking-wider uppercase transition-colors ${
                              active
                                ? "text-amber-200 bg-amber-400/15"
                                : "text-cream/85 hover:text-amber-200"
                            }`}
                          >
                            <link.icon
                              size={15}
                              className={
                                active ? "text-amber-300" : "text-amber-300/70"
                              }
                            />
                            <span>{isMarathi ? link.mr : link.name}</span>
                            {link.hasLive && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-saffron text-white font-bold tracking-widest">
                                LIVE
                              </span>
                            )}
                          </Link>

                          {link.dropdown && (
                            <button
                              type="button"
                              onClick={() => toggleMobileSubmenu(link.name)}
                              className="w-11 h-10 flex items-center justify-center text-amber-300/70 hover:text-amber-200 border-l border-gold/10 active:bg-gold/10 transition-colors cursor-pointer"
                              aria-label={
                                isExpanded ? "Collapse submenu" : "Expand submenu"
                              }
                            >
                              <ChevronDown
                                size={15}
                                className={`transform transition-transform duration-200 ${
                                  isExpanded ? "rotate-180 text-amber-300" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Collapsible Submenu */}
                        <AnimatePresence>
                          {link.dropdown && isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="px-2.5 pb-2.5 pt-1 flex flex-col gap-1 border-t border-gold/15 bg-black/20"
                            >
                              {link.dropdown.map((sub) => {
                                const SubIcon = sub.icon || Sparkles;
                                const isSubActive = isActive(sub.path);

                                return (
                                  <Link
                                    key={sub.path}
                                    to={sub.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-heading font-medium tracking-wide transition-colors ${
                                      isSubActive
                                        ? "text-amber-200 bg-amber-400/15 font-semibold"
                                        : "text-cream/70 hover:text-amber-200 hover:bg-white/5"
                                    }`}
                                  >
                                    <SubIcon size={13} className="text-amber-300/70 shrink-0" />
                                    <div className="flex flex-col text-left">
                                      <span className="text-[0.72rem]">{isMarathi ? sub.mr : sub.name}</span>
                                      <span className="font-marathi text-[9px] text-cream/45 leading-tight">
                                        {isMarathi ? sub.descMr : sub.desc}
                                      </span>
                                    </div>
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="p-3.5 border-t border-gold/20 bg-black/30 flex flex-col gap-2.5">
                <Link
                  to="/donation"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-heading text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-sm active:scale-98 transition-all"
                >
                  <Heart size={14} className="fill-maroon-dk" />
                  <span>{isMarathi ? "देणगी अर्पण करा" : "Offer Donation"}</span>
                </Link>

                <div className="flex items-center justify-between text-[0.68rem] text-gold-lt/75 font-marathi pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Clock size={11} className="text-amber-400" />
                    {isMarathi ? "दर्शन: स. ६ ते रा. ९" : "Darshan: 6 AM – 9 PM"}
                  </span>
                  <span className="italic opacity-80">
                    {isMarathi ? "रत्नागिरी, महाराष्ट्र" : "Ratnagiri, MH"}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
