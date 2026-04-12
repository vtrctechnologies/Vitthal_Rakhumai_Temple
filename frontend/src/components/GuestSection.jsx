import React, { useState, useEffect, memo, useCallback } from "react";
import { guestAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

/* ── Section Header (Internal) ── */
const SectionHeader = ({ title, titleMr, isMarathi }) => (
  <div className="text-center mb-16 relative">
    <div className="inline-block relative">
      <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold text-maroon leading-tight relative z-10 px-8">
        {isMarathi ? titleMr : title}
      </h2>
      <div className="absolute top-1/2 left-0 w-6 h-6 border-l-4 border-t-4 border-saffron -translate-y-full -translate-x-2 opacity-50" />
      <div className="absolute bottom-1/2 right-0 w-6 h-6 border-r-4 border-b-4 border-saffron translate-y-full translate-x-2 opacity-50" />
    </div>
    
    <div className="flex items-center justify-center gap-4 mt-6">
      <div className="flex-1 max-w-[100px] h-px bg-gradient-to-r from-transparent to-gold" />
      <div className="w-3 h-3 bg-saffron rotate-45" />
      <div className="flex-1 max-w-[100px] h-px bg-gradient-to-l from-transparent to-gold" />
    </div>
  </div>
);

const GuestSection = memo(() => {
  const { isMarathi } = useLanguage();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await guestAPI.getGuests();
        if (response && response.status === "success") {
          setGuests(response.data);
        }
      } catch (error) {
        console.error("Error fetching guests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGuests();
  }, []);

  useEffect(() => {
    if (guests.length <= 1) return;
    const interval = setInterval(() => handleNext(), 6000);
    return () => clearInterval(interval);
  }, [guests, currentIndex]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % guests.length);
  }, [guests.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + guests.length) % guests.length);
  }, [guests.length]);

  if (!loading && guests.length === 0) return null;

  const variants = {
    enter: (direction) => ({ opacity: 0, scale: 1.1, filter: "blur(10px)" }),
    center: { opacity: 1, scale: 1, filter: "blur(0px)", zIndex: 1 },
    exit: (direction) => ({ opacity: 0, scale: 0.95, filter: "blur(10px)", zIndex: 0 }),
  };

  return (
    <section className="py-24 bg-cream relative overflow-hidden">
      {/* Background Motifs */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-maroon via-gold via-saffron to-maroon" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#C0392B 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <SectionHeader 
          title="Venerated Guests" 
          titleMr="विशेष अतिथी आणि मानकरी" 
          isMarathi={isMarathi} 
        />

        {loading ? (
          <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-stone-100 animate-pulse rounded-2xl border border-gold/20" />
        ) : (
          <div className="relative group mx-auto max-w-5xl">
            {/* Main Stage */}
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl border-4 border-cream shadow-maroon/10">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={getImageUrl(guests[currentIndex].imageUrl)}
                    alt={guests[currentIndex].name}
                    className="w-full h-full object-cover saturate-[1.1] brightness-[0.85]"
                  />
                  {/* Overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon/90 via-maroon/20 to-transparent" />
                  
                  {/* Guest Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex-1">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                         <p className="font-heading text-saffron-lt text-sm tracking-[0.3em] uppercase mb-2">
                           {isMarathi && guests[currentIndex].prizeMarathi ? guests[currentIndex].prizeMarathi : (guests[currentIndex].prize || "Honored Guest")}
                         </p>
                         <h3 className="font-display text-3xl md:text-5xl font-bold leading-tight">
                           {isMarathi && guests[currentIndex].nameMarathi ? guests[currentIndex].nameMarathi : guests[currentIndex].name}
                         </h3>
                         <div className="h-0.5 w-16 bg-gold mt-4 hidden md:block" />
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className="md:max-w-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="font-marathi text-cream-dk/80 text-lg leading-relaxed italic line-clamp-2 md:line-clamp-none">
                        {isMarathi && guests[currentIndex].descriptionMarathi ? guests[currentIndex].descriptionMarathi : guests[currentIndex].description}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Ornamental Frame Overlays */}
            <div className="absolute -top-6 -left-6 w-24 h-24 border-t-8 border-l-8 border-maroon opacity-20 pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 border-b-8 border-r-8 border-maroon opacity-20 pointer-events-none" />

            {/* Navigation Navigation */}
            {guests.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* Indicator Dots */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
              {guests.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  className={`h-2 transition-all duration-500 rounded-full ${i === currentIndex ? "w-12 bg-maroon shadow-md shadow-maroon/30" : "w-3 bg-maroon/20 hover:bg-maroon/40"}`}
                  aria-label={`Guest ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

GuestSection.displayName = "GuestSection";
export default GuestSection;
