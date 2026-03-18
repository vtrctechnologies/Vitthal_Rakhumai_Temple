import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Loader2,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  ExternalLink,
  Video,
  Share2,
  Copy,
  Check,
  ChevronDown,
  // New: Icons that evoke a spiritual/traditional feel (e.g., Diya/Lamp, Flute/Feather, Temple Structure)
  HeartHandshake, // For spiritual connection, or a simplified Diya/Lamp if available
  BookOpenText, // Generic program icon replacement
  Feather, // Represents Vithoba/Krishna's peacock feather
} from "lucide-react";
// Assuming the API imports remain the same
import { liveProgramsAPI, liveProgramCategoriesAPI } from "../../services/api";

import { motion } from "framer-motion";

// =========================================================================
//                             Program Card Component
// =========================================================================

const ProgramCard = ({
  program,
  getImageUrl,
  formatDate,
  formatTime,
  isUpcoming,
  isLive,
  handleSocialLinkClick,
  index,
  isHighlighted = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const socialLinks = program.socialLinks || {};

  const status = isLive(program.startTimestamp, program.endTimestamp)
    ? "live"
    : isUpcoming(program.startTimestamp)
      ? "upcoming"
      : "past";

  // New Copy logic to handle the delay/timeout
  const handleCopyShare = async (programId, title, description) => {
    const shareUrl = `${window.location.origin}/events/live-programs?program=${programId}`;
    const shareData = { title, text: description, url: shareUrl };

    // Standard logic for copying/sharing
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === "AbortError") return; // User cancelled
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <motion.div
      className={`
        bg-white rounded-xl shadow-lg border-t-4 overflow-hidden 
        transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]
        ${
          isHighlighted
            ? "border-amber-500 shadow-amber-500/50 ring-4 ring-amber-200 animate-pulse-subtle" // Highlight with warm amber color
            : "border-amber-100" // Subtle saffron border for unhighlighted
        }
      `}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ animationDuration: isHighlighted ? "2s" : "0s" }} // Control the subtle pulse speed
    >
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-amber-50">
        {program.thumbnailUrl && !imgError ? (
          <img
            src={getImageUrl(program.thumbnailUrl)}
            alt={program.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
            <Feather className="w-16 h-16 text-amber-300 opacity-75" />{" "}
            {/* Thematic Icon */}
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md
              ${
                status === "live"
                  ? "bg-red-600 text-white animate-pulse" // Red for Live/Flame
                  : status === "upcoming"
                    ? "bg-green-600 text-white" // Green for Upcoming/Tulsi Leaf
                    : "bg-stone-500 text-white" // Gray/Stone for Past
              }
            `}
          >
            {status === "live"
              ? "🔴 LIVE"
              : status === "upcoming"
                ? "Upcoming"
                : "Past"}
          </span>
          {program.isActive === false && ( // Check for explicit false or status !== live/upcoming
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500 text-stone-900 shadow-md">
              Archived
            </span>
          )}
        </div>

        {/* Year Badge - Bottom Right Corner */}
        <div className="absolute bottom-4 right-4">
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-700/80 backdrop-blur-sm text-white">
            {program.year || new Date(program.startTimestamp).getFullYear()}
          </span>
        </div>

        {/* Category Badge - Top Left Corner */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-amber-700 border border-amber-200">
            {typeof program.category === "object" && program.category?.name
              ? program.category.name
              : program.category || "General"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 line-clamp-2">
          {program.title}
        </h3>
        <p className="text-stone-700 text-sm mb-4 line-clamp-3">
          {program.description}
        </p>

        {/* Date & Time */}
        <div className="space-y-2 mb-4 pb-4 border-b border-amber-100">
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <Calendar size={16} className="text-amber-700" />
            <span className="font-medium">
              {formatDate(program.startTimestamp)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <Clock size={16} className="text-amber-700" />
            <span>
              {formatTime(program.startTimestamp)} -{" "}
              {formatTime(program.endTimestamp)}
            </span>
          </div>
        </div>

        {/* Social Links - Thematic Primary Color */}
        <div className="flex flex-wrap items-center gap-2">
          {socialLinks.youtube && (
            <button
              onClick={() => handleSocialLinkClick(socialLinks.youtube)}
              className="flex items-center gap-2 px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              title="Watch on YouTube"
            >
              <Youtube size={18} />
              <span>YouTube</span>
            </button>
          )}
          {socialLinks.facebook && (
            <button
              onClick={() => handleSocialLinkClick(socialLinks.facebook)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              title="Watch on Facebook"
            >
              <Facebook size={18} />
              <span>Facebook</span>
            </button>
          )}
          {/* ... other social links (Instagram, Twitter, etc. - keep their brand colors for familiarity) */}
          {socialLinks.other && (
            <button
              onClick={() => handleSocialLinkClick(socialLinks.other)}
              className="flex items-center gap-2 px-3 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              title="Open Link"
            >
              <ExternalLink size={18} />
              <span>Watch</span>
            </button>
          )}
          {/* ... No links message */}
        </div>

        {/* Share Button - Saffron/Gerua Theme */}
        <div className="mt-4 pt-4 border-t border-amber-100">
          <button
            onClick={() =>
              handleCopyShare(program._id, program.title, program.description)
            }
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {copied ? (
              <>
                <Check size={18} />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={18} />
                <span>Share Event</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// =========================================================================
//                             LivePrograms Component
// =========================================================================

const LivePrograms = () => {
  // --- State and Effect hooks remain the same ---
  const [searchParams, setSearchParams] = useSearchParams();
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [highlightedProgramId, setHighlightedProgramId] = useState(null);
  const programRefs = useRef({});
  const shouldSkipInitialFetch = useRef(false);

  // --- Utility functions (getImageUrl, formatDate, formatTime, isUpcoming, isLive, etc.) remain the same ---
  // ... (keeping them here for completeness in the file)
  useEffect(() => {
    fetchCategories();
    fetchAvailableYears();

    // Check if there's a shared program in URL
    const programId = searchParams.get("program");
    if (programId) {
      shouldSkipInitialFetch.current = true;
    }
  }, []);

  // Check for shared program ID in URL once years are loaded
  useEffect(() => {
    const programId = searchParams.get("program");
    if (
      programId &&
      availableYears.length > 0 &&
      shouldSkipInitialFetch.current
    ) {
      handleSharedProgram(programId);
    }
  }, [availableYears]);

  useEffect(() => {
    // Fetch programs when filters change
    // Skip if we're waiting to process a shared program
    if (!shouldSkipInitialFetch.current) {
      fetchPrograms();
    }
  }, [selectedCategory, selectedYear]);

  // Scroll to highlighted program after programs load
  useEffect(() => {
    if (highlightedProgramId && programs.length > 0) {
      setTimeout(() => {
        const element = programRefs.current[highlightedProgramId];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Remove highlight after scroll animation
          setTimeout(() => setHighlightedProgramId(null), 5000);
        }
      }, 500);
    }
  }, [highlightedProgramId, programs]);

  const handleSharedProgram = async (programId) => {
    try {
      // Fetch the specific program to get its year and category
      const response = await liveProgramsAPI.getLiveProgram(programId);
      if (response && response.status === "success" && response.data) {
        const program = response.data;

        // Set the correct year based on the shared program
        if (program.year) {
          // Ensure the year is in available years, if not, add it
          if (!availableYears.includes(program.year)) {
            setAvailableYears((prev) => {
              const updated = [...prev, program.year].sort((a, b) => b - a);
              return updated;
            });
          }
          setSelectedYear(program.year);
        }

        // Set the correct category based on the shared program
        if (program.category) {
          const categoryId =
            typeof program.category === "object"
              ? program.category._id
              : program.category;
          setSelectedCategory(categoryId);
        } else {
          // If no category, show all
          setSelectedCategory("all");
        }

        // Set highlighted program ID to scroll to it after programs load
        setHighlightedProgramId(programId);

        // Remove the program parameter from URL
        setSearchParams({}, { replace: true });

        // Allow fetching programs now that filters are set
        shouldSkipInitialFetch.current = false;

        // The useEffect for fetchPrograms will trigger automatically when year/category are set
        // But we need to trigger it manually since the state updates might not trigger the effect immediately
        setTimeout(() => {
          fetchPrograms();
        }, 100);
      }
    } catch (err) {
      console.error("Error fetching shared program:", err);
      // If program not found, just remove the parameter and fetch normally
      setSearchParams({}, { replace: true });
      shouldSkipInitialFetch.current = false;
      fetchPrograms();
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await liveProgramCategoriesAPI.getCategories();
      const categoriesList = extractCategories(response);
      setCategories(categoriesList);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Fallback to default categories if API fails
      setCategories([
        { _id: "sports", name: "Sports" },
        { _id: "dance", name: "Dance" },
        { _id: "music", name: "Music" },
        { _id: "cultural", name: "Cultural" },
        { _id: "religious", name: "Religious" },
        { _id: "other", name: "Other" },
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const extractCategories = (response) => {
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

  const fetchAvailableYears = async () => {
    try {
      const response = await liveProgramsAPI.getLiveProgramYears();
      if (response && response.status === "success" && response.data) {
        const years = Array.isArray(response.data) ? response.data : [];
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } else {
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear + 1, currentYear]);
        setSelectedYear(currentYear);
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear + 1, currentYear]);
      setSelectedYear(currentYear);
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all programs (active and inactive) so users can see old programs
      // We'll filter live/upcoming by selected year, but show all past programs
      const params = { active: "all" };
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      // Don't filter by year - we want all programs to show past programs from all years

      const response = await liveProgramsAPI.getLivePrograms(params);
      const programsList = extractPrograms(response);
      setPrograms(programsList);
    } catch (err) {
      console.error("Error fetching live programs:", err);
      setError("Unable to load live programs. Please try again later.");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const extractPrograms = (response) => {
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

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${baseUrl}${imageUrl}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isUpcoming = (startTimestamp) => {
    return new Date(startTimestamp) > new Date();
  };

  const isLive = (startTimestamp, endTimestamp) => {
    const now = new Date();
    const start = new Date(startTimestamp);
    const end = new Date(endTimestamp);
    return now >= start && now <= end;
  };

  const handleSocialLinkClick = (url) => {
    if (url && url.trim()) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // --- END OF UTILITY FUNCTIONS ---

  return (
    <div className="bg-yellow-50 font-sans py-28 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-4 p-3 bg-amber-100 rounded-full border-4 border-amber-300 shadow-lg">
            {/* Thematic Icon: Feather for Vithoba */}
            <Feather className="w-10 h-10 text-amber-700 mx-auto" />
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-700 mb-4">
            Live Programs & Events
          </h2>
          <p className="text-lg text-stone-700 max-w-2xl mx-auto">
            Experience our devotional and cultural events live. Join the stream
            for Kirtans, Bhajans, and Utsavs!
          </p>
        </motion.div>

        {/* Year & Category Filters */}
        <motion.div
          className="mb-10 space-y-6 p-6 bg-white rounded-xl shadow-lg border border-amber-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Year Filter - Enhanced Thematic Look */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-sm font-bold text-amber-700 uppercase tracking-wider whitespace-nowrap">
              Program Year:
            </span>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="pl-4 pr-10 py-2 border-2 border-amber-300 rounded-lg bg-amber-50 text-amber-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer hover:bg-amber-100 transition-colors"
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
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-800 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Category Filter - Thematic Buttons */}
          <div className="flex flex-wrap justify-center gap-3 border-t border-amber-50 pt-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md
                ${
                  selectedCategory === "all"
                    ? "bg-amber-700 text-white shadow-amber-700/50 scale-105" // Thematic primary color
                    : "bg-amber-50 text-stone-800 hover:bg-amber-100 border border-amber-200"
                }
              `}
            >
              <HeartHandshake size={18} /> {/* Thematic Icon */}
              All Programs
            </button>
            {categoriesLoading ? (
              <div className="flex items-center gap-2 px-4 py-2">
                <Loader2 className="animate-spin text-amber-400" size={18} />
                <span className="text-sm text-stone-500">
                  Loading categories...
                </span>
              </div>
            ) : (
              categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md
                    ${
                      selectedCategory === category._id
                        ? "bg-amber-700 text-white shadow-amber-700/50 scale-105" // Thematic primary color
                        : "bg-amber-50 text-stone-800 hover:bg-amber-100 border border-amber-200"
                    }
                  `}
                >
                  <BookOpenText size={18} /> {/* Thematic Icon */}
                  {category.name}
                </button>
              ))
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-stone-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Loader2 className="w-12 h-12 animate-spin text-amber-600 mb-4" />
            <p className="font-medium">Vithoba is preparing the stream...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            className="bg-red-100 border border-red-300 rounded-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Programs Grid */}
        {!loading && !error && (
          <>
            {programs.length === 0 ? (
              <motion.div
                className="bg-white rounded-xl shadow-lg border border-amber-200 p-16 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <Feather className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-stone-800 mb-2">
                  No Programs Scheduled
                </h3>
                <p className="text-stone-500">
                  {selectedCategory !== "all"
                    ? `No ${
                        categories
                          .find((c) => c._id === selectedCategory)
                          ?.name.toLowerCase() || ""
                      } programs available at this time. Please check the 'All Programs' section.`
                    : "There are currently no live or upcoming programs scheduled. Please check the archive below."}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Program Filtering Logic (remains the same) */}
                {(() => {
                  const livePrograms = programs.filter((program) => {
                    const status = isLive(
                      program.startTimestamp,
                      program.endTimestamp,
                    )
                      ? "live"
                      : isUpcoming(program.startTimestamp)
                        ? "upcoming"
                        : "past";
                    if (status === "live" || status === "upcoming") {
                      const programYear =
                        program.year ||
                        new Date(program.startTimestamp).getFullYear();
                      return programYear === selectedYear;
                    }
                    return false;
                  });

                  const pastPrograms = programs.filter((program) => {
                    const status = isLive(
                      program.startTimestamp,
                      program.endTimestamp,
                    )
                      ? "live"
                      : isUpcoming(program.startTimestamp)
                        ? "upcoming"
                        : "past";
                    return status === "past";
                  });

                  const pastProgramsByYear = pastPrograms.reduce(
                    (acc, program) => {
                      const year =
                        program.year ||
                        new Date(program.startTimestamp).getFullYear();
                      if (!acc[year]) {
                        acc[year] = [];
                      }
                      acc[year].push(program);
                      return acc;
                    },
                    {},
                  );

                  const sortedYears = Object.keys(pastProgramsByYear)
                    .map(Number)
                    .sort((a, b) => b - a);

                  // --- Live/Upcoming Programs Section ---
                  return (
                    <>
                      {livePrograms.length > 0 && (
                        <motion.div
                          className="mb-12"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6 }}
                        >
                          <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-700 mb-6 text-center border-b-2 border-amber-700/30 pb-2">
                            Live & Upcoming Darshan
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {livePrograms.map((program, idx) => (
                              <div
                                key={program._id || idx}
                                ref={(el) => {
                                  if (el && program._id) {
                                    programRefs.current[program._id] = el;
                                  }
                                }}
                              >
                                <ProgramCard
                                  program={program}
                                  getImageUrl={getImageUrl}
                                  formatDate={formatDate}
                                  formatTime={formatTime}
                                  isUpcoming={isUpcoming}
                                  isLive={isLive}
                                  handleSocialLinkClick={handleSocialLinkClick}
                                  index={idx}
                                  isHighlighted={
                                    highlightedProgramId === program._id
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Past Programs Section - Grouped by Year */}
                      {sortedYears.length > 0 && (
                        <motion.div
                          className="mt-12"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6 }}
                        >
                          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-8 text-center border-b-2 border-stone-900/30 pb-2">
                            Archive of Past Utsavs
                          </h2>
                          {sortedYears.map((year, yearIdx) => (
                            <motion.div
                              key={year}
                              className="mb-10 p-6 bg-white rounded-xl shadow-inner border-t-4 border-amber-300"
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.6,
                                delay: yearIdx * 0.1,
                              }}
                            >
                              <div className="flex items-center justify-between mb-6 border-b pb-3 border-amber-100">
                                <h3 className="text-xl md:text-2xl font-serif font-bold text-amber-800">
                                  {year} Darshan
                                </h3>
                                <span className="text-sm text-stone-500">
                                  {pastProgramsByYear[year].length}{" "}
                                  {pastProgramsByYear[year].length === 1
                                    ? "program"
                                    : "programs"}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pastProgramsByYear[year].map(
                                  (program, idx) => (
                                    <div
                                      key={program._id || idx}
                                      ref={(el) => {
                                        if (el && program._id) {
                                          programRefs.current[program._id] = el;
                                        }
                                      }}
                                    >
                                      <ProgramCard
                                        program={program}
                                        getImageUrl={getImageUrl}
                                        formatDate={formatDate}
                                        formatTime={formatTime}
                                        isUpcoming={isUpcoming}
                                        isLive={isLive}
                                        handleSocialLinkClick={
                                          handleSocialLinkClick
                                        }
                                        index={idx}
                                        isHighlighted={
                                          highlightedProgramId === program._id
                                        }
                                      />
                                    </div>
                                  ),
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LivePrograms;
