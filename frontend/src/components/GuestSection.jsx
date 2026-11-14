import { useState, useEffect, memo, useCallback } from "react";
import { guestAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ── Sacred Diamond Divider ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-4 justify-center">
    <div className="flex-1 max-w-[80px] sm:max-w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
    <div className="w-2 h-2 rotate-45 bg-saffron border border-amber-300 shadow-xs shrink-0" />
    <div className="flex-1 max-w-[80px] sm:max-w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
  </div>
);

/* ── Section Header ── */
const SectionHeader = ({ title, titleMr, isMarathi }) => (
  <div className="text-center mb-8 sm:mb-12 relative px-4">
    <span className="block font-heading text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.28em] uppercase text-saffron mb-1.5">
      {isMarathi ? "|| सन्माननीय पाहुणे ||" : "|| Special Dignitaries ||"}
    </span>
    <h2 className="font-display text-[clamp(1.75rem,4.5vw,3rem)] font-bold text-maroon leading-tight">
      {isMarathi ? titleMr : title}
    </h2>
    <DiamondDivider />
    <p className="font-body text-xs sm:text-sm md:text-base text-ink-light max-w-lg mx-auto italic px-2">
      {isMarathi
        ? "मंदिराच्या पवित्र उत्सवांना लाभलेले सन्माननीय पाहुणे आणि मान्यवर."
        : "Distinguished guests and dignitaries honoring our sacred temple festivals."}
    </p>
  </div>
);

const GuestSection = memo(() => {
  const { isMarathi } = useLanguage();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchGuests = async () => {
      try {
        const response = await guestAPI.getActiveGuests();
        const guestList = response?.data || (Array.isArray(response) ? response : []);
        if (!isMounted) return;
        if (Array.isArray(guestList) && guestList.length > 0) {
          setGuests(guestList);
        } else {
          const fallbackResp = await guestAPI.getGuests();
          const fallbackList = fallbackResp?.data || (Array.isArray(fallbackResp) ? fallbackResp : []);
          if (isMounted) {
            setGuests(Array.isArray(fallbackList) ? fallbackList.filter((g) => g.isActive !== false) : []);
          }
        }
      } catch (error) {
        console.error("Error fetching guests:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchGuests();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % guests.length);
  }, [guests.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + guests.length) % guests.length);
  }, [guests.length]);

  useEffect(() => {
    if (guests.length <= 1) return;
    const interval = setInterval(() => handleNext(), 6000);
    return () => clearInterval(interval);
  }, [guests.length, handleNext]);

  if (!loading && guests.length === 0) return null;

  const currentGuest = guests[currentIndex] || {};
  const guestName = isMarathi && currentGuest.nameMarathi ? currentGuest.nameMarathi : currentGuest.name;
  const guestPrize = isMarathi && currentGuest.prizeMarathi ? currentGuest.prizeMarathi : (currentGuest.prize || "Honored Guest");
  const guestDesc = isMarathi && currentGuest.descriptionMarathi ? currentGuest.descriptionMarathi : currentGuest.description;

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.35, ease: "easeIn" } }),
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-cream relative overflow-hidden w-full">
      {/* Top sacred gold filament line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <SectionHeader 
          title="Venerated Guests" 
          titleMr="विशेष अतिथी आणि मानकरी" 
          isMarathi={isMarathi} 
        />

        {loading ? (
          <div className="w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] bg-stone-100 animate-pulse rounded-xl sm:rounded-2xl border border-gold/25" />
        ) : (
          <div className="relative mx-auto w-full max-w-4xl">
            {/* Sacred Temple Frame */}
            <div className="relative border-2 border-gold rounded-sm p-1.5 sm:p-2 bg-cream-dk shadow-xl">
              <span className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-4 border-l-4 border-saffron z-30 pointer-events-none" />
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-4 border-r-4 border-saffron z-30 pointer-events-none" />
              <span className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-4 border-l-4 border-saffron z-30 pointer-events-none" />
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-4 border-r-4 border-saffron z-30 pointer-events-none" />

              <div className="border border-saffron-lt/60 rounded-sm overflow-hidden relative">
                {/* Main Stage Card */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-[#140303]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={getImageUrl(currentGuest.imageUrl)}
                    alt={guestName || "Guest"}
                    className="w-full h-full object-cover object-center saturate-[1.08] brightness-[0.88]"
                  />

                  {/* Gradient overlay for clear legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140303]/98 via-[#140303]/45 to-transparent" />

                  {/* Guest Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white flex flex-col justify-end">
                    <span className="font-heading text-amber-300 text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase mb-1 sm:mb-1.5 drop-shadow-sm break-words">
                      {guestPrize}
                    </span>
                    <h3 className="font-display text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md mb-1.5 break-words">
                      {guestName}
                    </h3>
                    {guestDesc && (
                      <p className="font-body text-cream/85 text-xs sm:text-sm leading-relaxed italic line-clamp-2 sm:line-clamp-3 max-w-2xl drop-shadow-sm break-words">
                        "{guestDesc}"
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Chevrons inside card */}
              {guests.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/75 border border-white/30 text-white backdrop-blur-xs transition-all flex items-center justify-center cursor-pointer shadow-md active:scale-90"
                    aria-label="Previous guest"
                  >
                    <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/75 border border-white/30 text-white backdrop-blur-xs transition-all flex items-center justify-center cursor-pointer shadow-md active:scale-90"
                    aria-label="Next guest"
                  >
                    <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
                </div>
              </div>
            </div>

            {/* Indicator Dots in Normal Document Flow (No overflow possible) */}
            {guests.length > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4 sm:mt-6">
                {guests.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setDirection(i > currentIndex ? 1 : -1);
                      setCurrentIndex(i);
                    }}
                    className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                      i === currentIndex
                        ? "w-8 sm:w-10 bg-maroon shadow-xs"
                        : "w-2 sm:w-2.5 bg-maroon/25 hover:bg-maroon/50"
                    }`}
                    aria-label={`Go to guest ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
});

GuestSection.displayName = "GuestSection";
export default GuestSection;
