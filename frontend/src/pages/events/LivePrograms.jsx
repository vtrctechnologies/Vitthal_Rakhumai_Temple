import React, { useState, useEffect, useRef, memo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Loader2,
  Youtube,
  Facebook,
  Instagram,
  Share2,
  Check,
  ChevronDown,
  Sparkles,
  Radio,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { liveProgramsAPI, liveProgramCategoriesAPI } from "../../services/api";
import { openSafeUrl } from "../../utils/urlSecurity";
import { useLanguage } from "../../context/LanguageContext";

/* ── Sacred Diamond Divider ── */
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
    <span className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-4 border-l-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-4 border-r-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-4 border-l-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-4 border-r-4 border-saffron z-30 pointer-events-none" />
  </>
);

/* ── Custom Temple Dropdown for Years ── */
const CustomYearDropdown = memo(({ selectedYear, availableYears, onChange, isMarathi }) => {
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

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 h-10 sm:h-11 px-4 sm:px-5 rounded-md bg-cream-dk/90 border border-gold/45 hover:border-amber-500 hover:bg-cream text-maroon font-heading text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs select-none"
      >
        <Calendar size={14} className="text-saffron shrink-0" />
        <span className="text-ink-mid font-semibold">{isMarathi ? "वर्ष:" : "Year:"}</span>
        <span className="text-maroon font-bold text-amber-900">{selectedYear}</span>
        <ChevronDown
          size={14}
          className={`text-gold-dk transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-1.5 min-w-[150px] max-h-56 overflow-y-auto bg-gradient-to-b from-[#1c0505]/98 via-[#140303]/98 to-[#0c0202]/98 border border-amber-500/35 rounded-md shadow-xl p-1.5 z-50 backdrop-blur-md"
          >
            <div className="flex flex-col gap-0.5">
              {availableYears.map((year) => {
                const isSelected = selectedYear === year;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      onChange(year);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-xs"
                        : "text-amber-100/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{year}</span>
                    {isSelected && <Check size={13} className="text-maroon-dk stroke-[2.5]" />}
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

/* ── Custom Temple Dropdown for Categories (Mobile Only) ── */
const CustomCategoryDropdown = memo(({ selectedCategory, categories, onChange, isMarathi }) => {
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
    { value: "all", label: isMarathi ? "सर्व कार्यक्रम" : "All Programs" },
    ...categories.map((cat) => ({
      value: cat._id,
      label: cat.name,
    })),
  ];

  const currentOption = options.find((opt) => opt.value === selectedCategory) || options[0];

  return (
    <div className="relative w-full max-w-xs sm:hidden" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2.5 h-11 px-4 rounded-md bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border border-amber-500/70 font-heading text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer select-none transition-all"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Filter size={14} className="text-maroon-dk shrink-0" />
          <span className="truncate">{currentOption.label}</span>
        </div>
        <ChevronDown
          size={15}
          className={`text-maroon-dk shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto bg-gradient-to-b from-[#1c0505]/98 via-[#140303]/98 to-[#0c0202]/98 border border-amber-500/35 rounded-md shadow-[0_12px_32px_rgba(0,0,0,0.65)] p-1.5 z-50 backdrop-blur-md"
            role="listbox"
          >
            <div className="flex flex-col gap-0.5">
              {options.map((opt) => {
                const isSelected = selectedCategory === opt.value;
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-xs"
                        : "text-amber-100/85 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check size={13} className="text-maroon-dk stroke-[2.5] shrink-0" />
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
CustomCategoryDropdown.displayName = "CustomCategoryDropdown";

// =========================================================================
//                             Program Card Component
// =========================================================================

const ProgramCard = ({
  program,
  getImageUrl,
  formatDate,
  formatTime,
  isUpcoming,
  isLive,
  handleSocialLinkClick,
  index,
  isHighlighted = false,
  isMarathi = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const socialLinks = program.socialLinks || {};

  const status = isLive(program.startTimestamp, program.endTimestamp)
    ? "live"
    : isUpcoming(program.startTimestamp)
      ? "upcoming"
      : "past";

  const handleCopyShare = async (programId, title, description) => {
    const shareUrl = `${window.location.origin}/events/live-programs?program=${programId}`;
    const shareData = { title, text: description, url: shareUrl };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <motion.div
      className={`group relative bg-cream-dk border-2 border-gold rounded-sm p-1.5 sm:p-2 shadow-sm flex flex-col justify-between ${
        isHighlighted ? "ring-2 ring-amber-500 shadow-md" : ""
      }`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
    >
      {/* 4 Saffron Corner Brackets */}
      <CornerAccents />

      {/* Inner Framed Card */}
      <div className="border border-saffron-lt/60 rounded-sm overflow-hidden bg-cream/95 flex-1 flex flex-col justify-between">
        <div>
          {/* Thumbnail */}
          <div className="relative h-48 w-full overflow-hidden bg-black border-b border-gold/30">
            {program.thumbnailUrl && !imgError ? (
              <img
                src={getImageUrl(program.thumbnailUrl)}
                alt={program.title}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-stone text-gold-dk">
                <Radio className="w-12 h-12 text-maroon/60" />
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1">
              <span
                className={`px-2.5 py-0.5 rounded-sm text-[10px] font-heading font-bold uppercase tracking-wider shadow-xs ${
                  status === "live"
                    ? "bg-red-600 text-white animate-pulse"
                    : status === "upcoming"
                    ? "bg-emerald-700 text-white"
                    : "bg-ink-dark/80 text-cream"
                }`}
              >
                {status === "live"
                  ? "🔴 LIVE"
                  : status === "upcoming"
                  ? isMarathi
                    ? "आगामी"
                    : "Upcoming"
                  : isMarathi
                  ? "संपन्न"
                  : "Past"}
              </span>
            </div>

            {/* Year Badge */}
            <div className="absolute bottom-2 left-2 z-10">
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-heading font-bold bg-black/75 text-gold-lt border border-gold/30">
                {program.year || new Date(program.startTimestamp).getFullYear()}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={11} className="text-saffron shrink-0" />
              <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-saffron-dk">
                {typeof program.category === "object" && program.category?.name
                  ? program.category.name
                  : "Satsang"}
              </span>
            </div>

            <h3 className="font-display text-lg font-bold text-maroon group-hover:text-saffron-dk transition-colors leading-snug line-clamp-2 mb-2">
              {program.title}
            </h3>

            {program.description && (
              <p className="font-body text-xs text-ink-light line-clamp-2 mb-3">
                {program.description}
              </p>
            )}

            <div className="space-y-1 text-xs text-ink-mid pt-2 border-t border-gold/25 font-body">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-saffron shrink-0" />
                <span>{formatDate(program.startTimestamp)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-saffron shrink-0" />
                <span>
                  {formatTime(program.startTimestamp)}
                  {program.endTimestamp && ` - ${formatTime(program.endTimestamp)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social / Stream Links Footer */}
        <div className="p-3 bg-cream border-t border-gold/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {socialLinks.youtube && (
              <button
                onClick={() => handleSocialLinkClick(socialLinks.youtube)}
                className="p-1.5 rounded-md bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                title="Watch on YouTube"
              >
                <Youtube size={15} />
              </button>
            )}
            {socialLinks.facebook && (
              <button
                onClick={() => handleSocialLinkClick(socialLinks.facebook)}
                className="p-1.5 rounded-md bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                title="Watch on Facebook"
              >
                <Facebook size={15} />
              </button>
            )}
            {socialLinks.instagram && (
              <button
                onClick={() => handleSocialLinkClick(socialLinks.instagram)}
                className="p-1.5 rounded-md bg-pink-600/10 text-pink-600 hover:bg-pink-600 hover:text-white transition-colors cursor-pointer"
                title="Watch on Instagram"
              >
                <Instagram size={15} />
              </button>
            )}
          </div>

          <button
            onClick={() =>
              handleCopyShare(program._id, program.title, program.description)
            }
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-heading font-bold text-maroon hover:bg-amber-100/60 border border-gold/40 transition-colors cursor-pointer"
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} />}
            <span>{copied ? (isMarathi ? "कॉपी झाले" : "Copied!") : isMarathi ? "शेअर" : "Share"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// =========================================================================
//                             Main Component
// =========================================================================

const LivePrograms = () => {
  const { isMarathi } = useLanguage();
  const [searchParams] = useSearchParams();
  const highlightedProgramId = searchParams.get("program");

  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  const programRefs = useRef({});
  useEffect(() => {
    fetchYears();
    fetchCategories();
  }, []);
  useEffect(() => {
    fetchPrograms();
  }, [selectedCategory, selectedYear]);

  const fetchYears = async () => {
    try {
      const response = await (liveProgramsAPI.getLiveProgramYears || liveProgramsAPI.getProgramYears)();
      const yearsData =
        response?.data || (Array.isArray(response) ? response : []);
      if (Array.isArray(yearsData) && yearsData.length > 0) {
        setAvailableYears(yearsData);
        const currentYear = new Date().getFullYear();
        if (yearsData.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else {
          setSelectedYear(yearsData[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching years:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await (liveProgramCategoriesAPI.getCategories || liveProgramCategoriesAPI.getAllCategories)();
      const catsData =
        response?.data || (Array.isArray(response) ? response : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        active: "true",
        year: selectedYear.toString(),
      };
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      const response = await (liveProgramsAPI.getLivePrograms || liveProgramsAPI.getPrograms)(params);
      const progsData =
        response?.data || (Array.isArray(response) ? response : []);
      setPrograms(Array.isArray(progsData) ? progsData : []);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError(
        isMarathi
          ? "थेट कार्यक्रम लोड करण्यात अडचण आली."
          : "Unable to load live programs."
      );
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${baseUrl}${url}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isMarathi ? "mr-IN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isUpcoming = (startTimestamp) => new Date(startTimestamp) > new Date();
  const isLive = (startTimestamp, endTimestamp) => {
    const now = new Date();
    return now >= new Date(startTimestamp) && now <= new Date(endTimestamp);
  };

  const handleSocialLinkClick = (url) => {
    if (url?.trim()) openSafeUrl(url);
  };

  return (
    <div className="w-full bg-cream font-body text-ink-dark min-h-screen relative overflow-hidden">
      {/* ═══════════ 1. CINEMATIC HERO BANNER ═══════════ */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 bg-gradient-to-b from-[#180303] via-[#100202] to-[#180303] text-cream border-b border-amber-500/25 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12)_0%,_rgba(24,4,4,0.40)_65%,_rgba(12,2,2,0.95)_100%)] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 40px)",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
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
            <Radio size={13} className="text-amber-300 shrink-0" />
            <span>{isMarathi ? "थेट प्रक्षेपण व कीर्तन" : "Live Streaming & Kirtan"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center select-none"
          >
            <span className="font-heading text-[clamp(2rem,5.5vw,4rem)] font-black text-white leading-tight tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              {isMarathi ? "थेट कार्यक्रम व उत्सव" : "Live Programs & Events"}
            </span>
            <span className="font-heading text-[clamp(1.1rem,3vw,2rem)] font-bold tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] mt-1 block">
              {isMarathi ? "श्री विठ्ठल रखुमाई मंदिर ट्रस्ट" : "Shree Vitthal Rakhumai Mandir Trust"}
            </span>
          </motion.h1>

          <DiamondDivider />

          <motion.p
            className="max-w-2xl mx-auto text-base sm:text-lg text-cream/85 font-body leading-relaxed mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isMarathi
              ? "“दैनंदिन काकड आरती, भजन, प्रवचन आणि उत्सव कीर्तनाचे घरबसल्या थेट पावन दर्शन.”"
              : "“Experience our devotional gatherings, daily aartis, bhajan sandhyas, and sacred utsavs live from anywhere.”"}
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
          || थेट दर्शन — घरबसल्या विठ्ठल दर्शन ||
        </p>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />

      {/* ═══════════ 3. CATEGORY & YEAR FILTER BAR ═══════════ */}
      <section className="bg-cream border-b border-gold/30 shadow-xs relative z-20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
          {/* Mobile-Only Custom Category Dropdown */}
          <CustomCategoryDropdown
            selectedCategory={selectedCategory}
            categories={categories}
            onChange={setSelectedCategory}
            isMarathi={isMarathi}
          />

          {/* Tablet & Desktop Category Tabs */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-1.5 rounded-md text-xs font-heading font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-maroon text-gold-lt border-maroon shadow-xs"
                  : "bg-cream-dk border-gold/40 text-maroon hover:border-gold hover:bg-cream"
              }`}
            >
              {isMarathi ? "सर्व कार्यक्रम" : "All Programs"}
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`px-4 py-1.5 rounded-md text-xs font-heading font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                  selectedCategory === category._id
                    ? "bg-maroon text-gold-lt border-maroon shadow-xs"
                    : "bg-cream-dk border-gold/40 text-maroon hover:border-gold hover:bg-cream"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Year Dropdown (Downside) */}
          {availableYears.length > 0 && (
            <div className="flex items-center justify-center">
              <CustomYearDropdown
                selectedYear={selectedYear}
                availableYears={availableYears}
                onChange={setSelectedYear}
                isMarathi={isMarathi}
              />
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ 4. PROGRAMS DIRECTORY ═══════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-ink-light">
            <Loader2 className="w-10 h-10 animate-spin text-saffron mb-3" />
            <p className="font-heading text-xs sm:text-sm tracking-widest uppercase text-maroon font-bold">
              {isMarathi ? "थेट कार्यक्रम लोड होत आहेत..." : "Loading live programs…"}
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-cream-dk border border-vermillion/40 rounded-md p-8 text-center max-w-lg mx-auto shadow-sm">
            <p className="text-vermillion font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div>
            {programs.length === 0 ? (
              <div className="bg-cream-dk rounded-md border border-gold/40 p-12 text-center max-w-md mx-auto shadow-xs">
                <Radio className="w-10 h-10 text-gold-dk mx-auto mb-3" />
                <h3 className="font-display text-xl font-bold text-maroon mb-1.5">
                  {isMarathi ? "कार्यक्रम उपलब्ध नाहीत" : "No Programs Scheduled"}
                </h3>
                <p className="font-body text-sm text-ink-light">
                  {isMarathi
                    ? "सध्या या श्रेणीत कोणतेही थेट किंवा आगामी कार्यक्रम नाहीत."
                    : "There are currently no live or scheduled programs for this selection."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {programs.map((program, idx) => (
                  <div
                    key={program._id || idx}
                    ref={(el) => {
                      if (el && program._id) programRefs.current[program._id] = el;
                    }}
                  >
                    <ProgramCard
                      program={program}
                      getImageUrl={getImageUrl}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      isUpcoming={isUpcoming}
                      isLive={isLive}
                      handleSocialLinkClick={handleSocialLinkClick}
                      index={idx}
                      isHighlighted={highlightedProgramId === program._id}
                      isMarathi={isMarathi}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LivePrograms;
