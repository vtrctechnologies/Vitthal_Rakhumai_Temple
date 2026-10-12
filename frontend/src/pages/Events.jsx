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
        const featData = response?.data || (Array.isArray(response) ? response[0] : response);
        if (featData) {
          setFeaturedEvent(Array.isArray(featData) ? featData[0] : featData);
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
        const years = response?.data || (Array.isArray(response) ? response : []);
        if (Array.isArray(years) && years.length > 0) {
          setAvailableYears(years);
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
        const events = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setUpcomingEvents(events);
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
    <div className="min-h-screen pt-20 bg-cream font-body text-ink-dark">

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-saffron/10 via-cream-dk/40 to-maroon/10 border-b border-gold/30">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="block font-heading text-xs tracking-[0.28em] uppercase text-saffron mb-2">
            Utsav & Celebrations
          </span>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-maroon mb-4 animate-fade-in drop-shadow-sm">
            Temple Events
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-gold via-saffron to-maroon mx-auto mb-4" />
          <p className="text-xl text-ink-mid font-medium">
            Join us in celebrating divine festivals and spiritual gatherings
          </p>
        </div>
      </section>

      {/* Countdown Section (Visible only when featured loaded) */}
      {!loadingFeatured && featuredEvent && (
        <section className="py-16 px-4 bg-cream">
          <div className="container mx-auto max-w-6xl">
            <Card className="p-8 md:p-12 bg-maroon rounded-xl shadow-2xl border-2 border-gold relative overflow-hidden">
              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-bl-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/10 rounded-tr-full pointer-events-none"></div>

              <div className="text-center mb-10 relative z-10">
                <Badge variant="gold" className="font-heading font-bold mb-4 text-xs tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg border border-gold/40 bg-gold/20 text-gold-lt">
                  Upcoming Utsav
                </Badge>
                <h2 className="text-4xl md:text-5xl font-display font-extrabold text-gold-lt mb-4 tracking-tight">
                  {featuredEvent.title}
                </h2>
                <p className="text-lg text-cream-dk/90 font-light italic max-w-2xl mx-auto">
                  {featuredEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 relative z-10">
                {/* Reusing existing countdown logic */}
                {Object.entries(countdown).map(([unit, value]) => (
                  <div
                    key={unit}
                    className="text-center p-6 bg-cream-dk/90 rounded-lg shadow-xl border border-gold/40 border-t-4 border-t-saffron"
                  >
                    <div className="text-5xl md:text-6xl font-display font-black text-maroon mb-1">
                      {value}
                    </div>
                    <div className="text-xs text-saffron-dk uppercase tracking-widest font-heading font-bold">
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
              <span className="block font-heading text-xs tracking-[0.28em] uppercase text-saffron mb-1">
                Sacred Calendar
              </span>
              <h2 className="text-4xl font-display font-bold mb-2 text-maroon">
                Upcoming Events
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gold to-maroon" />
            </div>
          </div>

          {/* Year Filter Bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`
                  px-5 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 border
                  ${activeYear === year
                    ? "bg-maroon text-gold-lt border-gold shadow-md shadow-maroon/20 scale-105"
                    : "bg-cream-dk text-ink-mid border-gold/30 hover:border-gold hover:text-maroon"
                  }
                `}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Loading / Empty States */}
          {loadingUpcoming && (
            <div className="text-center py-12 text-ink-light font-heading tracking-widest uppercase text-sm">
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
                    className="p-6 cursor-glow group bg-white/70 border border-gold/30 hover:border-gold hover:shadow-xl transition-all duration-300 h-full rounded-xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Badge
                        variant={event.status === "upcoming" ? "gold" : "maroon"}
                      >
                        {event.status === "upcoming" ? "Upcoming" : "Recurring"}
                      </Badge>
                      <CalendarIcon className="w-5 h-5 text-maroon group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-3 text-maroon group-hover:text-saffron-dk transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2 mb-4 text-sm text-ink-mid">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-saffron shrink-0" />
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-saffron shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-saffron shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-ink-dark text-sm md:text-base italic border-t border-gold/30 pt-4 line-clamp-2">
                        "{event.description}"
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-ink-light font-heading tracking-widest uppercase text-sm">
              Loading upcoming events...
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;
