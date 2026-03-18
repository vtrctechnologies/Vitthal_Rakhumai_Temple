import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { eventsPageAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";

const EventsSection = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the API service to fetch events
        const response = await eventsPageAPI.getAllEvents({ upcoming: "true" });

        // Handle API response structure: { status: "success", data: [...] }
        let eventsData = [];
        if (
          response &&
          response.status === "success" &&
          Array.isArray(response.data)
        ) {
          eventsData = response.data;
        } else if (Array.isArray(response)) {
          eventsData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          eventsData = response.data;
        }

        // Filter for active events only and sort by date (earliest first)
        const activeEvents = eventsData
          .filter((event) => {
            // Only filter out if explicitly inactive
            return event.isActive !== false;
          })
          .sort((a, b) => {
            // Sort by date ascending (earliest first)
            if (!a.date || !b.date) return 0;
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
          })
          .slice(0, 4); // Take only 4 events

        setEvents(activeEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Unable to load events right now.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Reset scroll position to start when events are loaded or component mounts
  useEffect(() => {
    const resetScroll = () => {
      if (scrollContainerRef.current) {
        // Force scroll to the beginning
        scrollContainerRef.current.scrollLeft = 0;
      }
    };

    if (!loading) {
      // Reset immediately when events are loaded
      resetScroll();

      // Also reset after a short delay to ensure DOM is ready and override browser restore
      const timeoutId = setTimeout(resetScroll, 50);
      const timeoutId2 = setTimeout(resetScroll, 200);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(timeoutId2);
      };
    }
  }, [loading, events]);

  // Ensure scroll position is reset on component mount (before events load)
  useEffect(() => {
    // Reset scroll position on mount
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }

    // Prevent browser from restoring scroll position
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Reset after a short delay to override any browser restoration
    const timeoutId = setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = 0;
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      // Restore scroll restoration when component unmounts
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = window.innerWidth >= 768 ? 360 : 300; // md:w-[360px] or w-[300px]
      const gap = 24; // gap-6 = 1.5rem = 24px
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-stone-50 pt-10 md:pb-2 font-sans overflow-hidden relative">
      {/* Inline Styles for Hiding Scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-orange-500 rounded-full"></div>
              <span className="text-orange-600 font-bold tracking-wider text-sm uppercase">
                Temple Calendar
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-stone-800 font-serif leading-tight">
              Upcoming Events
            </h2>
            <p className="text-stone-600 mt-4 text-lg leading-relaxed">
              Join us in our upcoming utsavs, community services, and
              educational workshops. All are welcome to participate.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full border border-stone-300 bg-white text-stone-600 flex items-center justify-center hover:border-orange-500 hover:text-orange-600 hover:shadow-lg transition-all duration-300 group"
              aria-label="Scroll Left"
            >
              <ChevronLeft
                size={24}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full bg-stone-800 text-white flex items-center justify-center hover:bg-orange-600 shadow-lg hover:shadow-orange-200 transition-all duration-300 group"
              aria-label="Scroll Right"
            >
              <ChevronRight
                size={24}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </div>

        {/* Scroll Container */}
        {/* -mx-4 sm:-mx-6 lg:-mx-8 pulls the container to the edges of the screen on mobile for full-bleed scroll */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8 gap-6 snap-x snap-mandatory hide-scrollbar -mx-4 sm:-mx-6 lg:-mx-8 scroll-smooth"
          style={{ scrollBehavior: "smooth", scrollLeft: 0 }}
        >
          {/* Spacer div to align first item with container padding on large screens */}
          <div className="w-0 sm:w-0 lg:w-0 flex-shrink-0"></div>

          {(() => {
            console.log(
              "Render check - loading:",
              loading,
              "error:",
              error,
              "events:",
              events,
              "isArray:",
              Array.isArray(events),
              "length:",
              events?.length,
            );
            if (
              !loading &&
              !error &&
              Array.isArray(events) &&
              events.length > 0
            ) {
              return events.map((event) => {
                // Format date for display
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                });
                const formattedYear = eventDate.getFullYear();
                const formattedFullDate = eventDate.toLocaleDateString(
                  "en-US",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                );

                // Get image URL using utility function
                const imageUrl = getImageUrl(event.imageUrl);

                return (
                  <div
                    key={event._id || event.id}
                    className="snap-center flex-shrink-0 w-[300px] md:w-[360px] bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                  >
                    {/* Image Area */}
                    <div className="h-48 bg-stone-200 relative overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                          style={{ transform: "translateZ(0)" }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center bg-stone-200 ${imageUrl ? "hidden" : ""}`}
                      >
                        <Calendar className="w-12 h-12 text-stone-400" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded-lg text-xs font-bold text-orange-700 uppercase tracking-wide shadow-sm border border-orange-100">
                        {event.status || "upcoming"}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex-1 flex flex-col relative">
                      {/* Date Flag */}
                      <div className="absolute -top-8 right-6 bg-white shadow-lg rounded-xl p-2 text-center min-w-[70px] border border-stone-50">
                        <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider">
                          {formattedYear}
                        </span>
                        <span className="block text-lg font-bold text-orange-600 leading-none font-serif">
                          {formattedDate}
                        </span>
                      </div>

                      <div className="mt-2">
                        <h3 className="text-xl font-bold text-stone-800 font-serif mb-3 leading-tight group-hover:text-orange-700 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-stone-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="mt-auto pt-4 border-t border-stone-100 flex flex-col gap-2">
                        <div className="flex items-center text-xs font-medium text-stone-500">
                          <Calendar
                            size={14}
                            className="mr-2 text-orange-400"
                          />
                          {formattedFullDate}
                        </div>
                        <div className="flex items-center text-xs font-medium text-stone-500">
                          <Clock size={14} className="mr-2 text-orange-400" />
                          {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center text-xs font-medium text-stone-500">
                            <MapPin
                              size={14}
                              className="mr-2 text-orange-400"
                            />
                            <span className="line-clamp-1">
                              {event.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            }
            return null;
          })()}

          {/* Loading / Error / Empty states */}
          {loading && (
            <div className="flex items-center justify-center w-full text-stone-500">
              Loading events...
            </div>
          )}
          {!loading && error && (
            <div className="flex items-center justify-center w-full text-red-500">
              {error}
            </div>
          )}
          {!loading &&
            !error &&
            (!Array.isArray(events) || events.length === 0) && (
              <div className="flex items-center justify-center w-full text-stone-500">
                No upcoming events yet. Please check back soon.
              </div>
            )}

          {/* "View All" Card at the end */}
          <div
            onClick={() => navigate("/events#calendar")}
            className="snap-center flex-shrink-0 w-[250px] bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center text-center p-6 hover:bg-orange-100 hover:border-orange-300 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-orange-600 mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
              <Calendar size={32} />
            </div>
            <h3 className="font-bold text-xl text-stone-800 font-serif mb-2">
              View Full Calendar
            </h3>
            <p className="text-sm text-stone-500 mb-6 px-4">
              Browse all upcoming events for the year 2026
            </p>
            <button className="flex items-center gap-2 text-sm font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
              Open Calendar <ArrowRight size={16} />
            </button>
          </div>

          {/* End Spacer */}
          <div className="w-4 sm:w-6 lg:w-8 flex-shrink-0"></div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
