import React, { useState, useEffect } from "react";
import { Trophy, ChevronDown, Medal, Users, Loader2, X } from "lucide-react";
import { sportsAPI } from "../../services/api";
import Modal from "@/components/base/Modal";

import { motion } from "framer-motion";

const Sports = () => {
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

  // --- SCROLL LOCK EFFECT (For Modals) ---
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
    <div className="bg-stone-50 font-sans py-20 text-stone-800 overflow-x-hidden">
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Filter & Controls */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-stone-200"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-sm font-bold text-red-900 uppercase tracking-wider">
              Select Year:
            </span>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="pl-4 pr-10 py-2 border-2 border-red-100 rounded-lg bg-red-50 text-red-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none cursor-pointer hover:bg-red-100 transition-colors"
              >
                {availableYears.length > 0 ? (
                  availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))
                ) : (
                  <option value={new Date().getFullYear()}>
                    {new Date().getFullYear()}
                  </option>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-red-800 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <span className="text-sm text-stone-500 flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading Data...
              </span>
            ) : sports.length > 0 ? (
              <span className="text-sm font-medium text-stone-600">
                Showing{" "}
                <strong className="text-red-900">{sports.length}</strong> Events
              </span>
            ) : null}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-stone-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
            <p className="font-medium">Retrieving tournament data...</p>
          </motion.div>
        )}

        {/* No Sports State */}
        {!loading && sports.length === 0 && (
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-stone-200 p-16 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">
              No Events Found
            </h3>
            <p className="text-stone-500">
              No sports data available for {selectedYear}.
            </p>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        {!loading && sports.length > 0 && (
          <motion.div
            className="border-b border-stone-200"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar scroll-smooth">
              {sports.map((sport) => (
                <button
                  key={sport._id}
                  onClick={() => {
                    setActiveTab(sport._id);
                    setExpandedList(null);
                  }}
                  className={`
                    whitespace-nowrap px-5 py-3 rounded-t-lg text-sm md:text-base font-bold transition-all duration-200 border-t-2 border-x-2
                    ${
                      activeTab === sport._id
                        ? "bg-red-900 text-amber-400 border-red-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                        : "bg-white text-stone-500 border-transparent hover:bg-red-50 hover:text-red-800"
                    }
                  `}
                >
                  {sport.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {currentSport && (
          <div className="space-y-10">
            {/* Hero Section */}
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-red-900 via-red-800 to-red-950 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {currentSport.imageUrl && (
                <div className="absolute inset-0">
                  <img
                    src={getImageUrl(currentSport.imageUrl)}
                    alt={currentSport.name}
                    className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 to-transparent"></div>
                </div>
              )}

              <div className="relative p-8 md:p-14 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 text-amber-400 mb-4 font-bold tracking-widest text-xs uppercase">
                  <span className="w-8 h-[1px] bg-amber-400"></span>
                  Tournament Event
                  <span className="w-8 h-[1px] bg-amber-400"></span>
                </div>

                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-md">
                  {currentSport.title}
                </h2>

                {currentSport.description && (
                  <p className="text-red-100/80 max-w-2xl text-lg leading-relaxed">
                    {currentSport.description}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Podium Section */}
            <div className="relative">
              {/* Section Title */}
              <motion.div
                className="flex items-center justify-center mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-amber-100 flex items-center gap-3">
                  <Medal className="text-amber-500 fill-amber-100" size={24} />
                  <span className="font-serif font-bold text-xl text-red-950">
                    Victory Podium
                  </span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto">
                {/* 2nd Place */}
                <WinnerCard
                  winner={winners.second}
                  position="second"
                  expanded={expandedList === "second"}
                  onToggle={() => toggleList("second")}
                  onViewMembers={() => setShowMembersModal(winners.second)}
                  onViewImage={() =>
                    winners.second?.imageUrl &&
                    setShowImageModal(winners.second)
                  }
                />

                {/* 1st Place */}
                <WinnerCard
                  winner={winners.first}
                  position="first"
                  expanded={expandedList === "first"}
                  onToggle={() => toggleList("first")}
                  onViewMembers={() => setShowMembersModal(winners.first)}
                  onViewImage={() =>
                    winners.first?.imageUrl && setShowImageModal(winners.first)
                  }
                />

                {/* 3rd Place */}
                <WinnerCard
                  winner={winners.third}
                  position="third"
                  expanded={expandedList === "third"}
                  onToggle={() => toggleList("third")}
                  onViewMembers={() => setShowMembersModal(winners.third)}
                  onViewImage={() =>
                    winners.third?.imageUrl && setShowImageModal(winners.third)
                  }
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
        />
      )}

      {/* Winner Image Modal */}
      {showImageModal && (
        <WinnerImageModal
          winner={showImageModal}
          onClose={() => setShowImageModal(null)}
        />
      )}
    </div>
  );
};

// Winner Card Component
const WinnerCard = ({
  winner,
  position,
  expanded,
  onToggle,
  onViewMembers,
  onViewImage,
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
      label: "Champion",
      containerClass:
        "bg-gradient-to-b from-amber-50 to-white border-amber-400 ring-4 ring-amber-400/20 z-10",
      height: "min-h-[340px]",
      badge: "bg-amber-500 text-white border-amber-600 shadow-amber-200",
      trophyColor: "text-amber-500 drop-shadow-sm",
      order: "order-1 md:order-2 md:-mt-12 mb-8 md:mb-0",
      imageSize: "w-28 h-28 ring-4 ring-amber-200",
      initial: { opacity: 0, scale: 0.9 },
      whileInView: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay: 0 },
    },
    second: {
      label: "Runner Up",
      containerClass: "bg-white border-stone-200",
      height: "min-h-[280px]",
      badge: "bg-stone-600 text-white border-stone-700",
      trophyColor: "text-stone-400",
      order: "order-2 md:order-1",
      imageSize: "w-20 h-20 ring-4 ring-stone-100",
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.1 },
    },
    third: {
      label: "Third Place",
      containerClass: "bg-white border-orange-200",
      height: "min-h-[280px]",
      badge: "bg-orange-700 text-white border-orange-800",
      trophyColor: "text-orange-600",
      order: "order-3 md:order-3",
      imageSize: "w-20 h-20 ring-4 ring-orange-100",
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.2 },
    },
  };

  const config = positionConfig[position];

  if (!winner) {
    return (
      <motion.div
        className={`${config.order} flex flex-col`}
        initial={config.initial}
        whileInView={config.whileInView}
        viewport={{ once: true }}
        transition={config.transition}
      >
        <div
          className={`relative rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/50 p-6 flex flex-col items-center justify-center ${config.height}`}
        >
          <div className="w-16 h-16 bg-stone-200 rounded-full mb-3 flex items-center justify-center text-stone-400">
            <Users size={24} />
          </div>
          <span className="text-stone-400 font-medium text-sm">
            Position Vacant
          </span>
        </div>
      </motion.div>
    );
  }

  const members = winner.members
    ? winner.members.map((m) => (typeof m === "string" ? m : m.name))
    : [];

  return (
    <motion.div
      className={`${config.order} flex flex-col group`}
      initial={config.initial}
      whileInView={config.whileInView}
      viewport={{ once: true }}
      transition={config.transition}
    >
      <div
        className={`
        relative rounded-xl shadow-lg border ${config.containerClass} 
        p-6 flex flex-col items-center justify-between transition-transform duration-300 hover:-translate-y-1
        ${position === "first" ? "shadow-amber-900/10" : "shadow-stone-900/5"}
      `}
      >
        {/* Badge */}
        <div
          className={`absolute -top-4 ${config.badge} px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border`}
        >
          {config.label}
        </div>

        {/* Content Wrapper */}
        <div className="w-full flex flex-col items-center pt-6">
          {/* Image */}
          <div
            className={`relative mb-4 rounded-full overflow-hidden bg-stone-100 flex-shrink-0 cursor-pointer ${config.imageSize}`}
            onClick={onViewImage}
          >
            {winner.imageUrl ? (
              <img
                src={getImageUrl(winner.imageUrl)}
                alt={winner.teamName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            {/* Fallback Icon */}
            <div
              className={`absolute inset-0 flex items-center justify-center bg-stone-100 ${
                winner.imageUrl ? "hidden" : "flex"
              }`}
            >
              <Trophy
                className={config.trophyColor}
                size={position === "first" ? 40 : 32}
              />
            </div>
          </div>

          <h3 className="font-serif font-bold text-xl text-stone-800 text-center leading-tight mb-2">
            {winner.teamName}
          </h3>

          <p className="text-sm text-stone-500 font-medium mb-6">
            <span className="text-stone-400 mr-1">Captain:</span>
            <span className="text-red-900">{winner.captain}</span>
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full mt-auto">
          <button
            onClick={members.length > 0 ? onViewMembers : onToggle}
            className={`
                w-full py-2.5 px-4 rounded-lg flex items-center justify-between text-sm font-medium transition-colors
                ${
                  position === "first"
                    ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200"
                }
            `}
          >
            <span>{members.length > 0 ? "View Squad" : "No Members"}</span>
            {members.length > 0 && (
              <span className="bg-white/50 px-2 py-0.5 rounded text-xs">
                {members.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Team Members Modal Component
const TeamMembersModal = ({ winner, onClose }) => {
  if (!winner) return null;

  const members = winner.members
    ? winner.members.map((m) => (typeof m === "string" ? m : m.name))
    : [];

  return (
    <Modal
      isOpen={!!winner}
      onClose={onClose}
      title={winner.teamName}
    >
      <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
        <div className="space-y-2">
          {members.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <Users size={48} className="mx-auto mb-2 opacity-20" />
              <p>No team members listed</p>
            </div>
          ) : (
            members.map((member, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-white border border-stone-200 rounded-lg hover:border-amber-300 hover:shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-900 flex items-center justify-center text-sm font-bold border border-red-100 group-hover:bg-red-900 group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                <div className="flex-1 font-medium text-stone-700">
                  {member}
                  {(member === winner.captain ||
                    (typeof member === "string" &&
                      member.includes(winner.captain))) && (
                    <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                      CPT
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

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
    <Modal
      isOpen={!!winner}
      onClose={onClose}
      title={winner.teamName}
    >
        <div className="relative flex flex-col h-full max-h-[90vh]">
          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center min-h-[400px] overflow-hidden relative">
            <img
              src={getImageUrl(winner.imageUrl)}
              alt={winner.teamName}
              className="max-w-full max-h-[80vh] object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                const errorDiv = e.target.nextSibling;
                if (errorDiv) errorDiv.style.display = "flex";
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center text-white/50">
              <p>Image load failed</p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white p-4 shrink-0 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-red-950 font-serif">
                {winner.teamName}
              </h3>
              <p className="text-sm text-stone-500">
                Captain: {winner.captain}
              </p>
            </div>
            <div className="flex gap-2">
              {winner.position === "first" && (
                <Medal className="text-amber-500" />
              )}
              {winner.position === "second" && (
                <Medal className="text-stone-400" />
              )}
              {winner.position === "third" && (
                <Medal className="text-orange-600" />
              )}
            </div>
          </div>
        </div>
    </Modal>
  );
};

export default Sports;
