import { useState, useEffect, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import {
  Download,
  Maximize2,
  X,
  Calendar,
  Loader2,
  ChevronDown,
  Sparkles,
  Check,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { bannerAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { openSafeUrl } from "@/utils/urlSecurity";
import { useLanguage } from "@/context/LanguageContext";

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

/* ── Corner Accents ── */
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
        <span className="text-maroon font-bold">{selectedYear}</span>
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
            className="absolute left-0 top-full mt-1.5 min-w-[150px] max-h-56 overflow-y-auto bg-gradient-to-b from-[#1c0505]/98 via-[#140303]/98 to-[#0c0202]/98 border border-amber-500/35 rounded-md shadow-xl p-1.5 z-50 backdrop-blur-md"
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${isSelected
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

/* ── Optimize Cloudinary banner image delivery for smooth scrolling ── */
const getOptimizedBannerUrl = (rawUrl, width = 1000) => {
  const url = getImageUrl(rawUrl);
  if (!url) return null;
  if (url.includes("cloudinary.com") && url.includes("/upload/") && !url.includes("/upload/f_auto")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  return url;
};

/* ── Memoized Featured Banner Showcase Card ── */
const FeaturedBannerCard = memo(({ banner, selectedYear, isMarathi, onSelect, onDownload, onShare, isCopied }) => {
  if (!banner) {
    return (
      <div className="relative bg-cream-dk border-2 border-gold rounded-sm p-2 sm:p-3 shadow-sm">
        <CornerAccents />
        <div className="border border-dashed border-gold/50 rounded-sm bg-cream/60 py-14 px-6 flex flex-col items-center justify-center text-center">
          <Sparkles className="w-10 h-10 text-gold-dk opacity-50 mb-3" />
          <p className="text-maroon text-sm sm:text-base font-heading font-semibold">
            {isMarathi ? "मुख्य उत्सव फलक लवकरच उपलब्ध" : "Featured Banner Coming Soon"}
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = getOptimizedBannerUrl(banner.imageUrl, 1200);

  return (
    <div
      onClick={() => onSelect?.(banner)}
      className="group relative bg-cream-dk border-2 border-gold rounded-sm p-2 sm:p-3 shadow-sm cursor-pointer [contain:layout_style_paint]"
    >
      <CornerAccents />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-stretch">
        {/* Framed Hero Image */}
        <div className="md:col-span-7 relative border border-saffron-lt/60 rounded-sm overflow-hidden bg-gradient-to-b from-[#1c0505] to-[#0e0202] aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center">
          <img
            src={imageUrl}
            alt={banner.title}
            decoding="async"
            fetchpriority="high"
            className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        </div>

        {/* Royal Parchment Info Panel */}
        <div className="md:col-span-5 flex flex-col justify-between bg-cream/95 border border-gold/30 rounded-sm p-4 sm:p-5 lg:p-7">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 bg-maroon text-amber-200 border border-gold/40 px-2.5 py-0.5 rounded-sm text-[10px] sm:text-[11px] font-heading font-bold uppercase tracking-wider">
                <Sparkles size={10} className="text-amber-300 shrink-0" />
                <span>{isMarathi ? "मुख्य फलक" : "Featured Banner"}</span>
              </span>
              <span className="text-[11px] font-heading font-bold text-maroon bg-amber-100/80 border border-gold/40 px-2.5 py-0.5 rounded-sm">
                {selectedYear}
              </span>
            </div>

            <span className="block text-[10.5px] sm:text-xs font-heading font-bold uppercase tracking-[0.14em] text-saffron mb-1">
              || {isMarathi ? "जय हरी विठ्ठल" : "Jay Hari Vitthal"} ||
            </span>

            <h2 className="font-heading text-lg sm:text-xl lg:text-2xl font-bold text-maroon leading-snug group-hover:text-saffron transition-colors">
              {banner.title || (isMarathi ? "उत्सव दर्शन फलक" : "Temple Celebration Banner")}
            </h2>

            <div className="w-16 h-0.5 bg-gradient-to-r from-saffron via-gold to-transparent my-3" />

            {banner.description && (
              <p className="font-body text-xs sm:text-sm lg:text-base text-ink-mid leading-relaxed line-clamp-3 sm:line-clamp-4">
                {banner.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 sm:mt-5 pt-3.5 border-t border-gold/30">
            <button
              type="button"
              onClick={(e) => onDownload?.(e, banner)}
              className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk px-2 sm:px-3 py-2.5 rounded-sm text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider border border-amber-500/60 shadow-xs hover:shadow-md cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isMarathi ? "डाउनलोड" : "Download"}</span>
            </button>
            <button
              type="button"
              onClick={(e) => onShare?.(e, banner)}
              className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2.5 bg-cream-dk hover:bg-amber-100/80 text-maroon rounded-sm border border-gold/50 text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title={isMarathi ? "बॅनर शेअर करा" : "Share Banner"}
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Share2 className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">{isCopied ? (isMarathi ? "कॉपी!" : "Copied") : isMarathi ? "शेअर" : "Share"}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(banner);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2.5 bg-maroon text-amber-200 hover:bg-maroon-dk hover:text-white rounded-sm border border-gold/40 text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title={isMarathi ? "मोठे पहा" : "View Fullscreen"}
            >
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isMarathi ? "पहा" : "Preview"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
FeaturedBannerCard.displayName = "FeaturedBannerCard";

/* ── Memoized Secondary Banner Card ── */
const BannerCard = memo(({ banner, label, isMarathi, onSelect, onDownload, onShare, isCopied }) => {
  if (!banner) {
    return (
      <div className="group relative bg-cream-dk border-2 border-gold/50 rounded-sm p-1.5 sm:p-2 shadow-xs flex flex-col">
        <CornerAccents />
        <div className="flex-1 border border-dashed border-gold/45 rounded-sm bg-cream/60 flex flex-col items-center justify-center p-8 min-h-[240px]">
          <Sparkles className="w-8 h-8 text-gold-dk opacity-50 mb-2" />
          <p className="text-maroon text-xs sm:text-sm font-heading font-semibold text-center">
            {isMarathi ? "दर्शन फलक लवकरच उपलब्ध" : "Darshan Coming Soon"}
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = getOptimizedBannerUrl(banner.imageUrl, 800);

  return (
    <div
      onClick={() => onSelect?.(banner)}
      className="group relative bg-cream-dk border-2 border-gold rounded-sm p-1.5 sm:p-2 shadow-sm cursor-pointer flex flex-col [contain:layout_style_paint]"
    >
      <CornerAccents />

      {/* Inner Framed Image */}
      <div className="relative border border-saffron-lt/60 rounded-sm overflow-hidden bg-gradient-to-b from-[#1c0505] to-[#0e0202] aspect-[4/3] flex items-center justify-center">
        <img
          src={imageUrl}
          alt={banner.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />
      </div>

      {/* Parchment Details Body */}
      <div className="flex-1 flex flex-col justify-between pt-3 pb-1 px-1.5 sm:px-2">
        <div>
          <div className="inline-flex items-center gap-1 text-saffron text-[10px] font-heading font-bold uppercase tracking-wider mb-1">
            <Sparkles size={10} className="shrink-0" />
            <span>{label}</span>
          </div>

          {banner.title && (
            <h3 className="text-maroon text-base sm:text-lg font-heading font-bold leading-snug line-clamp-2 group-hover:text-saffron transition-colors">
              {banner.title}
            </h3>
          )}

          {banner.description && (
            <p className="text-ink-light text-xs sm:text-sm line-clamp-2 font-body mt-1">
              {banner.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-gold/30">
          <button
            type="button"
            onClick={(e) => onDownload?.(e, banner)}
            className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk px-2.5 py-2 rounded-sm text-[11px] font-heading font-bold uppercase tracking-wider border border-amber-500/50 shadow-xs hover:shadow-md cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isMarathi ? "डाउनलोड" : "Download"}</span>
          </button>
          <button
            type="button"
            onClick={(e) => onShare?.(e, banner)}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 bg-cream hover:bg-amber-100/80 text-maroon rounded-sm border border-gold/50 text-[11px] font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
            title={isMarathi ? "बॅनर शेअर करा" : "Share Banner"}
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Share2 className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{isCopied ? (isMarathi ? "कॉपी!" : "Copied") : isMarathi ? "शेअर" : "Share"}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(banner);
            }}
            className="p-2 bg-maroon hover:bg-maroon-dk text-amber-200 hover:text-white rounded-sm border border-gold/40 transition-colors cursor-pointer shrink-0"
            title={isMarathi ? "मोठे पहा" : "View Fullscreen"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});
BannerCard.displayName = "BannerCard";

const Banners = () => {
  const { isMarathi } = useLanguage();
  const [searchParams] = useSearchParams();
  const sharedBannerId = searchParams.get("banner");
  const sharedYearParam = searchParams.get("year");
  const [banners, setBanners] = useState({
    hero: null,
    "top-right": null,
    "middle-right": null,
    "bottom-right": null,
  });
  const [loading, setLoading] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedBannerId, setCopiedBannerId] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(() => {
    const parsed = sharedYearParam ? parseInt(sharedYearParam, 10) : NaN;
    return !Number.isNaN(parsed) ? parsed : new Date().getFullYear();
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!showModal) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);
  useEffect(() => {
    const init = async () => {
      try {
        const initialYear = await fetchAvailableYears();
        await fetchBanners(initialYear);
      } catch {
        setError(
          isMarathi
            ? "मंदिर सर्व्हरशी संपर्क होऊ शकला नाही. कृपया नंतर पुन्हा प्रयत्न करा."
            : "Unable to connect to the temple server. Please try again later."
        );
        setLoading(false);
      }
    };
    init();
  }, []);
  const isFirstYearRender = useRef(true);
  useEffect(() => {
    if (isFirstYearRender.current) {
      isFirstYearRender.current = false;
      return;
    }
    if (availableYears.length > 0) {
      fetchBanners(selectedYear);
    }
  }, [selectedYear]);

  const fetchAvailableYears = async () => {
    try {
      const response = await bannerAPI.getBannerYears();
      const yearsData =
        response?.data || (Array.isArray(response) ? response : []);
      if (Array.isArray(yearsData) && yearsData.length > 0) {
        setAvailableYears(yearsData);
        const parsedSharedYear = sharedYearParam ? parseInt(sharedYearParam, 10) : NaN;
        const currentYear = new Date().getFullYear();
        const resolvedYear =
          !Number.isNaN(parsedSharedYear) && yearsData.includes(parsedSharedYear)
            ? parsedSharedYear
            : yearsData.includes(currentYear)
              ? currentYear
              : yearsData[0];
        setSelectedYear(resolvedYear);
        return resolvedYear;
      }
    } catch (error) {
      console.error("Error fetching banner years:", error);
    }
    return selectedYear;
  };

  const fetchBanners = async (yearOverride) => {
    try {
      setLoading(true);
      setIsAnimating(true);
      const targetYear = yearOverride ?? selectedYear;
      const response = await bannerAPI.getBanners({
        active: "true",
        year: targetYear.toString(),
      });

      const bannersList =
        response?.data || (Array.isArray(response) ? response : []);

      if (Array.isArray(bannersList)) {
        const groupedBanners = {
          hero: null,
          "top-right": null,
          "middle-right": null,
          "bottom-right": null,
        };

        bannersList.forEach((banner) => {
          if (banner.position && groupedBanners[banner.position] === null) {
            groupedBanners[banner.position] = banner;
          }
        });

        setBanners(groupedBanners);
        setError(null);

        if (sharedBannerId) {
          const matched = bannersList.find(
            (b) => (b._id || b.id) === sharedBannerId
          );
          if (matched) {
            setSelectedBanner(matched);
            setShowModal(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError(
        isMarathi ? "बॅनर लोड करण्यात अडचण आली." : "Failed to load holy glimpses."
      );
    } finally {
      setLoading(false);
      setIsAnimating(false);
    }
  };

  const handleBannerClick = useCallback((banner) => {
    setSelectedBanner(banner);
    setShowModal(true);
  }, []);

  const handleShare = useCallback(async (e, banner) => {
    e.stopPropagation();
    if (!banner) return;
    const bannerId = banner._id || banner.id || "";
    const shareUrl = `${window.location.origin}/events/banners?year=${selectedYear}${bannerId ? `&banner=${bannerId}` : ""}`;
    const shareData = {
      title: banner.title || (isMarathi ? "श्री विठ्ठल रखुमाई मंदिर उत्सव फलक" : "Shree Vitthal Rakhumai Mandir Banner"),
      text: banner.description || (isMarathi ? "मंदिर उत्सव दर्शन फलक पहा आणि शेअर करा." : "View and share this temple festival banner."),
      url: shareUrl,
    };

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
      setCopiedBannerId(bannerId || banner.title || "shared");
      setTimeout(() => setCopiedBannerId(null), 2000);
    } catch (err) {
      console.error("Share copy failed:", err);
    }
  }, [selectedYear, isMarathi]);

  const handleDownload = useCallback(async (e, banner) => {
    e.stopPropagation();
    try {
      const imageUrl = getImageUrl(banner.imageUrl);
      if (!imageUrl) return;

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${banner.title || "vitthal-darshan"}-${selectedYear}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading:", error);
      const imageUrl = getImageUrl(banner.imageUrl);
      if (imageUrl) openSafeUrl(imageUrl);
    }
  }, [selectedYear]);

    return (
      <div className="w-full bg-cream font-body text-ink-dark min-h-screen relative overflow-x-clip">
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
              className="inline-flex items-center gap-2 bg-black/55 border border-amber-400/40 rounded-full px-4 py-1.5 font-heading text-xs sm:text-[0.82rem] font-medium text-amber-200 tracking-wide mb-4 shadow-sm select-none"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
              <Sparkles size={13} className="text-amber-300 shrink-0" />
              <span>{isMarathi ? "उत्सव फलक व परिपत्रके" : "Festive Announcements & Banners"}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col items-center select-none"
            >
              <span className="font-heading text-[clamp(2rem,5.5vw,4rem)] font-black text-white leading-tight tracking-wider [text-shadow:0_4px_18px_rgba(0,0,0,0.85)]">
                {isMarathi ? "उत्सव दर्शन फलक" : "Temple Banners"}
              </span>
              <span className="font-heading text-[clamp(1.1rem,3vw,2rem)] font-bold tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 mt-1 block">
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
                ? "“वार्षिक सोहळे, महापूजा, उत्सव निमंत्रणे व परंपरेचे अधिकृत डिजिटल फलक.”"
                : "“Official announcements, invitations, and divine glimpses of annual festivals and holy ceremonies.”"}
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
            || उत्सव दर्शन — भक्तीचा अनुपम सोहळा ||
          </p>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />

        {/* ═══════════ 3. YEAR FILTER BAR ═══════════ */}
        <section className="bg-cream border-b border-gold/30 shadow-xs relative z-20 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            {availableYears.length > 0 && (
              <CustomYearDropdown
                selectedYear={selectedYear}
                availableYears={availableYears}
                onChange={setSelectedYear}
                isMarathi={isMarathi}
              />
            )}
          </div>
        </section>

        {/* ═══════════ 4. BANNERS GRID ═══════════ */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          {error && (
            <div className="text-center mb-8 p-4 bg-cream-dk text-vermillion rounded-md border border-vermillion/30 max-w-lg mx-auto">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-ink-light">
              <Loader2 className="w-10 h-10 text-saffron animate-spin mb-3" />
              <p className="font-heading text-xs sm:text-sm tracking-widest uppercase text-maroon font-bold">
                {isMarathi ? "फलक लोड होत आहेत..." : "Loading Divine Glimpses…"}
              </p>
            </div>
          ) : (
            <div
              className={`space-y-8 sm:space-y-12 transition-opacity duration-300 ${isAnimating ? "opacity-50" : "opacity-100"
                }`}
            >
              {/* 1. Featured Main Banner Showcase */}
              <FeaturedBannerCard
                banner={banners.hero}
                selectedYear={selectedYear}
                isMarathi={isMarathi}
                onSelect={handleBannerClick}
                onDownload={handleDownload}
                onShare={handleShare}
                isCopied={copiedBannerId && banners.hero && copiedBannerId === (banners.hero._id || banners.hero.id || banners.hero.title)}
              />

              {/* 2. Secondary Festival & Event Banners (1 col mobile, 2 cols tablet, 3 cols desktop) */}
              <div>
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-gold/20" />
                  <span className="font-heading text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-maroon">
                    {isMarathi ? "इतर उत्सव व कार्यक्रम फलक" : "Festival & Event Posters"}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/50 to-gold/20" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  <BannerCard
                    banner={banners["top-right"]}
                    label={isMarathi ? "विशेष फलक १" : "Highlight 01"}
                    isMarathi={isMarathi}
                    onSelect={handleBannerClick}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    isCopied={copiedBannerId && banners["top-right"] && copiedBannerId === (banners["top-right"]._id || banners["top-right"].id || banners["top-right"].title)}
                  />
                  <BannerCard
                    banner={banners["middle-right"]}
                    label={isMarathi ? "विशेष फलक २" : "Highlight 02"}
                    isMarathi={isMarathi}
                    onSelect={handleBannerClick}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    isCopied={copiedBannerId && banners["middle-right"] && copiedBannerId === (banners["middle-right"]._id || banners["middle-right"].id || banners["middle-right"].title)}
                  />
                  <BannerCard
                    banner={banners["bottom-right"]}
                    label={isMarathi ? "विशेष फलक ३" : "Highlight 03"}
                    isMarathi={isMarathi}
                    onSelect={handleBannerClick}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    isCopied={copiedBannerId && banners["bottom-right"] && copiedBannerId === (banners["bottom-right"]._id || banners["bottom-right"].id || banners["bottom-right"].title)}
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ═══════════ 5. FULLSCREEN MODAL (PORTAL, NO SCROLLBAR) ═══════════ */}
        {showModal &&
          selectedBanner &&
          createPortal(
            <div
              className="fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-black/92 overscroll-none"
              onClick={() => setShowModal(false)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative w-full max-w-4xl max-h-[92dvh] bg-gradient-to-b from-[#1c0505] to-[#0c0202] border-2 border-gold/60 rounded-sm p-3 sm:p-5 overflow-hidden flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center gap-3 mb-3 border-b border-amber-500/25 pb-2.5">
                  <h3 className="text-white font-heading text-base sm:text-xl font-bold truncate">
                    {selectedBanner.title}
                  </h3>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setShowModal(false)}
                    className="shrink-0 w-9 h-9 flex items-center justify-center text-amber-200 hover:text-white bg-white/5 hover:bg-maroon rounded-full border border-gold/40 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 min-h-0 flex items-center justify-center bg-black/50 rounded-sm p-2 border border-gold/20">
                  <img
                    src={getImageUrl(selectedBanner.imageUrl)}
                    alt={selectedBanner.title}
                    className="max-h-[60dvh] sm:max-h-[68dvh] w-auto max-w-full object-contain mx-auto rounded-sm"
                  />
                </div>

                <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-heading uppercase tracking-wider text-amber-300/80">
                    {selectedYear}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleShare(e, selectedBanner)}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-amber-200 border border-gold/40 px-3.5 py-2 rounded-sm text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {copiedBannerId === (selectedBanner._id || selectedBanner.id || selectedBanner.title) ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Share2 size={14} />
                      )}
                      <span>
                        {copiedBannerId === (selectedBanner._id || selectedBanner.id || selectedBanner.title)
                          ? isMarathi
                            ? "कॉपी झाले"
                            : "Copied!"
                          : isMarathi
                            ? "शेअर"
                            : "Share"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDownload(e, selectedBanner)}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk px-4 py-2 rounded-sm text-xs font-heading font-bold uppercase tracking-wider shadow-xs cursor-pointer"
                    >
                      <Download size={14} />
                      <span>{isMarathi ? "डाउनलोड" : "Download"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  };

  export default Banners;
