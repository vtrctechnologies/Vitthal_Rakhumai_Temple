import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import { bannerAPI } from "../../services/api";
import { Button } from "../customUi/AdminShared";
import { getImageUrl } from "../../utils/imageUrl";

const BannerView = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    position: "hero",
    order: 0,
    year: new Date().getFullYear(),
    isActive: true,
    link: "",
    image: null,
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [togglingBanner, setTogglingBanner] = useState(null); // Track which banner is being toggled

  const positionOptions = [
    { value: "hero", label: "Hero (Large Left)" },
    { value: "top-right", label: "Top Right" },
    { value: "middle-right", label: "Middle Right" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  useEffect(() => {
    fetchBanners();
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [selectedYear]);

  const fetchAvailableYears = async () => {
    try {
      const response = await bannerAPI.getBannerYears();
      const yearsData = response?.data || (Array.isArray(response) ? response : []);
      if (Array.isArray(yearsData) && yearsData.length > 0) {
        setAvailableYears(yearsData);
      }
    } catch (error) {
      console.error("Error fetching banner years:", error);
    }
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      // Fetch all banners for selected year
      const response = await bannerAPI.getBanners({ 
        year: selectedYear.toString()
      });

      const allBanners = response?.data || (Array.isArray(response) ? response : []);
      setBanners(Array.isArray(allBanners) ? allBanners : []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setMessage({ type: "error", text: `Failed to load banners: ${error.message || "Unknown error"}` });
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) || 0 : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isImage && !isVideo) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image or video file",
        }));
        return;
      }

      // Validate file size (5MB for image, 50MB for video)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          image: `File size must be less than ${isVideo ? '50MB' : '5MB'}`,
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: "" }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      position: "hero",
      order: 0,
      year: selectedYear,
      isActive: true,
      link: "",
      image: null,
    });
    setImagePreview(null);
    setErrors({});
    setEditingBanner(null);
    setShowForm(false);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      description: banner.description || "",
      position: banner.position || "hero",
      order: banner.order || 0,
      year: banner.year || new Date().getFullYear(),
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      link: banner.link || "",
      image: null,
    });
    setImagePreview(banner.imageUrl ? getImageUrl(banner.imageUrl) : null);
    setErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.position) {
      newErrors.position = "Position is required";
    }

    if (!editingBanner && !formData.image) {
      newErrors.image = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({ type: "error", text: "Please fix the errors in the form" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);
      submitFormData.append("position", formData.position);
      submitFormData.append("order", formData.order.toString());
      submitFormData.append("year", formData.year.toString());
      submitFormData.append("isActive", formData.isActive.toString());
      submitFormData.append("link", formData.link);

      if (formData.image) {
        submitFormData.append("image", formData.image);
      }

      let response;
      if (editingBanner) {
        response = await bannerAPI.updateBanner(editingBanner._id, submitFormData);
      } else {
        response = await bannerAPI.createBanner(submitFormData);
      }

      if (response && (response.status === "success" || response.success || response.data)) {
        setMessage({
          type: "success",
          text: editingBanner
            ? "Banner updated successfully"
            : "Banner created successfully",
        });
        const createdYear = parseInt(formData.year);
        resetForm();
        if (selectedYear !== createdYear) {
          setSelectedYear(createdYear);
        } else {
          fetchBanners();
        }
        fetchAvailableYears();
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to save banner",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await bannerAPI.deleteBanner(id);
      setMessage({ type: "success", text: "Banner deleted successfully" });
      setDeleteId(null);
      fetchBanners();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting banner:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to delete banner",
      });
      setDeleteId(null);
    }
  };

  const toggleActive = async (banner) => {
    // Set toggling state for animation
    setTogglingBanner(banner._id);
    
    try {
      const submitFormData = new FormData();
      submitFormData.append("title", banner.title);
      submitFormData.append("description", banner.description);
      submitFormData.append("position", banner.position);
      submitFormData.append("order", banner.order.toString());
      submitFormData.append("year", banner.year.toString());
      submitFormData.append("isActive", (!banner.isActive).toString());
      submitFormData.append("link", banner.link || "");

      const response = await bannerAPI.updateBanner(banner._id, submitFormData);
      if (response && response.status === "success") {
        // Keep animation state for a moment before fetching
        setTimeout(() => {
          setTogglingBanner(null);
          fetchBanners();
        }, 300);
      } else {
        setTogglingBanner(null);
      }
    } catch (error) {
      console.error("Error toggling banner status:", error);
      setTogglingBanner(null);
      setMessage({
        type: "error",
        text: "Failed to update banner status",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom Animations for Eye Icon */}
      <style>{`
        @keyframes eyeToggle {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          30% {
            transform: scale(0.7) rotate(90deg);
            opacity: 0.3;
          }
          70% {
            transform: scale(0.7) rotate(270deg);
            opacity: 0.3;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        
        @keyframes eyeClick {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.85);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .eye-toggle-animation {
          animation: eyeToggle 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .eye-icon-transition {
          transition: all 0.2s ease-in-out;
        }
        
        .eye-button-hover:hover:not(:disabled) {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .eye-button-active:active:not(:disabled) {
          animation: eyeClick 0.2s ease-out;
        }
        
        .eye-button-disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Banner Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage website banners for the banner page by year
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="admin-year-select" className="text-sm font-medium text-gray-700">
              Year:
            </label>
            <select
              id="admin-year-select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }));
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {(availableYears.length > 0
                ? availableYears
                : Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + 5 - i)
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="!w-auto"
          >
            <Plus size={18} className="mr-2" /> Create Banner
          </Button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-display font-bold">
                {editingBanner ? "Edit Banner" : "Create New Banner"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter banner title"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter banner description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position *
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.position ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {positionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.position && (
                    <p className="text-red-500 text-xs mt-1">{errors.position}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i + 5).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (Optional)
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image/Video {!editingBanner && "*"}
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.image && (
                    <p className="text-red-500 text-xs">{errors.image}</p>
                  )}
                  {(imagePreview || (editingBanner && editingBanner.imageUrl)) && (
                    <div className="mt-2 relative">
                      { (imagePreview?.startsWith('data:video') || editingBanner?.resourceType === 'video') ? (
                        <video 
                          src={imagePreview || getImageUrl(editingBanner.imageUrl)} 
                          className="w-full h-48 object-cover rounded-md border border-gray-300"
                          controls
                        />
                      ) : (
                        <img
                          src={imagePreview || getImageUrl(editingBanner.imageUrl)}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-md border border-gray-300"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active (visible on website)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
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
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingBanner ? (
                    "Update Banner"
                  ) : (
                    "Create Banner"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banners List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Banners</h3>
          <p className="text-gray-500 mb-8">Create your first banner</p>
          <Button onClick={() => setShowForm(true)} className="!w-auto">
            <Plus size={18} className="mr-2" /> Create Banner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 bg-gray-100">
                {banner.imageUrl ? (
                  <img
                    src={getImageUrl(banner.imageUrl)}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`p-2 rounded-full transition-all duration-200 eye-button-hover eye-button-active ${
                      banner.isActive
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-400 text-white hover:bg-gray-500"
                    } ${
                      togglingBanner === banner._id 
                        ? "eye-toggle-animation eye-button-disabled" 
                        : ""
                    }`}
                    title={banner.isActive ? "Click to hide" : "Click to show"}
                    disabled={togglingBanner === banner._id}
                  >
                    {banner.isActive ? (
                      <Eye 
                        size={16} 
                        className={`eye-icon-transition ${
                          togglingBanner === banner._id ? "eye-toggle-animation" : ""
                        }`}
                      />
                    ) : (
                      <EyeOff 
                        size={16} 
                        className={`eye-icon-transition ${
                          togglingBanner === banner._id ? "eye-toggle-animation" : ""
                        }`}
                      />
                    )}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {banner.title}
                  </h3>
                </div>
                {banner.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {banner.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                    {positionOptions.find((p) => p.value === banner.position)?.label ||
                      banner.position}
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-medium">
                    {banner.year || new Date().getFullYear()}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    Order: {banner.order}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(banner)}
                    className="flex-1"
                  >
                    <Edit size={16} className="mr-1" /> Edit
                  </Button>
                  <Button
                    variant="dangerPrimary"
                    size="sm"
                    onClick={() => setDeleteId(banner._id)}
                    className="flex-1"
                  >
                    <Trash2 size={16} className="mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Delete Banner?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this banner? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="dangerPrimary"
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerView;

