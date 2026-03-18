import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Initialize state from localStorage if available, default to false (English)
  const [isMarathi, setIsMarathi] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved === "marathi";
  });

  const toggleLanguage = () => {
    setIsMarathi((prev) => {
      const newValue = !prev;
      localStorage.setItem("language", newValue ? "marathi" : "english");
      return newValue;
    });
  };

  // --- NEW: Effect to apply Marathi font globally to body ---
  useEffect(() => {
    if (isMarathi) {
      document.body.classList.add("font-marathi");
    } else {
      document.body.classList.remove("font-marathi");
    }
  }, [isMarathi]);

  // Translation helper function
  const t = (english, marathi) => (isMarathi ? marathi : english);

  return (
    <LanguageContext.Provider value={{ isMarathi, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
