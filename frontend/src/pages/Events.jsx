import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "@/components/base/Card";
import Badge from "@/components/base/Badge";
import Button from "@/components/base/Button";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  CalendarDays,
  List,
  Menu,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
// Removed Shadcn Calendar
import Modal from "@/components/base/Modal";
import { eventsPageAPI } from "@/services/api";

const Events = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.1 });

  // View mode: 'list' or 'calendar'
  const [viewMode, setViewMode] = useState(() => {
    return location.hash === "#calendar" ? "calendar" : "list";
  });

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

  // All events state
  const [allEvents, setAllEvents] = useState([]);
  const [loadingAllEvents, setLoadingAllEvents] = useState(false);

  // Calendar selected date
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Event list modal visibility
  const [showEventListModal, setShowEventListModal] = useState(false);

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

  // Fetch upcoming events
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoadingUpcoming(true);
        const response = await eventsPageAPI.getUpcomingEvents();
        if (response && response.status === "success") {
          setUpcomingEvents(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        setUpcomingEvents([]);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchUpcomingEvents();
  }, []);

  // Fetch all events for calendar
  useEffect(() => {
    const fetchAllEvents = async () => {
      if (viewMode !== "calendar") return;
      try {
        setLoadingAllEvents(true);
        const response = await eventsPageAPI.getAllEvents();
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

        const activeEvents = eventsData
          .filter((event) => event.isActive !== false && event.date)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setAllEvents(activeEvents);

        // Auto-select logic
        if (activeEvents.length > 0) {
          // Basic logic to find the "Cricket" event or nearest future event to replicate image feel
          const cricketEvent = activeEvents.find((e) =>
            e.title.includes("Cricket")
          );
          if (cricketEvent) {
            const d = new Date(cricketEvent.date);
            setSelectedDate(d);
            setCalendarMonth(d);
          } else {
            // Fallback to nearest future event
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const firstEvent = activeEvents.find(
              (e) => new Date(e.date) >= today
            );
            if (firstEvent) {
              const d = new Date(firstEvent.date);
              setSelectedDate(d);
              setCalendarMonth(d);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching all events:", error);
        setAllEvents([]);
      } finally {
        setLoadingAllEvents(false);
      }
    };
    fetchAllEvents();
  }, [viewMode]);

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    if (mode === "calendar") {
      navigate("/events#calendar", { replace: true });
    } else {
      navigate("/events", { replace: true });
    }
  };

  useEffect(() => {
    if (location.hash === "#calendar") {
      setViewMode("calendar");
      setTimeout(() => {
        const calendarSection = document.getElementById(
          "upcoming-events-section"
        );
        if (calendarSection)
          calendarSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } else {
      setViewMode("list");
    }
  }, [location.hash]);

  const formatEventDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEventsForDate = (date) => {
    const eventsToUse = viewMode === "calendar" ? allEvents : upcomingEvents;
    if (!eventsToUse || eventsToUse.length === 0) return [];
    const dateStr = date.toDateString();
    return eventsToUse.filter((event) => {
      if (!event.date) return false;
      return new Date(event.date).toDateString() === dateStr;
    });
  };

  const modifiers = {
    hasEvent: (date) => {
      const eventsToUse = viewMode === "calendar" ? allEvents : upcomingEvents;
      if (!eventsToUse) return false;
      const dateStr = date.toDateString();
      return eventsToUse.some(
        (event) => event.date && new Date(event.date).toDateString() === dateStr
      );
    },
  };

  const modifiersClassNames = {
    hasEvent: "bg-[#FFB700]/20 font-bold text-[#5D0000]",
  };

  return (
    <div className="min-h-screen pt-20 bg-[#FFF8E1]">
      <style>{`
        /* Calendar Theme Overrides - MATCHING IMAGE */
        .rdp {
          margin: 0;
        }
        .rdp-months {
          justify-content: center;
        }
        .rdp-month {
          background-color: white;
          padding: 1.5rem;
          border-radius: 0.5rem;
        }
        .rdp-caption {
          margin-bottom: 1.5rem;
          position: relative; 
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .rdp-caption_label {
          color: #5D0000;
          font-family: 'serif';
          font-weight: 700;
          font-size: 1.25rem;
        }
        .rdp-nav {
          display: flex;
          justify-content: space-between;
          width: 100%;
          position: absolute;
          top: 0;
        }
        .rdp-nav_button {
          color: #5D0000;
          background: transparent;
          border: none;
          padding: 0;
        }
        .rdp-nav_button:hover {
          background: transparent !important;
          color: #FFB700 !important;
        }
        .rdp-head_cell {
          color: #888;
          font-weight: 500;
          font-size: 0.9rem;
          text-transform: uppercase;
          padding-bottom: 1rem;
        }
        .rdp-day {
          font-size: 1rem;
          width: 40px;
          height: 40px;
          color: #333;
        }
        .rdp-day_selected {
          background-color: #FFB700 !important; /* Gold/Orange Circle */
          color: white !important;
          border-radius: 50%;
          font-weight: bold;
        }
        .rdp-day_today {
          color: #FF7F00;
          font-weight: bold;
        }
      `}</style>

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
          className={`container mx-auto max-w-6xl ${
            inView1 ? "animate-fade-in" : "opacity-0"
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

            <div className="flex items-center gap-3">
              <Button
                variant={viewMode === "list" ? "primary" : "outline"}
                onClick={() => toggleViewMode("list")}
                className={`rounded-full px-6 border ${
                  viewMode === "list"
                    ? "bg-[#5D0000] text-white border-[#5D0000]"
                    : "bg-transparent text-[#5D0000] border-[#5D0000] hover:bg-[#FFF8E1]"
                }`}
              >
                <List size={16} className="mr-2" /> List View
              </Button>
              <Button
                variant={viewMode === "calendar" ? "primary" : "outline"}
                onClick={() => toggleViewMode("calendar")}
                className={`rounded-full px-6 border ${
                  viewMode === "calendar"
                    ? "bg-[#5D0000] text-white border-[#5D0000]"
                    : "bg-transparent text-[#5D0000] border-[#5D0000] hover:bg-[#FFF8E1]"
                }`}
              >
                <CalendarDays size={16} className="mr-2" /> Calendar View
              </Button>
            </div>
          </div>

          {/* Loading / Empty States */}
          {loadingUpcoming && viewMode === "list" && (
            <div className="text-center py-12 text-[#770A0A]">
              Loading upcoming events...
            </div>
          )}

          {/* List View Content */}
          {viewMode === "list" && !loadingUpcoming && (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <Card
                  key={event._id}
                  interactive
                  className="p-6 cursor-glow group bg-[#FFF8E1] border border-[#FFB700]/30 hover:border-[#FFB700]"
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
                </Card>
              ))}
            </div>
          )}

          {/* Calendar View Custom UI */}
          {viewMode === "calendar" && (
            <div className="relative">
              {/* All Events Filter Button (Top Right as per image) */}
              <div className="flex justify-end mb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEventListModal(true)}
                  className="rounded-full border-[#FFB700] text-[#5D0000] hover:bg-[#FFB700]/10"
                >
                  <Menu size={16} className="mr-2" /> All Events (
                  {allEvents.length})
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
                {/* Custom Calendar Column (Left) */}
                <div className="lg:col-span-4 order-1">
                  {/* The Frame Container (Yellow Border) */}
                  <div className="p-1 rounded-xl border-2 border-[#FFC300] bg-white shadow-lg">
                    <div className="p-4 bg-white rounded-lg">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            setCalendarMonth(date);
                            // Smooth scroll to event details if on mobile
                            if (window.innerWidth < 1024) {
                              document
                                .getElementById("event-detail-card")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }
                          }
                        }}
                        modifiers={modifiers}
                        modifiersClassNames={modifiersClassNames}
                        className="w-full flex justify-center p-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Details Column (Right) */}
                <div className="lg:col-span-8 order-2 flex flex-col h-full" id="event-detail-card">
                  {/* Event Date Header */}
                  <div className="mb-4 flex-shrink-0">
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-[#5D0000] mb-2">
                    Event on{" "}
                    {selectedDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                    <div className="w-20 h-1 bg-[#FFB700] mb-4" />
                  </div>

                  {/* Scrollable Event Cards Container - one-day many-events */}
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className="overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-[#FFB700] scrollbar-track-[#FFF8E1] hover:scrollbar-thumb-[#FF7F00] h-[360px] md:h-[420px] lg:h-[460px]">
                      <style>{`
                        /* Custom Scrollbar Styling */
                        .scrollbar-thin::-webkit-scrollbar {
                          width: 8px;
                        }
                        .scrollbar-thin::-webkit-scrollbar-track {
                          background: #FFF8E1;
                          border-radius: 10px;
                        }
                        .scrollbar-thin::-webkit-scrollbar-thumb {
                          background: #FFB700;
                          border-radius: 10px;
                          transition: background 0.2s ease;
                        }
                        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                          background: #FF7F00;
                        }
                        /* Firefox */
                        .scrollbar-thin {
                          scrollbar-width: thin;
                          scrollbar-color: #FFB700 #FFF8E1;
                        }
                        /* Smooth scrolling */
                        .scrollbar-thin {
                          scroll-behavior: smooth;
                          -webkit-overflow-scrolling: touch;
                        }
                      `}</style>
                      {getEventsForDate(selectedDate).map((event) => (
                      <div
                        key={event._id}
                          className="bg-[#FFF8E1] rounded-xl p-5 md:p-6 border border-[#FFB700]/20 border-l-[6px] border-l-[#5D0000] shadow-sm relative overflow-hidden flex-shrink-0"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="gold" className="border-none px-3 py-1 text-xs font-semibold rounded-full">
                            {event.status === "upcoming"
                              ? "Upcoming"
                              : event.status}
                          </Badge>
                          <CalendarIcon className="w-5 h-5 text-[#5D0000]" />
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-[#5D0000] mb-4 font-display line-clamp-2">
                          "{event.title}"
                        </h2>

                        <div className="space-y-2.5 mb-4">
                          <div className="flex items-center text-[#770A0A] text-sm">
                            <Clock className="w-4 h-4 text-[#FF7F00] mr-2 flex-shrink-0" />
                            <span className="font-medium line-clamp-1">
                              {event.time || "Time TBA"}
                            </span>
                          </div>
                          <div className="flex items-start text-[#770A0A] text-sm">
                            <MapPin className="w-4 h-4 text-[#FF7F00] mr-2 mt-0.5 flex-shrink-0" />
                            <span className="font-medium line-clamp-2">
                              {event.location}
                            </span>
                          </div>
                          {event.attendees && (
                            <div className="flex items-center text-[#770A0A] text-sm">
                              <Users className="w-4 h-4 text-[#FF7F00] mr-2 flex-shrink-0" />
                              <span className="font-medium">
                                {event.attendees} Expected
                              </span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-[#5D0000] text-sm md:text-base italic border-t border-[#FFB700]/30 pt-4 line-clamp-2">
                            "{event.description}"
                          </p>
                        )}
                      </div>
                      ))}
                    </div>
                  ) : (
                    /* Empty State Card */
                    <div className="bg-[#FFF8E1] rounded-xl p-12 border border-[#FFB700]/20 border-l-[6px] border-l-gray-300 shadow-sm text-center">
                      <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl text-gray-500 font-medium">
                        No events scheduled for this date.
                      </h3>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal for All Events List */}
              <Modal
                isOpen={showEventListModal}
                onClose={() => setShowEventListModal(false)}
                title={`All Events (${allEvents.length})`}
              >
                <div className="space-y-3">
                  {allEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const isSelected =
                      selectedDate.toDateString() ===
                      eventDate.toDateString();
                    return (
                      <button
                        key={event._id}
                        onClick={() => {
                          setSelectedDate(eventDate);
                          setCalendarMonth(eventDate);
                          setShowEventListModal(false);
                        }}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-[#5D0000]/10 border-[#5D0000]"
                            : "bg-white border-[#FFB700]/30 hover:border-[#5D0000]/50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-[#FF7F00] uppercase mb-1">
                              {eventDate.toLocaleDateString()}
                            </p>
                            <p className="font-semibold text-[#5D0000]">
                              {event.title}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-[#5D0000]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Modal>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;
