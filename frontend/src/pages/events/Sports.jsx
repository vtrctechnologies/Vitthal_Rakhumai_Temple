import React, { useState, useEffect, memo } from "react";
import { Trophy, ChevronDown, Medal, Users, Loader2, X, Sparkles, Calendar } from "lucide-react";
import { sportsAPI } from "../../services/api";
import Modal from "@/components/base/Modal";
import { motion } from "framer-motion";
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
    <span className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 border-t-2 border-l-2 border-saffron z-20" />
    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 border-t-2 border-r-2 border-saffron z-20" />
    <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 border-b-2 border-l-2 border-saffron z-20" />
    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-b-2 border-r-2 border-saffron z-20" />
  </>
);

const Sports = () => {
  const { isMarathi } = useLanguage();
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    if (showMembersModal || showImageModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMembersModal, showImageModal]);

  useEffect(() => {
    const initialize = async () => {
      await fetchAvailableYears();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      setActiveTab(null);
      setCurrentSport(null);
      setWinners({ first: null, second: null, third: null });
      fetchSports();
    }
  }, [selectedYear]);

  useEffect(() => {
    if (activeTab) {
      fetchSportData(activeTab);
    }
  }, [activeTab]);

  const fetchAvailableYears = async () => {
    try {
      const response = await sportsAPI.getSportYears();
      if (response && response.status === "success" && response.data) {
        const years = Array.isArray(response.data) ? response.data : [];
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const allYears = new Set([...years, currentYear, nextYear]);
        const sortedYears = Array.from(allYears).sort((a, b) => b - a);
        setAvailableYears(sortedYears);
        if (sortedYears.length > 0) setSelectedYear(sortedYears[0]);
      } else {
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear + 1, currentYear]);
        setSelectedYear(currentYear);
      }
    } catch (error) {
      console.error("Frontend: Error fetching sport years:", error);
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear + 1, currentYear]);
      setSelectedYear(currentYear);
    }
  };

  const fetchSports = async () => {
    try {
      setLoading(true);
      const params = { active: "true" };
      if (selectedYear) params.year = selectedYear.toString();

      const response = await sportsAPI.getSports(params);
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
      if (sportsList.length > 0 && !activeTab) {
        setActiveTab(sportsList[0]._id);
      } else if (sportsList.length === 0) {
        setActiveTab(null);
        setCurrentSport(null);
        setWinners({ first: null, second: null, third: null });
      }
    } catch (error) {
      console.error("Frontend: Error fetching sports:", error);
      setSports([]);
      setActiveTab(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSportData = async (sportId) => {
    try {
      if (!sportId) return;
      const response = await sportsAPI.getSportWithWinners(sportId);

      if (response && (response.status === "success" || response.data)) {
        const data = response.data || response;
        setCurrentSport(data.sport);
        setWinners(data.winners || { first: null, second: null, third: null });
      } else {
        setCurrentSport(null);
        setWinners({ first: null, second: null, third: null });
      }
    } catch (error) {
      console.error("Frontend: Error fetching sport data:", error);
      setCurrentSport(null);
      setWinners({ first: null, second: null, third: null });
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const API_BASE_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${API_BASE_URL}${imageUrl}`;
  };

  const toggleList = (rank) => {
    setExpandedList(expandedList === rank ? null : rank);
  };

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
          {/* Year Filter */}
          {availableYears.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#180404]/8 border border-amber-500/25 rounded-md max-w-fit mx-auto">
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

        {currentSport && (
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
                    winners.second?.imageUrl && setShowImageModal(winners.second)
                  }
                  isMarathi={isMarathi}
                />

                <WinnerCard
                  winner={winners.first}
                  position="first"
                  expanded={expandedList === "first"}
                  onToggle={() => toggleList("first")}
                  onViewMembers={() => setShowMembersModal(winners.first)}
                  onViewImage={() =>
                    winners.first?.imageUrl && setShowImageModal(winners.first)
                  }
                  isMarathi={isMarathi}
                />

                <WinnerCard
                  winner={winners.third}
                  position="third"
                  expanded={expandedList === "third"}
                  onToggle={() => toggleList("third")}
                  onViewMembers={() => setShowMembersModal(winners.third)}
                  onViewImage={() =>
                    winners.third?.imageUrl && setShowImageModal(winners.third)
                  }
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
          isMarathi={isMarathi}
        />
      )}

      {/* ═══════════ 5. FOOTER STRIP ═══════════ */}
      <div className="bg-ink-dark border-t-4 border-gold py-6 text-center">
        <p className="font-marathi text-[1.1rem] text-gold-lt tracking-wide">
          || पुंडलिका वरदा हरी विठ्ठल — श्री ज्ञानदेव तुकाराम ||
        </p>
        <p className="font-body italic text-cream/45 text-[0.85rem] mt-1 tracking-wider">
          Shree Vitthal Rakhumai Temple · Amberkarwadi, Ratnagiri
        </p>
      </div>
    </div>
  );
};

// Winner Card Component (Rectangular Temple Styling)
const WinnerCard = ({
  winner,
  position,
  expanded,
  onToggle,
  onViewMembers,
  onViewImage,
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
        <div className="relative rounded-md border border-dashed border-gold/40 bg-cream-dk/50 p-6 flex flex-col items-center justify-center min-h-[260px]">
          <div className="w-12 h-12 bg-white rounded-md mb-3 flex items-center justify-center text-gold-dk border border-gold/30">
            <Users size={20} />
          </div>
          <span className="text-ink-light font-heading text-xs font-bold uppercase tracking-wider">
            {isMarathi ? "माहिती उपलब्ध नाही" : "Position Vacant"}
          </span>
        </div>
      </div>
    );
  }

  const members = winner.members
    ? winner.members.map((m) => (typeof m === "string" ? m : m.name))
    : [];

  return (
    <div className={`${config.order} flex flex-col group h-full`}>
      <div className="relative bg-cream-dk rounded-md border border-gold/45 p-6 flex flex-col items-center justify-between shadow-xs hover:border-gold hover:shadow-md transition-colors duration-200 h-full overflow-hidden">
        {/* Saffron Corner Accents */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <CornerAccents />
        </div>

        {/* Position Badge */}
        <div
          className={`absolute top-2.5 right-2.5 ${config.badge} px-2.5 py-0.5 rounded-sm text-[10px] font-heading font-bold uppercase tracking-wider border shadow-xs`}
        >
          {config.label}
        </div>

        <div className="w-full flex flex-col items-center pt-4">
          {/* Winner Image Frame */}
          <div
            className="relative mb-3 rounded-md overflow-hidden bg-stone w-24 h-24 border border-gold/40 shrink-0 cursor-pointer shadow-xs"
            onClick={onViewImage}
          >
            {winner.imageUrl ? (
              <img
                src={getImageUrl(winner.imageUrl)}
                alt={winner.teamName}
                className="w-full h-full object-cover"
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

        {/* Action Button */}
        <div className="w-full mt-auto">
          <button
            onClick={members.length > 0 ? onViewMembers : onToggle}
            className="w-full py-2 px-3 rounded-md bg-white border border-gold/40 hover:border-gold text-maroon hover:bg-cream flex items-center justify-between text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>{members.length > 0 ? (isMarathi ? "खेळाडू यादी" : "View Squad") : (isMarathi ? "खेळाडू नाहीत" : "No Members")}</span>
            {members.length > 0 && (
              <span className="bg-amber-100 text-maroon px-2 py-0.5 rounded-sm text-[10px]">
                {members.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Team Members Modal
const TeamMembersModal = ({ winner, onClose, isMarathi }) => {
  if (!winner) return null;

  const members = winner.members
    ? winner.members.map((m) => (typeof m === "string" ? m : m.name))
    : [];

  return (
    <Modal isOpen={!!winner} onClose={onClose} title={winner.teamName}>
      <div className="flex-1 overflow-y-auto p-6 bg-cream">
        {winner.captain && (
          <div className="mb-4 p-3.5 bg-maroon rounded-md border border-gold/40 text-gold-lt flex items-center gap-3">
            <Trophy size={20} className="text-gold" />
            <div>
              <p className="text-[10px] text-gold-lt uppercase tracking-widest font-heading font-bold">
                {isMarathi ? "कर्णधार" : "Team Captain"}
              </p>
              <h4 className="text-base font-display font-bold text-white">{winner.captain}</h4>
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
              className="flex items-center gap-3 p-2.5 bg-white border border-gold/30 rounded-md text-xs font-body text-ink-dark"
            >
              <span className="w-5 h-5 rounded-full bg-cream-dk border border-gold/30 flex items-center justify-center font-bold text-maroon text-[10px]">
                {index + 1}
              </span>
              <span className="font-medium">{member}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

// Winner Image Modal
const WinnerImageModal = ({ winner, onClose }) => {
  if (!winner || !winner.imageUrl) return null;

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const API_BASE_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${API_BASE_URL}${imageUrl}`;
  };

  return (
    <Modal isOpen={!!winner} onClose={onClose} title={winner.teamName}>
      <div className="relative flex flex-col bg-cream p-4">
        <div className="flex items-center justify-center min-h-[300px] overflow-hidden rounded-md border border-gold/30 bg-black">
          <img
            src={getImageUrl(winner.imageUrl)}
            alt={winner.teamName}
            className="max-w-full max-h-[70vh] object-contain rounded-md"
          />
        </div>
        <div className="pt-3 text-center">
          <h3 className="font-display font-bold text-lg text-maroon">{winner.teamName}</h3>
          <p className="text-xs text-ink-mid">Captain: {winner.captain}</p>
        </div>
      </div>
    </Modal>
  );
};

export default Sports;
