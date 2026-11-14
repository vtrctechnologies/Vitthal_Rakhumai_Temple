import { memo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

/**
 * Switch - High-performance bilingual language toggle (Marathi / English)
 * Styled with temple aesthetic tones (sacred gold gradient, deep obsidian maroon background).
 * Clean rectangular segmented switch with smooth Framer Motion spring physics.
 */
const Switch = memo(({ className = "" }) => {
  const { isMarathi, toggleLanguage } = useLanguage();

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isMarathi}
        onClick={toggleLanguage}
        className="relative inline-flex items-center justify-center p-0.5 rounded-md bg-[#160404]/95 border border-amber-500/35 hover:border-amber-400/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] transition-colors duration-200 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-amber-400/50"
        aria-label={isMarathi ? "Switch to English" : "मराठी भाषेत बदला"}
        title={isMarathi ? "Switch to English" : "मराठी भाषेत बदला"}
      >
        <div className="relative grid grid-cols-2 items-center w-[74px] sm:w-[80px] h-7 sm:h-7.5">
          {/* Smooth Sliding Sacred Gold Pill Indicator */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 rounded-[4px] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shadow-xs pointer-events-none"
            initial={false}
            animate={{
              x: isMarathi ? "100%" : "0%",
            }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 32,
              mass: 0.8,
            }}
          />

          {/* English label */}
          <span
            className={`relative z-10 flex items-center justify-center font-heading text-[10px] sm:text-[11px] font-bold tracking-wider leading-none transition-colors duration-200 select-none ${
              !isMarathi
                ? "text-[#2b0808] font-black"
                : "text-amber-100/70 hover:text-amber-100"
            }`}
          >
            EN
          </span>

          {/* Marathi label */}
          <span
            className={`relative z-10 flex items-center justify-center font-marathi text-[11px] sm:text-[12px] font-bold leading-none transition-colors duration-200 select-none ${
              isMarathi
                ? "text-[#2b0808] font-black"
                : "text-amber-100/70 hover:text-amber-100"
            }`}
          >
            मराठी
          </span>
        </div>
      </button>
    </div>
  );
});

Switch.displayName = "Switch";
export default Switch;
