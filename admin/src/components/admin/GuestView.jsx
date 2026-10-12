import React, { useState, useEffect } from "react";
import {
  User,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import { guestAPI } from "../../services/api";
import { Button } from "../customUi/AdminShared";
import { getImageUrl } from "../../utils/imageUrl";

const GuestView = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    nameMarathi: "",
    prize: "",
    prizeMarathi: "",
    description: "",
    descriptionMarathi: "",
    year: new Date().getFullYear(),
    order: 0,
    isActive: true,
    image: null,
  });
  const [selectedYear, setSelectedYear] = useState("all");
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchGuests();
  }, [selectedYear]);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedYear !== "all") {
        params.year = selectedYear.toString();
      }
      const response = await guestAPI.getGuestsAdmin(params);
      const guestList = response?.data || (Array.isArray(response) ? response : []);
      if (Array.isArray(guestList)) {
        setGuests(guestList);
      } else {
        setGuests([]);
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      setMessage({ type: "error", text: "Failed to load guests" });
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "Please select an image file" }));
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameMarathi: "",
      prize: "",
      prizeMarathi: "",
      description: "",
      descriptionMarathi: "",
      year: selectedYear === "all" ? new Date().getFullYear() : selectedYear,
      order: 0,
      isActive: true,
      image: null,
    });
    setImagePreview(null);
    setErrors({});
    setEditingGuest(null);
    setShowForm(false);
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name || "",
      nameMarathi: guest.nameMarathi || "",
      prize: guest.prize || "",
      prizeMarathi: guest.prizeMarathi || "",
      description: guest.description || "",
      descriptionMarathi: guest.descriptionMarathi || "",
      year: guest.year || new Date().getFullYear(),
      order: guest.order || 0,
      isActive: guest.isActive !== undefined ? guest.isActive : true,
      image: null,
    });
    setImagePreview(guest.imageUrl ? getImageUrl(guest.imageUrl) : null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const submitFormData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "image" && formData[key]) {
          submitFormData.append("image", formData[key]);
        } else if (key !== "image" && formData[key] !== null && formData[key] !== undefined) {
          submitFormData.append(key, formData[key]);
        }
      });

      let response;
      if (editingGuest) {
        response = await guestAPI.updateGuest(editingGuest._id, submitFormData);
      } else {
        response = await guestAPI.createGuest(submitFormData);
      }

      if (response && (response.status === "success" || response.success)) {
        setMessage({
          type: "success",
          text: `Guest ${editingGuest ? "updated" : "created"} successfully`,
        });
        resetForm();
        fetchGuests();
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Failed to save guest",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to save guest" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await guestAPI.deleteGuest(id);
      setMessage({ type: "success", text: "Guest deleted successfully" });
      setDeleteId(null);
      fetchGuests();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete guest" });
    }
  };

  // Generate list of available years (from 2030 down to 2020)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear + 5; y >= currentYear - 5; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guest Management</h2>
          <p className="text-sm text-gray-500">Manage felicitated guests and their details</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))}
            className="px-3 py-2 border rounded-md bg-white shadow-sm font-medium"
          >
            <option value="all">All Years</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={18} className="mr-2" /> Add Guest
          </Button>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      ) : guests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">No Guests Found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {selectedYear === "all"
              ? "Start by adding honored guests to feature."
              : `No guests recorded for year ${selectedYear}.`}
          </p>
          <Button onClick={() => setShowForm(true)} className="mt-4 !w-auto">
            <Plus size={16} className="mr-2" /> Add First Guest
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guests.map((guest) => (
            <div key={guest._id} className="bg-white rounded-lg shadow border overflow-hidden group">
              <div className="h-48 bg-gray-100 relative">
                {guest.imageUrl ? (
                  <img
                    src={getImageUrl(guest.imageUrl)}
                    alt={guest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(guest)}
                    className="p-2 bg-white/90 backdrop-blur rounded-full shadow hover:bg-white transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => setDeleteId(guest._id)}
                    className="p-2 bg-white/90 backdrop-blur rounded-full shadow hover:bg-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1.5">
                  <span className="text-xs font-semibold bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur">
                    {guest.year}
                  </span>
                  {!guest.isActive && (
                    <span className="text-xs font-semibold bg-red-600/80 text-white px-2 py-0.5 rounded backdrop-blur">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-snug">{guest.name}</h3>
                    {guest.nameMarathi && (
                      <p className="text-sm text-gray-600 font-medium">{guest.nameMarathi}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full shrink-0">
                    Order: {guest.order || 0}
                  </span>
                </div>
                {(guest.prize || guest.prizeMarathi) && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                    {guest.prize || guest.prizeMarathi}
                  </p>
                )}
                {(guest.description || guest.descriptionMarathi) && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {guest.description || guest.descriptionMarathi}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900">
                {editingGuest ? "Edit Honored Guest" : "Add Honored Guest"}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Shri. Rajesh Patil"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Name (Marathi)
                  </label>
                  <input
                    type="text"
                    name="nameMarathi"
                    placeholder="उदा. श्री. राजेश पाटील"
                    value={formData.nameMarathi}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Honor / Prize (English)
                  </label>
                  <input
                    type="text"
                    name="prize"
                    placeholder="e.g. Chief Patron / Awardee"
                    value={formData.prize}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Honor / Prize (Marathi)
                  </label>
                  <input
                    type="text"
                    name="prizeMarathi"
                    placeholder="उदा. प्रमुख पाहुणे / पुरस्कारार्थी"
                    value={formData.prizeMarathi}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Description (English)
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Brief description or contribution"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Description (Marathi)
                  </label>
                  <textarea
                    name="descriptionMarathi"
                    rows={2}
                    placeholder="संक्षिप्त माहिती किंवा योगदान"
                    value={formData.descriptionMarathi}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Guest Image {!editingGuest && "*"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded"
                />
                {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image}</p>}
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-auto object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveGuest"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="isActiveGuest" className="text-sm font-medium text-gray-700">
                  Active (visible on website)
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                  {editingGuest ? "Update Guest" : "Save Guest"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this guest? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="dangerPrimary" onClick={() => handleDelete(deleteId)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestView;
