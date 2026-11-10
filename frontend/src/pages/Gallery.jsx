import { useState, useEffect, useRef, memo } from "react";
import { Loader2, Calendar, ChevronDown, Check, Sparkles, Filter, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { galleryAPI } from "../services/api";
import GalleryGrid from "../components/GalleryGrid";
import GalleryLightbox from "../components/GalleryLightbox";
import { useLanguage } from "../context/LanguageContext";

/* ── Sacred Diamond Divider (mirrors Home, About & Committee) ── */
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
        <Calendar size={14} className="text-saffron shrink-0" />
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
            className="absolute right-0 sm:left-0 top-full mt-1.5 min-w-[170px] max-h-60 overflow-y-auto bg-gradient-to-b from-[#1c0505]/98 via-[#140303]/98 to-[#0c0202]/98 border border-amber-500/35 rounded-md shadow-[0_12px_32px_rgba(0,0,0,0.65)] p-1.5 z-50 backdrop-blur-md"
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

const Gallery = () => {
  const { isMarathi } = useLanguage();
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeYear, setActiveYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── Fetch Data ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [categoriesResponse, imagesResponse] = await Promise.all([
          galleryAPI.getCategories(),
          galleryAPI.getImages(),
        ]);

        const catList =
          categoriesResponse?.data ||
          (Array.isArray(categoriesResponse) ? categoriesResponse : []);
        setCategories(Array.isArray(catList) ? catList : []);

        const imagesList =
          imagesResponse?.data ||
          (Array.isArray(imagesResponse) ? imagesResponse : []);
        setImages(Array.isArray(imagesList) ? imagesList : []);

        const currentYear = new Date().getFullYear();
        const years = [
          ...new Set(
            imagesList
              .map((img) => (img.year ? parseInt(img.year, 10) : currentYear))
              .filter(Boolean)
          ),
        ].sort((a, b) => b - a);

        if (!years.includes(currentYear)) {
          years.unshift(currentYear);
        }
        setAvailableYears(years);
      } catch (err) {
        console.error("Error fetching gallery data:", err);
        setError(err.message || "Failed to load gallery images");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Filtered Images ── */
  const filteredImages = images.filter((img) => {
    const categoryMatch =
      activeCategory === "all" ||
      img.category?._id === activeCategory ||
      img.category?.slug === activeCategory ||
      img.category?.name?.toLowerCase() === activeCategory.toLowerCase();

    const currentYear = new Date().getFullYear();
    const imgYear = img.year ? parseInt(img.year, 10) : currentYear;
    const yearMatch =
      !activeYear ||
      activeYear === "all" ||
      imgYear === parseInt(activeYear, 10);

    return categoryMatch && yearMatch;
  });

  /* ── Lightbox Navigation ── */
  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      (prev) => (prev - 1 + filteredImages.length) % filteredImages.length
    );
  };

  const selectedImage =
    selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

  useEffect(() => {
    if (selectedImageIndex === null) return;
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setSelectedImageIndex(null);
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedImageIndex, filteredImages.length]);

  return (
    <>
      <div className="w-full bg-cream font-body text-ink-dark min-h-screen relative overflow-hidden">
        {/* ═══════════ 1. CINEMATIC HERO BANNER (Home.jsx Signature) ═══════════ */}
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
            {/* Sacred Darshan Badge */}
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
              <span>{isMarathi ? "दिव्य दर्शन संग्रह" : "Sacred Darshan & Celebrations"}</span>
            </motion.div>

            {/* Main Page Title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col items-center select-none"
            >
              <span className="font-heading text-[clamp(2rem,5.5vw,4rem)] font-black text-white leading-tight tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                {isMarathi ? "छायाचित्र दालन" : "Temple Gallery"}
              </span>
              <span className="font-heading text-[clamp(1.1rem,3vw,2rem)] font-bold tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] mt-1 block">
                {isMarathi ? "श्री विठ्ठल रखुमाई मंदिर ट्रस्ट" : "Shree Vitthal Rakhumai Mandir Trust"}
              </span>
            </motion.h1>

            <DiamondDivider />

            {/* Subtitle with minimal padding */}
            <motion.p
              className="max-w-2xl mx-auto text-base sm:text-lg text-cream/85 font-body leading-relaxed mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {isMarathi
                ? "“उत्सव, सोहळे, महापूजा आणि भक्तीच्या अलौकिक क्षणांचे मनोहारी दर्शन.”"
                : "“Capturing divine celebrations, sacred aartis, festive joy, and timeless devotion in Amberkarwadi.”"}
            </motion.p>
          </div>
        </section>

        {/* ═══════════ 2. SACRED SHLOKA STRIP (Home.jsx Signature) ═══════════ */}
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
            || रूप पाहता लोचनी । सुख झाले वो साजणी ||
          </p>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />

        {/* ═══════════ 3. FILTER BAR WITH RECTANGULAR TABS & CUSTOM YEAR DROPDOWN ═══════════ */}
        <section className="bg-cream border-b border-gold/30 shadow-xs relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Category Filter Tabs (Rectangular Styling) */}
              <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#180404]/8 border border-amber-500/25 rounded-md">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-4 sm:px-5 py-2 rounded-md font-heading text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 border cursor-pointer select-none ${
                    activeCategory === "all"
                      ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border-amber-400/70 shadow-xs"
                      : "bg-transparent border-transparent text-maroon hover:border-amber-500/40 hover:bg-cream hover:text-maroon-dk"
                  }`}
                >
                  {isMarathi ? "सर्व चित्रे" : "All Photos"}
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setActiveCategory(cat._id)}
                    className={`px-4 sm:px-5 py-2 rounded-md font-heading text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 border cursor-pointer select-none ${
                      activeCategory === cat._id
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border-amber-400/70 shadow-xs"
                        : "bg-transparent border-transparent text-maroon hover:border-amber-500/40 hover:bg-cream hover:text-maroon-dk"
                    }`}
                  >
                    {isMarathi && cat.nameMarathi ? cat.nameMarathi : cat.name}
                  </button>
                ))}
              </div>

              {/* Custom Dropdown for Years */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-maroon uppercase tracking-wider hidden sm:flex">
                  <Filter size={13} className="text-saffron shrink-0" />
                  <span>{isMarathi ? "वर्ष निवडा:" : "Filter:"}</span>
                </div>
                <CustomYearDropdown
                  activeYear={activeYear}
                  availableYears={availableYears}
                  onChange={setActiveYear}
                  isMarathi={isMarathi}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ 4. GALLERY GRID SECTION ═══════════ */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-ink-light">
              <Loader2 className="w-10 h-10 animate-spin text-saffron mb-3" />
              <p className="font-heading text-xs sm:text-sm tracking-widest uppercase text-maroon font-bold">
                {isMarathi ? "पवित्र गॅलरी लोड होत आहे..." : "Loading sacred gallery…"}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-cream-dk border border-vermillion/40 rounded-md p-8 text-center max-w-lg mx-auto shadow-sm">
              <p className="text-vermillion font-medium">{error}</p>
            </div>
          )}

          {/* Gallery Content */}
          {!loading && !error && (
            <>
              {/* Image Grid */}
              <GalleryGrid
                images={filteredImages}
                onImageClick={setSelectedImageIndex}
              />

              {/* Empty State */}
              {filteredImages.length === 0 && (
                <div className="bg-cream-dk rounded-md border border-gold/40 p-12 text-center max-w-md mx-auto shadow-xs my-8">
                  <div className="bg-white w-16 h-16 rounded-md flex items-center justify-center mx-auto mb-4 border border-gold/30 shadow-xs">
                    <ImageIcon className="w-8 h-8 text-gold-dk" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-maroon mb-1.5">
                    {isMarathi ? "छायाचित्रे आढळली नाहीत" : "No Images Found"}
                  </h3>
                  <p className="font-body text-sm text-ink-light">
                    {isMarathi
                      ? "या श्रेणी किंवा वर्षासाठी छायाचित्रे उपलब्ध नाहीत."
                      : "No images match the selected category or year."}
                  </p>
                </div>
              )}
            </>
          )}
        </main>

        {/* ═══════════ 5. FOOTER STRIP (Home.jsx Signature) ═══════════ */}
        <div className="bg-ink-dark border-t-4 border-gold py-6 text-center">
          <p className="font-marathi text-[1.1rem] text-gold-lt tracking-wide">
            || पुंडलिका वरदा हरी विठ्ठल — श्री ज्ञानदेव तुकाराम ||
          </p>
          <p className="font-body italic text-cream/45 text-[0.85rem] mt-1 tracking-wider">
            Shree Vitthal Rakhumai Temple · Amberkarwadi, Ratnagiri
          </p>
        </div>
      </div>

      {/* ═══════════ LIGHTBOX ═══════════ */}
      {selectedImage && (
        <GalleryLightbox
          image={selectedImage}
          onClose={() => setSelectedImageIndex(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={selectedImageIndex < filteredImages.length - 1}
          hasPrev={selectedImageIndex > 0}
        />
      )}
    </>
  );
};

export default Gallery;
