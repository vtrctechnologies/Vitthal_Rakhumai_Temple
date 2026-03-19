import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, User, Loader2 } from "lucide-react";
import { getImageUrl } from "../utils/imageUrl";

/* --- 1. FONTS & GLOBAL STYLES --- */
const GlobalStyles = () => (
  <style>{`
    /* Fonts loaded asynchronously via index.html - no @import here to avoid blocking */

    .font-serif { font-family: 'Crimson Pro', 'Playfair Display', serif; }
    .font-sans { font-family: 'Inter', 'Poppins', sans-serif; }

    .bg-texture {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
    }

    .ornament-divider {
      background-image: linear-gradient(to right, transparent, #F97316, transparent);
      height: 1px;
      width: 100%;
      opacity: 0.3;
    }
  `}</style>
);

/* --- 2. HELPERS --- */

/* --- 3. SUB-COMPONENTS --- */

const DecorativeHeading = ({ title, subtitle }) => (
  <div className="text-center mb-12 relative z-10">
    <div className="flex items-center justify-center gap-3 mb-3 opacity-60">
      <div className="h-px w-8 sm:w-16 bg-linear-to-r from-transparent to-orange-400"></div>
      <div className="w-2 h-2 rotate-45 border border-orange-500 bg-orange-100"></div>
      <div className="h-px w-8 sm:w-16 bg-linear-to-l from-transparent to-orange-400"></div>
    </div>
    <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 tracking-wide mb-3">
      {title}
    </h3>
    {subtitle && (
      <p className="text-gray-500 font-sans text-sm md:text-base max-w-lg mx-auto leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

const MemberCard = ({ name, role, image }) => {
  // Simple error handling state in case the constructed URL is still invalid
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative w-56 sm:w-64 shrink-0 cursor-default perspective-1000">
      {/* Card Border/Frame Effect */}
      <div className="absolute -inset-1.5 bg-linear-to-b from-orange-200 to-transparent rounded-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div className="relative h-88 overflow-hidden rounded-3xl bg-white shadow-md border border-stone-100 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl">
        {/* Image Container */}
        <div className="h-[75%] w-full relative overflow-hidden bg-orange-50">
          {image && !imgError ? (
            <img
              src={image}
              alt={name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              draggable="false"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[#FFF8F0] text-orange-200">
              <User size={64} strokeWidth={1.5} />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
        </div>

        {/* Text Content */}
        <div className="absolute bottom-0 w-full h-[30%] bg-white flex flex-col items-center justify-center px-4 pb-2 text-center border-t border-orange-100/50">
          {/* Decorative little top notch */}
          <div className="absolute -top-4 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-orange-100 shadow-sm">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
          </div>

          <h4 className="font-serif text-lg font-bold text-gray-800 leading-tight mt-2 line-clamp-1 group-hover:text-orange-700 transition-colors">
            {name}
          </h4>
          <span className="inline-block w-8 h-0.5 bg-orange-200 my-2 rounded-full" />
          <p className="font-sans text-xs font-semibold text-orange-600 uppercase tracking-widest">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
};

const CarouselSection = ({ title, description, members, loading, error }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="mb-24 last:mb-0 relative">
      <DecorativeHeading title={title} subtitle={description} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        {/* Navigation Buttons */}
        <div className="hidden md:block">
          <button
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
            className={`absolute left-0 top-[40%] -translate-y-1/2 -ml-4 lg:-ml-12 z-20 w-12 h-12 rounded-full border border-orange-100 bg-white shadow-lg flex items-center justify-center text-orange-600 transition-all duration-300 hover:bg-orange-50 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none`}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
            className={`absolute right-0 top-[40%] -translate-y-1/2 -mr-4 lg:-mr-12 z-20 w-12 h-12 rounded-full border border-orange-100 bg-white shadow-lg flex items-center justify-center text-orange-600 transition-all duration-300 hover:bg-orange-50 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none`}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Carousel Viewport */}
        <div className="overflow-hidden py-4 -my-4" ref={emblaRef}>
          <div className="flex gap-6 sm:gap-8 px-2">
            {loading ? (
              // Skeleton Loading
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="shrink-0 w-56 sm:w-64 h-88 rounded-3xl bg-stone-100 animate-pulse flex items-center justify-center border border-stone-200"
                  >
                    <Loader2 className="animate-spin text-stone-300" />
                  </div>
                ))
            ) : error ? (
              <div className="w-full text-center py-12 text-red-400 bg-red-50 rounded-xl border border-red-100">
                {error}
              </div>
            ) : members?.length === 0 ? (
              <div className="w-full text-center py-12 text-stone-400 italic">
                No members found for this committee.
              </div>
            ) : (
              members.map((member, idx) => (
                <MemberCard
                  key={`${member._id}-${idx}`}
                  name={member.name}
                  role={member.role}
                  // Fix: Use the helper to construct full URL
                  image={getImageUrl(member.imageUrl)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- 4. MAIN COMPONENT --- */

const CommitteeMembers = () => {
  const [data, setData] = useState({ register: [], utsav: [], mahila: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Defer API calls to reduce initial blocking time
    const fetchMembers = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

        // Fetch all three committees - use AbortController for better performance
        const controller = new AbortController();
        const signal = controller.signal;

        const [registerRes, utsavRes, mahilaRes] = await Promise.all([
          fetch(`${baseUrl}/committee?committeeType=register`, { signal }),
          fetch(`${baseUrl}/committee?committeeType=utsav`, { signal }),
          fetch(`${baseUrl}/committee?committeeType=mahila`, { signal }),
        ]);

        if (!registerRes.ok || !utsavRes.ok || !mahilaRes.ok)
          throw new Error("Failed to load committee members");

        // Parse JSON in parallel
        const [rData, uData, mData] = await Promise.all([
          registerRes.json(),
          utsavRes.json(),
          mahilaRes.json(),
        ]);

        setData({
          register: rData.data || rData || [],
          utsav: uData.data || uData || [],
          mahila: mData.data || mData || [],
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          setError("Unable to load committee members.");
          setData({ register: [], utsav: [], mahila: [] });
        }
      } finally {
        setLoading(false);
      }
    };

    // Defer fetching until component is in view or after a short delay
    if ("requestIdleCallback" in window) {
      requestIdleCallback(fetchMembers, { timeout: 2000 });
    } else {
      setTimeout(fetchMembers, 100);
    }
  }, []);

  return (
    <section className="relative min-h-screen bg-[#FFFCF5] overflow-hidden font-sans pb-20">
      <GlobalStyles />

      {/* Background Pattern Layer */}
      <div className="absolute inset-0 z-0 bg-texture opacity-60 pointer-events-none" />
      <div
        className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(#F97316 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      ></div>

      {/* Decorative Top Banner */}
      <div className="w-full h-2 bg-linear-to-r from-orange-400 via-red-500 to-orange-400 relative z-20" />

      {/* Main Header */}
      <div className="relative pt-20 pb-12 text-center z-10 px-4">
        <div className="inline-block mb-4">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            className="text-orange-500 mx-auto opacity-80"
          >
            <path
              d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
          Our Committee
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 font-serif italic">
          "Dedicated souls weaving the fabric of our community through service,
          tradition, and devotion."
        </p>
      </div>

      {/* Content Container */}
      <div className="max-w-360 mx-auto relative z-10 px-4">
        <CarouselSection
          title="Register Committee"
          description="The pillars of our governance, ensuring transparency and operational excellence."
          members={data.register}
          loading={loading}
          error={error}
        />

        {/* Ornamental Divider */}
        <div className="max-w-xs mx-auto my-4 opacity-30">
          <svg
            viewBox="0 0 100 20"
            className="w-full text-orange-400 fill-current"
          >
            <path d="M50 10 C 30 10 20 20 0 20 L 0 18 C 20 18 30 8 50 8 C 70 8 80 18 100 18 L 100 20 C 80 20 70 10 50 10 Z" />
          </svg>
        </div>

        <CarouselSection
          title="Utsav Committee"
          description="Orchestrating divine celebrations and keeping our vibrant traditions alive."
          members={data.utsav}
          loading={loading}
          error={error}
        />

        {/* Ornamental Divider */}
        <div className="max-w-xs mx-auto my-4 opacity-30">
          <svg
            viewBox="0 0 100 20"
            className="w-full text-orange-400 fill-current"
          >
            <path d="M50 10 C 30 10 20 20 0 20 L 0 18 C 20 18 30 8 50 8 C 70 8 80 18 100 18 L 100 20 C 80 20 70 10 50 10 Z" />
          </svg>
        </div>

        <CarouselSection
          title="Mahila Mandal"
          description="The strength of our community, empowering women through spiritual union."
          members={data.mahila}
          loading={loading}
          error={error}
        />
      </div>

      {/* Footer Decoration */}
      <div className="w-full h-24 bg-linear-to-t from-orange-100/50 to-transparent absolute bottom-0 z-0" />
    </section>
  );
};

export default CommitteeMembers;
