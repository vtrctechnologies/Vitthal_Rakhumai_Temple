import { useState, useEffect, useCallback } from "react";
import { bannerAPI } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Video, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const BannerSection = () => {
  const { isMarathi } = useLanguage();
  const [banners, setBanners] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchYears = async () => {
    try {
      const response = await bannerAPI.getBannerYears();
      if (response && response.status === "success" && response.data) {
        setYears(response.data);
        if (response.data.length > 0 && !response.data.includes(selectedYear)) {
          setSelectedYear(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching banner years:", error);
    }
  };

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bannerAPI.getBanners({ 
        year: selectedYear,
        active: "true" 
      });
      if (response && response.status === "success") {
        setBanners(response.data);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (!loading && banners.length === 0 && years.length === 0) return null;

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-2">
              {isMarathi ? "उत्सव आणि कार्यक्रम बॅनर" : "Festival & Event Banners"}
            </h2>
            <div className="h-1 w-24 bg-orange-500 rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 bg-orange-50 p-2 rounded-xl border border-orange-100"
          >
            <Calendar className="text-orange-600" size={20} />
            <span className="text-sm font-bold text-orange-800 uppercase tracking-wider">
              {isMarathi ? "वर्ष निवडा" : "Select Year"}:
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-white border-none focus:ring-2 focus:ring-orange-500 rounded-lg py-1 px-3 text-stone-700 font-bold shadow-sm"
            >
              {[...new Set([new Date().getFullYear(), ...years])].sort((a,b) => b-a).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </motion.div>
        </div>

        {/* Banner Display */}
        <div className="relative group">
          {loading ? (
            <div className="h-[400px] md:h-[600px] bg-stone-100 animate-pulse rounded-3xl flex items-center justify-center">
              <div className="text-orange-500 font-bold">Loading Banners...</div>
            </div>
          ) : banners.length > 0 ? (
            <div className="relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-black">
              <AnimatePresence mode="wait">
                <motion.div
                  key={banners[currentIndex]._id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  {banners[currentIndex].resourceType === 'video' ? (
                    <video
                      src={banners[currentIndex].imageUrl}
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={banners[currentIndex].imageUrl}
                      alt={banners[currentIndex].title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Overlay Content */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16">
                    <motion.h3 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl md:text-5xl font-bold text-white mb-4"
                    >
                      {banners[currentIndex].title}
                    </motion.h3>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg text-stone-200 max-w-2xl mb-8 line-clamp-2"
                    >
                      {banners[currentIndex].description}
                    </motion.p>
                    {banners[currentIndex].link && (
                      <motion.a
                        href={banners[currentIndex].link}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-bold transition-all w-fit"
                      >
                        {isMarathi ? "अधिक जाणून घ्या" : "Learn More"}
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={32} />
                  </button>
                  {/* Indicators */}
                  <div className="absolute bottom-6 right-8 flex gap-2">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentIndex ? "w-8 bg-orange-500" : "w-2 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-[300px] border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center text-stone-400 bg-stone-50">
              <ImageIcon size={48} className="mb-4 opacity-50" />
              <p className="text-xl font-medium">
                {isMarathi ? `${selectedYear} साठी कोणतेही बॅनर सापडले नाहीत` : `No banners found for ${selectedYear}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
