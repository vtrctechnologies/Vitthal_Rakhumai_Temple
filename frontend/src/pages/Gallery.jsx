import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { galleryAPI } from "../services/api";
import GalleryGrid from "../components/GalleryGrid";
import GalleryLightbox from "../components/GalleryLightbox";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories and images
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories and images in parallel
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
          
          // Extract available years
          const years = [...new Set(imagesData.map(img => img.year))].filter(Boolean).sort((a, b) => b - a);
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

  // Filter images by category
  const filteredImages = images.filter((img) => {
    const categoryMatch = activeCategory === "all" || 
                         img.category?._id === activeCategory ||
                         img.category?.slug === activeCategory ||
                         img.category?.name?.toLowerCase() === activeCategory.toLowerCase();
    const yearMatch = img.year === activeYear;
    return categoryMatch && yearMatch;
  });

  // Navigation handlers
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

  // Keyboard navigation
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-stone-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-2">Error loading gallery</p>
          <p className="text-stone-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white text-stone-800 font-sans selection:bg-amber-200 selection:text-amber-900 overflow-x-hidden animate-fade-in">
        {/* --- Hero Section --- */}
        <header className="relative lg:h-[50vh] md:h-[35vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-stone-900">
            <img
              src="/gallery/Temple3D.png"
              className="w-full h-full object-cover opacity-40 scale-110"
              alt="Background"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="absolute inset-0"></div>
          </div>

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10">
            <div className="border-y border-amber-500/30 py-8 relative">
              {/* Decorative Corners */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-amber-400"></div>
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t border-r border-amber-400"></div>
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b border-l border-amber-400"></div>
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-amber-400"></div>

              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-2 tracking-tight leading-none drop-shadow-2xl">
                Sacred{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
                  Glimpses
                </span>
              </h1>
            </div>

            {/* Floating Filters */}
            <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in-up">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-500 border-2 ${
                  activeCategory === "all"
                    ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/40 scale-105"
                    : "bg-transparent border-white/20 text-white hover:bg-white hover:text-amber-900 hover:border-white"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat._id)}
                  className={`px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-500 border-2 ${
                    activeCategory === cat._id
                      ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/40 scale-105"
                      : "bg-transparent border-white/20 text-white hover:bg-white hover:text-amber-900 hover:border-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Year Filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in-up delay-100">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setActiveYear(year)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-300 border ${
                    activeYear === year
                      ? "bg-white text-stone-900 border-white shadow-lg"
                      : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/30"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
        </header>

        {/* --- Varied Grid Gallery Section --- */}
        <main className="container mx-auto px-4 pb-24 mt-5 relative z-20">
          {/* Abstract Background Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>

          {/* Gallery Grid */}
          <GalleryGrid
            images={filteredImages}
            onImageClick={setSelectedImageIndex}
          />

          {/* Empty State */}
          {filteredImages.length === 0 && (
            <div className="text-center py-24">
              <p className="text-stone-500 text-lg">
                No images found in this category.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* --- Lightbox Modal --- */}
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
