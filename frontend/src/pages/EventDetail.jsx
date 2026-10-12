import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ArrowLeft, 
  Share2,
  Bell,
  CheckCircle2,
  CalendarDays,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { eventsPageAPI } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const singleResponse = await eventsPageAPI.getEventById(id);
        const eventData = singleResponse?.data || (singleResponse?._id ? singleResponse : null);
        if (eventData) {
          setEvent(eventData);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-maroon font-heading tracking-widest uppercase animate-pulse text-sm">Loading Event Details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-center">
        <div className="w-20 h-20 bg-vermillion/10 rounded-full flex items-center justify-center mb-6 text-vermillion">
          <Bell size={40} />
        </div>
        <h2 className="text-2xl font-display font-bold text-maroon mb-4">{error || "Event Not Found"}</h2>
        <p className="text-ink-mid mb-8 max-w-md">The event you are looking for might have been moved or removed.</p>
        <Link 
          to="/events" 
          className="bg-maroon text-gold-lt border border-gold px-8 py-3 rounded-full font-heading font-bold shadow-lg hover:bg-maroon-dk transition-all flex items-center gap-2 tracking-widest uppercase text-sm"
        >
          <ArrowLeft size={18} /> Back to Events
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-cream font-body text-ink-dark pb-20">
      {/* Hero Header */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img 
          src={getImageUrl(event.imageUrl)} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/60 to-black/30" />
        
        {/* Breadcrumbs & Navigation */}
        <div className="absolute top-8 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="bg-ink-dark/40 backdrop-blur-md border border-gold/40 p-3 rounded-full text-gold-lt hover:bg-ink-dark/60 transition-all shadow-xl group"
            >
              <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-ink-dark/50 backdrop-blur-md px-4 py-2 rounded-full border border-gold/30 text-cream-dk text-sm font-heading">
              <Link to="/" className="hover:text-gold-lt transition-colors">Home</Link>
              <ChevronRight size={14} className="text-gold" />
              <Link to="/events" className="hover:text-gold-lt transition-colors">Events</Link>
              <ChevronRight size={14} className="text-gold" />
              <span className="text-gold-lt font-semibold">{event.title}</span>
            </div>
            <button className="bg-ink-dark/40 backdrop-blur-md border border-gold/40 p-3 rounded-full text-gold-lt hover:bg-ink-dark/60 transition-all shadow-xl">
              <Share2 size={22} />
            </button>
          </div>
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute bottom-12 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                  event.status === 'upcoming' 
                  ? 'bg-orange-500/20 text-orange-200 border-orange-500/30' 
                  : 'bg-green-500/20 text-green-200 border-green-500/30'
                }`}>
                  {event.status}
                </span>
                {event.isFeatured && (
                  <span className="bg-yellow-500/20 text-yellow-200 border border-yellow-500/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    Featured Event
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight drop-shadow-lg">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-cream-dk">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gold rounded-lg text-maroon">
                    <Calendar size={20} />
                  </div>
                  <span className="font-semibold text-lg">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gold rounded-lg text-maroon">
                    <Clock size={20} />
                  </div>
                  <span className="font-semibold text-lg">{event.time}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-xl border border-gold/40 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cream-dk rounded-bl-full -mr-16 -mt-16 flex items-end justify-start p-8">
                 <CalendarDays className="text-gold/30" size={48} />
              </div>
              
              <h2 className="text-2xl font-display font-bold text-maroon mb-6 flex items-center gap-3">
                About the Event
              </h2>
              <div className="prose prose-lg text-ink-mid max-w-none space-y-6">
                {event.description.split('\n').map((para, idx) => (
                  <p key={idx} className="leading-relaxed whitespace-pre-wrap">{para}</p>
                ))}
              </div>
            </motion.div>

            {/* General Guidelines */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-maroon via-maroon-dk to-maroon p-8 md:p-12 rounded-3xl shadow-2xl text-white border border-gold/40 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-40 h-40 border-4 border-gold rounded-full translate-x-[-50%] translate-y-[-50%]" />
                <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-gold rounded-full translate-x-[50%] translate-y-[50%]" />
              </div>

              <h2 className="text-2xl font-display font-bold text-gold-lt mb-6 flex items-center gap-3 relative z-10">
                General Guidelines
              </h2>
              <ul className="space-y-4 relative z-10">
                {[
                  "Please maintain sanctity within the temple premises.",
                  "Photography might be restricted in certain areas.",
                  "Follow the instructions from temple volunteers.",
                  "All devotees are cordially invited for the sacred darshan & prasad."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <CheckCircle2 size={24} className="text-gold shrink-0 mt-0.5" />
                    <span className="text-lg font-medium opacity-90">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gold/40 sticky top-28"
            >
              <h3 className="text-xl font-display font-bold text-maroon mb-8 pb-4 border-b border-gold/30 flex items-center justify-between">
                Event Logistics
                <Bell size={20} className="text-saffron" />
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cream-dk rounded-2xl flex items-center justify-center text-saffron shrink-0 border border-gold/30">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-heading font-bold text-ink-light uppercase tracking-widest mb-1">Venue Location</p>
                    <p className="text-lg font-bold text-maroon">{event.location}</p>
                    <span className="text-sm font-medium text-saffron-dk mt-1 inline-block">Ambere, Ratnagiri</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cream-dk rounded-2xl flex items-center justify-center text-saffron shrink-0 border border-gold/30">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-heading font-bold text-ink-light uppercase tracking-widest mb-1">Expected Attendance</p>
                    <p className="text-lg font-bold text-maroon">{event.attendees || "Open for All"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cream-dk rounded-2xl flex items-center justify-center text-saffron shrink-0 border border-gold/30">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-heading font-bold text-ink-light uppercase tracking-widest mb-1">Event Year</p>
                    <p className="text-lg font-bold text-maroon">{event.year}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gold/30">
                <button className="w-full bg-gradient-to-r from-maroon via-maroon-lt to-maroon text-gold-lt border border-gold/60 py-4 rounded-full font-heading font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm group">
                   Add to Calendar
                   <CalendarDays size={18} className="group-hover:rotate-12 transition-transform text-saffron-lt" />
                </button>
                <p className="text-center text-xs text-ink-light mt-4 leading-relaxed font-body italic">
                  Set a reminder to never miss the divine celebrations.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
