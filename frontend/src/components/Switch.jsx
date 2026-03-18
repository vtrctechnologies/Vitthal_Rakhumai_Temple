import React from "react";
import { useLanguage } from "../context/LanguageContext"; // Import the hook

const Switch = () => {
  // Use global state instead of local useState
  const { isMarathi, toggleLanguage } = useLanguage();

  return (
    <div className="relative flex flex-col items-center group">
      {/* Your Custom Button Switch */}
      <button
        onClick={toggleLanguage} // Use the context toggle function
        className="relative inline-flex h-7 w-16 items-center rounded-full bg-red-950/50 border border-yellow-500/30 transition-colors hover:bg-red-950/70"
        aria-label="Toggle Language"
      >
        <span
          className={`absolute left-2 text-[10px] font-bold text-yellow-100 transition-opacity ${
            isMarathi ? "opacity-40" : "opacity-100"
          }`}
        >
          EN
        </span>
        <span
          className={`absolute right-2 text-[10px] font-bold text-yellow-100 transition-opacity ${
            !isMarathi ? "opacity-40" : "opacity-100"
          }`}
        >
          म
        </span>
        <span
          className={`${
            isMarathi
              ? "translate-x-9 bg-yellow-500"
              : "translate-x-1 bg-yellow-100"
          } inline-block h-5 w-5 transform rounded-full shadow-md transition-transform duration-300 ease-in-out`}
        />
      </button>

      {/* Tooltip Container */}
      <div className="absolute top-full mt-3 hidden flex-col items-center group-hover:flex transition-all duration-200 ease-in-out opacity-0 group-hover:opacity-100">
        <div className="w-3 h-3 -mb-2 rotate-45 bg-red-900"></div>
        <span className="relative z-10 p-2 text-xs font-semibold leading-none text-yellow-100 whitespace-no-wrap bg-red-900 shadow-lg rounded-md whitespace-nowrap border border-yellow-500/30">
          Switch to {isMarathi ? "English" : "Marathi"}
        </span>
      </div>
    </div>
  );
};

export default Switch;
