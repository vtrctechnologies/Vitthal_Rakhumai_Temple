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
      closeTimer.current = setTimeout(() => setOpen(false), 160);
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
          ? "text-amber-100 font-bold bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-amber-500/25 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.22)]"
          : "text-amber-100/75 hover:text-amber-100 hover:bg-white/[0.06] border border-transparent font-semibold"
          }`}
        aria-expanded={link.dropdown ? open : undefined}
      >
        <IconComponent
          size={13}
          className={`transition-colors duration-200 ${active
            ? "text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
            : "text-amber-400/70 group-hover:text-amber-300"
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
            className={`text-amber-400/70 transition-transform duration-200 ${open ? "rotate-180 text-amber-300" : "group-hover:text-amber-300"
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
            className="absolute top-full left-1/2 -translate-x-1/2 min-w-[310px] pt-2 z-50 origin-top"
          >
            {/* Card Shell */}
            <div className="relative rounded-md bg-gradient-to-b from-[#1c0505]/98 via-[#140303]/98 to-[#0c0202]/98 border border-amber-500/35 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_16px_rgba(212,175,55,0.1)] p-2 overflow-hidden">
              {/* Top ambient gold filament */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

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
                        ? "bg-amber-500/15 border-amber-400/35 text-amber-100"
                        : "border-transparent hover:bg-white/[0.05] hover:border-amber-500/20 text-cream/80 hover:text-white"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Micro icon box with sacred golden tone */}
                        <div
                          className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 transition-all duration-200 ${isSubActive
                            ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-[#2b0808] shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/20 group-hover:bg-amber-400 group-hover:text-[#2b0808] group-hover:border-amber-300"
                            }`}
                        >
                          <SubIcon size={14} />
                        </div>

                        <div className="flex flex-col text-left min-w-0">
                          <span className="font-heading text-[0.74rem] font-bold tracking-wider uppercase text-amber-100 group-hover:text-amber-200 transition-colors truncate">
                            {isMarathi ? sub.mr : sub.name}
                          </span>
                          <span className="font-marathi text-[0.66rem] text-amber-200/60 group-hover:text-amber-200/85 transition-colors leading-tight truncate">
                            {isMarathi ? sub.descMr : sub.desc}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        size={13}
                        className={`text-amber-400/40 group-hover:text-amber-300 transition-transform duration-150 transform group-hover:translate-x-0.5 shrink-0 ${isSubActive ? "text-amber-300 opacity-100" : ""
                          }`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Dropdown Auxiliary Footer: Darshan Times */}
              <div className="mt-1.5 pt-1.5 border-t border-amber-500/15 px-2.5 py-1.5 flex items-center justify-between bg-amber-500/[0.04] rounded-sm text-[0.66rem] text-amber-200/80">
                <span className="flex items-center gap-1.5 font-marathi">
                  <Clock size={11} className="text-amber-400 shrink-0" />
                  {isMarathi ? "दर्शन: स. ६ ते रा. ९" : "Darshan: 6 AM – 9 PM"}
                </span>
                <span className="font-marathi font-medium text-amber-300 flex items-center gap-1">
                  <SacredOm className="text-amber-400 text-[0.75rem]" />
                  <span>{isMarathi ? "पंढरपूर रूप" : "Ratnagiri"}</span>
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

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Track scroll state for sleek dock transition
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${scrolled
          ? "py-2 bg-[#120303]/95 backdrop-blur-xl border-b border-amber-500/25 shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
          : "py-3 sm:py-3.5 bg-gradient-to-b from-[#180303]/90 via-[#130202]/85 to-transparent backdrop-blur-sm border-b border-amber-500/15"
          }`}
      >
        {/* Sacred Golden Top Filament Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-85 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
          {/* ── Brand / Temple Deity Crest ── */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 sm:gap-3.5 shrink-0 py-0.5 min-w-0"
            onClick={() => setIsOpen(false)}
            aria-label="Home"
          >
            {/* Medallion with luminous gold rim & subtle sacred halo */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full border-2 border-amber-400/60 p-[2px] bg-gradient-to-tr from-amber-600/30 via-[#220707] to-amber-400/30 group-hover:border-amber-300 group-hover:shadow-[0_0_14px_rgba(245,158,11,0.4)] transition-all duration-300">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#180303]">
                <img
                  src="/temple-logo-optimized.png"
                  alt="Shree Vitthal Rakhumai Mandir Trust Logo"
                  loading="eager"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                />
              </div>
            </div>

            {/* Typography Stack */}
            <div className="flex flex-col text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-marathi text-[0.88rem] sm:text-[1.02rem] font-bold text-amber-100 tracking-wide leading-tight group-hover:text-amber-200 transition-colors truncate">
                  {isMarathi ? "श्री विठ्ठल रखुमाई" : "Shree Vitthal Rakhumai"}
                </span>
                <SacredOm className="hidden sm:inline-block text-amber-400/70 text-[0.8rem]" />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-heading text-[0.58rem] sm:text-[0.66rem] font-semibold text-amber-300/80 tracking-[0.2em] uppercase leading-tight group-hover:text-amber-200 transition-colors">
                  {isMarathi ? "मंदिर" : "Mandir"}
                </span>
                <span className="hidden md:inline-block text-[0.55rem] text-amber-400/40">
                  •
                </span>
                <span className="hidden md:flex items-center gap-1 font-body text-[0.64rem] text-cream/70 tracking-wider">
                  <MapPin size={10} className="text-amber-400 shrink-0" />
                  {isMarathi ? "आंबेकरवाडी · रत्नागिरी" : "Ambekarwadi · Ratnagiri"}
                </span>
              </div>
            </div>
          </Link>

          {/* ── Modern Floating Desktop Nav Capsule (Rectangular Temple Architecture) ── */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 px-2.5 py-1.5 rounded-md bg-black/45 border border-amber-500/25 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.35)]"
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
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Primary Spiritual Offering CTA: Donate / देणगी */}
            <Link
              to="/donation"
              className="group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 h-7.5 sm:h-8 px-3 sm:px-4 rounded-md font-heading text-[0.68rem] sm:text-[0.76rem] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-200 text-[#2b0808] shadow-[0_2px_14px_rgba(245,158,11,0.32)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.5)] active:scale-95 transition-all duration-200 select-none overflow-hidden leading-none"
            >
              {/* Subtle inner shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent ease-out" />

              <Heart
                size={13}
                className="fill-[#2b0808] text-[#2b0808] shrink-0 sm:w-3.5 sm:h-3.5 transition-transform duration-200 group-hover:scale-110"
              />
              <span className="whitespace-nowrap relative z-10">
                {isMarathi ? "देणगी" : "Donate"}
              </span>
            </Link>

            {/* Language Switcher on larger screens */}
            <div className="hidden sm:flex items-center">
              <Switch />
            </div>

            {/* Mobile Menu Trigger Button */}
            <button
              type="button"
              className="flex lg:hidden items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/20 text-amber-200 transition-all active:scale-90 cursor-pointer shrink-0 shadow-xs"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Aesthetic Mobile Navigation Drawer / Slide-Over Sheet ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Aesthetic Temple Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[86vw] max-w-[340px] bg-gradient-to-b from-[#1c0505] via-[#140303] to-[#0c0202] border-l border-amber-500/30 shadow-2xl flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              {/* Mobile Drawer Top Section */}
              <div>
                {/* Header */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-amber-500/20 bg-black/30">
                  <Link
                    to="/"
                    className="flex items-center gap-2.5"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full border border-amber-400/60 p-0.5 shrink-0 bg-[#180303]">
                      <img
                        src="/temple-logo-optimized.png"
                        alt="Temple Logo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-marathi text-[0.86rem] font-bold text-amber-200 leading-tight">
                        {isMarathi ? "श्री विठ्ठल रखुमाई" : "Shree Vitthal Rakhumai"}
                      </span>
                      <span className="font-heading text-[0.58rem] text-amber-300/80 tracking-widest uppercase">
                        {isMarathi ? "मंदिर ट्रस्ट" : "Mandir Trust"}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-200 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Devotional Shloka Banner with Language Switcher */}
                <div className="px-4 py-2 bg-gradient-to-r from-amber-500/15 via-gold/10 to-amber-500/15 border-b border-amber-500/20 flex items-center justify-between">
                  <span className="font-marathi text-xs text-amber-200 font-bold tracking-wide flex items-center gap-1.5">
                    <SacredOm className="text-amber-400 text-[0.75rem]" />
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
                        className="rounded-xl overflow-hidden border border-amber-500/20 bg-white/[0.02]"
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            to={link.path}
                            onClick={() => !link.dropdown && setIsOpen(false)}
                            className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 font-heading text-[0.78rem] font-semibold tracking-wider uppercase transition-colors ${active
                              ? "text-amber-200 bg-amber-500/15 font-bold"
                              : "text-cream/85 hover:text-amber-200"
                              }`}
                          >
                            <LinkIcon
                              size={15}
                              className={
                                active ? "text-amber-300" : "text-amber-400/70"
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
                              className="w-11 h-10 flex items-center justify-center text-amber-400/70 hover:text-amber-200 border-l border-amber-500/15 active:bg-amber-500/10 transition-colors cursor-pointer"
                              aria-label={
                                isExpanded ? "Collapse submenu" : "Expand submenu"
                              }
                            >
                              <ChevronDown
                                size={15}
                                className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180 text-amber-300" : ""
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
                              className="px-2.5 pb-2.5 pt-1 flex flex-col gap-1 border-t border-amber-500/15 bg-black/25"
                            >
                              {link.dropdown.map((sub) => {
                                const SubIcon = sub.icon || Sparkles;
                                const isSubActive = isActive(sub.path);

                                return (
                                  <Link
                                    key={sub.path}
                                    to={sub.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-heading font-medium tracking-wide transition-colors ${isSubActive
                                      ? "text-amber-200 bg-amber-500/20 font-semibold"
                                      : "text-cream/70 hover:text-amber-200 hover:bg-white/5"
                                      }`}
                                  >
                                    <div className="w-5 h-5 rounded flex items-center justify-center bg-amber-500/10 text-amber-300 shrink-0">
                                      <SubIcon size={12} />
                                    </div>
                                    <div className="flex flex-col text-left min-w-0">
                                      <span className="text-[0.74rem] font-semibold text-amber-100 truncate">
                                        {isMarathi ? sub.mr : sub.name}
                                      </span>
                                      <span className="font-marathi text-[9px] text-cream/50 leading-tight truncate">
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

              {/* Mobile Drawer Footer with Sacred Offering Action */}
              <div className="p-3.5 border-t border-amber-500/20 bg-black/40 flex flex-col gap-2.5">
                <Link
                  to="/donation"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-heading text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-[#2b0808] shadow-[0_2px_12px_rgba(245,158,11,0.35)] active:scale-98 transition-all"
                >
                  <Heart size={14} className="fill-[#2b0808]" />
                  <span>{isMarathi ? "देणगी अर्पण करा" : "Offer Donation"}</span>
                </Link>

                <div className="flex items-center justify-between text-[0.68rem] text-amber-200/80 font-marathi pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Clock size={11} className="text-amber-400 shrink-0" />
                    {isMarathi ? "दर्शन: स. ६ ते रा. ९" : "Darshan: 6 AM – 9 PM"}
                  </span>
                  <span className="italic opacity-80 flex items-center gap-1">
                    <SacredOm className="text-amber-400 text-[0.7rem]" />
                    <span>{isMarathi ? "रत्नागिरी" : "Ratnagiri"}</span>
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
