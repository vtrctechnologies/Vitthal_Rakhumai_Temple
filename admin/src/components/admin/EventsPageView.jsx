import React, { useState, useEffect } from "react";
import {
  Calendar,
  X,
  FileText,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Timer,
  Sparkles,
} from "lucide-react";
import { eventsAPI } from "../../services/api";
import { Button, InputField } from "../customUi/AdminShared";
import { getImageUrl } from "../../utils/imageUrl";

const EventsPageView = () => {
  const [activeTab, setActiveTab] = useState("featured"); // "featured" or "upcoming"
  
  // Featured Event State
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [showFeaturedForm, setShowFeaturedForm] = useState(false);
  const [featuredFormData, setFeaturedFormData] = useState({
    title: "",
    description: "",
    targetDate: "",
    eventDate: "",
    eventTime: "",
    eventDetails: "",
  });
  const [featuredErrors, setFeaturedErrors] = useState({});
  const [savingFeatured, setSavingFeatured] = useState(false);

  // Upcoming Events State
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [showUpcomingForm, setShowUpcomingForm] = useState(false);
  const [editingUpcoming, setEditingUpcoming] = useState(null);
  const [upcomingFormData, setUpcomingFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    attendees: "",
    status: "upcoming",
    image: null,
  });
  const [upcomingErrors, setUpcomingErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [savingUpcoming, setSavingUpcoming] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch featured event
  useEffect(() => {
    if (activeTab === "featured") {
      fetchFeaturedEvent();
    }
  }, [activeTab]);

  // Fetch upcoming events
  useEffect(() => {
    if (activeTab === "upcoming") {
      fetchUpcomingEvents();
    }
  }, [activeTab]);

  const fetchFeaturedEvent = async () => {
    setLoadingFeatured(true);
    try {
      const response = await eventsAPI.getFeaturedEvent();
      if (response && response.status === "success" && response.data) {
        setFeaturedEvent(response.data);
        setFeaturedFormData({
          title: response.data.title || "",
          description: response.data.description || "",
          targetDate: response.data.targetDate
            ? new Date(response.data.targetDate).toISOString().slice(0, 16)
            : "",
          eventDate: response.data.eventDate || "",
          eventTime: response.data.eventTime || "",
          eventDetails: response.data.eventDetails || "",
        });
      } else {
        setFeaturedEvent(null);
      }
    } catch (error) {
      console.error("Error fetching featured event:", error);
      setMessage({ type: "error", text: "Failed to load featured event" });
    } finally {
      setLoadingFeatured(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    setLoadingUpcoming(true);
    try {
      const response = await eventsAPI.getUpcomingEvents();
      if (response && response.status === "success") {
        setUpcomingEvents(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      setMessage({ type: "error", text: "Failed to load upcoming events" });
      setUpcomingEvents([]);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  // Featured Event Handlers
  const handleFeaturedSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!featuredFormData.title.trim()) errors.title = "Title is required";
    if (!featuredFormData.targetDate) errors.targetDate = "Target date is required";
    setFeaturedErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingFeatured(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await eventsAPI.setFeaturedEvent(featuredFormData);
      if (response && response.status === "success") {
        setMessage({ type: "success", text: "Featured event set successfully!" });
        setShowFeaturedForm(false);
        fetchFeaturedEvent();
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to save featured event" });
    } finally {
      setSavingFeatured(false);
    }
  };

  // Upcoming Events Handlers
  const validateUpcomingForm = () => {
    const errors = {};
    if (!upcomingFormData.title.trim()) errors.title = "Title is required";
    if (!upcomingFormData.description.trim()) errors.description = "Description is required";
    if (!upcomingFormData.date) errors.date = "Date is required";
    if (!upcomingFormData.time.trim()) errors.time = "Time is required";
    if (!upcomingFormData.location.trim()) errors.location = "Location is required";
    setUpcomingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUpcomingErrors({ ...upcomingErrors, image: "Image size must be less than 5MB" });
        return;
      }
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setUpcomingErrors({ ...upcomingErrors, image: "Invalid image format" });
        return;
      }
      setUpcomingFormData({ ...upcomingFormData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setUpcomingErrors({ ...upcomingErrors, image: "" });
    }
  };

  const handleUpcomingSubmit = async (e) => {
    e.preventDefault();
    if (!validateUpcomingForm()) return;

    setSavingUpcoming(true);
    setMessage({ type: "", text: "" });
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", upcomingFormData.title);
      formDataToSend.append("description", upcomingFormData.description);
      formDataToSend.append("date", upcomingFormData.date);
      formDataToSend.append("time", upcomingFormData.time);
      formDataToSend.append("location", upcomingFormData.location);
      formDataToSend.append("attendees", upcomingFormData.attendees || "");
      formDataToSend.append("status", upcomingFormData.status);
      if (upcomingFormData.image) {
        formDataToSend.append("image", upcomingFormData.image);
      }

      let response;
      if (editingUpcoming) {
        response = await eventsAPI.updateUpcomingEvent(editingUpcoming._id, formDataToSend);
      } else {
        response = await eventsAPI.createUpcomingEvent(formDataToSend);
      }

      if (response && response.status === "success") {
        setMessage({
          type: "success",
          text: editingUpcoming ? "Event updated successfully!" : "Event created successfully!",
        });
        resetUpcomingForm();
        fetchUpcomingEvents();
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to save event" });
    } finally {
      setSavingUpcoming(false);
    }
  };

  const handleEditUpcoming = (event) => {
    setEditingUpcoming(event);
    setUpcomingFormData({
      title: event.title || "",
      description: event.description || "",
      date: event.date ? new Date(event.date).toISOString().split("T")[0] : "",
      time: event.time || "",
      location: event.location || "",
      attendees: event.attendees || "",
      status: event.status || "upcoming",
      image: null,
    });
    setImagePreview(getImageUrl(event.imageUrl));
    setShowUpcomingForm(true);
    setMessage({ type: "", text: "" });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSavingUpcoming(true);
    try {
      const response = await eventsAPI.deleteUpcomingEvent(deleteId);
      if (response && response.status === "success") {
        setMessage({ type: "success", text: "Event deleted successfully!" });
        fetchUpcomingEvents();
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to delete event" });
    } finally {
      setSavingUpcoming(false);
      setDeleteId(null);
    }
  };

  const resetUpcomingForm = () => {
    setUpcomingFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      attendees: "",
      status: "upcoming",
      image: null,
    });
    setUpcomingErrors({});
    setImagePreview(null);
    setEditingUpcoming(null);
    setShowUpcomingForm(false);
  };


  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Events Page Management
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Manage featured event countdown timer and upcoming events for the Events page.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab("featured");
              setMessage({ type: "", text: "" });
            }}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "featured"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Timer size={18} />
              Featured Event (Countdown)
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab("upcoming");
              setMessage({ type: "", text: "" });
            }}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "upcoming"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              Upcoming Events
            </div>
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Featured Event Tab */}
        {activeTab === "featured" && (
          <div className="space-y-6">
            {loadingFeatured ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : (
              <>
                {!showFeaturedForm ? (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    {featuredEvent ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{featuredEvent.title}</h3>
                            {featuredEvent.description && (
                              <p className="text-gray-600 mt-1">{featuredEvent.description}</p>
                            )}
                          </div>
                          <Button
                            onClick={() => setShowFeaturedForm(true)}
                            className="!w-auto"
                          >
                            <Edit size={18} className="mr-2" /> Edit
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-gray-500">Target Date</p>
                            <p className="font-semibold">
                              {new Date(featuredEvent.targetDate).toLocaleString()}
                            </p>
                          </div>
                          {featuredEvent.eventDate && (
                            <div>
                              <p className="text-sm text-gray-500">Event Date</p>
                              <p className="font-semibold">{featuredEvent.eventDate}</p>
                            </div>
                          )}
                          {featuredEvent.eventTime && (
                            <div>
                              <p className="text-sm text-gray-500">Event Time</p>
                              <p className="font-semibold">{featuredEvent.eventTime}</p>
                            </div>
                          )}
                        </div>
                        {featuredEvent.eventDetails && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-gray-500 mb-1">Event Details</p>
                            <p className="text-gray-700">{featuredEvent.eventDetails}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No featured event set</p>
                        <Button onClick={() => setShowFeaturedForm(true)} className="!w-auto">
                          <Plus size={18} className="mr-2" /> Set Featured Event
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Set Featured Event</h3>
                      <button
                        onClick={() => {
                          setShowFeaturedForm(false);
                          if (featuredEvent) {
                            setFeaturedFormData({
                              title: featuredEvent.title || "",
                              description: featuredEvent.description || "",
                              targetDate: featuredEvent.targetDate
                                ? new Date(featuredEvent.targetDate).toISOString().slice(0, 16)
                                : "",
                              eventDate: featuredEvent.eventDate || "",
                              eventTime: featuredEvent.eventTime || "",
                              eventDetails: featuredEvent.eventDetails || "",
                            });
                          }
                        }}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <form onSubmit={handleFeaturedSubmit} className="space-y-4">
                      <InputField
                        label="Event Title *"
                        placeholder="e.g. Kartiki Ekadashi Utsav 2025"
                        type="text"
                        icon={FileText}
                        value={featuredFormData.title}
                        onChange={(e) =>
                          setFeaturedFormData({ ...featuredFormData, title: e.target.value })
                        }
                        error={featuredErrors.title}
                      />
                      <InputField
                        label="Description"
                        placeholder="Event description"
                        type="text"
                        icon={FileText}
                        value={featuredFormData.description}
                        onChange={(e) =>
                          setFeaturedFormData({ ...featuredFormData, description: e.target.value })
                        }
                      />
                      <InputField
                        label="Target Date (for countdown) *"
                        placeholder=""
                        type="datetime-local"
                        icon={Clock}
                        value={featuredFormData.targetDate}
                        onChange={(e) =>
                          setFeaturedFormData({ ...featuredFormData, targetDate: e.target.value })
                        }
                        error={featuredErrors.targetDate}
                      />
                      <InputField
                        label="Event Date (Display)"
                        placeholder="e.g. November 02, 2025"
                        type="text"
                        icon={Calendar}
                        value={featuredFormData.eventDate}
                        onChange={(e) =>
                          setFeaturedFormData({ ...featuredFormData, eventDate: e.target.value })
                        }
                      />
                      <InputField
                        label="Event Time (Display)"
                        placeholder="e.g. 9:00 AM - 10:00 PM"
                        type="text"
                        icon={Clock}
                        value={featuredFormData.eventTime}
                        onChange={(e) =>
                          setFeaturedFormData({ ...featuredFormData, eventTime: e.target.value })
                        }
                      />
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Event Details
                        </label>
                        <textarea
                          className="w-full py-3 px-4 min-h-[100px] rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none resize-y"
                          placeholder="Maha Aarti, Bhajan Sessions, Cultural Programs & Prasad Distribution"
                          value={featuredFormData.eventDetails}
                          onChange={(e) =>
                            setFeaturedFormData({ ...featuredFormData, eventDetails: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowFeaturedForm(false);
                            if (featuredEvent) fetchFeaturedEvent();
                          }}
                          className="!w-auto"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" isLoading={savingFeatured} className="!w-auto">
                          Save Featured Event <ArrowRight size={18} className="ml-2" />
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Upcoming Events Tab */}
        {activeTab === "upcoming" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  resetUpcomingForm();
                  setShowUpcomingForm(true);
                }}
                className="!w-auto"
              >
                <Plus size={18} className="mr-2" /> Create Upcoming Event
              </Button>
            </div>

            {showUpcomingForm && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingUpcoming ? "Edit Upcoming Event" : "Create Upcoming Event"}
                  </h3>
                  <button onClick={resetUpcomingForm} className="p-2 rounded-full hover:bg-gray-100">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleUpcomingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Event Title *"
                      placeholder="e.g. Shri Vitthal Rakhumai Cricket Cup"
                      type="text"
                      icon={FileText}
                      value={upcomingFormData.title}
                      onChange={(e) =>
                        setUpcomingFormData({ ...upcomingFormData, title: e.target.value })
                      }
                      error={upcomingErrors.title}
                    />
                    <InputField
                      label="Event Date *"
                      type="date"
                      icon={Calendar}
                      value={upcomingFormData.date}
                      onChange={(e) =>
                        setUpcomingFormData({ ...upcomingFormData, date: e.target.value })
                      }
                      error={upcomingErrors.date}
                    />
                    <InputField
                      label="Event Time *"
                      placeholder="e.g. Starts 3:30 PM (Nov 1st)"
                      type="text"
                      icon={Clock}
                      value={upcomingFormData.time}
                      onChange={(e) =>
                        setUpcomingFormData({ ...upcomingFormData, time: e.target.value })
                      }
                      error={upcomingErrors.time}
                    />
                    <InputField
                      label="Location *"
                      placeholder="e.g. Shri Vitthal Rakhumai Kridaangan"
                      type="text"
                      icon={MapPin}
                      value={upcomingFormData.location}
                      onChange={(e) =>
                        setUpcomingFormData({ ...upcomingFormData, location: e.target.value })
                      }
                      error={upcomingErrors.location}
                    />
                    <InputField
                      label="Expected Attendees"
                      placeholder="e.g. Teams participating: 20+"
                      type="text"
                      icon={Users}
                      value={upcomingFormData.attendees}
                      onChange={(e) =>
                        setUpcomingFormData({ ...upcomingFormData, attendees: e.target.value })
                      }
                    />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none"
                        value={upcomingFormData.status}
                        onChange={(e) =>
                          setUpcomingFormData({ ...upcomingFormData, status: e.target.value })
                        }
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="recurring">Recurring</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      className={`w-full py-3 px-4 min-h-[100px] rounded-xl bg-gray-50 border outline-none resize-y ${
                        upcomingErrors.description
                          ? "border-red-400"
                          : "border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                      }`}
                      placeholder="Event description"
                      value={upcomingFormData.description}
                      onChange={(e) =>
                        setUpcomingFormData({ ...upcomingFormData, description: e.target.value })
                      }
                    />
                    {upcomingErrors.description && (
                      <p className="text-xs text-red-500 mt-1">{upcomingErrors.description}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cover Image
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                          id="upcoming-image-upload"
                        />
                        <label
                          htmlFor="upcoming-image-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer border-orange-200 bg-orange-50 hover:bg-orange-100"
                        >
                          <ImageIcon size={24} className="text-orange-400" />
                          <span className="mt-2 text-sm font-medium text-orange-600">
                            {upcomingFormData.image ? "Change Image" : "Upload Photo"}
                          </span>
                        </label>
                        {upcomingErrors.image && (
                          <p className="text-xs text-red-500 mt-1">{upcomingErrors.image}</p>
                        )}
                      </div>
                      {imagePreview && (
                        <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={resetUpcomingForm} className="!w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={savingUpcoming} className="!w-auto">
                      {editingUpcoming ? "Update Event" : "Create Event"}{" "}
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {loadingUpcoming ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="bg-white p-16 rounded-xl shadow-sm border border-gray-200 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Events</h3>
                <p className="text-gray-500 mb-8">Create your first upcoming event</p>
                <div className="flex justify-center">
                  <Button onClick={() => setShowUpcomingForm(true)} className="!w-auto">
                    <Plus size={18} className="mr-2" /> Create Event
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                  >
                    {event.imageUrl && (
                      <div className="h-48 bg-gray-100 overflow-hidden">
                        <img
                          src={getImageUrl(event.imageUrl)}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${
                            event.status === "upcoming"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => handleEditUpcoming(event)}
                          className="!w-full !py-2 !text-xs"
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setDeleteId(event._id)}
                          className="!w-full !py-2 !text-xs"
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Event?</h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="dangerPrimary" onClick={confirmDelete} isLoading={savingUpcoming} className="flex-1">
                    Confirm Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPageView;

