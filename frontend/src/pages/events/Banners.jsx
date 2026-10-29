import React, { useState, useEffect } from "react";
import {
  Download,
  Maximize2,
  X,
  Calendar,
  Loader2,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import { bannerAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { openSafeUrl } from "@/utils/urlSecurity";

const Banners = () => {
  const [banners, setBanners] = useState({
    hero: null,
    "top-right": null,
    "middle-right": null,
    "bottom-right": null,
  });
  const [loading, setLoading] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchAvailableYears();
        await fetchBanners();
      } catch (err) {
        setError(
          "Unable to connect to the temple server. Please try again later."
        );
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (availableYears.length > 0) {
      fetchBanners();
    }
  }, [selectedYear]);

  const fetchAvailableYears = async () => {
    try {
      const response = await bannerAPI.getBannerYears();
      const yearsData = response?.data || (Array.isArray(response) ? response : []);
      if (Array.isArray(yearsData) && yearsData.length > 0) {
        setAvailableYears(yearsData);
        const currentYear = new Date().getFullYear();
        if (yearsData.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else {
          setSelectedYear(yearsData[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching banner years:", error);
    }
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setIsAnimating(true);
      const response = await bannerAPI.getBanners({
        active: "true",
        year: selectedYear.toString(),
      });

      const bannersList = response?.data || (Array.isArray(response) ? response : []);

      if (Array.isArray(bannersList)) {
        const groupedBanners = {
          hero: null,
          "top-right": null,
          "middle-right": null,
          "bottom-right": null,
        };

        bannersList.forEach((banner) => {
          if (banner.position && groupedBanners[banner.position] === null) {
            groupedBanners[banner.position] = banner;
          }
        });

        setBanners(groupedBanners);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError("Failed to load holy glimpses.");
    } finally {
      setLoading(false);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleBannerClick = (banner) => {
    const hasLink = banner.link && banner.link.trim() !== "";
    if (hasLink) {
      openSafeUrl(banner.link);
    } else {
      setSelectedBanner(banner);
      setShowModal(true);
    }
  };

  const handleDownload = async (e, banner) => {
    e.stopPropagation();
    try {
      const imageUrl = getImageUrl(banner.imageUrl);
      if (!imageUrl) return;

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${
        banner.title || "vitthal-darshan"
      }-${selectedYear}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading:", error);
      const imageUrl = getImageUrl(banner.imageUrl);
      if (imageUrl) openSafeUrl(imageUrl);
    }
  };

  const BannerCard = ({ banner, position, className }) => {
    if (!banner) {
      return (
        <div
          className={`${className} group relative rounded-xl overflow-hidden bg-amber-50 border-2 border-dashed border-amber-200 flex flex-col items-center justify-center p-4`}
        >
          <div className="text-amber-300 mb-2">
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mx-auto opacity-50" />
          </div>
          <p className="text-amber-700 text-xs sm:text-sm font-medium text-center">
            Darshan Coming Soon
          </p>
        </div>
      );
    }

    const imageUrl = getImageUrl(banner.imageUrl);

    return (
      <div
        onClick={() => handleBannerClick(banner)}
        className={`${className} group relative rounded-xl overflow-hidden cursor-pointer bg-stone-900 shadow-xl shadow-amber-900/10 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-900/20 hover:-translate-y-1 ring-1 ring-amber-900/5`}
      >
        {/* Image */}
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          {/* Gradient Overlay - Reduced initial opacity for better visibility of bottom content */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/50 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
        </div>

        {/* Decorative Border Frame */}
        <div className="absolute inset-0 border border-white/10 m-2 rounded-lg pointer-events-none group-hover:border-amber-400/30 transition-colors duration-500" />

        {/* Content */}
        <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end z-10">
          {/* Tag - Slides in from top of title */}
          <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 opacity-0 group-hover:max-h-8 group-hover:opacity-100 mb-2">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 sm:w-8 bg-amber-500"></span>
              <span className="text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                Jay Hari
              </span>
            </div>
          </div>

          {/* Title - Always visible at bottom, slides up when content below expands */}
          {banner.title && (
            <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-wide leading-tight drop-shadow-sm line-clamp-2 transition-transform duration-500">
              {banner.title}
            </h3>
          )}

          {/* Hidden Content (Description & Buttons) - Expands up from bottom */}
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
            <div className="overflow-hidden">
              <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                {banner.description && (
                  <p className="text-amber-100/80 text-xs sm:text-sm line-clamp-2 font-medium mb-4">
                    {banner.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pb-1">
                  <button
                    onClick={(e) => handleDownload(e, banner)}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-amber-900/20"
                  >
                    <Download className="w-3 h-3" />
                    Seva
                  </button>
                  <button className="p-1.5 sm:p-2 bg-stone-800/50 hover:bg-stone-800 text-amber-100 rounded-full transition-colors backdrop-blur-sm border border-white/10">
                    <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-stone-800 font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Decorative Background Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Top Gradient */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-100/50 to-transparent pointer-events-none" />

      <main className="relative pt-20 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-16 relative">
          {/* Decorative Tilak Icon */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-32 h-32 text-amber-500 filter drop-shadow-lg"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />

                <circle cx="12" cy="9" r="3.5" className="text-[#2a1208]" />
              </svg>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
            Shree Vitthal Rakhumai Mandir
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-stone-900 mb-3 sm:mb-4 leading-tight">
            Event <span className="text-amber-700">Banners</span>
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-stone-600 leading-relaxed italic px-4">
            "Mauli Mauli Roop Tujhe" - Relive the divine moments of the Varkari
            tradition.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-8 sm:mb-12">
          {availableYears.length > 0 && (
            <div className="relative inline-flex items-center bg-white p-2 rounded-full shadow-xl shadow-amber-900/5 border border-amber-100/50 ring-1 ring-amber-50 max-w-[90vw] sm:max-w-xs w-full">
              <div className="absolute left-5 z-10 text-amber-600">
                <Calendar className="w-5 h-5" />
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="appearance-none bg-transparent pl-12 pr-10 py-2.5 sm:py-3 rounded-full text-stone-700 font-medium focus:outline-none cursor-pointer hover:bg-amber-50/50 transition-colors text-base sm:text-lg w-full truncate"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 z-0 pointer-events-none text-amber-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 max-w-lg mx-auto">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 sm:h-96">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-20"></div>
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600 animate-spin relative z-10" />
            </div>
            <p className="text-amber-800 font-medium mt-6 animate-pulse">
              Loading Divine Glimpses...
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[250px] sm:auto-rows-[280px] transition-opacity duration-500 ${
              isAnimating ? "opacity-50" : "opacity-100"
            }`}
          >
            {/* Hero Banner (Left Side - Tall) */}
            {/* Mobile: Standard height, Desktop: Tall span */}
            <BannerCard
              banner={banners.hero}
              position="hero"
              className="md:col-span-2 lg:col-span-2 col-span-1 row-span-1 md:row-span-2 lg:row-span-3 "
            />

            {/* Side Banners */}
            <BannerCard
              banner={banners["top-right"]}
              position="top-right"
              className="md:col-span-1 lg:col-span-1"
            />

            <BannerCard
              banner={banners["middle-right"]}
              position="middle-right"
              className="md:col-span-1 lg:col-span-1"
            />

            <BannerCard
              banner={banners["bottom-right"]}
              position="bottom-right"
              className="md:col-span-1 lg:col-span-1"
            />
          </div>
        )}
      </main>

      {/* Custom Modal/Dialog */}
      {showModal && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-stone-900/95 backdrop-blur-md transition-opacity"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-5xl bg-[#FFF8F0] rounded-2xl overflow-hidden shadow-2xl transform transition-all scale-100 flex flex-col max-h-[85vh] sm:max-h-[90vh] border border-amber-100">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-amber-100 bg-white/50 backdrop-blur-sm">
              <div className="pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-amber-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    Jay Hari Vitthal
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-stone-900 line-clamp-1">
                  {selectedBanner.title || "Banner Preview"}
                </h2>
                {selectedBanner.description && (
                  <p className="text-stone-500 text-xs sm:text-sm mt-1 italic line-clamp-1 sm:line-clamp-2">
                    {selectedBanner.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={(e) => handleDownload(e, selectedBanner)}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm font-bold tracking-wide transition-colors shadow-lg shadow-amber-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Prasad (Save)</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div className="relative flex-1 bg-stone-100/50 flex items-center justify-center p-2 sm:p-4 overflow-auto">
              <div className="relative shadow-2xl shadow-stone-900/10 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(selectedBanner.imageUrl)}
                  alt={selectedBanner.title}
                  className="max-w-full max-h-[50vh] sm:max-h-[65vh] w-auto h-auto object-contain bg-white"
                />
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="sm:hidden p-4 border-t border-amber-100 bg-white flex justify-center">
              <button
                onClick={(e) => handleDownload(e, selectedBanner)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm font-bold w-full justify-center shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download Prasad</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
