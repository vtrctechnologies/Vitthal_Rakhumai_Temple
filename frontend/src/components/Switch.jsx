import { memo } from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * Switch - High-performance bilingual language toggle (Marathi / English)
 * Optimized with light gradients, crisp typography, and zero heavy raster filters.
 */
const Switch = memo(({ className = "" }) => {
  const { isMarathi, toggleLanguage } = useLanguage();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Light Gradient Language Switch Pill */}
      <button
        type="button"
        role="switch"
        aria-checked={isMarathi}
        onClick={toggleLanguage}
        className="relative inline-flex items-center h-7 sm:h-8 px-1 rounded-full bg-[#1e0404]/90 border border-gold/35 hover:border-gold/70 shadow-sm transition-colors duration-200 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-gold/50"
        aria-label={isMarathi ? "Switch to English" : "मराठी भाषेत बदला"}
        title={isMarathi ? "Switch to English" : "मराठी भाषेत बदला"}
      >
        <div className="relative flex items-center justify-between w-[64px] sm:w-[68px] text-[10px] sm:text-[10.5px] font-heading font-bold uppercase tracking-wider px-1">
          {/* English label */}
          <span
            className={`z-10 transition-colors duration-200 flex items-center justify-center w-6 text-center ${
              !isMarathi
                ? "text-maroon-dk font-extrabold"
                : "text-cream/55 hover:text-cream"
            }`}
          >
            EN
          </span>

          {/* Marathi label */}
          <span
            className={`z-10 font-marathi text-[11px] sm:text-xs transition-colors duration-200 flex items-center justify-center w-7 text-center ${
              isMarathi
                ? "text-maroon-dk font-black"
                : "text-cream/55 hover:text-cream"
            }`}
          >
            मराठी
          </span>

          {/* Sliding Light Gold Pill Indicator */}
          <span
            className={`absolute top-[2px] bottom-[2px] w-[30px] sm:w-[32px] rounded-full bg-gradient-to-r from-amber-300 to-amber-500 shadow-sm transition-transform duration-250 ease-out ${
              isMarathi
                ? "translate-x-[30px] sm:translate-x-[32px]"
                : "translate-x-0"
            }`}
          />
        </div>
      </button>
    </div>
  );
});

Switch.displayName = "Switch";
export default Switch;


