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
    year: new Date().getFullYear(),
    order: 0,
    isActive: true,
    image: null,
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
      const response = await guestAPI.getGuestsAdmin({
        year: selectedYear.toString()
      });
      if (response && response.status === "success") {
        setGuests(response.data);
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      setMessage({ type: "error", text: "Failed to load guests" });
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
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
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
      year: selectedYear,
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
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          submitFormData.append('image', formData[key]);
        } else if (key !== 'image') {
          submitFormData.append(key, formData[key]);
        }
      });

      let response;
      if (editingGuest) {
        response = await guestAPI.updateGuest(editingGuest._id, submitFormData);
      } else {
        response = await guestAPI.createGuest(submitFormData);
      }

      if (response.status === "success") {
        setMessage({ type: "success", text: `Guest ${editingGuest ? 'updated' : 'created'} successfully` });
        resetForm();
        fetchGuests();
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guest Management</h2>
          <p className="text-sm text-gray-500">Manage felicitated guests and their details</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={18} className="mr-2" /> Add Guest
          </Button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guests.map((guest) => (
            <div key={guest._id} className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="h-40 bg-gray-100 italic relative">
                {guest.imageUrl && (
                  <img src={getImageUrl(guest.imageUrl)} alt={guest.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={() => handleEdit(guest)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                    <Edit size={16} className="text-blue-600" />
                  </button>
                  <button onClick={() => setDeleteId(guest._id)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">{guest.name}</h3>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  ORDER: {guest.order}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingGuest ? "Edit Guest" : "Add Guest"}</h3>
              <button onClick={resetForm}><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Internal Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Guest Name (for identification)"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image {!editingGuest && "*"}</label>
                <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded" />
                {imagePreview && (
                  <img src={imagePreview} className="mt-2 h-32 object-cover rounded" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label className="text-sm">Active</label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : "Save Guest"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this guest?</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="dangerPrimary" onClick={() => handleDelete(deleteId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestView;
