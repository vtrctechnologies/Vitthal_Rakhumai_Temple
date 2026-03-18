import React, { useState, useEffect } from "react";
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Users,
  Medal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { sportsAPI } from "../../services/api";
import { Button } from "../customUi/AdminShared";
import { getImageUrl } from "../../utils/imageUrl";

const SportsView = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSportForm, setShowSportForm] = useState(false);
  const [showWinnerForm, setShowWinnerForm] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [editingWinner, setEditingWinner] = useState(null);
  const [sportFormData, setSportFormData] = useState({
    name: "",
    title: "",
    description: "",
    heroColor: "bg-orange-100",
    order: 0,
    year: new Date().getFullYear(),
    isActive: true,
    image: null,
  });
  const [winnerFormData, setWinnerFormData] = useState({
    position: "first",
    teamName: "",
    captain: "",
    members: [],
    image: null,
  });
  const [newMember, setNewMember] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteImage, setDeleteImage] = useState(false); // Track if image should be deleted
  const [winnerImagePreview, setWinnerImagePreview] = useState(null);
  const [winnerDeleteImage, setWinnerDeleteImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [expandedWinners, setExpandedWinners] = useState({});
  const [refreshWinners, setRefreshWinners] = useState({}); // Track which sports need winner refresh
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear() + 1, new Date().getFullYear()]);

  const heroColorOptions = [
    { value: "bg-orange-100", label: "Orange" },
    { value: "bg-blue-50", label: "Blue" },
    { value: "bg-red-50", label: "Red" },
    { value: "bg-teal-50", label: "Teal" },
    { value: "bg-green-50", label: "Green" },
    { value: "bg-purple-50", label: "Purple" },
  ];

  const positionOptions = [
    { value: "first", label: "1st Place", color: "yellow" },
    { value: "second", label: "2nd Place", color: "gray" },
    { value: "third", label: "3rd Place", color: "orange" },
  ];

  useEffect(() => {
    // Fetch years first, then sports
    const initialize = async () => {
      await fetchAvailableYears();
      await fetchSports();
    };
    initialize();
  }, []);

  useEffect(() => {
    // Fetch sports when year changes
    if (selectedYear) {
      fetchSports();
    }
  }, [selectedYear]);

  const fetchAvailableYears = async () => {
    try {
      const response = await sportsAPI.getSportYears();
      if (response && response.status === "success" && response.data) {
        const years = Array.isArray(response.data) ? response.data : [];
        // Ensure we have at least current year and next year
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const allYears = new Set([...years, currentYear, nextYear]);
        const sortedYears = Array.from(allYears).sort((a, b) => b - a);
        
        setAvailableYears(sortedYears);
        if (sortedYears.length > 0) {
          // If current selected year is not in the list, use the most recent year
          if (!sortedYears.includes(selectedYear)) {
            setSelectedYear(sortedYears[0]); // Set to most recent year
          }
        }
      } else {
        // Fallback to current year and next year if API fails
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        setAvailableYears([nextYear, currentYear]);
        setSelectedYear(currentYear);
      }
    } catch (error) {
      console.error("Error fetching sport years:", error);
      // Fallback to current year and next year if API fails
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      setAvailableYears([nextYear, currentYear]);
      setSelectedYear(currentYear);
    }
  };

  const fetchSports = async () => {
    setLoading(true);
    try {
      // Fetch all sports (both active and inactive) for admin panel, filtered by year
      const params = { active: "all" };
      if (selectedYear) {
        params.year = selectedYear.toString();
      }
      console.log("Fetching sports with params:", params); // Debug log
      
      const response = await sportsAPI.getSports(params);
      console.log("Raw Sports API Response:", response); // Debug log
      console.log("Response type:", typeof response); // Debug log
      console.log("Response keys:", response ? Object.keys(response) : "null"); // Debug log
      
      let sportsList = [];
      
      // Handle response format - axios interceptor returns response.data directly
      // So response is already the data object from the server
      if (response) {
        // Check if response has status and data (normal API response)
        if (response.status === "success" && Array.isArray(response.data)) {
          sportsList = response.data;
          console.log("Extracted sports from response.data:", sportsList.length);
        } 
        // Check if response.data exists and is an array
        else if (response.data && Array.isArray(response.data)) {
          sportsList = response.data;
          console.log("Extracted sports from response.data (no status):", sportsList.length);
        } 
        // Check if response itself is an array (direct array response)
        else if (Array.isArray(response)) {
          sportsList = response;
          console.log("Response is array directly:", sportsList.length);
        } 
        // Check if response has a data property that's an array
        else if (response.data && Array.isArray(response.data)) {
          sportsList = response.data;
          console.log("Extracted from nested response.data:", sportsList.length);
        }
        else {
          console.warn("Unexpected response format:", response);
          console.warn("Response structure:", JSON.stringify(response, null, 2));
          sportsList = [];
        }
      } else {
        console.warn("Response is null or undefined");
        sportsList = [];
      }
      
      console.log("Final sports list:", sportsList.length, "for year:", selectedYear); // Debug log
      console.log("Sports data:", sportsList); // Debug log
      setSports(sportsList);
      
      if (sportsList.length === 0) {
        console.log(`No sports found for year ${selectedYear}`);
        setMessage({ 
          type: "info", 
          text: `No sports found for year ${selectedYear}. Create a new sport to get started.` 
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      } else {
        setMessage({ type: "", text: "" }); // Clear any previous messages
      }
    } catch (error) {
      console.error("Error fetching sports:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      const errorMessage = error.message || "Failed to load sports. Please check your connection.";
      setMessage({ type: "error", text: errorMessage });
      setSports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSportWinners = async (sportId) => {
    try {
      const response = await sportsAPI.getSportWithWinners(sportId);
      if (response && response.status === "success") {
        return response.data.winners;
      }
      return { first: null, second: null, third: null };
    } catch (error) {
      console.error("Error fetching winners:", error);
      return { first: null, second: null, third: null };
    }
  };

  const handleSportInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSportFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleWinnerInputChange = (e) => {
    const { name, value } = e.target;
    setWinnerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }

      setSportFormData((prev) => ({ ...prev, image: file }));
      setDeleteImage(false); // Reset delete flag when new image is selected
      setErrors((prev) => ({ ...prev, image: "" }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWinnerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          winnerImage: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          winnerImage: "Image size must be less than 5MB",
        }));
        return;
      }

      setWinnerFormData((prev) => ({ ...prev, image: file }));
      setWinnerDeleteImage(false); // Reset delete flag when new image is selected
      setErrors((prev) => ({ ...prev, winnerImage: "" }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setWinnerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteWinnerImage = () => {
    setWinnerFormData((prev) => ({ ...prev, image: null }));
    setWinnerImagePreview(null);
    setWinnerDeleteImage(true);
    // Reset file input
    const fileInput = document.querySelector('#winner-image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDeleteImage = () => {
    setSportFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    setDeleteImage(true);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const addMember = () => {
    if (newMember.trim()) {
      setWinnerFormData((prev) => ({
        ...prev,
        members: [...prev.members, newMember.trim()],
      }));
      setNewMember("");
    }
  };

  const removeMember = (index) => {
    setWinnerFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const resetSportForm = () => {
    setSportFormData({
      name: "",
      title: "",
      description: "",
      heroColor: "bg-orange-100",
      order: 0,
      year: new Date().getFullYear(),
      isActive: true,
      image: null,
    });
    setImagePreview(null);
    setDeleteImage(false);
    setErrors({});
    setEditingSport(null);
    setShowSportForm(false);
  };

  const resetWinnerForm = () => {
    setWinnerFormData({
      position: "first",
      teamName: "",
      captain: "",
      members: [],
      image: null,
    });
    setNewMember("");
    setWinnerImagePreview(null);
    setWinnerDeleteImage(false);
    setErrors({});
    setEditingWinner(null);
    setSelectedSport(null);
    setSelectedPosition(null);
    setShowWinnerForm(false);
  };

  const handleEditSport = (sport) => {
    setEditingSport(sport);
    setSportFormData({
      name: sport.name || "",
      title: sport.title || "",
      description: sport.description || "",
      heroColor: sport.heroColor || "bg-orange-100",
      order: sport.order || 0,
      year: sport.year || new Date().getFullYear(),
      isActive: sport.isActive !== undefined ? sport.isActive : true,
      image: null,
    });
    setImagePreview(getImageUrl(sport.imageUrl));
    setDeleteImage(false); // Reset delete flag when editing
    setErrors({});
    setShowSportForm(true);
  };

  const handleEditWinner = async (sport, position) => {
    setSelectedSport(sport);
    setSelectedPosition(position);
    
    // Fetch winners for this sport
    const winners = await fetchSportWinners(sport._id);
    const winner = winners[position];

    if (winner) {
      setEditingWinner(winner);
      setWinnerFormData({
        position: winner.position || position,
        teamName: winner.teamName || "",
        captain: winner.captain || "",
        members: winner.members ? winner.members.map((m) => m.name) : [],
        image: null,
      });
      setWinnerImagePreview(getImageUrl(winner.imageUrl));
      setWinnerDeleteImage(false);
    } else {
      setEditingWinner(null);
      setWinnerFormData({
        position: position,
        teamName: "",
        captain: "",
        members: [],
        image: null,
      });
      setWinnerImagePreview(null);
      setWinnerDeleteImage(false);
    }
    setErrors({});
    setShowWinnerForm(true);
  };



  const validateSportForm = () => {
    const newErrors = {};
    if (!sportFormData.name.trim()) {
      newErrors.name = "Sport name is required";
    }
    if (!sportFormData.title.trim()) {
      newErrors.title = "Sport title is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateWinnerForm = () => {
    const newErrors = {};
    if (!winnerFormData.teamName.trim()) {
      newErrors.teamName = "Team name is required";
    }
    if (!winnerFormData.captain.trim()) {
      newErrors.captain = "Captain name is required";
    }
    if (winnerFormData.members.length === 0) {
      newErrors.members = "At least one team member is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSportSubmit = async (e) => {
    e.preventDefault();

    if (!validateSportForm()) {
      setMessage({ type: "error", text: "Please fix the errors in the form" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const submitFormData = new FormData();
      submitFormData.append("name", sportFormData.name);
      submitFormData.append("title", sportFormData.title);
      submitFormData.append("description", sportFormData.description);
      submitFormData.append("heroColor", sportFormData.heroColor);
      submitFormData.append("order", sportFormData.order.toString());
      submitFormData.append("year", sportFormData.year.toString());
      submitFormData.append("isActive", sportFormData.isActive.toString());

      if (sportFormData.image) {
        submitFormData.append("image", sportFormData.image);
      }

      // If editing and deleteImage is true, send a flag to delete the image
      if (editingSport && deleteImage) {
        submitFormData.append("deleteImage", "true");
      }

      let response;
      if (editingSport) {
        response = await sportsAPI.updateSport(editingSport._id, submitFormData);
      } else {
        response = await sportsAPI.createSport(submitFormData);
      }

      if (response && response.status === "success") {
        setMessage({
          type: "success",
          text: editingSport ? "Sport updated successfully" : "Sport created successfully",
        });
        resetSportForm();
        // Immediately refresh sports list
        await fetchSports();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: "Unexpected response from server",
        });
      }
    } catch (error) {
      console.error("Error saving sport:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to save sport",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWinnerSubmit = async (e) => {
    e.preventDefault();

    if (!validateWinnerForm()) {
      setMessage({ type: "error", text: "Please fix the errors in the form" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const submitFormData = new FormData();
      submitFormData.append("position", winnerFormData.position);
      submitFormData.append("teamName", winnerFormData.teamName);
      submitFormData.append("captain", winnerFormData.captain);
      submitFormData.append("members", JSON.stringify(winnerFormData.members));

      if (winnerFormData.image) {
        submitFormData.append("image", winnerFormData.image);
      }

      // If editing and deleteImage is true, send a flag to delete the image
      if (editingWinner && winnerDeleteImage) {
        submitFormData.append("deleteImage", "true");
      }

      const response = await sportsAPI.createOrUpdateWinner(selectedSport._id, submitFormData);

      if (response && response.status === "success") {
        setMessage({
          type: "success",
          text: editingWinner ? "Winner updated successfully" : "Winner set successfully",
        });
        resetWinnerForm();
        // Immediately refresh sports and trigger winner refresh for the specific sport
        await fetchSports();
        // Trigger refresh for the specific sport's winners
        setRefreshWinners((prev) => ({
          ...prev,
          [selectedSport._id]: Date.now(), // Use timestamp to force refresh
        }));
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: "Unexpected response from server",
        });
      }
    } catch (error) {
      console.error("Error saving winner:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to save winner",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSport = async (id) => {
      try {
      await sportsAPI.deleteSport(id);
      setMessage({ type: "success", text: "Sport deleted successfully" });
      setDeleteId(null);
      // Immediately refresh sports list
      await fetchSports();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting sport:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to delete sport",
      });
      setDeleteId(null);
    }
  };

  const toggleWinners = async (sportId) => {
    if (expandedWinners[sportId]) {
      setExpandedWinners((prev) => ({ ...prev, [sportId]: false }));
    } else {
      setExpandedWinners((prev) => ({ ...prev, [sportId]: true }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Sports Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage sports categories, titles, and winners
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="year-filter" className="text-sm font-medium text-gray-700">
              Filter by Year:
            </label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              )}
            </select>
          </div>
          <Button
            onClick={() => {
              resetSportForm();
              setShowSportForm(true);
            }}
            className="!w-auto"
          >
            <Plus size={18} className="mr-2" /> Create Sport
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

      {/* Sport Form Modal */}
      {showSportForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-display font-bold">
                {editingSport ? "Edit Sport" : "Create New Sport"}
              </h3>
              <button
                onClick={resetSportForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSportSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={sportFormData.name}
                  onChange={handleSportInputChange}
                  placeholder="e.g., Cricket, Volleyball"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={sportFormData.title}
                  onChange={handleSportInputChange}
                  placeholder="e.g., Cricket Championship"
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
                  value={sportFormData.description}
                  onChange={handleSportInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Sport description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={sportFormData.year}
                    onChange={handleSportInputChange}
                    min="2000"
                    max="2100"
                    placeholder={new Date().getFullYear().toString()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Year when the sport event takes place
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Color
                  </label>
                  <select
                    name="heroColor"
                    value={sportFormData.heroColor}
                    onChange={handleSportInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {heroColorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={sportFormData.order}
                  onChange={handleSportInputChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image {!editingSport && "(Optional)"}
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.image && (
                    <p className="text-red-500 text-xs">{errors.image}</p>
                  )}
                  {(imagePreview || (editingSport && editingSport.imageUrl && !deleteImage)) && (
                    <div className="mt-2 relative">
                      <img
                        src={imagePreview || getImageUrl(editingSport.imageUrl)}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                        title="Delete image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={sportFormData.isActive}
                  onChange={handleSportInputChange}
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
                  onClick={resetSportForm}
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
                  ) : editingSport ? (
                    "Update Sport"
                  ) : (
                    "Create Sport"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Winner Form Modal */}
      {showWinnerForm && selectedSport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-display font-bold">
                {editingWinner ? "Edit Winner" : "Set Winner"} - {selectedSport.name}
              </h3>
              <button
                onClick={resetWinnerForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleWinnerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <select
                  name="position"
                  value={winnerFormData.position}
                  onChange={handleWinnerInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {positionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  name="teamName"
                  value={winnerFormData.teamName}
                  onChange={handleWinnerInputChange}
                  placeholder="e.g., Pandharpur Warriors"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.teamName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.teamName && (
                  <p className="text-red-500 text-xs mt-1">{errors.teamName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Captain Name *
                </label>
                <input
                  type="text"
                  name="captain"
                  value={winnerFormData.captain}
                  onChange={handleWinnerInputChange}
                  placeholder="e.g., R. Deshmukh"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.captain ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.captain && (
                  <p className="text-red-500 text-xs mt-1">{errors.captain}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Members *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addMember();
                      }
                    }}
                    placeholder="Enter member name and press Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Button type="button" onClick={addMember} className="!w-auto">
                    <Plus size={16} className="mr-1" /> Add
                  </Button>
                </div>
                {errors.members && (
                  <p className="text-red-500 text-xs mb-2">{errors.members}</p>
                )}
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {winnerFormData.members.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No members added yet
                    </p>
                  ) : (
                    winnerFormData.members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          {member}
                          {member === winnerFormData.captain && (
                            <span className="ml-2 text-xs text-primary font-semibold">
                              (C)
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Image (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    id="winner-image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleWinnerImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.winnerImage && (
                    <p className="text-red-500 text-xs">{errors.winnerImage}</p>
                  )}
                  {(winnerImagePreview || (editingWinner && editingWinner.imageUrl && !winnerDeleteImage)) && (
                    <div className="mt-2 relative">
                      <img
                        src={winnerImagePreview || getImageUrl(editingWinner.imageUrl)}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteWinnerImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                        title="Delete image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetWinnerForm}
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
                  ) : editingWinner ? (
                    "Update Winner"
                  ) : (
                    "Set Winner"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sports List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Sports</h3>
          <p className="text-gray-500 mb-8">Create your first sport category</p>
          <Button onClick={() => setShowSportForm(true)} className="!w-auto">
            <Plus size={18} className="mr-2" /> Create Sport
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {sports.map((sport) => (
            <SportCard
              key={sport._id}
              sport={sport}
              onEdit={handleEditSport}
              onDelete={() => setDeleteId(sport._id)}
              onEditWinner={handleEditWinner}
              expanded={expandedWinners[sport._id]}
              onToggleWinners={() => toggleWinners(sport._id)}
              fetchWinners={fetchSportWinners}
              refreshTrigger={refreshWinners[sport._id]}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Delete Sport?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this sport? This will also delete all associated winners. This action cannot be undone.
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
                onClick={() => handleDeleteSport(deleteId)}
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

// Sport Card Component
const SportCard = ({
  sport,
  onEdit,
  onDelete,
  onEditWinner,
  expanded,
  onToggleWinners,
  fetchWinners,
  refreshTrigger,
}) => {
  const [winners, setWinners] = useState({ first: null, second: null, third: null });
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(null);

  const loadWinners = async () => {
    setLoadingWinners(true);
    try {
      const winnersData = await fetchWinners(sport._id);
      setWinners(winnersData);
    } catch (error) {
      console.error("Error loading winners:", error);
      setWinners({ first: null, second: null, third: null });
    } finally {
      setLoadingWinners(false);
    }
  };

  useEffect(() => {
    if (expanded || refreshTrigger) {
      loadWinners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, refreshTrigger, sport._id]); // Refresh when expanded, refreshTrigger, or sport changes

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${API_BASE_URL}${imageUrl}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{sport.name}</h3>
              <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {sport.year}
              </span>
              {!sport.isActive && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">{sport.title}</p>
            {sport.description && (
              <p className="text-sm text-gray-600">{sport.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(sport)}
              className="!w-auto"
            >
              <Edit size={16} className="mr-1" /> Edit
            </Button>
            <Button
              variant="dangerPrimary"
              size="sm"
              onClick={onDelete}
              className="!w-auto"
            >
              <Trash2 size={16} className="mr-1" /> Delete
            </Button>
          </div>
        </div>

        {/* Winners Section */}
        <div className="mt-4 border-t pt-4">
          <button
            onClick={onToggleWinners}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Medal className="text-orange-500" size={20} />
              <span className="font-semibold text-gray-900">Winners</span>
            </div>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {expanded && (
            <div className="mt-4 space-y-4">
              {loadingWinners ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {["first", "second", "third"].map((position) => {
                    const winner = winners[position];
                    const positionInfo = {
                      first: { label: "1st Place", color: "yellow" },
                      second: { label: "2nd Place", color: "gray" },
                      third: { label: "3rd Place", color: "orange" },
                    }[position];

                    return (
                      <div
                        key={position}
                        className={`border-2 rounded-lg p-4 ${
                          position === "first"
                            ? "border-yellow-400 bg-yellow-50"
                            : position === "second"
                            ? "border-gray-400 bg-gray-50"
                            : "border-orange-300 bg-orange-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm">
                            {positionInfo.label}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditWinner(sport, position)}
                            className="!w-auto"
                          >
                            {winner ? (
                              <>
                                <Edit size={14} className="mr-1" /> Edit
                              </>
                            ) : (
                              <>
                                <Plus size={14} className="mr-1" /> Set Winner
                              </>
                            )}
                          </Button>
                        </div>
                        {winner ? (
                          <div>
                            <p className="font-semibold text-gray-900">
                              {winner.teamName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Capt: {winner.captain}
                            </p>
                            {winner.members && winner.members.length > 0 && (
                              <button
                                onClick={() => setShowMembersModal(winner)}
                                className="mt-2 text-sm text-primary hover:underline"
                              >
                                View {winner.members.length} members
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">No winner set</p>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Team Members Modal */}
      {showMembersModal && (
        <TeamMembersModal
          winner={showMembersModal}
          onClose={() => setShowMembersModal(null)}
        />
      )}
    </div>
  );
};

// Team Members Modal Component
const TeamMembersModal = ({ winner, onClose }) => {
  const members = winner.members ? winner.members.map((m) => 
    typeof m === "string" ? m : m.name
  ) : [];

  return (
    <>
      <style>{`
        .team-members-scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        .team-members-scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .team-members-scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .team-members-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col" style={{ maxHeight: '85vh' }}>
          <div className="px-6 py-4 border-b flex justify-between items-center flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{winner.teamName}</h3>
              <p className="text-sm text-gray-600">Team Members ({members.length})</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div 
            className="flex-1 overflow-y-auto p-6 team-members-scroll-container"
            style={{
              height: 'calc(85vh - 140px)',
              maxHeight: 'calc(85vh - 140px)',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9',
              overflowY: 'auto',
              overflowX: 'hidden',
              overscrollBehavior: 'contain'
            }}
          >
            <div className="space-y-2">
              {members.length > 0 ? (
                members.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Users size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {member}
                        {(member === winner.captain || (typeof member === "string" && member.includes(winner.captain))) && (
                          <span className="ml-2 text-xs text-primary font-semibold">
                            (Captain)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">No members added</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SportsView;

