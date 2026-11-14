import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { Trophy, Medal, Users, Loader2, Calendar, ChevronDown, Check, X, Share2 } from "lucide-react";
import { sportsAPI } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

/* ── Sacred Diamond Divider ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-3 justify-center">
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

/* ── Corner Accents for Cards ── */
const CornerAccents = () => (
  <>
    <span className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-4 border-l-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-4 border-r-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-4 border-l-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-4 border-r-4 border-saffron z-30 pointer-events-none" />
  </>
);

/* ── Custom Temple Dropdown for Years (Mobile Only) ── */
const CustomYearDropdown = memo(({ selectedYear, availableYears, onChange, isMarathi }) => {
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
    <div className="relative w-full max-w-xs mx-auto sm:hidden" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2.5 h-11 px-4 rounded-md bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border border-amber-500/70 font-heading text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer select-none transition-all"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar size={14} className="text-maroon-dk shrink-0" />
          <span>{isMarathi ? `वर्ष: ${selectedYear}` : `Year: ${selectedYear}`}</span>
        </div>
        <ChevronDown
          size={15}
          className={`text-maroon-dk shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto bg-gradient-to-b from-[#1c0505]/98 via-[#140303]/98 to-[#0c0202]/98 border border-amber-500/35 rounded-md shadow-[0_12px_32px_rgba(0,0,0,0.65)] p-1.5 z-50 backdrop-blur-md"
            role="listbox"
          >
            <div className="flex flex-col gap-0.5">
              {availableYears.map((year) => {
                const isSelected = selectedYear === year;
                return (
                  <button
                    key={year}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(year);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-xs"
                        : "text-amber-100/85 hover:text-white hover:bg-white/10"
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

const Sports = () => {
  const { isMarathi } = useLanguage();
  const [searchParams] = useSearchParams();
  const sharedYearParam = searchParams.get("year");
  const sharedSportParam = searchParams.get("sport");
  const sharedWinnerParam = searchParams.get("winner");
  const handledDeepLinkRef = useRef(false);

  const [sports, setSports] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [currentSport, setCurrentSport] = useState(null);
  const [winners, setWinners] = useState({
    first: null,
    second: null,
    third: null,
  });
  const [expandedList, setExpandedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(null);
  const [showImageModal, setShowImageModal] = useState(null);
  const [copiedRank, setCopiedRank] = useState(null);
  const [selectedYear, setSelectedYear] = useState(() => {
    const parsed = sharedYearParam ? parseInt(sharedYearParam, 10) : NaN;
    return !Number.isNaN(parsed) ? parsed : new Date().getFullYear();
  });
  const [availableYears, setAvailableYears] = useState([]);
  const [yearsReady, setYearsReady] = useState(false);
  const sportsReqRef = useRef(0);
  const sportDataReqRef = useRef(0);

  useEffect(() => {
    if (showMembersModal || showImageModal) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showMembersModal, showImageModal]);

  useEffect(() => {
    const initialize = async () => {
      await fetchAvailableYears();
      setYearsReady(true);
    };
    initialize();
  }, []);
  useEffect(() => {
    if (yearsReady && selectedYear) {
      setActiveTab(null);
      setCurrentSport(null);
      setWinners({ first: null, second: null, third: null });
      fetchSports(selectedYear);
    }
  }, [yearsReady, selectedYear]);

  useEffect(() => {
    if (activeTab) {
      fetchSportData(activeTab);
    } else {
      setCurrentSport(null);
      setWinners({ first: null, second: null, third: null });
    }
  }, [activeTab]);

  const fetchAvailableYears = async () => {
    try {
      const response = await sportsAPI.getSportYears();
      if (response && response.status === "success" && response.data) {
        const years = Array.isArray(response.data) ? response.data : [];
        const currentYear = new Date().getFullYear();
        const allYears = new Set([...years, currentYear]);
        const sortedYears = Array.from(allYears).sort((a, b) => b - a);
        setAvailableYears(sortedYears);
        const parsedSharedYear = sharedYearParam ? parseInt(sharedYearParam, 10) : NaN;
        if (!Number.isNaN(parsedSharedYear) && allYears.has(parsedSharedYear)) {
          setSelectedYear(parsedSharedYear);
        } else if (years.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else if (years.length > 0) {
          const sortedActual = [...years].sort((a, b) => b - a);
          setSelectedYear(sortedActual[0]);
        } else {
          setSelectedYear(currentYear);
        }
      } else {
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear]);
        setSelectedYear(currentYear);
      }
    } catch (error) {
      console.error("Frontend: Error fetching sport years:", error);
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear]);
      setSelectedYear(currentYear);
    }
  };

  const fetchSports = async (targetYear = selectedYear) => {
    const reqId = ++sportsReqRef.current;
    try {
      setLoading(true);
      const params = { active: "true" };
      if (targetYear) params.year = targetYear.toString();

      const response = await sportsAPI.getSports(params);
      if (reqId !== sportsReqRef.current) return;

      let sportsList = [];

      if (response) {
        if (response.status === "success" && Array.isArray(response.data)) {
          sportsList = response.data;
        } else if (response.data && Array.isArray(response.data)) {
          sportsList = response.data;
        } else if (Array.isArray(response)) {
          sportsList = response;
        }
      }

      setSports(sportsList);
      if (sportsList.length > 0) {
        const matchedSport =
          sharedSportParam && sportsList.find((s) => s._id === sharedSportParam);
        setActiveTab(matchedSport ? matchedSport._id : sportsList[0]._id);
      } else {
        setActiveTab(null);
        setCurrentSport(null);
        setWinners({ first: null, second: null, third: null });
      }
    } catch (error) {
      if (reqId !== sportsReqRef.current) return;
      console.error("Frontend: Error fetching sports:", error);
      setSports([]);
      setActiveTab(null);
      setCurrentSport(null);
      setWinners({ first: null, second: null, third: null });
    } finally {
      if (reqId === sportsReqRef.current) {
        setLoading(false);
      }
    }
  };

  const fetchSportData = async (sportId) => {
    const reqId = ++sportDataReqRef.current;
    try {
      if (!sportId) return;
      const response = await sportsAPI.getSportWithWinners(sportId);
      if (reqId !== sportDataReqRef.current) return;

      if (response && (response.status === "success" || response.data)) {
        const data = response.data || response;
        setCurrentSport(data.sport);
        const resolvedWinners = data.winners || { first: null, second: null, third: null };
        setWinners(resolvedWinners);

        if (
          !handledDeepLinkRef.current &&
          sharedWinnerParam &&
          resolvedWinners[sharedWinnerParam]?.imageUrl
        ) {
          handledDeepLinkRef.current = true;
          setShowImageModal({
            ...resolvedWinners[sharedWinnerParam],
            _position: sharedWinnerParam,
          });
        }
      } else {
        setCurrentSport(null);
        setWinners({ first: null, second: null, third: null });
      }
    } catch (error) {
      if (reqId !== sportDataReqRef.current) return;
      console.error("Frontend: Error fetching sport data:", error);
      setCurrentSport(null);
      setWinners({ first: null, second: null, third: null });
    }
  };

  const toggleList = (rank) => {
    setExpandedList(expandedList === rank ? null : rank);
  };

  const handleShareWinner = useCallback(async (e, winner, position) => {
    e?.stopPropagation?.();
    if (!winner) return;
    const shareUrl = `${window.location.origin}/events/sports?year=${selectedYear}${activeTab ? `&sport=${activeTab}` : ""}${position ? `&winner=${position}` : ""}`;
    const sportTitle = currentSport?.name || (isMarathi ? "क्रीडा स्पर्धा" : "Sports Tournament");
    const shareData = {
      title: `${winner.teamName} — ${sportTitle} (${selectedYear})`,
      text: isMarathi
        ? `${sportTitle} ${selectedYear} मधील ${winner.teamName} चा विजयाचा क्षण पहा!`
        : `Celebrate ${winner.teamName}'s winning moment in ${sportTitle} ${selectedYear}!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedRank(position || "shared");
      setTimeout(() => setCopiedRank(null), 2000);
    } catch (err) {
      console.error("Share copy failed:", err);
    }
  }, [selectedYear, activeTab, currentSport, isMarathi]);

  return (
    <div className="w-full bg-cream font-body text-ink-dark min-h-screen relative overflow-hidden">
      {/* ═══════════ 1. CINEMATIC HERO BANNER ═══════════ */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 bg-gradient-to-b from-[#180303] via-[#100202] to-[#180303] text-cream border-b border-amber-500/25 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12)_0%,_rgba(24,4,4,0.40)_65%,_rgba(12,2,2,0.95)_100%)] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 40px)",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
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
            <Trophy size={13} className="text-amber-300 shrink-0" />
            <span>{isMarathi ? "युवा क्रीडा महोत्सव" : "Youth Sports & Athletics"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center select-none"
          >
            <span className="font-heading text-[clamp(2rem,5.5vw,4rem)] font-black text-white leading-tight tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              {isMarathi ? "क्रीडा स्पर्धा व निकाल" : "Sports Tournaments"}
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
              ? "“गावच्या तरुणाईची एकजूट, खिलाडूवृत्ती आणि उत्साहाचा वार्षिक क्रीडा सोहळा.”"
              : "“Celebrating youth sportsmanship, unity, and athletic excellence in the temple village.”"}
          </motion.p>
        </div>
      </section>

      {/* ═══════════ 2. SACRED SHLOKA STRIP ═══════════ */}
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />
      <div className="relative bg-maroon px-6 py-7 sm:py-8 text-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(212,175,55,0.15) 0, rgba(212,175,55,0.15) 1px, transparent 0, transparent 60px)",
          }}
        />
        <p className="relative z-10 font-marathi text-[clamp(1.1rem,2.8vw,1.5rem)] text-gold-lt tracking-wide leading-relaxed">
          || शरीरमाद्यं खलु धर्मसाधनम् — युवा क्रीडा महोत्सव ||
        </p>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />

      {/* ═══════════ 3. YEAR & SPORT SELECTOR BAR ═══════════ */}
      <section className="bg-cream border-b border-gold/30 shadow-xs relative z-20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Year Filter: Dropdown on Mobile Only, Horizontal Tabs on Tablet/Desktop */}
          {availableYears.length > 0 && (
            <>
              <CustomYearDropdown
                selectedYear={selectedYear}
                availableYears={availableYears}
                onChange={setSelectedYear}
                isMarathi={isMarathi}
              />

              <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#180404]/8 border border-amber-500/25 rounded-md max-w-fit mx-auto">
                <span className="text-xs font-heading font-bold text-maroon uppercase tracking-wider px-2 flex items-center gap-1.5">
                  <Calendar size={13} className="text-saffron shrink-0" />
                  <span>{isMarathi ? "वर्ष:" : "Year:"}</span>
                </span>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-heading font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                      selectedYear === year
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border-amber-400/70 shadow-xs"
                        : "bg-white/80 text-ink-mid border-gold/30 hover:border-gold hover:text-maroon"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Sports Navigation Tabs (Rectangular Theme) */}
          {!loading && sports.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {sports.map((sport) => (
                <button
                  key={sport._id}
                  onClick={() => {
                    setActiveTab(sport._id);
                    setExpandedList(null);
                  }}
                  className={`px-4 sm:px-5 py-2 rounded-md font-heading text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 border cursor-pointer select-none ${
                    activeTab === sport._id
                      ? "bg-maroon text-gold-lt border-maroon shadow-xs"
                      : "bg-cream-dk border-gold/40 text-maroon hover:border-gold hover:bg-cream"
                  }`}
                >
                  {sport.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ 4. MAIN TOURNAMENT CONTENT ═══════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-ink-light">
            <Loader2 className="w-10 h-10 animate-spin text-saffron mb-3" />
            <p className="font-heading text-xs sm:text-sm tracking-widest uppercase text-maroon font-bold">
              {isMarathi ? "माहिती लोड होत आहे..." : "Retrieving tournament data…"}
            </p>
          </div>
        )}

        {!loading && sports.length === 0 && (
          <div className="bg-cream-dk rounded-md border border-gold/40 p-12 text-center max-w-md mx-auto shadow-xs">
            <Trophy className="w-10 h-10 text-gold-dk mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-maroon mb-1.5">
              {isMarathi ? "क्रीडा माहिती उपलब्ध नाही" : "No Events Found"}
            </h3>
            <p className="font-body text-sm text-ink-light">
              {isMarathi
                ? `${selectedYear} या वर्षासाठी क्रीडा निकाल उपलब्ध नाहीत.`
                : `No sports data available for the year ${selectedYear}.`}
            </p>
          </div>
        )}

        {!loading && sports.length > 0 && currentSport && (
          <div className="space-y-12">
            {/* Sport Banner Overview */}
            <div className="text-center max-w-3xl mx-auto">
              <span className="font-heading text-xs text-saffron font-bold uppercase tracking-widest block mb-1">
                {selectedYear} {isMarathi ? "क्रीडा स्पर्धा" : "Championship"}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-maroon mb-2">
                {currentSport.name}
              </h2>
              {currentSport.description && (
                <p className="font-body text-ink-light text-sm sm:text-base leading-relaxed">
                  {currentSport.description}
                </p>
              )}
            </div>

            {/* Victory Podium Section */}
            <div>
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-amber-400/20 border border-amber-500/40 text-maroon font-heading text-xs font-bold uppercase tracking-wider">
                  <Medal className="text-saffron" size={14} />
                  <span>{isMarathi ? "विजेते संघ / खेळाडू" : "Victory Podium"}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch max-w-5xl mx-auto">
                <WinnerCard
                  winner={winners.second}
                  position="second"
                  expanded={expandedList === "second"}
                  onToggle={() => toggleList("second")}
                  onViewMembers={() => setShowMembersModal(winners.second)}
                  onViewImage={() =>
                    winners.second?.imageUrl && setShowImageModal({ ...winners.second, _position: "second" })
                  }
                  onShare={(e) => handleShareWinner(e, winners.second, "second")}
                  isCopied={copiedRank === "second"}
                  isMarathi={isMarathi}
                />

                <WinnerCard
                  winner={winners.first}
                  position="first"
                  expanded={expandedList === "first"}
                  onToggle={() => toggleList("first")}
                  onViewMembers={() => setShowMembersModal(winners.first)}
                  onViewImage={() =>
                    winners.first?.imageUrl && setShowImageModal({ ...winners.first, _position: "first" })
                  }
                  onShare={(e) => handleShareWinner(e, winners.first, "first")}
                  isCopied={copiedRank === "first"}
                  isMarathi={isMarathi}
                />

                <WinnerCard
                  winner={winners.third}
                  position="third"
                  expanded={expandedList === "third"}
                  onToggle={() => toggleList("third")}
                  onViewMembers={() => setShowMembersModal(winners.third)}
                  onViewImage={() =>
                    winners.third?.imageUrl && setShowImageModal({ ...winners.third, _position: "third" })
                  }
                  onShare={(e) => handleShareWinner(e, winners.third, "third")}
                  isCopied={copiedRank === "third"}
                  isMarathi={isMarathi}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Team Members Modal */}
      {showMembersModal && (
        <TeamMembersModal
          winner={showMembersModal}
          onClose={() => setShowMembersModal(null)}
          isMarathi={isMarathi}
        />
      )}

      {/* Winner Image Modal */}
      {showImageModal && (
        <WinnerImageModal
          winner={showImageModal}
          onClose={() => setShowImageModal(null)}
          onShare={(e) => handleShareWinner(e, showImageModal, showImageModal._position)}
          isCopied={copiedRank === showImageModal._position}
          isMarathi={isMarathi}
        />
      )}
    </div>
  );
};

// Winner Card Component (Rectangular Temple Styling)
const WinnerCard = ({
  winner,
  position,
  _expanded,
  onToggle,
  onViewMembers,
  onViewImage,
  onShare,
  isCopied,
  isMarathi,
}) => {
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const API_BASE_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${API_BASE_URL}${imageUrl}`;
  };

  const positionConfig = {
    first: {
      label: isMarathi ? "प्रथम क्रमांक (विजेता)" : "Champion",
      badge: "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border-amber-400/80",
      order: "order-1 md:order-2 md:-mt-6",
    },
    second: {
      label: isMarathi ? "द्वितीय क्रमांक" : "Runner Up",
      badge: "bg-slate-200 text-slate-800 border-slate-300",
      order: "order-2 md:order-1",
    },
    third: {
      label: isMarathi ? "तृतीय क्रमांक" : "Third Place",
      badge: "bg-amber-700 text-cream border-amber-800",
      order: "order-3 md:order-3",
    },
  };

  const config = positionConfig[position];

  if (!winner) {
    return (
      <div className={`${config.order} flex flex-col`}>
        <div className="relative bg-cream-dk border-2 border-gold/60 rounded-sm p-1.5 sm:p-2 shadow-xs h-full">
          <CornerAccents />
          <div className="border border-dashed border-gold/45 rounded-sm bg-cream/60 p-6 flex flex-col items-center justify-center min-h-[260px] h-full">
            <div className="w-12 h-12 bg-white rounded-sm mb-3 flex items-center justify-center text-gold-dk border border-gold/30">
              <Users size={20} />
            </div>
            <span className="text-ink-light font-heading text-xs font-bold uppercase tracking-wider">
              {isMarathi ? "माहिती उपलब्ध नाही" : "Position Vacant"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const members = winner.members
    ? winner.members.map((m) => (typeof m === "string" ? m : m.name))
    : [];

  return (
    <div className={`${config.order} flex flex-col group h-full`}>
      <div className="relative bg-cream-dk border-2 border-gold rounded-sm p-1.5 sm:p-2 shadow-sm h-full flex flex-col">
        {/* 4 Saffron Corner Brackets */}
        <CornerAccents />

        {/* Inner Framed Card */}
        <div className="relative border border-saffron-lt/60 rounded-sm overflow-hidden bg-cream/95 p-5 sm:p-6 flex flex-col items-center justify-between flex-1">
          {/* Position Badge */}
          <div
            className={`absolute top-2.5 right-2.5 ${config.badge} px-2.5 py-0.5 rounded-sm text-[10px] font-heading font-bold uppercase tracking-wider border shadow-xs`}
          >
            {config.label}
          </div>

          <div className="w-full flex flex-col items-center pt-6">
            {/* Winner Image Frame */}
            <div
              className="relative mb-3.5 rounded-sm overflow-hidden bg-stone w-full aspect-[16/10] border-2 border-gold/70 shrink-0 cursor-pointer shadow-xs"
              onClick={onViewImage}
            >
              {winner.imageUrl ? (
                <img
                  src={getImageUrl(winner.imageUrl)}
                  alt={winner.teamName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-stone text-gold-dk ${
                  winner.imageUrl ? "hidden" : "flex"
                }`}
              >
                <Trophy size={32} className="text-maroon/70" />
              </div>
            </div>

            <h3 className="font-display font-bold text-lg text-maroon text-center leading-tight mb-1">
              {winner.teamName}
            </h3>

            <p className="text-xs text-ink-mid font-body mb-4">
              <span className="text-ink-light mr-1">{isMarathi ? "कर्णधार:" : "Captain:"}</span>
              <span className="text-maroon font-bold">{winner.captain}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-auto flex items-center gap-2">
            <button
              type="button"
              onClick={members.length > 0 ? onViewMembers : onToggle}
              className="flex-1 min-w-0 py-2 px-2.5 sm:px-3 rounded-sm bg-white border border-gold/50 hover:border-gold text-maroon hover:bg-cream flex items-center justify-between gap-1.5 text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span className="truncate">{members.length > 0 ? (isMarathi ? "खेळाडू यादी" : "View Squad") : (isMarathi ? "खेळाडू नाहीत" : "No Members")}</span>
              {members.length > 0 && (
                <span className="bg-amber-100 text-maroon px-1.5 py-0.5 rounded-sm text-[10px] shrink-0">
                  {members.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => onShare?.(e)}
              title={isMarathi ? "विजयाचा क्षण शेअर करा" : "Share Winning Moment"}
              className="shrink-0 py-2 px-2.5 sm:px-3 rounded-sm bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border border-amber-500/60 flex items-center justify-center gap-1 text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              {isCopied ? (
                <Check size={13} className="text-emerald-700 shrink-0" />
              ) : (
                <Share2 size={13} className="shrink-0" />
              )}
              <span>{isCopied ? (isMarathi ? "कॉपी!" : "Copied") : isMarathi ? "शेअर" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Team Members Modal (Fixed Portal, No Page Scrollbar)
const TeamMembersModal = ({ winner, onClose, isMarathi }) => {
  useEffect(() => {
    if (!winner) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [winner, onClose]);

  if (!winner) return null;

  const members = winner.members
    ? winner.members.map((m) => (typeof m === "string" ? m : m.name))
    : [];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-black/85 overscroll-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md max-h-[88dvh] bg-cream border-2 border-gold rounded-sm overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Maroon Header */}
        <div className="bg-gradient-to-r from-[#2c0707] via-[#4a0f0f] to-[#2c0707] px-4 sm:px-5 py-3.5 border-b border-gold/40 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-heading font-bold uppercase tracking-[0.18em] text-amber-300">
              {isMarathi ? "संघ खेळाडू यादी" : "Team Squad"}
            </p>
            <h3 className="font-heading text-base sm:text-lg font-bold text-white truncate">
              {winner.teamName}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-maroon text-amber-200 hover:text-white border border-gold/40 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Squad Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 bg-cream">
          {winner.captain && (
            <div className="mb-4 p-3.5 bg-maroon rounded-sm border border-gold/40 text-gold-lt flex items-center gap-3">
              <Trophy size={20} className="text-gold shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gold-lt uppercase tracking-widest font-heading font-bold">
                  {isMarathi ? "कर्णधार" : "Team Captain"}
                </p>
                <h4 className="text-base font-display font-bold text-white truncate">{winner.captain}</h4>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-heading font-bold uppercase tracking-wider text-ink-light mb-2">
              {isMarathi ? "खेळाडूंची नावे" : "Squad Members"}
            </p>
            {members.map((member, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2.5 bg-white border border-gold/30 rounded-sm text-xs sm:text-sm font-body text-ink-dark"
              >
                <span className="w-6 h-6 shrink-0 rounded-full bg-cream-dk border border-gold/30 flex items-center justify-center font-bold text-maroon text-[11px]">
                  {index + 1}
                </span>
                <span className="font-medium">{member}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Winner Image Modal (Fixed Portal, No Scrollbar)
const WinnerImageModal = ({ winner, onClose, onShare, isCopied, isMarathi }) => {
  useEffect(() => {
    if (!winner) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [winner, onClose]);

  if (!winner || !winner.imageUrl) return null;

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const API_BASE_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${API_BASE_URL}${imageUrl}`;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-black/90 overscroll-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90dvh] bg-gradient-to-b from-[#1c0505] to-[#0c0202] border-2 border-gold/60 rounded-sm p-3 sm:p-5 overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-3 mb-3 border-b border-amber-500/25 pb-2.5">
          <h3 className="text-white font-heading text-base sm:text-xl font-bold truncate">
            {winner.teamName}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 w-9 h-9 flex items-center justify-center text-amber-200 hover:text-white bg-white/5 hover:bg-maroon rounded-full border border-gold/40 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center bg-black/50 rounded-sm p-2 border border-gold/20">
          <img
            src={getImageUrl(winner.imageUrl)}
            alt={winner.teamName}
            className="max-h-[60dvh] sm:max-h-[68dvh] w-auto max-w-full object-contain mx-auto rounded-sm"
          />
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left min-w-0">
            <h4 className="font-display font-bold text-base sm:text-lg text-amber-200 truncate">{winner.teamName}</h4>
            {winner.captain && (
              <p className="text-xs text-cream/80 mt-0.5">
                {isMarathi ? "कर्णधार:" : "Captain:"} {winner.captain}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => onShare?.(e)}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk px-4 py-2 rounded-sm text-xs font-heading font-bold uppercase tracking-wider shadow-xs cursor-pointer"
          >
            {isCopied ? (
              <Check size={14} className="text-emerald-700 shrink-0" />
            ) : (
              <Share2 size={14} className="shrink-0" />
            )}
            <span>
              {isCopied
                ? isMarathi
                  ? "लिंक कॉपी झाली!"
                  : "Link Copied!"
                : isMarathi
                  ? "क्षण शेअर करा"
                  : "Share Moment"}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Sports;
