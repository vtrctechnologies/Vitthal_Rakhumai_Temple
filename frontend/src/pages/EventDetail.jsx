import { useState, useEffect } from "react";
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
  ChevronRight,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { eventsPageAPI } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
import { useLanguage } from "../context/LanguageContext";

/* ── Sacred Diamond Divider ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-4 justify-center">
    <div className="flex-1 max-w-[80px] sm:max-w-[120px] h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
    <div className="w-2 h-2 rotate-45 bg-amber-400 border border-amber-200/80 shadow-xs shrink-0" />
    <div className="flex-1 max-w-[80px] sm:max-w-[120px] h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
  </div>
);

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMarathi } = useLanguage();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const singleResponse = await eventsPageAPI.getEventById(id);
        const eventData = singleResponse?.data || (singleResponse?._id ? singleResponse : null);
        if (isMounted) {
          if (eventData) {
            setEvent(eventData);
          } else {
            setError(isMarathi ? "कार्यक्रम आढळला नाही" : "Event not found");
          }
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        if (isMounted) {
          setError(isMarathi ? "कार्यक्रमाची माहिती लोड करता आली नाही" : "Failed to load event details");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvent();
    window.scrollTo(0, 0);
    return () => { isMounted = false; };
  }, [id, isMarathi]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || "Temple Event",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const eventTitle = encodeURIComponent(event.title || "Temple Festival");
    const eventDetails = encodeURIComponent(event.description || "Shree Vitthal Rakhumai Temple Event");
    const eventLocation = encodeURIComponent(event.location || "Shree Vitthal Rakhumai Temple, Amberkarwadi, Ratnagiri");
    
    // Construct Google Calendar Link
    const dateObj = new Date(event.date);
    const startStr = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${eventLocation}&dates=${startStr}/${startStr}`;
    window.open(calendarUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-maroon font-heading tracking-widest uppercase text-xs font-bold">
            {isMarathi ? "कार्यक्रमाची माहिती लोड होत आहे..." : "Loading Event Details..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-cream px-6 text-center">
        <div className="w-16 h-16 bg-vermillion/10 border border-vermillion/30 rounded-md flex items-center justify-center mb-4 text-vermillion">
          <Bell size={32} />
        </div>
        <h2 className="text-2xl font-heading font-bold text-maroon mb-2">{error || "Event Not Found"}</h2>
        <p className="text-ink-mid text-sm font-body mb-6 max-w-md">
          {isMarathi
            ? "हा कार्यक्रम उपलब्ध नाही किंवा हलवण्यात आला आहे."
            : "The event you are looking for might have been moved or removed."}
        </p>
        <Link 
          to="/events" 
          className="inline-flex items-center gap-2 h-10 sm:h-11 px-6 rounded-md font-heading text-xs font-bold tracking-wider uppercase bg-maroon text-gold-lt border border-gold/40 hover:bg-maroon-dk transition-all shadow-xs"
        >
          <ArrowLeft size={16} /> {isMarathi ? "सर्व कार्यक्रम पहा" : "Back to Events"}
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString(isMarathi ? "mr-IN" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const eventTitle = isMarathi && event.titleMarathi ? event.titleMarathi : event.title;
  const eventDesc = isMarathi && event.descriptionMarathi ? event.descriptionMarathi : event.description;
  const eventLocation = isMarathi && event.locationMarathi ? event.locationMarathi : (event.location || "Amberkarwadi, Ratnagiri");

  return (
    <div className="min-h-screen bg-cream font-body text-ink-dark pb-12 sm:pb-16">
      {/* ═══════════ 1. CINEMATIC HERO BANNER ═══════════ */}
      <section className="relative min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex items-end justify-center overflow-hidden border-b border-amber-500/25">
        {/* Subtle Top Gold Filament */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent z-20 opacity-80" />

        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src={getImageUrl(event.imageUrl)} 
            alt={eventTitle}
            className="w-full h-full object-cover object-center saturate-[1.08] brightness-[0.70] contrast-[1.05]"
          />
          {/* Layered Directional Scrim matching Home and Events */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#140202] via-[#1a0404]/75 to-[#140202]/65" />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        {/* Top Floating Breadcrumb Bar */}
        <div className="absolute top-24 sm:top-28 left-0 right-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 rounded-md bg-black/55 backdrop-blur-xs border border-amber-400/40 text-amber-200 hover:text-white hover:bg-black/80 transition-all text-xs font-heading font-bold uppercase tracking-wider cursor-pointer shadow-xs active:scale-95 select-none"
              aria-label="Go back"
            >
              <ArrowLeft size={14} />
              <span>{isMarathi ? "मागे जा" : "Back"}</span>
            </button>

            {/* Desktop Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2 bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-md border border-amber-400/30 text-amber-100 text-xs font-heading">
              <Link to="/" className="hover:text-amber-300 transition-colors">{isMarathi ? "मुखपृष्ठ" : "Home"}</Link>
              <ChevronRight size={12} className="text-amber-400" />
              <Link to="/events" className="hover:text-amber-300 transition-colors">{isMarathi ? "कार्यक्रम" : "Events"}</Link>
              <ChevronRight size={12} className="text-amber-400" />
              <span className="text-amber-300 font-semibold truncate max-w-xs">{eventTitle}</span>
            </div>

            {/* Share Button */}
            <button 
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 rounded-md bg-black/55 backdrop-blur-xs border border-amber-400/40 text-amber-200 hover:text-white hover:bg-black/80 transition-all text-xs font-heading font-bold uppercase tracking-wider cursor-pointer shadow-xs active:scale-95 select-none"
              title={copied ? "Link Copied!" : "Share Event"}
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">{copied ? (isMarathi ? "कॉपी झाले!" : "Copied!") : (isMarathi ? "शेअर करा" : "Share")}</span>
            </button>
          </div>
        </div>

        {/* Hero Title & Primary Metadata */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14 pt-36">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            {/* Status / Category Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[0.68rem] sm:text-xs font-heading font-bold uppercase tracking-wider bg-amber-500/25 border border-amber-400/50 text-amber-200 backdrop-blur-xs shadow-xs">
                <Sparkles size={11} className="text-amber-300" />
                {event.status === "upcoming" 
                  ? (isMarathi ? "आगामी उत्सव" : "Upcoming Event") 
                  : (isMarathi ? "संपन्न उत्सव" : "Completed Event")}
              </span>

              {event.isFeatured && (
                <span className="px-3 py-1 rounded-md text-[0.68rem] sm:text-xs font-heading font-bold uppercase tracking-wider bg-amber-400 text-maroon-dk font-bold border border-amber-300 shadow-xs">
                  {isMarathi ? "विशेष उत्सव" : "Featured Festival"}
                </span>
              )}

              {event.year && (
                <span className="px-2.5 py-1 rounded-md text-[0.68rem] sm:text-xs font-heading font-bold uppercase tracking-wider bg-black/45 border border-white/20 text-cream/90">
                  {event.year}
                </span>
              )}
            </div>

            {/* Event Main Title */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4 sm:mb-6 leading-tight tracking-wide drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              {eventTitle}
            </h1>

            {/* Event Time & Date Bar */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-cream/95 text-xs sm:text-sm">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-black/60 border border-amber-400/35 backdrop-blur-xs shadow-xs">
                <Calendar size={14} className="text-amber-400 shrink-0" />
                <span className="font-semibold text-amber-100">{formattedDate}</span>
              </div>
              
              {event.time && (
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-black/60 border border-amber-400/35 backdrop-blur-xs shadow-xs">
                  <Clock size={14} className="text-amber-400 shrink-0" />
                  <span className="font-semibold text-amber-100">{event.time}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 2. MAIN TEMPLE CONTENT SECTION ═══════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 items-start">
          
          {/* Left Column: Details & Sacred Guidelines (2 Cols) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* About the Event Card */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="bg-[#fffdfa] p-6 sm:p-9 rounded-md shadow-[0_4px_20px_rgba(74,15,15,0.06)] border-2 border-amber-600/40 relative overflow-hidden w-full max-w-full"
            >
              {/* Subtle Top Gold Filament */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90" />

              <div className="mb-4">
                <span className="font-heading text-[10px] sm:text-xs tracking-[0.25em] uppercase text-saffron block mb-1">
                  {isMarathi ? "|| सविस्तर माहिती ||" : "|| Sacred Details ||"}
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-maroon flex items-center gap-2.5">
                  <CalendarDays size={22} className="text-amber-600 shrink-0" />
                  <span>{isMarathi ? "कार्यक्रमाविषयी माहिती" : "About the Event"}</span>
                </h2>
              </div>

              <DiamondDivider />

              {/* Description Paragraphs - Fully visible with comprehensive text-wrapping */}
              <div className="font-body text-ink-dark text-base sm:text-lg leading-relaxed space-y-4 pt-2 w-full max-w-full overflow-hidden">
                {eventDesc ? (
                  eventDesc.split("\n").map((para, idx) => (
                    <p 
                      key={idx} 
                      className="whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] leading-relaxed text-ink-dark"
                    >
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="italic text-ink-light">
                    {isMarathi 
                      ? "या कार्यक्रमाविषयी सविस्तर माहिती लवकरच उपलब्ध केली जाईल."
                      : "Detailed schedule and guidelines for this event will be published soon."}
                  </p>
                )}
              </div>
            </motion.div>

            {/* General Guidelines Card */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="bg-gradient-to-br from-[#2a0808] via-[#1c0404] to-[#240606] p-6 sm:p-8 rounded-md shadow-md text-white border-2 border-amber-500/50 relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90" />

              <span className="font-heading text-[10px] sm:text-xs tracking-[0.25em] uppercase text-amber-300/90 block mb-1">
                {isMarathi ? "|| नियमावली व शिस्त ||" : "|| Sacred Discipline ||"}
              </span>
              <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-amber-100 mb-4 flex items-center gap-2">
                <span>{isMarathi ? "भाविकांसाठी महत्त्वाच्या सूचना" : "General Guidelines for Devotees"}</span>
              </h3>

              <div className="w-16 h-px bg-amber-400/50 mb-4" />

              <ul className="space-y-3.5 text-sm sm:text-base font-body text-cream/90">
                {[
                  isMarathi
                    ? "मंदिर परिसरात पावित्र्य व शांतता राखावी."
                    : "Please maintain sanctity and peace within the temple premises.",
                  isMarathi
                    ? "गर्भगृह व दर्शन रांगेत स्वयंसेवकांच्या सूचनांचे पालन करावे."
                    : "Follow the instructions from temple volunteers and committee members.",
                  isMarathi
                    ? "आरती, महाप्रसाद व दर्शनाची वेळ वेळेवर पाळावी."
                    : "Devotees are requested to arrive on time for Aarti, Darshan, and Mahaprasad.",
                  isMarathi
                    ? "सर्व भाविकांना श्रींच्या दर्शनाचा लाभ घेता यावा म्हणून सहकार्य करावे."
                    : "Cooperate with the sansthan so every devotee experiences peaceful darshan."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right Column: Event Logistics & Action Dock (1 Col) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="bg-[#fffdfa] p-5 sm:p-7 rounded-md shadow-[0_4px_20px_rgba(74,15,15,0.06)] border-2 border-amber-600/40 relative overflow-hidden"
            >
              {/* Subtle Top Gold Filament */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90" />

              {/* Header */}
              <div className="pb-3 border-b border-amber-500/30 flex items-center justify-between mb-5">
                <div>
                  <span className="font-heading text-[10px] sm:text-xs tracking-[0.2em] uppercase text-saffron block">
                    {isMarathi ? "तपशील" : "Information"}
                  </span>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-maroon">
                    {isMarathi ? "कार्यक्रम तपशील" : "Event Logistics"}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-md bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-700">
                  <Bell size={16} />
                </div>
              </div>

              {/* Logistics List */}
              <div className="space-y-3.5">
                {/* Location */}
                <div className="flex items-start gap-3 p-3.5 rounded-md bg-amber-50/50 border border-amber-400/50">
                  <div className="w-8 h-8 rounded-md bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-800 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-heading font-bold text-ink-light uppercase tracking-wider mb-0.5">
                      {isMarathi ? "स्थान / ठिकाण" : "Venue Location"}
                    </p>
                    <p className="text-sm font-heading font-bold text-maroon break-words">{eventLocation}</p>
                    <span className="text-xs text-saffron-dk font-marathi">
                      {isMarathi ? "आंबेकरवाडी, रत्नागिरी" : "Ratnagiri, Maharashtra"}
                    </span>
                  </div>
                </div>

                {/* Attendees */}
                <div className="flex items-start gap-3 p-3.5 rounded-md bg-amber-50/50 border border-amber-400/50">
                  <div className="w-8 h-8 rounded-md bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-800 shrink-0">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-heading font-bold text-ink-light uppercase tracking-wider mb-0.5">
                      {isMarathi ? "भाविकांची उपस्थिती" : "Expected Devotees"}
                    </p>
                    <p className="text-sm font-heading font-bold text-maroon">
                      {event.attendees || (isMarathi ? "सर्व भाविकांसाठी खुले" : "Open for All Devotees")}
                    </p>
                  </div>
                </div>

                {/* Event Year */}
                <div className="flex items-start gap-3 p-3.5 rounded-md bg-amber-50/50 border border-amber-400/50">
                  <div className="w-8 h-8 rounded-md bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-800 shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-heading font-bold text-ink-light uppercase tracking-wider mb-0.5">
                      {isMarathi ? "उत्सव वर्ष" : "Festival Year"}
                    </p>
                    <p className="text-sm font-heading font-bold text-maroon">{event.year || new Date(event.date).getFullYear()}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons with Standardized Sizes */}
              <div className="mt-6 pt-5 border-t border-amber-500/25 space-y-3">
                <button 
                  type="button"
                  onClick={handleAddToCalendar}
                  className="w-full inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 rounded-md font-heading text-xs sm:text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#2b0808] border border-amber-400/60 shadow-xs hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer select-none"
                >
                  <CalendarDays size={16} className="text-[#2b0808] shrink-0" />
                  <span>{isMarathi ? "कॅलेंडरमध्ये जोडा" : "Add to Calendar"}</span>
                  <ExternalLink size={13} className="opacity-70 ml-0.5" />
                </button>

                <Link
                  to="/donation"
                  className="w-full inline-flex items-center justify-center gap-2 h-10 sm:h-11 px-5 rounded-md font-heading text-xs font-bold tracking-wider uppercase bg-maroon text-gold-lt hover:bg-maroon-dk border border-gold/40 shadow-xs active:scale-95 transition-all select-none"
                >
                  <span>{isMarathi ? "उत्सवासाठी देणगी द्या" : "Support This Festival"}</span>
                </Link>
              </div>

              <p className="text-center text-[0.72rem] text-ink-light mt-4 italic font-body">
                {isMarathi
                  ? "|| विठ्ठल रखुमाई चरणी लीन व्हावे ||"
                  : "Experience sacred joy in the company of devotees."}
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetail;
