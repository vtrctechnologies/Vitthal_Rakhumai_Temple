import { useState, useEffect, useRef, memo } from "react";
import {
  Download,
  Maximize2,
  X,
  Calendar,
  Loader2,
  ChevronDown,
  Sparkles,
  Check,
  Filter,
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
    <span className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 border-t-2 border-l-2 border-saffron z-20" />
    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 border-t-2 border-r-2 border-saffron z-20" />
    <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 border-b-2 border-l-2 border-saffron z-20" />
    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-b-2 border-r-2 border-saffron z-20" />
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
        className="flex items-center gap-2.5 h-9 px-4 rounded-md bg-cream-dk/90 border border-gold/45 hover:border-amber-500 hover:bg-cream text-maroon font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs select-none"
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
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

const Banners = () => {
  const { isMarathi } = useLanguage();
  const [banners, setBanners] = useState({
    hero: null,
    "top-right": null,
    "middle-right": null,
    "bottom-right": null,
  });
  const [loading, setLoading] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchAvailableYears();
        await fetchBanners();
      } catch (err) {
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

  useEffect(() => {
    if (availableYears.length > 0) {
      fetchBanners();
    }
  }, [selectedYear]);

  const fetchAvailableYears = async () => {
    try {
      const response = await bannerAPI.getBannerYears();
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
    } catch (error) {
      console.error("Error fetching banner years:", error);
    }
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setIsAnimating(true);
      const response = await bannerAPI.getBanners({
        active: "true",
        year: selectedYear.toString(),
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

  const handleBannerClick = (banner) => {
    setSelectedBanner(banner);
    setShowModal(true);
  };

  const handleDownload = async (e, banner) => {
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
  };

  const BannerCard = ({ banner, position, className }) => {
    if (!banner) {
      return (
        <div
          className={`${className} group relative rounded-md overflow-hidden bg-cream-dk border border-dashed border-gold/45 flex flex-col items-center justify-center p-4`}
        >
          <div className="text-gold-dk mb-2">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 mx-auto opacity-50" />
          </div>
          <p className="text-maroon text-xs sm:text-sm font-heading font-semibold text-center">
            {isMarathi ? "दर्शन फलक लवकरच उपलब्ध" : "Darshan Coming Soon"}
          </p>
        </div>
      );
    }

    const imageUrl = getImageUrl(banner.imageUrl);

    return (
      <div
        onClick={() => handleBannerClick(banner)}
        className={`${className} group relative rounded-md overflow-hidden cursor-pointer bg-black border border-gold/40 hover:border-gold shadow-sm hover:shadow-xl transition-colors duration-300`}
      >
        {/* Saffron Corner Accents */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <CornerAccents />
        </div>

        {/* Image */}
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-75 group-hover:opacity-85 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end z-10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={11} className="text-amber-400 shrink-0" />
            <span className="text-amber-300 text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider">
              {isMarathi ? "जय हरी विठ्ठल" : "Jay Hari"}
            </span>
          </div>

          {banner.title && (
            <h3 className="text-white text-base sm:text-xl font-heading font-bold leading-snug drop-shadow-md line-clamp-2 group-hover:text-amber-200 transition-colors">
              {banner.title}
            </h3>
          )}

          {banner.description && (
            <p className="text-cream/80 text-xs sm:text-sm line-clamp-2 font-body mt-1">
              {banner.description}
            </p>
          )}

          <div className="flex items-center gap-2.5 mt-3 pt-2 border-t border-gold/30">
            <button
              onClick={(e) => handleDownload(e, banner)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk px-3.5 py-1.5 rounded-md text-[10.5px] font-heading font-bold uppercase tracking-wider shadow-xs hover:shadow-md cursor-pointer transition-all"
            >
              <Download className="w-3 h-3 shrink-0" />
              <span>{isMarathi ? "डाउनलोड" : "Download"}</span>
            </button>
            <button
              className="p-1.5 bg-black/60 hover:bg-black/90 text-amber-200 rounded-md border border-amber-400/30 transition-colors cursor-pointer"
              title={isMarathi ? "मोठे पहा" : "View Fullscreen"}
            >
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
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
            <Sparkles size={13} className="text-amber-300 shrink-0" />
            <span>{isMarathi ? "उत्सव फलक व परिपत्रके" : "Festive Announcements & Banners"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center select-none"
          >
            <span className="font-heading text-[clamp(2rem,5.5vw,4rem)] font-black text-white leading-tight tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              {isMarathi ? "उत्सव दर्शन फलक" : "Temple Banners"}
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
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 auto-rows-[260px] sm:auto-rows-[300px] transition-opacity duration-300 ${
              isAnimating ? "opacity-50" : "opacity-100"
            }`}
          >
            {/* Hero Banner (Left Side - Tall) */}
            <BannerCard
              banner={banners.hero}
              position="hero"
              className="md:col-span-2 lg:col-span-2 col-span-1 row-span-1 md:row-span-2 lg:row-span-3 min-h-[320px]"
            />

            {/* Side Banners */}
            <BannerCard
              banner={banners["top-right"]}
              position="top-right"
              className="md:col-span-1 lg:col-span-1"
            />
            <BannerCard
              banner={banners["middle-right"]}
              position="middle-right"
              className="md:col-span-1 lg:col-span-1"
            />
            <BannerCard
              banner={banners["bottom-right"]}
              position="bottom-right"
              className="md:col-span-1 lg:col-span-1"
            />
          </div>
        )}
      </main>

      {/* ═══════════ 5. FULLSCREEN MODAL ═══════════ */}
      {showModal && selectedBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-gradient-to-b from-[#1c0505] to-[#0c0202] border border-amber-500/40 rounded-md p-4 sm:p-6 overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 border-b border-amber-500/20 pb-2">
              <h3 className="text-white font-heading text-lg sm:text-xl font-bold truncate">
                {selectedBanner.title}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-amber-200/70 hover:text-white p-1 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-auto max-h-[70vh] flex items-center justify-center bg-black/40 rounded-sm p-2">
              <img
                src={getImageUrl(selectedBanner.imageUrl)}
                alt={selectedBanner.title}
                className="max-h-[65vh] object-contain mx-auto rounded-sm"
              />
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={(e) => handleDownload(e, selectedBanner)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk px-4 py-2 rounded-md text-xs font-heading font-bold uppercase tracking-wider shadow-xs cursor-pointer"
              >
                <Download size={14} />
                <span>{isMarathi ? "डाउनलोड" : "Download"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ 6. FOOTER STRIP ═══════════ */}
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
};

export default Banners;
