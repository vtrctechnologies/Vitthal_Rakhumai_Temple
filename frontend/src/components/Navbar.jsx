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
   Aesthetic Temple Micro Om Symbol
───────────────────────────────────────────────────────────── */
const SacredOm = ({ className = "text-amber-400" }) => (
  <span
    aria-hidden="true"
    className={`font-marathi font-bold select-none text-[0.85rem] leading-none ${className}`}
  >
    ॐ
  </span>
);

/* ─────────────────────────────────────────────────────────────
   DesktopNavItem – Modern aesthetic temple dropdown item
   - Clean glass capsule trigger with subtle temple gold border
   - Floating glassmorphic mega-card with sacred golden trim
   - Devotional micro-subtext and darshan timings chip
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
      closeTimer.current = setTimeout(() => setOpen(false), 220);
    }
  }, [link.dropdown]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const IconComponent = link.icon;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={link.path}
        className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-md font-heading text-[0.72rem] tracking-[0.14em] uppercase transition-all duration-200 select-none leading-none ${active
          ? "text-gold-lt font-bold bg-amber-500/20 border border-gold/40 shadow-[0_0_12px_rgba(212,175,55,0.22)]"
          : "text-cream/75 hover:text-gold-lt hover:bg-white/[0.06] border border-transparent font-semibold"
          }`}
        aria-expanded={link.dropdown ? open : undefined}
      >
        <IconComponent
          size={13}
          className={`transition-colors duration-200 ${active
            ? "text-gold-lt drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]"
            : "text-amber-400/70 group-hover:text-gold-lt"
            }`}
        />

        <span>{isMarathi ? link.mr : link.name}</span>

        {/* Live event glowing beacon */}
        {link.hasLive && (
          <span className="relative flex h-2 w-2 ml-0.5" title="Live Events">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron shadow-[0_0_6px_rgba(232,101,10,0.8)]" />
          </span>
        )}

        {/* Dropdown Chevron */}
        {link.dropdown && (
          <ChevronDown
            size={11}
            className={`text-gold/70 transition-transform duration-200 ${open ? "rotate-180 text-gold-lt" : "group-hover:text-gold-lt"
              }`}
          />
        )}
      </Link>

      {/* Floating Glassmorphic Dropdown Card (Rectangular Temple Architecture) */}
      <AnimatePresence>
        {link.dropdown && open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 min-w-[310px] pt-2 z-[100] origin-top pointer-events-auto"
          >
            {/* Card Shell */}
            <div className="relative rounded-md bg-maroon-dk border border-gold/40 shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_16px_rgba(212,175,55,0.1)] p-2 overflow-hidden">
              {/* Subtle Pattern Background (Exact match to Footer) */}
              <div
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 50%)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Top ambient gold filament */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent z-10" />

              <div className="flex flex-col gap-1 relative z-10 pt-0.5">
                {link.dropdown.map((sub) => {
                  const SubIcon = sub.icon || Sparkles;
                  const isSubActive = isActive(sub.path);

                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center justify-between p-2 rounded-md transition-all duration-150 border ${isSubActive
                        ? "bg-amber-500/15 border-gold/40 text-gold-lt"
                        : "border-transparent hover:bg-white/[0.05] hover:border-gold/20 text-cream/80 hover:text-gold-lt"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Micro icon box with sacred golden tone */}
                        <div
                          className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 transition-all duration-200 ${isSubActive
                            ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-[#2b0808] shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                            : "bg-amber-500/10 text-gold-lt border border-gold/20 group-hover:bg-amber-400 group-hover:text-[#2b0808] group-hover:border-gold"
                            }`}
                        >
                          <SubIcon size={14} />
                        </div>

                        <div className="flex flex-col text-left min-w-0">
                          <span className="font-heading text-[0.74rem] font-bold tracking-wider uppercase text-gold-lt transition-colors truncate">
                            {isMarathi ? sub.mr : sub.name}
                          </span>
                          <span className="font-marathi text-[0.66rem] text-cream/65 group-hover:text-cream/90 transition-colors leading-tight truncate">
                            {isMarathi ? sub.descMr : sub.desc}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        size={13}
                        className={`text-gold/40 group-hover:text-gold-lt transition-transform duration-150 transform group-hover:translate-x-0.5 shrink-0 ${isSubActive ? "text-gold-lt opacity-100" : ""
                          }`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Dropdown Auxiliary Footer: Darshan Times */}
              <div className="mt-1.5 pt-1.5 border-t border-gold/20 px-2.5 py-1.5 flex items-center justify-between bg-black/25 rounded-sm text-[0.66rem] text-cream/75 relative z-10">
                <span className="flex items-center gap-1.5 font-marathi">
                  <Clock size={11} className="text-gold-lt shrink-0" />
                  {isMarathi ? "दर्शन: स. ६ ते रा. ९" : "Darshan: 6 AM – 9 PM"}
                </span>
                <span className="font-marathi font-medium text-gold-lt flex items-center gap-1">
                  <SacredOm className="text-gold-lt text-[0.75rem]" />
                  <span>{isMarathi ? "रत्नागिरी" : "Ratnagiri"}</span>
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
   Main Navbar Component – Aesthetic Modern Temple
───────────────────────────────────────────────────────────── */
const Navbar = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const location = useLocation();
  const { isMarathi } = useLanguage();

  // Lock scroll and pause Lenis when mobile menu is open (smoothly without layout reflow)
  useEffect(() => {
    if (isOpen) {
      if (window.lenis) window.lenis.stop();
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      if (window.lenis) window.lenis.start();
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      if (window.lenis) window.lenis.start();
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  // Track scroll state with zero-lag requestAnimationFrame throttling
  useEffect(() => {
    let ticking = false;
    let lastScrolled = window.scrollY > 20;
    setScrolled(lastScrolled);

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          if (isScrolled !== lastScrolled) {
            lastScrolled = isScrolled;
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

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
        className={`fixed top-0 left-0 right-0 z-50 bg-maroon-dk text-cream border-b-2 border-gold/40 py-2.5 sm:py-3 transition-shadow duration-200 transform-gpu ${
          scrolled ? "shadow-[0_6px_28px_rgba(0,0,0,0.75)]" : "shadow-[0_2px_14px_rgba(0,0,0,0.45)]"
        }`}
      >
        {/* Subtle Sacred Diagonal Texture Overlay (Exact match to Footer, pinned to header bounds) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Sacred Golden Top Filament Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-90 z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 relative z-10">
          {/* ── Brand / Temple Deity Crest ── */}
          <Link
            to="/"
            className="group flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1 sm:flex-initial py-0.5"
            onClick={() => setIsOpen(false)}
            aria-label="Home"
          >
            {/* Medallion with luminous gold rim & subtle sacred halo */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 shrink-0 rounded-full border-2 border-gold/60 p-[2px] bg-gradient-to-tr from-amber-600/30 via-[#220707] to-gold/30 group-hover:border-gold-lt transition-all duration-300 shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#180303]">
                <img
                  src="/temple-logo-optimized.png"
                  alt="Shree Vitthal Rakhumai Mandir Trust Logo"
                  loading="eager"
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Typography Stack (Exact match to Footer fonts and colors) */}
            <div className="flex flex-col text-left min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-[0.82rem] sm:text-[1rem] md:text-[1.1rem] font-bold text-gold-lt tracking-wide leading-tight group-hover:text-amber-200 transition-colors drop-shadow-md truncate ${
                  isMarathi ? "font-marathi" : "font-display"
                }`}>
                  {isMarathi ? "श्री विठ्ठल रखुमाई" : "Shree Vitthal Rakhumai"}
                </span>
                <SacredOm className="hidden sm:inline-block text-gold-lt/80 text-[0.8rem] shrink-0" />
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="font-heading text-[0.52rem] sm:text-[0.62rem] md:text-[0.66rem] font-semibold text-saffron-lt tracking-[0.2em] uppercase leading-tight group-hover:text-gold-lt transition-colors truncate">
                  {isMarathi ? "मंदिर" : "Mandir"}
                </span>
                <span className="hidden md:inline-block text-[0.55rem] text-gold/40">
                  •
                </span>
                <span className="hidden md:flex items-center gap-1 font-body text-[0.65rem] text-cream/75 tracking-wider truncate">
                  <MapPin size={10} className="text-gold-lt shrink-0" />
                  {isMarathi ? "आंबेकरवाडी · रत्नागिरी" : "Ambekarwadi · Ratnagiri"}
                </span>
              </div>
            </div>
          </Link>

          {/* ── Modern Floating Desktop Nav Capsule (Rectangular Temple Architecture) ── */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 px-3 py-1.5 rounded-md bg-[#220505]/75 border border-gold/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.35)] relative z-10"
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

          {/* ── Right Action Hub (Aesthetic Donation CTA + Language Switch + Menu Toggle) ── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 relative z-10">
            {/* Primary Spiritual Offering CTA: Donate / देणगी (Exact match to Footer button) */}
            <Link
              to="/donation"
              className="hidden sm:inline-flex group relative items-center justify-center gap-1.5 h-9 px-4 rounded-md font-heading text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#2b0808] border border-amber-400/60 shadow-xs hover:shadow-sm active:scale-95 transition-all duration-200 select-none leading-none shrink-0"
            >
              <Heart
                size={13}
                className="fill-[#2b0808] text-[#2b0808] shrink-0"
              />
              <span className="whitespace-nowrap relative z-10">
                {isMarathi ? "देणगी" : "Donate"}
              </span>
            </Link>

            {/* Language Switcher on larger screens */}
            <div className="hidden sm:flex items-center shrink-0">
              <Switch />
            </div>

            {/* Mobile Menu Trigger Button (Always visible on mobile & tablet < lg) */}
            <button
              type="button"
              className="flex lg:hidden items-center justify-center w-9 h-9 rounded-md bg-amber-500/15 border border-gold/40 hover:border-gold hover:bg-amber-500/25 text-gold-lt transition-all active:scale-90 cursor-pointer shrink-0 shadow-xs"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Aesthetic Mobile Navigation Drawer / Slide-Over Sheet (Hardware-Composited Zero Lag) ── */}
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-[65] bg-black/75 lg:hidden transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ willChange: "opacity" }}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in Aesthetic Temple Sheet (Full Height Mobile Drawer) */}
      <div
        className={`fixed inset-y-0 right-0 z-[70] w-[86vw] max-w-[340px] h-full h-[100dvh] bg-maroon-dk text-cream border-l-2 border-gold/40 shadow-2xl flex flex-col justify-between overflow-hidden lg:hidden transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
          isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        }`}
        style={{
          willChange: "transform",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
        }}
      >
        {/* Subtle Pattern Background (Exact match to Footer, GPU cached) */}
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none transform-gpu"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
            transform: "translateZ(0)",
          }}
        />

        {/* Mobile Drawer Top Section (Scrollable content) */}
        <div
          className="relative z-10 flex-1 overflow-y-auto flex flex-col"
          style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-gold/25 bg-black/35">
            <Link
              to="/"
              className="flex items-center gap-2.5"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-8 h-8 rounded-full border border-gold/60 p-0.5 shrink-0 bg-[#180303] shadow-xs">
                <img
                  src="/temple-logo-optimized.png"
                  alt="Temple Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className={`text-[0.88rem] font-bold text-gold-lt leading-tight ${
                  isMarathi ? "font-marathi" : "font-display"
                }`}>
                  {isMarathi ? "श्री विठ्ठल रखुमाई" : "Shree Vitthal Rakhumai"}
                </span>
                <span className="font-heading text-[0.58rem] text-saffron-lt tracking-widest uppercase font-semibold">
                  {isMarathi ? "मंदिर ट्रस्ट" : "Mandir Trust"}
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-md bg-amber-500/10 border border-gold/30 flex items-center justify-center text-gold-lt hover:bg-amber-500/20 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Devotional Shloka Banner with Language Switcher */}
          <div className="px-4 py-2 bg-gradient-to-r from-amber-500/15 via-gold/10 to-amber-500/15 border-b border-gold/20 flex items-center justify-between">
            <span className="font-marathi text-xs text-gold-lt font-bold tracking-wide flex items-center gap-1.5">
              <SacredOm className="text-gold-lt text-[0.75rem]" />
              <span>|| राम कृष्ण हरी ||</span>
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
              const LinkIcon = link.icon;

              return (
                <div
                  key={link.path}
                  className="rounded-md overflow-hidden border border-gold/20 bg-white/[0.03]"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      to={link.path}
                      onClick={() => !link.dropdown && setIsOpen(false)}
                      className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 font-heading text-[0.78rem] font-semibold tracking-wider uppercase transition-colors ${active
                        ? "text-gold-lt bg-amber-500/20 font-bold"
                        : "text-cream/80 hover:text-gold-lt"
                        }`}
                    >
                      <LinkIcon
                        size={15}
                        className={
                          active ? "text-gold-lt" : "text-amber-400/70"
                        }
                      />
                      <span>{isMarathi ? link.mr : link.name}</span>
                      {link.hasLive && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-saffron text-white font-bold tracking-widest shadow-[0_0_6px_rgba(232,101,10,0.8)]">
                          LIVE
                        </span>
                      )}
                    </Link>

                    {link.dropdown && (
                      <button
                        type="button"
                        onClick={() => toggleMobileSubmenu(link.name)}
                        className="w-11 h-10 flex items-center justify-center text-gold/70 hover:text-gold-lt border-l border-gold/20 active:bg-amber-500/10 transition-colors cursor-pointer"
                        aria-label={
                          isExpanded ? "Collapse submenu" : "Expand submenu"
                        }
                      >
                        <ChevronDown
                          size={15}
                          className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180 text-gold-lt" : ""
                            }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Collapsible Submenu (Zero reflow CSS grid animation) */}
                  {link.dropdown && (
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out border-t border-gold/15 bg-black/30 ${
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-2.5 pb-2.5 pt-1 flex flex-col gap-1">
                          {link.dropdown.map((sub) => {
                            const SubIcon = sub.icon || Sparkles;
                            const isSubActive = isActive(sub.path);

                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-2.5 p-2 rounded-md text-xs font-heading font-medium tracking-wide transition-colors ${isSubActive
                                  ? "text-gold-lt bg-amber-500/20 font-semibold border border-gold/30"
                                  : "text-cream/70 hover:text-gold-lt hover:bg-white/5"
                                  }`}
                              >
                                <div className="w-5 h-5 rounded flex items-center justify-center bg-amber-500/10 text-gold-lt shrink-0">
                                  <SubIcon size={12} />
                                </div>
                                <div className="flex flex-col text-left min-w-0">
                                  <span className="text-[0.74rem] font-semibold text-gold-lt truncate">
                                    {isMarathi ? sub.mr : sub.name}
                                  </span>
                                  <span className="font-marathi text-[9px] text-cream/55 leading-tight truncate">
                                    {isMarathi ? sub.descMr : sub.desc}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Drawer Footer with Sacred Offering Action */}
        <div className="p-3.5 border-t border-gold/25 bg-black/45 flex flex-col gap-2.5 relative z-10 shrink-0">
          <Link
            to="/donation"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-heading text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#2b0808] border border-amber-400/60 shadow-xs active:scale-98 transition-all"
          >
            <Heart size={14} className="fill-[#2b0808]" />
            <span>{isMarathi ? "देणगी अर्पण करा" : "Offer Donation"}</span>
          </Link>

          <div className="flex items-center justify-between text-[0.68rem] text-gold-lt/85 font-marathi pt-0.5">
            <span className="flex items-center gap-1.5">
              <Clock size={11} className="text-gold-lt shrink-0" />
              {isMarathi ? "दर्शन: स. ६ ते रा. ९" : "Darshan: 6 AM – 9 PM"}
            </span>
            <span className="italic opacity-85 flex items-center gap-1">
              <SacredOm className="text-gold-lt text-[0.7rem]" />
              <span>{isMarathi ? "रत्नागिरी" : "Ratnagiri"}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
