import React, { useState, useEffect } from "react";
import {
  Video,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Upload,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  ExternalLink,
  Tag,
  AlertTriangle, // Added for error messages
  CheckCircle, // Added for success messages
} from "lucide-react";
import { liveProgramsAPI } from "../../services/api";
import { Button } from "../customUi/AdminShared";
import { getImageUrl } from "../../utils/imageUrl";

// Utility for consistent button/focus color
const PRIMARY_COLOR = "red";
const PRIMARY_COLOR_CODE = "600";
const HOVER_BG = `${PRIMARY_COLOR}-50`;
const TEXT_COLOR = `${PRIMARY_COLOR}-${PRIMARY_COLOR_CODE}`;
const RING_COLOR = `${PRIMARY_COLOR}-${PRIMARY_COLOR_CODE}`;
const ACTIVE_BG = `${PRIMARY_COLOR}-700`;
const ACTIVE_TEXT = "white"; // Changed from yellow-400 for better contrast/professionalism

const LiveProgramsView = () => {
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    year: new Date().getFullYear(),
    startTimestamp: "",
    endTimestamp: "",
    youtube: "",
    facebook: "",
    instagram: "",
    twitter: "",
    other: "",
    isActive: true,
    isLive: false,
    thumbnail: null,
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    order: 0,
    isActive: true,
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteThumbnail, setDeleteThumbnail] = useState(false);
  const [errors, setErrors] = useState({});
  const [categoryErrors, setCategoryErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [togglingProgram, setTogglingProgram] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchPrograms();
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [selectedCategory]);

  // --- API and Utility functions (Keep them as is for functionality) ---

  const fetchCategories = async () => {
    try {
      const response = await liveProgramsAPI.getCategoriesAdmin();
      const categoriesList = extractCategories(response);
      setCategories(categoriesList);
      // Set default category if none selected and categories exist
      if (categoriesList.length > 0 && !formData.category) {
        const defaultCategory =
          categoriesList.find((c) => c.isActive) || categoriesList[0];
        if (defaultCategory) {
          setFormData((prev) => ({ ...prev, category: defaultCategory._id }));
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const extractCategories = (response) => {
    if (!response) return [];
    if (response.status === "success" && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    return [];
  };

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const params = { active: "all" };
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      const response = await liveProgramsAPI.getLivePrograms(params);
      const programsList = extractPrograms(response);
      setPrograms(programsList);
    } catch (error) {
      console.error("Error fetching live programs:", error);
      setMessage({
        type: "error",
        text: `Failed to load programs: ${error.message || "Unknown error"}`,
      });
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh categories when they're updated
  useEffect(() => {
    if (!showCategoryForm && !editingCategory) {
      fetchCategories();
    }
  }, [showCategoryForm, editingCategory]);

  const extractPrograms = (response) => {
    if (!response) return [];
    if (response.status === "success" && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    return [];
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "datetime-local"
          ? value
          : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          thumbnail:
            "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: "Image size must be less than 5MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, thumbnail: file }));
      setErrors((prev) => ({ ...prev, thumbnail: "" }));
      setDeleteThumbnail(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    const defaultCategory =
      categories.find((c) => c.isActive)?._id ||
      (categories.length > 0 ? categories[0]._id : "");
    setFormData({
      title: "",
      description: "",
      category: defaultCategory,
      year: new Date().getFullYear(),
      startTimestamp: "",
      endTimestamp: "",
      youtube: "",
      facebook: "",
      instagram: "",
      twitter: "",
      other: "",
      isActive: true,
      isLive: false,
      thumbnail: null,
    });
    setImagePreview(null);
    setDeleteThumbnail(false);
    setErrors({});
    setEditingProgram(null);
    setShowForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      order: 0,
      isActive: true,
    });
    setCategoryErrors({});
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleEdit = (program) => {
    const startDate = new Date(program.startTimestamp);
    const endDate = new Date(program.endTimestamp);

    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Handle category - could be object with _id or just _id
    const categoryId =
      typeof program.category === "object" && program.category?._id
        ? program.category._id
        : program.category || "";

    setFormData({
      title: program.title || "",
      description: program.description || "",
      category: categoryId,
      year: program.year || new Date().getFullYear(),
      startTimestamp: formatDateTime(startDate),
      endTimestamp: formatDateTime(endDate),
      youtube: program.socialLinks?.youtube || "",
      facebook: program.socialLinks?.facebook || "",
      instagram: program.socialLinks?.instagram || "",
      twitter: program.socialLinks?.twitter || "",
      other: program.socialLinks?.other || "",
      isActive: program.isActive !== undefined ? program.isActive : true,
      isLive: program.isLive !== undefined ? program.isLive : false,
      thumbnail: null,
    });

    setImagePreview(getImageUrl(program.thumbnailUrl));
    setDeleteThumbnail(false);
    setEditingProgram(program);
    setShowForm(true);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.year || formData.year < 2000 || formData.year > 2100) {
      newErrors.year = "Valid year is required (2000-2100)";
    }

    if (!formData.startTimestamp) {
      newErrors.startTimestamp = "Start date and time is required";
    }

    if (!formData.endTimestamp) {
      newErrors.endTimestamp = "End date and time is required";
    }

    if (formData.startTimestamp && formData.endTimestamp) {
      const start = new Date(formData.startTimestamp);
      const end = new Date(formData.endTimestamp);
      if (end <= start) {
        newErrors.endTimestamp =
          "End date and time must be after start date and time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCategoryForm = () => {
    const newErrors = {};

    if (!categoryFormData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    setCategoryErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryEdit = (category) => {
    setCategoryFormData({
      name: category.name || "",
      description: category.description || "",
      order: category.order || 0,
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setEditingCategory(category);
    setShowCategoryForm(true);
    setCategoryErrors({});
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!validateCategoryForm()) {
      setMessage({
        type: "error",
        text: "Please fix the errors in the form",
      });
      return;
    }

    setSavingCategory(true);
    setMessage({ type: "", text: "" });

    try {
      if (editingCategory) {
        await liveProgramsAPI.updateCategory(
          editingCategory._id,
          categoryFormData
        );
        setMessage({ type: "success", text: "Category updated successfully!" });
      } else {
        await liveProgramsAPI.createCategory(categoryFormData);
        setMessage({ type: "success", text: "Category created successfully!" });
      }

      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      setMessage({
        type: "error",
        text: `Failed to save category: ${error.message || "Unknown error"}`,
      });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleCategoryDelete = async (id) => {
    try {
      await liveProgramsAPI.deleteCategory(id);
      setMessage({ type: "success", text: "Category deleted successfully!" });
      setDeleteCategoryId(null);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setMessage({
        type: "error",
        text: `Failed to delete category: ${error.message || "Unknown error"}`,
      });
      setDeleteCategoryId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({
        type: "error",
        text: "Please fix the errors in the form",
      });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title.trim());
      submitFormData.append("description", formData.description.trim());
      submitFormData.append("category", formData.category);
      submitFormData.append("year", formData.year.toString());
      submitFormData.append("startTimestamp", formData.startTimestamp);
      submitFormData.append("endTimestamp", formData.endTimestamp);
      submitFormData.append("youtube", formData.youtube.trim());
      submitFormData.append("facebook", formData.facebook.trim());
      submitFormData.append("instagram", formData.instagram.trim());
      submitFormData.append("twitter", formData.twitter.trim());
      submitFormData.append("other", formData.other.trim());
      submitFormData.append("isActive", formData.isActive);
      submitFormData.append("isLive", formData.isLive);

      if (formData.thumbnail) {
        submitFormData.append("thumbnail", formData.thumbnail);
      }

      if (editingProgram) {
        if (deleteThumbnail) {
          submitFormData.append("deleteThumbnail", "true");
        }
        await liveProgramsAPI.updateLiveProgram(
          editingProgram._id,
          submitFormData
        );
        setMessage({ type: "success", text: "Program updated successfully!" });
      } else {
        await liveProgramsAPI.createLiveProgram(submitFormData);
        setMessage({ type: "success", text: "Program created successfully!" });
      }

      resetForm();
      fetchPrograms();
    } catch (error) {
      console.error("Error saving program:", error);
      setMessage({
        type: "error",
        text: `Failed to save program: ${error.message || "Unknown error"}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await liveProgramsAPI.deleteLiveProgram(id);
      setMessage({ type: "success", text: "Program deleted successfully!" });
      setDeleteId(null);
      fetchPrograms();
    } catch (error) {
      console.error("Error deleting program:", error);
      setMessage({
        type: "error",
        text: `Failed to delete program: ${error.message || "Unknown error"}`,
      });
      setDeleteId(null);
    }
  };

  const toggleActive = async (program) => {
    setTogglingProgram(program._id);
    try {
      const submitFormData = new FormData();
      submitFormData.append("isActive", !program.isActive);
      // NOTE: We only send the one field we need to update, the API should handle merging
      await liveProgramsAPI.updateLiveProgram(program._id, submitFormData);
      setMessage({
        type: "success",
        text: `Program ${
          !program.isActive ? "activated" : "deactivated"
        } successfully!`,
      });
      fetchPrograms();
    } catch (error) {
      console.error("Error toggling program:", error);
      setMessage({
        type: "error",
        text: `Failed to update program: ${error.message || "Unknown error"}`,
      });
    } finally {
      setTogglingProgram(null);
    }
  };


  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Use 12-hour format with AM/PM
    });
  };

  // --- JSX START ---
  return (
    <div className="p-4 md:p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Video size={28} className={`text-${TEXT_COLOR}`} />
            Live Programs
          </h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Manage live events, programs, and categories.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              resetCategoryForm();
              setShowCategoryForm(true);
            }}
            className="flex items-center gap-2 !w-auto"
            variant="outline"
          >
            <Tag size={18} />
            Categories
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Add Program
          </Button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-xl shadow-lg flex items-start gap-3 transition-all ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} className="mt-0.5 text-green-600" />
          ) : (
            <AlertTriangle size={20} className="mt-0.5 text-red-600" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Category Filter Tabs (Improved) */}
      <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Filter by Category:
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
              selectedCategory === "all"
                ? `bg-${ACTIVE_BG} text-${ACTIVE_TEXT} hover:bg-${PRIMARY_COLOR}-800`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Programs
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                selectedCategory === cat._id
                  ? `bg-${ACTIVE_BG} text-${ACTIVE_TEXT} hover:bg-${PRIMARY_COLOR}-800`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${!cat.isActive ? "opacity-60 line-through" : ""}`}
              title={!cat.isActive ? "Inactive Category" : cat.name}
            >
              {cat.name} {!cat.isActive ? "(Inactive)" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Programs List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">
          Program Listing
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className={`animate-spin text-${TEXT_COLOR}`} size={32} />
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              No programs found under the selected category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {programs.map((program) => {
              const categoryName =
                typeof program.category === "object" && program.category?.name
                  ? program.category.name
                  : categories.find((c) => c._id === program.category)?.name ||
                    "Unknown";

              return (
                <div
                  key={program._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 w-full bg-gray-100 flex-shrink-0">
                    {program.thumbnailUrl ? (
                      <img
                        src={getImageUrl(program.thumbnailUrl)}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <span
                      className={`absolute top-2 right-2 px-3 py-1 bg-${ACTIVE_BG}/95 text-xs font-semibold rounded-full text-${ACTIVE_TEXT} shadow-md`}
                    >
                      {categoryName}
                    </span>
                    {program.isLive && (
                      <span className="absolute bottom-2 left-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                        <span className="block w-2 h-2 rounded-full bg-white"></span>
                        LIVE NOW
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3 flex flex-col flex-grow">
                    <h3 className="font-extrabold text-lg text-gray-900 line-clamp-2">
                      {program.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 flex-grow">
                      {program.description}
                    </p>

                    <div className="space-y-1 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      {program.year && (
                        <div className="flex items-center gap-2">
                          <Tag size={14} className={`text-${TEXT_COLOR}`} />
                          <span className="font-semibold text-gray-700">
                            Year: {program.year}
                          </span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <Calendar size={14} className="flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">
                          Starts: {formatDateTime(program.startTimestamp)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock size={14} className="flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">
                          Ends: {formatDateTime(program.endTimestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Social Links Preview */}
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                      {program.socialLinks?.youtube && (
                        <Youtube
                          size={20}
                          className="text-red-600 hover:scale-110 transition-transform"
                        />
                      )}
                      {program.socialLinks?.facebook && (
                        <Facebook
                          size={20}
                          className="text-blue-600 hover:scale-110 transition-transform"
                        />
                      )}
                      {program.socialLinks?.instagram && (
                        <Instagram
                          size={20}
                          className="text-pink-600 hover:scale-110 transition-transform"
                        />
                      )}
                      {program.socialLinks?.twitter && (
                        <Twitter
                          size={20}
                          className="text-sky-500 hover:scale-110 transition-transform"
                        />
                      )}
                      {program.socialLinks?.other && (
                        <ExternalLink
                          size={20}
                          className="text-gray-600 hover:scale-110 transition-transform"
                        />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <button
                        onClick={() => toggleActive(program)}
                        disabled={togglingProgram === program._id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm ${
                          program.isActive
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        title={
                          program.isActive
                            ? "Deactivate Program"
                            : "Activate Program"
                        }
                      >
                        {togglingProgram === program._id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : program.isActive ? (
                          <>
                            <Eye size={14} />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} />
                            Inactive
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(program)}
                          className={`p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors`}
                          title="Edit Program"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteId(program._id)}
                          className={`p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors`}
                          title="Delete Program"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal (Maintains existing functionality with cleaner styles) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto transform scale-100 transition-transform duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingProgram ? "Edit Program" : "Add New Program"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <fieldset className="p-4 border border-gray-200 rounded-xl space-y-4">
                <legend className="px-2 font-semibold text-gray-700">
                  Program Details
                </legend>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${RING_COLOR} focus:border-transparent ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter program title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${RING_COLOR} focus:border-transparent ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter program description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${RING_COLOR} focus:border-transparent bg-white ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option
                          key={cat._id}
                          value={cat._id}
                          disabled={!cat.isActive}
                        >
                          {cat.name} {!cat.isActive ? "(Inactive)" : ""}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="2000"
                      max="2100"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${RING_COLOR} focus:border-transparent ${
                        errors.year ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g. 2025"
                    />
                    {errors.year && (
                      <p className="text-red-500 text-sm mt-1">{errors.year}</p>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Date & Time */}
              <fieldset className="p-4 border border-gray-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <legend className="px-2 font-semibold text-gray-700">
                  Schedule
                </legend>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar size={16} /> Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTimestamp"
                    value={formData.startTimestamp}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${RING_COLOR} focus:border-transparent ${
                      errors.startTimestamp
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.startTimestamp && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startTimestamp}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Clock size={16} /> End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTimestamp"
                    value={formData.endTimestamp}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${RING_COLOR} focus:border-transparent ${
                      errors.endTimestamp ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.endTimestamp && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endTimestamp}
                    </p>
                  )}
                </div>
              </fieldset>

              {/* Thumbnail */}
              <fieldset className="p-4 border border-gray-200 rounded-xl space-y-4">
                <legend className="px-2 font-semibold text-gray-700">
                  Thumbnail
                </legend>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {imagePreview && (
                    <div className="relative flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                      />
                      {editingProgram && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteThumbnail(true);
                            setImagePreview(null);
                            setFormData((prev) => ({
                              ...prev,
                              thumbnail: null,
                            }));
                          }}
                          className={`absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-lg`}
                          title="Remove Current Image"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex-grow w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload New Thumbnail (Max 5MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-red-50 file:text-red-700
                        hover:file:bg-red-100"
                    />
                    {errors.thumbnail && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.thumbnail}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Social Links */}
              <fieldset className="p-4 border border-gray-200 rounded-xl space-y-4">
                <legend className="px-2 font-semibold text-gray-700">
                  Social Media Links (Optional)
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Youtube size={20} className="text-red-600 flex-shrink-0" />
                    <input
                      type="url"
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="YouTube URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Facebook
                      size={20}
                      className="text-blue-600 flex-shrink-0"
                    />
                    <input
                      type="url"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Facebook URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Instagram
                      size={20}
                      className="text-pink-600 flex-shrink-0"
                    />
                    <input
                      type="url"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Instagram URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter size={20} className="text-sky-500 flex-shrink-0" />
                    <input
                      type="url"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Twitter URL"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <ExternalLink
                      size={20}
                      className="text-gray-600 flex-shrink-0"
                    />
                    <input
                      type="url"
                      name="other"
                      value={formData.other}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Other Link URL"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Status Toggles */}
              <div className="flex items-center gap-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className={`w-5 h-5 text-red-600 rounded focus:ring-${RING_COLOR} border-gray-300`}
                  />
                  <span className="text-base font-medium text-gray-700">
                    Active (Visible on frontend)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isLive"
                    checked={formData.isLive}
                    onChange={handleInputChange}
                    className={`w-5 h-5 text-red-600 rounded focus:ring-${RING_COLOR} border-gray-300`}
                  />
                  <span className="text-base font-medium text-gray-700">
                    Currently Live
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Saving...
                    </>
                  ) : editingProgram ? (
                    "Update Program"
                  ) : (
                    "Create Program"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal (Improved) */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto transform scale-100 transition-transform duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Tag size={24} className="text-red-700" />
                Manage Categories
              </h3>
              <button
                onClick={resetCategoryForm}
                className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Add/Edit Category Form */}
              <div className="p-5 bg-red-50 rounded-xl border border-red-200 shadow-sm">
                <h4 className="font-bold text-lg text-red-800 mb-4">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h4>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={categoryFormData.name}
                        onChange={(e) =>
                          setCategoryFormData({
                            ...categoryFormData,
                            name: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${RING_COLOR} focus:border-transparent ${
                          categoryErrors.name
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g. Sports, Dance, Music"
                      />
                      {categoryErrors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {categoryErrors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        value={categoryFormData.order}
                        onChange={(e) =>
                          setCategoryFormData({
                            ...categoryFormData,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={categoryFormData.description}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={categoryFormData.isActive}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          isActive: e.target.checked,
                        })
                      }
                      className={`w-4 h-4 text-red-600 rounded focus:ring-${RING_COLOR}`}
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-4 pt-2">
                    {editingCategory && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetCategoryForm}
                      >
                        Cancel Edit
                      </Button>
                    )}
                    <Button type="submit" disabled={savingCategory}>
                      {savingCategory ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          Saving...
                        </>
                      ) : editingCategory ? (
                        "Update Category"
                      ) : (
                        "Create Category"
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Categories List */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-4">
                  All Categories ({categories.length})
                </h4>
                <div className="space-y-3">
                  {categories.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500">No categories found.</p>
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat._id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg text-gray-900 truncate">
                              {cat.name}
                            </span>
                            {!cat.isActive && (
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full font-medium flex-shrink-0">
                                Inactive
                              </span>
                            )}
                            <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                              (Order: {cat.order})
                            </span>
                          </div>
                          {cat.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {cat.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleCategoryEdit(cat)}
                            className={`p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors`}
                            title="Edit Category"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteCategoryId(cat._id)}
                            className={`p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors`}
                            title="Delete Category"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Program) */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border-t-4 border-red-500">
            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
              <AlertTriangle size={24} />
              Confirm Program Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this program? This action cannot
              be undone.
            </p>
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(deleteId)}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Category) */}
      {deleteCategoryId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border-t-4 border-red-500">
            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
              <AlertTriangle size={24} />
              Confirm Category Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? This action cannot
              be undone. **Make sure no programs are currently using this
              category.**
            </p>
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setDeleteCategoryId(null)}
                disabled={savingCategory}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCategoryDelete(deleteCategoryId)}
                disabled={savingCategory}
                className="bg-red-600 hover:bg-red-700"
              >
                {savingCategory ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveProgramsView;
