import React, { useState, useEffect, memo, useCallback } from "react";
import { guestAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

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
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <section className="py-20 bg-[#fffbf5] relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">
              {isMarathi ? "सन्मानित अतिथी" : "Felicitated Guests"}
            </h2>
            <div className="h-1.5 w-24 bg-orange-500 rounded-full mx-auto" />
          </motion.div>
        </div>

        {loading ? (
          <div className="w-full h-[300px] md:h-[500px] bg-stone-200 animate-pulse rounded-[4rem]" />
        ) : (
          <div className="relative w-full h-[300px] md:h-[500px] group">
            <div className="relative w-full h-full overflow-hidden rounded-[4rem] shadow-2xl ring-12 ring-white bg-stone-100">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.4 },
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={getImageUrl(guests[currentIndex].imageUrl)}
                    alt={`Guest ${currentIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {guests.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 rounded-full bg-white/40 hover:bg-white/60 text-stone-800 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                  aria-label="Previous guest"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 rounded-full bg-white/40 hover:bg-white/60 text-stone-800 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                  aria-label="Next guest"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
              {guests.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "w-10 bg-orange-600" : "w-2.5 bg-orange-200 hover:bg-orange-300"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
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
