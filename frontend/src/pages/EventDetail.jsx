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
        const response = await eventsPageAPI.getAllEvents(); // Use specific ID fetch if available
        // Since getAllEvents returns all, we find the one. 
        // Better: update api.js to include getEventById
        const singleResponse = await eventsPageAPI.getUpcomingEvent(id);
        
        if (singleResponse && singleResponse.status === "success") {
          setEvent(singleResponse.data);
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
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F3]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#FFB700] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#5D0000] font-medium animate-pulse text-lg">Loading Event Details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F3] px-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500">
          <Bell size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[#5D0000] mb-4">{error || "Event Not Found"}</h2>
        <p className="text-gray-600 mb-8 max-w-md">The event you are looking for might have been moved or removed.</p>
        <Link 
          to="/events" 
          className="bg-[#5D0000] text-yellow-500 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#770A0A] transition-all flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Back to Events
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
    <div className="min-h-screen bg-[#FDF8F3] font-sans pb-20">
      {/* Hero Header */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img 
          src={getImageUrl(event.imageUrl)} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#5D0000] via-[#5D0000]/40 to-black/20" />
        
        {/* Breadcrumbs & Navigation */}
        <div className="absolute top-8 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white hover:bg-white/20 transition-all shadow-xl group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/80 text-sm font-medium">
              <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
              <ChevronRight size={14} />
              <Link to="/events" className="hover:text-yellow-500 transition-colors">Events</Link>
              <ChevronRight size={14} />
              <span className="text-yellow-500">{event.title}</span>
            </div>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white hover:bg-white/20 transition-all shadow-xl">
              <Share2 size={24} />
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
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-yellow-500 rounded-lg text-[#5D0000]">
                    <Calendar size={20} />
                  </div>
                  <span className="font-semibold text-lg">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-yellow-500 rounded-lg text-[#5D0000]">
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
              className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-orange-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDF8F3] rounded-bl-full -mr-16 -mt-16 flex items-end justify-start p-8">
                 <CalendarDays className="text-[#FFB700]/20" size={48} />
              </div>
              
              <h2 className="text-2xl font-bold text-[#5D0000] mb-8 flex items-center gap-3">
                About the Event
              </h2>
              <div className="prose prose-lg text-gray-700 max-w-none space-y-6">
                {event.description.split('\n').map((para, idx) => (
                  <p key={idx} className="leading-relaxed whitespace-pre-wrap">{para}</p>
                ))}
              </div>
            </motion.div>

            {/* Program Schedule Placeholder / Additional Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[#5D0000] to-[#770A0A] p-8 md:p-12 rounded-3xl shadow-2xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full translate-x-[-50%] translate-y-[-50%]" />
                <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full translate-x-[50%] translate-y-[50%]" />
              </div>

              <h2 className="text-2xl font-bold text-yellow-500 mb-8 flex items-center gap-3 relative z-10">
                General Guidelines
              </h2>
              <ul className="space-y-4 relative z-10">
                {[
                  "Please maintain sanctity within the temple premises.",
                  "Photography might be restricted in certain areas.",
                  "Follow the instructions from temple volunteers.",
                  "COVID protocols (if any) must be strictly adhered to."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <CheckCircle2 size={24} className="text-yellow-500 shrink-0 mt-0.5" />
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
              className="bg-white p-8 rounded-3xl shadow-xl border border-orange-100 sticky top-28"
            >
              <h3 className="text-xl font-bold text-[#5D0000] mb-8 pb-4 border-b border-gray-100 flex items-center justify-between">
                Event Logistics
                <Bell size={20} className="text-[#FFB700]" />
              </h3>

              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0 border border-orange-100">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Venue Location</p>
                    <p className="text-lg font-bold text-[#5D0000]">{event.location}</p>
                    <button className="text-sm font-medium text-orange-600 mt-2 hover:underline">Get Directions</button>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Expected Attendance</p>
                    <p className="text-lg font-bold text-[#5D0000]">{event.attendees || "Open for All"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Event Year</p>
                    <p className="text-lg font-bold text-[#5D0000]">{event.year}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <button className="w-full bg-[#5D0000] text-yellow-500 py-4 rounded-2xl font-bold shadow-xl shadow-[#5D0000]/10 hover:shadow-2xl hover:bg-[#770A0A] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group">
                   Add to Calendar
                   <CalendarDays size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
                <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed font-medium">
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
