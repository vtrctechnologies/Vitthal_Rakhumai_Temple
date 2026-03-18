import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { heroFestivalAPI } from "../../services/api";
import { Button } from "../customUi/AdminShared";

const HeroFestivalView = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    titleMarathi: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    setLoading(true);
    try {
      const response = await heroFestivalAPI.getAllHeroFestivals();
      if (response && response.status === "success") {
        setFestivals(Array.isArray(response.data) ? response.data : []);
      } else {
        setFestivals([]);
      }
    } catch (error) {
      console.error("Error fetching festivals:", error);
      setMessage({ type: "error", text: "Failed to load festivals" });
      setFestivals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      titleMarathi: "",
      isActive: true,
    });
    setErrors({});
    setEditingFestival(null);
    setShowForm(false);
  };

  const handleEdit = (festival) => {
    setEditingFestival(festival);
    setFormData({
      title: festival.title || "",
      titleMarathi: festival.titleMarathi || "",
      isActive: festival.isActive !== undefined ? festival.isActive : true,
    });
    setErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Festival title is required";
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
      let response;
      if (editingFestival) {
        response = await heroFestivalAPI.updateHeroFestival(
          editingFestival._id,
          formData
        );
      } else {
        response = await heroFestivalAPI.createHeroFestival(formData);
      }

      if (response && response.status === "success") {
        setMessage({
          type: "success",
          text: editingFestival
            ? "Festival updated successfully"
            : "Festival created successfully",
        });
        resetForm();
        await fetchFestivals();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: "Unexpected response from server",
        });
      }
    } catch (error) {
      console.error("Error saving festival:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to save festival",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await heroFestivalAPI.deleteHeroFestival(id);
      setMessage({ type: "success", text: "Festival deleted successfully" });
      setDeleteId(null);
      await fetchFestivals();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting festival:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to delete festival",
      });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Hero Festival Title
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage the festival title displayed in the hero section of the home page
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="!w-auto"
        >
          <Plus size={18} className="mr-2" /> Create Festival Title
        </Button>
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
                {editingFestival ? "Edit Festival Title" : "Create Festival Title"}
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
                  Festival Title (English) *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Next Festival: Kartiki Ekadashi"
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
                  Festival Title (Marathi)
                </label>
                <input
                  type="text"
                  name="titleMarathi"
                  value={formData.titleMarathi}
                  onChange={handleInputChange}
                  placeholder="e.g., पुढील उत्सव: कार्तिकी एकादशी"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Marathi translation of the festival title
                </p>
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
                  Active (display on home page)
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
                  ) : editingFestival ? (
                    "Update Festival"
                  ) : (
                    "Create Festival"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Festivals List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : festivals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Festival Titles</h3>
          <p className="text-gray-500 mb-8">Create your first festival title</p>
          <Button onClick={() => setShowForm(true)} className="!w-auto">
            <Plus size={18} className="mr-2" /> Create Festival Title
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {festivals.map((festival) => (
            <div
              key={festival._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {festival.title}
                    </h3>
                    {festival.isActive && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-semibold">
                        Active
                      </span>
                    )}
                    {!festival.isActive && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  {festival.titleMarathi && (
                    <p className="text-lg text-gray-700 mb-2">
                      {festival.titleMarathi}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Created: {new Date(festival.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(festival)}
                    className="!w-auto"
                  >
                    <Edit size={16} className="mr-1" /> Edit
                  </Button>
                  <Button
                    variant="dangerPrimary"
                    size="sm"
                    onClick={() => setDeleteId(festival._id)}
                    className="!w-auto"
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
              Delete Festival Title?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this festival title? This action cannot be undone.
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

export default HeroFestivalView;

