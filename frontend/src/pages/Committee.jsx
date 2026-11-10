import React, { useState, useEffect, useRef, memo } from "react";
import { Users, Loader2, User, Award, Calendar, Sparkles, MapPin, ChevronDown, Check } from "lucide-react";
import { committeeAPI } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

/* ── Custom Temple Dropdown for Years ── */
const CustomYearDropdown = memo(({ activeYear, availableYears, onChange, isMarathi }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 h-9 px-4 rounded-md bg-cream-dk/90 border border-gold/45 hover:border-amber-500 hover:bg-cream text-maroon font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs select-none"
      >
        <Calendar size={14} className="text-saffron shrink-0" />
        <span className="text-ink-mid font-semibold">{isMarathi ? "कार्यकाळ वर्ष:" : "Tenure Year:"}</span>
        <span className="text-maroon font-bold text-amber-900">{activeYear}</span>
        <ChevronDown
          size={14}
          className={`text-gold-dk transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-1.5 min-w-[150px] max-h-56 overflow-y-auto bg-gradient-to-b from-[#1c0505]/98 via-[#140303]/98 to-[#0c0202]/98 border border-amber-500/35 rounded-md shadow-xl p-1.5 z-50 backdrop-blur-md"
          >
            <div className="flex flex-col gap-0.5">
              {availableYears.map((year) => {
                const isSelected = activeYear === year;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      onChange(year);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-xs"
                        : "text-amber-100/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{year}</span>
                    {isSelected && <Check size={13} className="text-maroon-dk stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
CustomYearDropdown.displayName = "CustomYearDropdown";

/* ── Sacred Diamond Divider (mirrors Home.jsx & About.jsx) ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-4 justify-center">
    <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="11"
        y="1"
        width="13"
        height="13"
        rx="1"
        transform="rotate(45 11 1)"
        className="fill-saffron opacity-80"
      />
      <rect
        x="11"
        y="4"
        width="9"
        height="9"
        rx="0.5"
        transform="rotate(45 11 4)"
        fill="none"
        className="stroke-gold-lt"
        strokeWidth="0.8"
      />
    </svg>
    <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
  </div>
);

/* Corner accents for cards (mirrors Home.jsx & About.jsx) */
const CornerAccents = () => (
  <>
    <span className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-3 border-l-3 border-saffron z-10" />
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-3 border-r-3 border-saffron z-10" />
    <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-3 border-l-3 border-saffron z-10" />
    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-3 border-r-3 border-saffron z-10" />
  </>
);

const Committee = memo(() => {
  const { isMarathi } = useLanguage();
  const [data, setData] = useState({ register: [], utsav: [], mahila: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("register");
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  // Fetch available years on mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await committeeAPI.getCommitteeYears();
        if (response?.status === "success" && Array.isArray(response.data)) {
          setAvailableYears(response.data);
          if (response.data.length > 0 && !response.data.includes(activeYear)) {
            setActiveYear(response.data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching committee years:", err);
      }
    };
    fetchYears();
  }, []);

  // Fetch members when year changes
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all three committees for the selected year in parallel
        const [registerRes, utsavRes, mahilaRes] = await Promise.all([
          committeeAPI.getMembers({ committeeType: "register", year: activeYear }),
          committeeAPI.getMembers({ committeeType: "utsav", year: activeYear }),
          committeeAPI.getMembers({ committeeType: "mahila", year: activeYear }),
        ]);

        const extractMembers = (response) => {
          if (!response) return [];
          if (response.status === "success" && Array.isArray(response.data)) {
            return response.data;
          } else if (response.data && Array.isArray(response.data)) {
            return response.data;
          } else if (Array.isArray(response)) {
            return response;
          }
          return [];
        };

        setData({
          register: extractMembers(registerRes),
          utsav: extractMembers(utsavRes),
          mahila: extractMembers(mahilaRes),
        });
      } catch (err) {
        console.error("Error fetching committee members:", err);
        setError(
          isMarathi
            ? "समिती सदस्य लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा."
            : "Unable to load committee members. Please try again later."
        );
        setData({ register: [], utsav: [], mahila: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [activeYear, isMarathi]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${baseUrl}${imageUrl}`;
  };

  const committees = [
    {
      id: "register",
      title: "Register Committee",
      marathiTitle: "नोंदणी समिती",
      description:
        "The pillars of our governance, ensuring transparency, development, and administrative excellence.",
      marathiDescription:
        "आमच्या संकुलाचे आधारस्तंभ, पारदर्शकता आणि व्यवस्थापकीय उत्कृष्टता सुनिश्चित करणारे विश्वस्त मंडळ.",
      members: data.register,
    },
    {
      id: "utsav",
      title: "Utsav Committee",
      marathiTitle: "उत्सव समिती",
      description:
        "Orchestrating divine celebrations, annual festivals, and keeping our sacred traditions alive.",
      marathiDescription:
        "दिव्य उत्सवांचे नियोजन, भजन-कीर्तन व अखंड वारकरी परंपरा यशस्वीपणे चालवणारी समिती.",
      members: data.utsav,
    },
    {
      id: "mahila",
      title: "Mahila Mandal",
      marathiTitle: "महिला मंडळ",
      description:
        "The spiritual strength of our community, uniting women through sacred seva and festive rituals.",
      marathiDescription:
        "आमच्या मंदिराची आध्यात्मिक शक्ती, सेवाभाव आणि भक्तीने कार्यरत असणारे महिला मंडळ.",
      members: data.mahila,
    },
  ];

  const activeCommittee =
    committees.find((c) => c.id === activeTab) || committees[0];

  return (
    <div className="w-full bg-cream font-body text-ink-dark min-h-screen relative overflow-hidden">
      {/* ── 1. CINEMATIC HEADER BANNER (Theme of Home.jsx) ── */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 bg-gradient-to-b from-[#180303] via-[#100202] to-[#180303] text-cream border-b border-amber-500/25 overflow-hidden">
        {/* Subtle Top Gold Filament */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

        {/* Ambient Divine Radiance */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12)_0%,_rgba(24,4,4,0.40)_65%,_rgba(12,2,2,0.95)_100%)] pointer-events-none" />

        {/* Repeating Sacred Grid Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 40px)",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Sacred Seva Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-black/45 border border-amber-400/40 rounded-full px-4 py-1.5 font-heading text-xs sm:text-[0.82rem] font-medium text-amber-200 tracking-wide mb-4 shadow-sm backdrop-blur-xs select-none"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <Sparkles size={13} className="text-amber-300 shrink-0" />
            <span>{isMarathi ? "सेवेचे अखंड व्रत" : "Dedicated Seva & Governance"}</span>
          </motion.div>

          {/* Main Page Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center select-none"
          >
            <span className="font-heading text-[clamp(2rem,5.5vw,4rem)] font-black text-white leading-tight tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              {isMarathi ? "मंदिर व्यवस्थापन समिती" : "Managing Committee"}
            </span>
            <span className="font-heading text-[clamp(1.1rem,3vw,2rem)] font-bold tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] mt-1 block">
              {isMarathi ? "श्री विठ्ठल रखुमाई मंदिर ट्रस्ट" : "Shree Vitthal Rakhumai Mandir Trust"}
            </span>
          </motion.h1>

          <DiamondDivider />

          <motion.p
            className="max-w-2xl mx-auto text-base sm:text-lg text-cream/85 font-body leading-relaxed mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isMarathi
              ? "“समर्पित भावनेने मंदिर संकुलाची सेवा, पारदर्शक कारभार आणि वारकरी परंपरेचे जतन करणारे कार्यकर्ते.”"
              : "“Devoted trustees and volunteers dedicated to spiritual seva, transparency, and preserving our living Varkari legacy.”"}
          </motion.p>
        </div>
      </section>

      {/* ── 2. SACRED SHLOKA STRIP (Home.jsx Signature) ── */}
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />
      <div className="relative bg-maroon px-6 py-7 text-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(212,175,55,0.15) 0, rgba(212,175,55,0.15) 1px, transparent 0, transparent 60px)",
          }}
        />
        <p className="relative z-10 font-marathi text-[clamp(1.1rem,2.8vw,1.5rem)] text-gold-lt tracking-wide leading-relaxed">
          || सेवा परमो धर्मः — विठ्ठल चरणी निष्ठा ||
        </p>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />

      {/* ── 3. MAIN MEMBERS & COMMITTEES SECTION ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        {/* Committee Wings Tab Navigation (Rectangular Theme matching About.jsx) */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-8 p-1.5 bg-[#180404]/8 border border-amber-500/25 rounded-md max-w-fit mx-auto"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {committees.map((committee) => (
            <button
              key={committee.id}
              onClick={() => setActiveTab(committee.id)}
              className={`
                px-5 sm:px-6 py-2.5 rounded-md font-heading text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 border cursor-pointer select-none
                ${
                  activeTab === committee.id
                    ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border-amber-400/70 shadow-xs"
                    : "bg-transparent border-transparent text-maroon hover:border-amber-500/40 hover:bg-cream hover:text-maroon-dk"
                }
              `}
            >
              {isMarathi ? committee.marathiTitle : committee.title}
            </button>
          ))}
        </motion.div>

        {/* Year Filter Selector (Custom Dropdown) */}
        {availableYears.length > 0 && (
          <div className="flex justify-center mb-12">
            <CustomYearDropdown
              activeYear={activeYear}
              availableYears={availableYears}
              onChange={setActiveYear}
              isMarathi={isMarathi}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-ink-light">
            <Loader2 className="w-10 h-10 animate-spin text-saffron mb-3" />
            <p className="font-heading text-xs sm:text-sm tracking-widest uppercase text-maroon font-bold">
              {isMarathi ? "समिती सदस्य लोड होत आहेत..." : "Loading committee members…"}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-cream-dk border border-vermillion/40 rounded-xl p-8 text-center max-w-lg mx-auto shadow-sm">
            <p className="text-vermillion font-medium">{error}</p>
          </div>
        )}

        {/* Committee Wing Content */}
        {!loading && !error && (
          <div>
            {/* Wing Banner Info */}
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-maroon mb-2">
                {isMarathi ? activeCommittee.marathiTitle : activeCommittee.title}
              </h2>
              <p className="font-body text-ink-light text-base leading-relaxed">
                {isMarathi ? activeCommittee.marathiDescription : activeCommittee.description}
              </p>
            </div>

            {/* Empty State */}
            {activeCommittee.members.length === 0 ? (
              <div className="bg-cream-dk rounded-2xl border border-gold/40 p-12 text-center max-w-md mx-auto shadow-xs">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/30 shadow-inner">
                  <Users className="w-8 h-8 text-gold-dk" />
                </div>
                <h3 className="font-display text-xl font-bold text-maroon mb-1.5">
                  {isMarathi ? "सदस्य माहिती उपलब्ध नाही" : "No Members Listed"}
                </h3>
                <p className="font-body text-sm text-ink-light">
                  {isMarathi
                    ? `या वर्षासाठी ${activeCommittee.marathiTitle}चे सदस्य उपलब्ध नाहीत.`
                    : `No members available for ${activeCommittee.title} for the year ${activeYear}.`}
                </p>
              </div>
            ) : (
              /* Members Grid (Home.jsx Aesthetic Frame) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
                {activeCommittee.members.map((member, idx) => (
                  <MemberCard
                    key={member._id || idx}
                    member={member}
                    getImageUrl={getImageUrl}
                    index={idx}
                    isMarathi={isMarathi}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── 4. FOOTER MANTRA STRIP (Exact match to Home.jsx & About.jsx) ── */}
      <div className="bg-ink-dark border-t-4 border-gold p-6 text-center">
        <p className="font-marathi text-[1.1rem] text-gold-lt tracking-wide">
          || पुंडलिका वरदा हरी विठ्ठल — पांडुरंग ||
        </p>
        <p className="font-body italic text-cream-dk/50 text-[0.9rem] mt-1.5">
          Shree Vitthal Rakhumai Temple, Amberkarwadi · Open 24 Hours
        </p>
      </div>
    </div>
  );
});

/* ── Refined Member Card matching Home.jsx & About.jsx Theme ── */
const MemberCard = ({ member, getImageUrl, index, isMarathi }) => {
  const [imgError, setImgError] = useState(false);
  const photoUrl = getImageUrl(member.imageUrl);

  return (
    <motion.div
      className="group relative bg-cream-dk rounded-md p-3 shadow-xs border border-gold/45 overflow-hidden transition-colors duration-200 hover:border-gold hover:shadow-md flex flex-col"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.04 }}
    >
      {/* Saffron Corner Accents: Revealed smoothly on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <CornerAccents />
      </div>

      {/* Image Container with Gold Border */}
      <div className="h-64 w-full relative overflow-hidden bg-stone border border-gold/40 rounded-sm">
        {photoUrl && !imgError ? (
          <img
            src={photoUrl}
            alt={member.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-top"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-maroon/20 via-cream-dk to-stone text-gold-dk">
            <User size={52} strokeWidth={1.5} className="text-maroon/60" />
          </div>
        )}

        {/* Warm Golden Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-200" />

        {/* Corner Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-cream/95 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-gold/50 shadow-xs flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-saffron shrink-0" />
          <span className="font-heading text-[10px] sm:text-[11px] font-bold text-maroon uppercase tracking-wider">
            {isMarathi && member.positionMarathi
              ? member.positionMarathi
              : member.role || member.position || "Sevak"}
          </span>
        </div>
      </div>

      {/* Text Info */}
      <div className="pt-3 pb-1 text-center relative z-10 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-display text-lg font-bold text-maroon leading-tight group-hover:text-saffron-dk transition-colors line-clamp-1">
            {member.name}
          </h4>
          {member.nameMarathi && (
            <p className="font-marathi text-base font-semibold text-ink-mid mt-0.5 line-clamp-1">
              {member.nameMarathi}
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-gold/30">
          <p className="font-heading text-[10.5px] font-bold text-saffron-dk uppercase tracking-[0.16em] line-clamp-1">
            {isMarathi && member.roleMarathi
              ? member.roleMarathi
              : member.role || member.position || "Sevak"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

Committee.displayName = "Committee";
export default Committee;
