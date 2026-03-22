import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Card from "@/components/base/Card";
import Badge from "@/components/base/Badge";
import Button from "@/components/base/Button";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
} from "lucide-react";
// Removed Shadcn Calendar
import { eventsPageAPI } from "@/services/api";

const Events = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Featured event state
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Countdown state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Upcoming events state
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  // Year filtering state
  const [availableYears, setAvailableYears] = useState([]);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());

  // Fetch featured event
  useEffect(() => {
    const fetchFeaturedEvent = async () => {
      try {
        setLoadingFeatured(true);
        const response = await eventsPageAPI.getFeaturedEvent();
        if (response && response.status === "success" && response.data) {
          setFeaturedEvent(response.data);
        }
      } catch (error) {
        console.error("Error fetching featured event:", error);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeaturedEvent();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!featuredEvent || !featuredEvent.targetDate) return;
    const targetDate = new Date(featuredEvent.targetDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [featuredEvent]);

  // Fetch available years on mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await eventsPageAPI.getEventYears();
        if (response && response.status === "success") {
          setAvailableYears(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching event years:", error);
      }
    };
    fetchYears();
  }, []);

  // Fetch upcoming/all events when year changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingUpcoming(true);
        const params = { year: activeYear };
        const response = await eventsPageAPI.getAllEvents(params);
        if (response && response.status === "success") {
          const events = Array.isArray(response.data) ? response.data : [];
          setUpcomingEvents(events);
        }
      } catch (error) {
        console.error("Error fetching events by year:", error);
        setUpcomingEvents([]);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchEvents();
  }, [activeYear]);


  const formatEventDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  return (
    <div className="min-h-screen pt-20 bg-[#FFF8E1]">

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#FF7F00]/10 to-[#5D0000]/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-[#5D0000] mb-6 animate-fade-in drop-shadow-sm">
            Temple Events
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-[#FFB700] to-[#5D0000] mx-auto mb-6" />
          <p className="text-xl text-[#770A0A]/80 font-medium">
            Join us in celebrating divine festivals and spiritual gatherings
          </p>
        </div>
      </section>

      {/* Countdown Section (Visible only when featured loaded) */}
      {!loadingFeatured && featuredEvent && (
        <section className="py-16 px-4 bg-[#FFF8E1]">
          <div className="container mx-auto max-w-6xl">
            <Card className="p-8 md:p-12 bg-[#5D0000] rounded-xl shadow-2xl border-4 border-[#FFB700] relative overflow-hidden">
              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFB700] opacity-10 rounded-bl-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FFB700] opacity-10 rounded-tr-full pointer-events-none"></div>

              <div className="text-center mb-10 relative z-10">
                <Badge variant="gold" className="font-bold mb-4 text-sm px-4 py-1.5 rounded-full shadow-lg border border-[#FFE082]">
                  Upcoming Utsav
                </Badge>
                <h2 className="text-4xl md:text-5xl font-display font-extrabold text-[#FFF8E1] mb-4 tracking-tight">
                  {featuredEvent.title}
                </h2>
                <p className="text-lg text-[#FFB700]/90 font-light italic">
                  {featuredEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 relative z-10">
                {/* Reusing existing countdown logic */}
                {Object.entries(countdown).map(([unit, value]) => (
                  <div
                    key={unit}
                    className="text-center p-6 bg-[#FFF8E1] rounded-lg shadow-xl border-t-4 border-[#FF7F00]"
                  >
                    <div className="text-5xl md:text-6xl font-display font-black text-[#5D0000] mb-1">
                      {value}
                    </div>
                    <div className="text-sm text-[#770A0A] uppercase tracking-widest font-semibold">
                      {unit}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Upcoming Events / Calendar Section */}
      <section id="upcoming-events-section" ref={ref1} className="py-16 px-4">
        <div
          className={`container mx-auto max-w-6xl ${inView1 ? "animate-fade-in" : "opacity-0"
            }`}
        >
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="text-left">
              <h2 className="text-4xl font-display font-bold mb-2 text-[#5D0000]">
                Upcoming Events
              </h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-[#FFB700] to-[#5D0000]" />
            </div>
          </div>

          {/* Year Filter Bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`
                  px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300
                  ${activeYear === year
                    ? "bg-[#5D0000] text-yellow-500 shadow-md shadow-[#5D0000]/20"
                    : "bg-white text-[#5D0000] border border-[#FFB700]/30 hover:border-[#FFB700]"
                  }
                `}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Loading / Empty States */}
          {loadingUpcoming && (
            <div className="text-center py-12 text-[#770A0A]">
              Loading upcoming events...
            </div>
          )}

          {/* List View Content */}
          {!loadingUpcoming ? (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="block group"
                >
                  <Card
                    interactive
                    className="p-6 cursor-glow group bg-[#FFF8E1] border border-[#FFB700]/30 hover:border-[#FFB700] h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Badge
                        variant={event.status === "upcoming" ? "gold" : "maroon"}
                      >
                        {event.status === "upcoming" ? "Upcoming" : "Recurring"}
                      </Badge>
                      <CalendarIcon className="w-5 h-5 text-[#5D0000] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-display font-semibold mb-3 text-[#5D0000] group-hover:text-[#FF7F00] transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2 mb-4 text-sm text-[#770A0A]/80">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-[#FFB700]" />
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-[#FFB700]" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-[#FFB700]" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-[#5D0000] text-sm md:text-base italic border-t border-[#FFB700]/30 pt-4 line-clamp-2">
                        "{event.description}"
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#770A0A]">
              Loading upcoming events...
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;
