import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { galleryAPI } from "../services/api";
import GalleryGrid from "../components/GalleryGrid";
import GalleryLightbox from "../components/GalleryLightbox";
import { useLanguage } from "../context/LanguageContext";

/* ── Ornamental Divider (matches Home page) ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-4 justify-center">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="11" y="1" width="13" height="13" rx="1"
        transform="rotate(45 11 1)"
        className="fill-saffron opacity-80"
      />
      <rect
        x="11" y="4" width="9" height="9" rx="0.5"
        transform="rotate(45 11 4)"
        fill="none"
        className="stroke-gold-lt"
        strokeWidth="0.8"
      />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
  </div>
);

const Gallery = () => {
  const { isMarathi } = useLanguage();
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
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

        if (categoriesResponse?.status === "success") {
          setCategories(categoriesResponse.data || []);
        }
        if (imagesResponse?.status === "success") {
          const imagesData = imagesResponse.data || [];
          setImages(imagesData);
          const years = [...new Set(imagesData.map(img => img.year))]
            .filter(Boolean)
            .sort((a, b) => b - a);
          setAvailableYears(years);
          if (years.length > 0 && !years.includes(activeYear)) {
            setActiveYear(years[0]);
          }
        }
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
    const yearMatch = img.year === activeYear;
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
    setSelectedImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };
  const selectedImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

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

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center font-body text-ink-dark">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-saffron mx-auto mb-4" />
          <p className="text-ink-mid italic text-lg">
            {isMarathi ? "पवित्र गॅलरी लोड होत आहे..." : "Loading sacred gallery..."}
          </p>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center font-body text-ink-dark">
        <div className="text-center p-8 border border-gold/40 rounded bg-cream-dk max-w-md mx-4">
          <p className="text-maroon text-xl font-bold mb-2">
            {isMarathi ? "गॅलरी लोड करताना त्रुटी आली" : "Error loading gallery"}
          </p>
          <p className="text-ink-mid">{error}</p>
        </div>
      </div>
    );
  }

  /* ── Main Render ── */
  return (
    <>
      <div className="min-h-screen bg-cream text-ink-dark font-body selection:bg-saffron/20 selection:text-ink-dark overflow-x-hidden">

        {/* ═══════════ HERO HEADER ═══════════ */}
        <header className="relative pt-32 pb-20 flex items-center justify-center overflow-hidden">
          {/* Top gradient border strip */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron to-maroon z-20" />

          {/* Background image + overlays */}
          <div className="absolute inset-0 z-0">
            <img
              src="/gallery/Temple3D.png"
              className="w-full h-full object-cover opacity-30 scale-105 saturate-50 brightness-60"
              alt="Gallery Background"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {/* Solid dark overlay — no gradient, no fade */}
            <div className="absolute inset-0 bg-maroon-dk" />
            {/* Subtle gold grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 50%)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          {/* Heading content */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <span className="block font-heading text-[0.65rem] tracking-[0.35em] uppercase text-saffron mb-3 opacity-90">
              {isMarathi ? "|| दर्शन गॅलरी ||" : "|| Darshan Gallery ||"}
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,5rem)] font-bold text-white leading-tight drop-shadow-2xl mb-1">
              {isMarathi ? "दर्शन सोहळा" : "Sacred Glimpses"}
            </h1>
            <span className="font-heading text-[clamp(1rem,2.5vw,1.5rem)] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gold-lt via-saffron-lt to-gold tracking-wider block mb-2">
              {isMarathi ? "पवित्र क्षण" : "Divine Moments"}
            </span>
            <DiamondDivider />
          </div>


        </header>

        {/* ═══════════ FILTER BAR ═══════════ */}
        {/* Solid cream background — fully readable, no fading effect */}
        <div className="bg-cream border-b border-gold/20 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-6">

            {/* Category filter buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-5 py-2 rounded-full text-xs font-heading font-semibold tracking-widest uppercase transition-all duration-300 border-2 shadow-sm ${activeCategory === "all"
                  ? "bg-gradient-to-br from-vermillion to-saffron-dk border-transparent text-white shadow-[0_4px_14px_rgba(192,57,43,0.40)] scale-105"
                  : "bg-cream-dk border-gold/50 text-ink-mid hover:bg-gold/10 hover:border-gold hover:text-maroon hover:scale-105"
                  }`}
              >
                {isMarathi ? "सर्व" : "All"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat._id)}
                  className={`px-5 py-2 rounded-full text-xs font-heading font-semibold tracking-widest uppercase transition-all duration-300 border-2 shadow-sm ${activeCategory === cat._id
                    ? "bg-gradient-to-br from-vermillion to-saffron-dk border-transparent text-white shadow-[0_4px_14px_rgba(192,57,43,0.40)] scale-105"
                    : "bg-cream-dk border-gold/50 text-ink-mid hover:bg-gold/10 hover:border-gold hover:text-maroon hover:scale-105"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Year filter buttons */}
            {availableYears.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setActiveYear(year)}
                    className={`px-4 py-1.5 rounded-md text-[0.7rem] font-heading font-bold tracking-widest uppercase transition-all duration-300 border ${activeYear === year
                      ? "bg-maroon text-gold-lt border-maroon shadow-[0_3px_10px_rgba(107,26,26,0.25)] scale-105"
                      : "bg-transparent border-gold/30 text-ink-light hover:text-maroon hover:border-gold/60 hover:bg-cream-dk"
                      }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* ═══════════ GALLERY GRID ═══════════ */}
        <main className="max-w-7xl mx-auto px-6 py-14 relative">
          {/* Subtle ambient blobs */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-saffron/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section label */}
          <div className="text-center mb-10">
            <span className="block font-heading text-[0.65rem] tracking-[0.3em] uppercase text-saffron mb-1">
              {isMarathi ? "दर्शन क्षण" : "Captured Moments"}
            </span>
            <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold text-maroon leading-tight">
              {isMarathi ? "गॅलरी" : "Gallery"}
            </h2>
            <DiamondDivider />
          </div>

          <GalleryGrid images={filteredImages} onImageClick={setSelectedImageIndex} />

          {filteredImages.length === 0 && (
            <div className="text-center py-24 border-2 border-dashed border-gold/25 rounded-xl bg-cream-dk/40">
              <p className="text-ink-light text-lg font-heading italic">
                {isMarathi ? "या श्रेणीत चित्रे आढळली नाहीत." : "No images found in this category."}
              </p>
            </div>
          )}
        </main>

        {/* ═══════════ FOOTER STRIP ═══════════ */}
        <div className="bg-ink-dark border-t-4 border-gold py-5 text-center">
          <p className="font-marathi text-[1rem] text-gold-lt tracking-wide">
            || पुंडलिका वरदा हरी विठ्ठल ||
          </p>
          <p className="font-body italic text-cream-dk/40 text-[0.85rem] mt-1">
            Shree Vitthal Rakhumai Temple · Amberkarwadi
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
