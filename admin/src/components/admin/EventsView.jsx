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
  MoreVertical,
  Loader2,
} from "lucide-react";
import { eventsAPI } from "../../services/api"; // Adjust path
import { Button, InputField } from "../customUi/AdminShared";
import { getImageUrl } from "../../utils/imageUrl";

const EventsView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [filterYear, setFilterYear] = useState("");

  // State for delete confirmation modal
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    attendees: "",
    status: "upcoming",
    image: null,
    isFeatured: false,
    year: new Date().getFullYear(),
  });

  const [errors, setErrors] = useState({});

  // Fetch events on component mount
  useEffect(() => {
    fetchYears();
    fetchEvents();
  }, [filterYear]);

  const fetchYears = async () => {
    try {
      const response = await eventsAPI.getEventYears();
      if (response && response.status === "success") {
        setAvailableYears(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching event years:", error);
    }
  };

  const fetchEvents = async () => {
    setFetching(true);
    try {
      // Fetch all events for admin panel with year filter if selected
      const params = {};
      if (filterYear) params.year = filterYear;
      const response = await eventsAPI.getEventsAdmin(params);
      console.log("Events API Response:", response);
      if (response && response.status === "success") {
        const eventsData = Array.isArray(response.data) ? response.data : [];
        setEvents(eventsData);
      } else if (Array.isArray(response)) {
        setEvents(response);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setMessage({
        type: "error",
        text: `Failed to load events: ${error.message}`,
      });
      setEvents([]);
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.time.trim()) newErrors.time = "Time is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size must be less than 5MB." });
        return;
      }
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          ...errors,
          image: "Only JPEG, PNG, GIF, and WebP images are allowed.",
        });
        return;
      }
      setFormData({ ...formData, image: file });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors({ ...errors, image: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("attendees", formData.attendees || "");
      formDataToSend.append("status", formData.status);
      formDataToSend.append("isFeatured", formData.isFeatured);
      formDataToSend.append("year", formData.year);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      let response;
      if (editingEvent) {
        response = await eventsAPI.updateEvent(
          editingEvent._id,
          formDataToSend
        );
      } else {
        response = await eventsAPI.createEvent(formDataToSend);
      }

      if (response.status === "success") {
        setMessage({
          type: "success",
          text: editingEvent
            ? "Event updated successfully!"
            : "Event created successfully!",
        });
        resetForm();
        fetchEvents();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save event.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      date: event.date ? new Date(event.date).toISOString().split("T")[0] : "",
      time: event.time || "",
      location: event.location || "",
      attendees: event.attendees || "",
      status: event.status || "upcoming",
      image: null,
      isFeatured: event.isFeatured || false,
      year: event.year || new Date().getFullYear(),
    });
    setImagePreview(getImageUrl(event.imageUrl));
    setShowForm(true);
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Trigger the delete modal
  const promptDelete = (id) => {
    setDeleteId(id);
  };

  // Execute the actual delete
  const confirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      const response = await eventsAPI.deleteEvent(deleteId);
      if (response.status === "success") {
        setMessage({ type: "success", text: "Event deleted successfully!" });
        fetchEvents(); // Re-fetch from server
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete event.",
      });
    } finally {
      setLoading(false);
      setDeleteId(null); // Close modal
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      attendees: "",
      status: "upcoming",
      image: null,
      isFeatured: false,
      year: new Date().getFullYear(),
    });
    setErrors({});
    setImagePreview(null);
    setEditingEvent(null);
    setShowForm(false);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "ongoing":
        return "bg-green-100 text-green-700 border-green-200";
      case "completed":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "cancelled":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Temple Events
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Manage ceremonies, festivals, and community gatherings.
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="!w-full md:!w-auto bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 transition-all duration-300"
          >
            <Plus size={20} className="mr-2" /> Create New Event
          </Button>
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by Year:</span>
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2 transition-all outline-none"
          >
            <option value="">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {filterYear && (
            <button
              onClick={() => setFilterYear("")}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear Filter
            </button>
          )}
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

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEvent ? "Edit Event Details" : "Plan New Event"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Fill in the details below to publish an event.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <InputField
                    label="Event Title"
                    placeholder="e.g. Maha Shivratri Celebration"
                    type="text"
                    icon={FileText}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    error={errors.title}
                  />
                </div>

                <InputField
                  label="Event Date"
                  placeholder="Select date"
                  type="date"
                  icon={Calendar}
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  error={errors.date}
                />

                <InputField
                  label="Event Time"
                  placeholder="e.g. 05:00 AM (Kakad Aarti)"
                  type="text"
                  icon={Clock}
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  error={errors.time}
                />

                <InputField
                  label="Location"
                  placeholder="e.g. Main Mandap"
                  type="text"
                  icon={MapPin}
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  error={errors.location}
                />

                <InputField
                  label="Expected Attendees"
                  placeholder="e.g. 500+ Devotees"
                  type="text"
                  icon={Users}
                  value={formData.attendees}
                  onChange={(e) =>
                    setFormData({ ...formData, attendees: e.target.value })
                  }
                  error={errors.attendees}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Description
                </label>
                <textarea
                  className={`w-full py-3 px-4 min-h-[120px] rounded-xl bg-gray-50 border transition-all duration-200 outline-none resize-y ${
                    errors.description
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  }`}
                  placeholder="Describe the significance and schedule of the event..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Event Status
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200 cursor-pointer"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <MoreVertical size={16} />
                    </div>
                  </div>
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Cover Image
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                          errors.image
                            ? "border-red-300 bg-red-50"
                            : "border-orange-200 bg-orange-50 hover:bg-orange-100"
                        }`}
                      >
                        <ImageIcon
                          size={24}
                          className={
                            errors.image ? "text-red-400" : "text-orange-400"
                          }
                        />
                        <span
                          className={`mt-2 text-sm font-medium ${
                            errors.image ? "text-red-500" : "text-orange-600"
                          }`}
                        >
                          {formData.image ? "Change Image" : "Upload Photo"}
                        </span>
                        {formData.image && (
                          <span className="text-xs text-gray-500 mt-1 max-w-[150px] truncate">
                            {formData.image.name}
                          </span>
                        )}
                      </label>
                      {errors.image && (
                        <p className="text-xs text-red-500 mt-1 ml-1">
                          {errors.image}
                        </p>
                      )}
                    </div>

                    {imagePreview && (
                      <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200 shadow-sm shrink-0 bg-gray-100">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Is Featured and Year Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Feature on Home Page (Countdown Timer)
                  </label>
                </div>
                <div>
                   <InputField
                    label="Year"
                    placeholder="e.g. 2026"
                    type="number"
                    icon={Calendar}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="!w-auto !bg-transparent !border-gray-200 !text-gray-600 hover:!bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                  className="!w-auto bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {editingEvent ? "Update Event" : "Publish Event"}{" "}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Events Grid */}
        {fetching ? (
          <div className="flex flex-col items-center justify-center py-24 text-orange-600">
            <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
            <p className="text-sm font-medium text-gray-500">
              Loading Events...
            </p>
          </div>
        ) : !Array.isArray(events) || events.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-200 border-dashed text-center max-w-lg mx-auto mt-12">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Events Scheduled
            </h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              The calendar is currently empty. Create your first event to share
              with the devotees.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="!w-auto bg-orange-600 text-white mx-auto"
            >
              <Plus size={18} className="mr-2" /> Create First Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {Array.isArray(events) &&
              events.map((event) => (
                <div
                  key={event._id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  {/* Card Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {event.imageUrl ? (
                      <img
                        src={getImageUrl(event.imageUrl)}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                        <ImageIcon size={48} />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border ${getStatusColor(
                          event.status
                        )} bg-opacity-90 backdrop-blur-sm`}
                      >
                        {event.status}
                      </span>
                    </div>

                    {/* Quick Date Overlay */}
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                      <div className="flex items-center text-white/90 gap-2 text-sm font-medium">
                        <Calendar size={14} className="text-orange-300" />
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-700 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="mt-auto space-y-3 pt-6 border-t border-gray-50">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} className="text-orange-500" />
                          <span>{event.time}</span>
                        </div>
                        {event.attendees && (
                          <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <Users size={14} />
                            <span>{event.attendees}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin
                          size={16}
                          className="text-orange-500 shrink-0"
                        />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(event)}
                      className="!w-full !py-2 !h-auto !text-xs bg-white hover:border-orange-300 hover:text-orange-600"
                    >
                      <Edit size={14} className="mr-1.5" /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => promptDelete(event._id)}
                      className="!w-full !py-2 !h-auto !text-xs !bg-white !text-red-500 !border-gray-200 hover:!bg-red-50 hover:!border-red-200"
                    >
                      <Trash2 size={14} className="mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Event?
              </h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                Are you sure you want to delete this event? This action cannot
                be undone and will remove it from the schedule.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setDeleteId(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="dangerPrimary"
                  onClick={confirmDelete}
                  isLoading={loading}
                  className="flex-1"
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsView;
