import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { eventsPageAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

const EventsSection = () => {
  const { isMarathi } = useLanguage();
  const scrollContainerRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await eventsPageAPI.getAllEvents({ upcoming: "true", limit: 6 });

        let eventsData = [];
        if (response && Array.isArray(response.data)) {
          eventsData = response.data;
        } else if (Array.isArray(response)) {
          eventsData = response;
        } else if (response && response.events && Array.isArray(response.events)) {
          eventsData = response.events;
        }

        const activeEvents = eventsData
          .filter((event) => event.isActive !== false)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setEvents(activeEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(isMarathi ? "कार्यक्रमांची माहिती मिळू शकली नाही." : "Unable to load events at this time.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [isMarathi]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-stone/30 rounded-xl border border-gold/20">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-saffron rounded-full animate-spin mb-4" />
        <p className="font-body italic text-maroon/60">
          {isMarathi ? "पवित्र दिनदर्शिका लोड होत आहे..." : "Loading sacred calendar..."}
        </p>
      </div>
    );
  }

  if (error || events.length === 0) {
    return (
      <div className="text-center py-16 bg-cream-dk/30 rounded-xl border border-gold/10">
        <Calendar size={48} className="mx-auto text-gold/40 mb-4" />
        <p className="text-xl font-serif text-maroon/70">
          {error || (isMarathi ? "सध्या कोणतेही आगामी कार्यक्रम नाहीत." : "No upcoming events scheduled at the moment.")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full bg-cream border-2 border-gold text-maroon shadow-lg flex items-center justify-center transition-all hover:bg-gold hover:text-white opacity-0 group-hover:opacity-100 hidden md:flex"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full bg-cream border-2 border-gold text-maroon shadow-lg flex items-center justify-center transition-all hover:bg-gold hover:text-white opacity-0 group-hover:opacity-100 hidden md:flex"
      >
        <ChevronRight size={24} />
      </button>

      {/* Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-8 pt-3 pb-12 px-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {events.map((event, index) => {
          const eventDate = new Date(event.date);
          const day = eventDate.getDate();
          const month = eventDate.toLocaleDateString(isMarathi ? "mr-IN" : "en-US", { month: "short" });
          
          return (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-[320px] md:w-[380px] snap-center"
            >
              <Link 
                to={`/events/${event._id}`}
                className="block group/card relative border-2 border-gold rounded-sm p-1.5 sm:p-2 bg-cream-dk shadow-sm hover:shadow-xl transition-shadow duration-500"
              >
                {/* Sacred 4-Corner Saffron Frame Brackets */}
                <span className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-4 border-l-4 border-saffron z-20 pointer-events-none" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-4 border-r-4 border-saffron z-20 pointer-events-none" />
                <span className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-4 border-l-4 border-saffron z-20 pointer-events-none" />
                <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-4 border-r-4 border-saffron z-20 pointer-events-none" />

                <div className="border border-saffron-lt/60 rounded-sm overflow-hidden bg-white relative">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden bg-stone-100">
                  <img
                    src={getImageUrl(event.imageUrl)}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 flex flex-col items-center bg-white/95 border border-gold rounded px-3 py-1 shadow-md">
                    <span className="text-2xl font-black text-maroon leading-none">{day}</span>
                    <span className="text-xs font-bold text-saffron uppercase tracking-tighter">{month}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gold/30" />
                    <div className="w-1.5 h-1.5 bg-saffron rotate-45" />
                    <div className="h-px flex-1 bg-gold/30" />
                  </div>

                  {/* Bilingual Title */}
                  <h3 className="font-display text-xl font-bold text-maroon mb-1 leading-tight group-hover/card:text-saffron-dk transition-colors">
                    {event.title}
                  </h3>
                  {event.titleMarathi && (
                     <p className="font-marathi text-lg text-ink-mid font-semibold mb-3">
                        {event.titleMarathi}
                     </p>
                  )}

                  <p className="text-ink-mid text-sm line-clamp-2 italic mb-4 opacity-80 decoration-gold/30 group-hover/card:opacity-100 transition-opacity">
                    {isMarathi && event.descriptionMarathi ? event.descriptionMarathi : event.description}
                  </p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gold/10">
                    <div className="flex items-center gap-2 text-xs font-medium text-ink-light">
                      <Clock size={14} className="text-saffron shrink-0" />
                      <span>{isMarathi && event.timeMarathi ? event.timeMarathi : event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-ink-light">
                      <MapPin size={14} className="text-saffron shrink-0" />
                      <span className="truncate">{isMarathi && event.locationMarathi ? event.locationMarathi : (event.location || "Temple Hall")}</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-5 flex items-center justify-end">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron uppercase tracking-[0.1em] group-hover/card:gap-3 transition-all">
                      {isMarathi ? "तपशील पहा" : "View Details"}
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {/* View All Card */}
        <div className="flex-shrink-0 w-[280px] snap-center py-4">
             <Link 
                to="/events" 
                className="h-full flex flex-col items-center justify-center text-center p-8 bg-cream-dk/20 border-2 border-dashed border-gold/30 rounded-xl hover:bg-gold/10 hover:border-gold/50 transition-all group/all"
             >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gold mb-4 shadow-sm border border-gold/20 group-hover/all:scale-110 transition-transform">
                    <Calendar size={32} />
                </div>
                <h3 className="font-serif text-xl font-bold text-maroon">
                    {isMarathi ? "पूर्ण दिनदर्शिका" : "View Full Calendar"}
                </h3>
                <p className="text-xs text-ink-mid mt-2 opacity-60">
                    {isMarathi ? "सर्व आगामी सण आणि कार्यक्रम पहा" : "Browse all upcoming festivals and events"}
                </p>
                <div className="mt-6 w-10 h-10 rounded-full bg-maroon text-white flex items-center justify-center group-hover/all:translate-x-2 transition-transform">
                    <ArrowRight size={18} />
                </div>
             </Link>
        </div>
      </div>
    </div>
  );
};

export default EventsSection;
