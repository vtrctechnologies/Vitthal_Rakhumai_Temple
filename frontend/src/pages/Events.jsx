import { useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  Loader2,
  CalendarDays,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { eventsPageAPI } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";

/* ── Sacred Diamond Divider (mirrors Home, About, Committee & Gallery) ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-3 justify-center">
    <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="11"
        y="1"
        width="13"
        height="13"
        rx="1"
        transform="rotate(45 11 1)"
        className="fill-saffron opacity-80"
      />
      <rect
        x="11"
        y="4"
        width="9"
        height="9"
        rx="0.5"
        transform="rotate(45 11 4)"
        fill="none"
        className="stroke-gold-lt"
        strokeWidth="0.8"
      />
    </svg>
    <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
  </div>
);

/* ── Corner Accents for Cards ── */
const CornerAccents = () => (
  <>
    <span className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 border-t-2 border-l-2 border-saffron z-20" />
    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 border-t-2 border-r-2 border-saffron z-20" />
    <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 border-b-2 border-l-2 border-saffron z-20" />
    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-b-2 border-r-2 border-saffron z-20" />
  </>
);

/* ── Custom Temple-Themed Dropdown for Years ── */
const CustomYearDropdown = memo(({ activeYear, availableYears, onChange, isMarathi }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const options = [
    { value: "all", label: isMarathi ? "सर्व वर्षे" : "All Years" },
    ...availableYears.map((y) => ({ value: y, label: y.toString() })),
  ];

  const currentOption = options.find((opt) => opt.value === activeYear) || options[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger Button (Rectangular Temple Styling) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 h-9 px-4 rounded-md bg-cream-dk/90 border border-gold/45 hover:border-amber-500 hover:bg-cream text-maroon font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs select-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <CalendarIcon size={14} className="text-saffron shrink-0" />
        <span className="text-ink-mid font-semibold">{isMarathi ? "वर्ष:" : "Year:"}</span>
        <span className="text-maroon font-bold text-amber-900">{currentOption.label}</span>
        <ChevronDown
          size={14}
          className={`text-gold-dk transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Floating Animated Custom Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-1.5 min-w-[170px] max-h-60 overflow-y-auto bg-gradient-to-b from-[#1c0505]/98 via-[#140303]/98 to-[#0c0202]/98 border border-amber-500/35 rounded-md shadow-[0_12px_32px_rgba(0,0,0,0.65)] p-1.5 z-50 backdrop-blur-md"
            role="listbox"
          >
            <div className="flex flex-col gap-0.5">
              {options.map((opt) => {
                const isSelected =
                  activeYear === opt.value ||
                  (opt.value === "all" && (!activeYear || activeYear === "all"));

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-xs"
                        : "text-amber-100/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check size={13} className="text-maroon-dk stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
CustomYearDropdown.displayName = "CustomYearDropdown";

const Events = memo(() => {
  const { isMarathi } = useLanguage();

  // Featured event state
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Countdown state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Upcoming events state
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  // Year filtering state
  const [availableYears, setAvailableYears] = useState([]);
  const [activeYear, setActiveYear] = useState("all");

  // Fetch featured event
  useEffect(() => {
    const fetchFeaturedEvent = async () => {
      try {
        setLoadingFeatured(true);
        const response = await eventsPageAPI.getFeaturedEvent();
        const featData =
          response?.data || (Array.isArray(response) ? response[0] : response);
        if (featData) {
          setFeaturedEvent(Array.isArray(featData) ? featData[0] : featData);
        }
      } catch (error) {
        console.error("Error fetching featured event:", error);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeaturedEvent();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!featuredEvent || !featuredEvent.targetDate) return;
    const targetDate = new Date(featuredEvent.targetDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [featuredEvent]);

  // Fetch available years on mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await eventsPageAPI.getEventYears();
        const years =
          response?.data || (Array.isArray(response) ? response : []);
        if (Array.isArray(years) && years.length > 0) {
          setAvailableYears(years);
        }
      } catch (error) {
        console.error("Error fetching event years:", error);
      }
    };
    fetchYears();
  }, []);

  // Fetch upcoming/all events when year changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingUpcoming(true);
        const params = {};
        if (activeYear && activeYear !== "all") {
          params.year = activeYear;
        }
        const response = await eventsPageAPI.getAllEvents(params);
        const events = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setUpcomingEvents(events);
      } catch (error) {
        console.error("Error fetching events by year:", error);
        setUpcomingEvents([]);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchEvents();
  }, [activeYear]);

  const formatEventDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(isMarathi ? "mr-IN" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full bg-cream font-body text-ink-dark min-h-screen relative overflow-hidden">
      {/* ═══════════ 1. CINEMATIC HERO BANNER ═══════════ */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 bg-gradient-to-b from-[#180303] via-[#100202] to-[#180303] text-cream border-b border-amber-500/25 overflow-hidden">
        {/* Subtle Top Gold Filament */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

        {/* Ambient Divine Radiance */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12)_0%,_rgba(24,4,4,0.40)_65%,_rgba(12,2,2,0.95)_100%)] pointer-events-none" />

        {/* Repeating Sacred Grid Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 40px)",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Sacred Seva Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-black/45 border border-amber-400/40 rounded-full px-4 py-1.5 font-heading text-xs sm:text-[0.82rem] font-medium text-amber-200 tracking-wide mb-4 shadow-sm backdrop-blur-xs select-none"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <Sparkles size={13} className="text-amber-300 shrink-0" />
            <span>{isMarathi ? "उत्सव व धार्मिक सोहळे" : "Utsav & Sacred Gatherings"}</span>
          </motion.div>

          {/* Main Page Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center select-none"
          >
            <span className="font-heading text-[clamp(2rem,5.5vw,4rem)] font-black text-white leading-tight tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              {isMarathi ? "वार्षिक कार्यक्रम व उत्सव" : "Temple Events"}
            </span>
            <span className="font-heading text-[clamp(1.1rem,3vw,2rem)] font-bold tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] mt-1 block">
              {isMarathi ? "श्री विठ्ठल रखुमाई मंदिर ट्रस्ट" : "Shree Vitthal Rakhumai Mandir Trust"}
            </span>
          </motion.h1>

          <DiamondDivider />

          {/* Subtitle with low vertical padding */}
          <motion.p
            className="max-w-2xl mx-auto text-base sm:text-lg text-cream/85 font-body leading-relaxed mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isMarathi
              ? "“अखंड नामस्मरण, कीर्तन, पालखी सोहळे आणि भक्तिभावाने रंगणारे मंदिरामधील सर्व सण-उत्सव.”"
              : "“Join us in celebrating divine festivals, sacred kirtans, annual palkhi utsavs, and timeless spiritual gatherings.”"}
          </motion.p>
        </div>
      </section>

      {/* ═══════════ 2. SACRED SHLOKA STRIP ═══════════ */}
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />
      <div className="relative bg-maroon px-6 py-7 sm:py-8 text-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(212,175,55,0.15) 0, rgba(212,175,55,0.15) 1px, transparent 0, transparent 60px)",
          }}
        />
        <p className="relative z-10 font-marathi text-[clamp(1.1rem,2.8vw,1.5rem)] text-gold-lt tracking-wide leading-relaxed">
          || अखंड हरिनाम सप्ताह व उत्सव परंपरा — विठ्ठल कृपा ||
        </p>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />

      {/* ═══════════ 3. FEATURED EVENT COUNTDOWN BANNER ═══════════ */}
      {!loadingFeatured && featuredEvent && (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-b from-[#1c0505] via-[#140303] to-[#0d0202] rounded-md border border-amber-500/40 p-6 sm:p-10 shadow-xl overflow-hidden"
          >
            {/* Top gold filament */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <CornerAccents />

            <div className="text-center mb-8 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-amber-400/15 border border-amber-400/40 text-amber-200 font-heading text-xs font-bold uppercase tracking-widest mb-3">
                <Sparkles size={12} className="text-amber-300" />
                {isMarathi ? "प्रमुख आगामी उत्सव" : "Featured Upcoming Utsav"}
              </span>

              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-2">
                {featuredEvent.title}
              </h2>
              {featuredEvent.description && (
                <p className="text-cream/80 font-body text-sm sm:text-base italic max-w-2xl mx-auto leading-relaxed">
                  "{featuredEvent.description}"
                </p>
              )}
            </div>

            {/* Countdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto relative z-10">
              {[
                { label: isMarathi ? "दिवस" : "Days", value: countdown.days },
                { label: isMarathi ? "तास" : "Hours", value: countdown.hours },
                { label: isMarathi ? "मिनिटे" : "Minutes", value: countdown.minutes },
                { label: isMarathi ? "सेकंद" : "Seconds", value: countdown.seconds },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-cream-dk/95 rounded-md p-4 sm:p-5 text-center border border-gold/45 shadow-sm"
                >
                  <div className="font-heading text-3xl sm:text-4xl font-black text-maroon mb-1">
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-saffron-dk uppercase tracking-widest font-heading font-bold">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ═══════════ 4. MAIN EVENTS DIRECTORY & TENURE DROPDOWN ═══════════ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-6">
          <span className="block font-heading text-xs tracking-[0.28em] uppercase text-saffron mb-1">
            {isMarathi ? "|| उत्सव दिनदर्शिका ||" : "|| Sacred Calendar ||"}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-maroon">
            {isMarathi ? "आगामी व नियमित कार्यक्रम" : "Upcoming & Regular Events"}
          </h2>
          <DiamondDivider />
        </div>

        {/* Custom Year Dropdown (Replaces button tabs) */}
        {availableYears.length > 0 && (
          <div className="flex justify-center mb-10">
            <CustomYearDropdown
              activeYear={activeYear}
              availableYears={availableYears}
              onChange={setActiveYear}
              isMarathi={isMarathi}
            />
          </div>
        )}

        {/* Loading State */}
        {loadingUpcoming && (
          <div className="flex flex-col items-center justify-center py-20 text-ink-light">
            <Loader2 className="w-10 h-10 animate-spin text-saffron mb-3" />
            <p className="font-heading text-xs sm:text-sm tracking-widest uppercase text-maroon font-bold">
              {isMarathi ? "कार्यक्रम लोड होत आहेत..." : "Loading upcoming events…"}
            </p>
          </div>
        )}

        {/* Events Cards Grid */}
        {!loadingUpcoming && (
          <div>
            {upcomingEvents.length === 0 ? (
              <div className="bg-cream-dk rounded-md border border-gold/40 p-12 text-center max-w-md mx-auto shadow-xs">
                <CalendarIcon className="w-10 h-10 text-gold-dk mx-auto mb-3" />
                <h3 className="font-display text-xl font-bold text-maroon mb-1.5">
                  {isMarathi ? "कार्यक्रम आढळले नाहीत" : "No Events Found"}
                </h3>
                <p className="font-body text-sm text-ink-light">
                  {isMarathi
                    ? `या वर्षासाठी (${activeYear === "all" ? "सर्व वर्षे" : activeYear}) कोणतेही कार्यक्रम उपलब्ध नाहीत.`
                    : `No events listed for ${activeYear === "all" ? "the selected archive" : `the year ${activeYear}`}.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
                {upcomingEvents.map((event, idx) => (
                  <Link
                    key={event._id || idx}
                    to={`/events/${event._id}`}
                    className="block group"
                  >
                    <div className="relative bg-cream-dk rounded-md p-6 border border-gold/45 shadow-xs hover:border-gold hover:shadow-md transition-colors duration-200 h-full flex flex-col justify-between overflow-hidden">
                      {/* Corner Accents on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <CornerAccents />
                      </div>

                      <div>
                        {/* Status Tag & Calendar Icon */}
                        <div className="flex justify-between items-start mb-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-sm font-heading text-[10.5px] font-bold uppercase tracking-wider ${
                              event.status === "upcoming"
                                ? "bg-amber-400/25 border border-amber-500/50 text-maroon-dk"
                                : "bg-maroon/15 border border-maroon/30 text-maroon"
                            }`}
                          >
                            {event.status === "upcoming"
                              ? isMarathi
                                ? "आगामी"
                                : "Upcoming"
                              : isMarathi
                              ? "नियमित"
                              : "Recurring"}
                          </span>
                          <CalendarIcon className="w-4 h-4 text-saffron shrink-0" />
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-xl font-bold text-maroon group-hover:text-saffron-dk transition-colors mb-3 leading-snug">
                          {event.title}
                        </h3>

                        {/* Meta info */}
                        <div className="space-y-1.5 mb-4 text-xs font-body text-ink-mid">
                          <div className="flex items-center">
                            <CalendarIcon className="w-3.5 h-3.5 mr-2 text-saffron shrink-0" />
                            <span>{formatEventDate(event.date)}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-2 text-saffron shrink-0" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-2 text-saffron shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-ink-dark text-xs sm:text-sm italic border-t border-gold/30 pt-3 line-clamp-2 mt-auto">
                          "{event.description}"
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ═══════════ 5. FOOTER STRIP ═══════════ */}
      <div className="bg-ink-dark border-t-4 border-gold py-6 text-center">
        <p className="font-marathi text-[1.1rem] text-gold-lt tracking-wide">
          || पुंडलिका वरदा हरी विठ्ठल — श्री ज्ञानदेव तुकाराम ||
        </p>
        <p className="font-body italic text-cream/45 text-[0.85rem] mt-1 tracking-wider">
          Shree Vitthal Rakhumai Temple · Amberkarwadi, Ratnagiri
        </p>
      </div>
    </div>
  );
});

Events.displayName = "Events";
export default Events;
