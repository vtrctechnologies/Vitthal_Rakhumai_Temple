import React, { useState, useEffect } from "react";
import {
  Users,
  X,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ImageIcon,
  User,
  Briefcase,
  Filter,
} from "lucide-react";
import { committeeAPI } from "../../services/api";
import { Button, InputField } from "../customUi/AdminShared";
import { getImageUrl } from "../../utils/imageUrl";

const MembersView = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filterType, setFilterType] = useState("all"); // "all", "register", "utsav", "mahila"
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    committeeType: "register",
    order: 0,
    image: null,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setFetching(true);
    try {
      // Fetch all members (including inactive) for admin panel
      const response = await committeeAPI.getMembers();
      if (response && response.status === "success") {
        const membersData = Array.isArray(response.data) ? response.data : [];
        setMembers(membersData);
      } else if (Array.isArray(response)) {
        setMembers(response);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching committee members:", error);
      setMessage({
        type: "error",
        text: `Failed to load members: ${error.message}`,
      });
      setMembers([]);
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.role.trim()) newErrors.role = "Role is required.";
    if (!formData.committeeType)
      newErrors.committeeType = "Committee type is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size must be less than 5MB." });
        return;
      }
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
      formDataToSend.append("name", formData.name);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("committeeType", formData.committeeType);
      formDataToSend.append("order", formData.order.toString());
      formDataToSend.append("isActive", formData.isActive.toString());
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      let response;
      if (editingMember) {
        response = await committeeAPI.updateMember(
          editingMember._id,
          formDataToSend
        );
      } else {
        response = await committeeAPI.createMember(formDataToSend);
      }

      if (response.status === "success") {
        setMessage({
          type: "success",
          text: editingMember
            ? "Member updated successfully!"
            : "Member created successfully!",
        });
        resetForm();
        fetchMembers();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save member.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      role: member.role || "",
      committeeType: member.committeeType || "register",
      order: member.order || 0,
      image: null,
      isActive: member.isActive !== undefined ? member.isActive : true,
    });
    setImagePreview(getImageUrl(member.imageUrl));
    setShowForm(true);
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const promptDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      const response = await committeeAPI.deleteMember(deleteId);
      if (response.status === "success") {
        setMessage({ type: "success", text: "Member deleted successfully!" });
        fetchMembers();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete member.",
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      committeeType: "register",
      order: 0,
      image: null,
      isActive: true,
    });
    setErrors({});
    setImagePreview(null);
    setEditingMember(null);
    setShowForm(false);
  };


  const filteredMembers = members
    .filter((m) => {
      // Filter by committee type
      if (filterType !== "all" && m.committeeType !== filterType) return false;
      // Filter by active status
      if (!showInactive && !m.isActive) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by order first, then by name
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });

  // Theme constants for consistent styling
  const THEME = {
    primary: "bg-gradient-to-r from-[#6b1a1a] to-[#8b2222] hover:from-[#5a1515] hover:to-[#7a1e1e]",
    secondary: "bg-[#fef6e4] hover:bg-[#f5e6c8] text-[#6b1a1a]",
    accent: "text-[#6b1a1a]",
    border: "border-[#d4af37]/30",
    gradient: "bg-gradient-to-br from-[#fef6e4] via-[#fff8ee] to-[#f5e6c8]",
    cardHover: "hover:shadow-[#d4af37]/20",
  };

  return (
    <div className={`p-6 min-h-screen ${THEME.gradient} animate-fade-in-up`}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6" style={{ borderColor: "rgba(212,175,55,0.3)" }}>
        <div>
          <h2 className="text-3xl font-serif font-bold flex items-center gap-3" style={{ color: "#3d0f0f" }}>
            <span className="p-2 rounded-lg" style={{ background: "rgba(212,175,55,0.15)", color: "#6b1a1a" }}>
              <Users className="w-8 h-8" />
            </span>
            Committee Members
          </h2>
          <p className="mt-2 text-base ml-1" style={{ color: "#5c3317" }}>
            Manage Utsav &amp; Mahila members. <strong style={{ color: "#6b1a1a", fontSize: "0.85em" }}>Homepage is static — edit <code>StaticCommitteeMembers.jsx</code> to update it.</strong>
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className={`mt-4 md:mt-0 flex items-center gap-2 !w-auto ${THEME.primary} text-white border-none`}
          style={{ boxShadow: "0 4px 15px rgba(107,26,26,0.3)" }}
        >
          <Plus className="w-5 h-5" />
          Add New Member
        </Button>
      </div>

      {/* Filter & Controls Bar */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-white p-4 rounded-xl shadow-sm" style={{ border: "1px solid rgba(212,175,55,0.2)" }}>
        <div className="flex gap-2 flex-wrap w-full lg:w-auto">
          {[
            { id: "all", label: "All Members" },
            { id: "register", label: "Register" },
            { id: "utsav", label: "Utsav" },
            { id: "mahila", label: "Mahila Mandal" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                filterType === tab.id
                  ? "text-white shadow-md transform scale-105"
                  : ""
              }`}
              style={filterType === tab.id
                ? { background: "linear-gradient(135deg, #6b1a1a, #8b2222)" }
                : { background: "rgba(212,175,55,0.1)", color: "#6b1a1a" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-lg border" style={{ background: "rgba(212,175,55,0.05)", borderColor: "rgba(212,175,55,0.25)" }}>
          <input
            type="checkbox"
            id="showInactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 border-gray-300 rounded cursor-pointer"
            style={{ accentColor: "#6b1a1a" }}
          />
          <label
            htmlFor="showInactive"
            className="text-sm font-medium cursor-pointer select-none"
            style={{ color: "#5c3317" }}
          >
            Show inactive members
          </label>
        </div>
      </div>

      {/* Notifications */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-100 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-serif font-bold text-stone-800">
                  {editingMember ? "Edit Member" : "New Member Entry"}
                </h3>
                <p className="text-sm text-stone-500 mt-1">
                  {editingMember
                    ? "Update details for this committee member"
                    : "Enter details to register a new member"}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <InputField
                      label="Full Name"
                      type="text"
                      placeholder="e.g. Shri Rajesh Patil"
                      icon={User}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      error={errors.name}
                      required
                      className="focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <InputField
                      label="Role / Position"
                      type="text"
                      placeholder="e.g. Treasurer"
                      icon={Briefcase}
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      error={errors.role}
                      required
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-semibold text-stone-700 mb-2 ml-1">
                      Committee Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.committeeType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            committeeType: e.target.value,
                          })
                        }
                        className="w-full pl-4 pr-10 py-3 border-2 border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:border-orange-500 focus:ring-0 outline-none text-stone-800 transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="register">Register Committee</option>
                        <option value="utsav">Utsav Committee</option>
                        <option value="mahila">Mahila Mandal</option>
                      </select>
                      <Filter className="absolute right-3 top-3.5 w-5 h-5 text-stone-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2 ml-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg bg-white focus:border-orange-500 outline-none text-stone-800"
                    />
                    <p className="text-xs text-stone-500 mt-1 ml-1">
                      Lower numbers appear first
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors w-full">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </div>
                      <span className="text-sm font-medium text-stone-700">
                        {formData.isActive ? "Active Status" : "Inactive"}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Member Photograph
                  </label>
                  <div className="flex items-center gap-6 p-4 border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 hover:bg-orange-50 hover:border-orange-300 transition-colors">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
                      />
                      <p className="text-xs text-stone-400 mt-2 ml-1">
                        Max 5MB (JPEG, PNG, WebP)
                      </p>
                      {errors.image && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.image}
                        </p>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="relative group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-full border-2 border-orange-500 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, image: null });
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-transform hover:scale-110"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-stone-100">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 ${THEME.primary} text-white`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Saving...
                      </div>
                    ) : (
                      <span className="font-bold">
                        {editingMember ? "Update Details" : "Create Member"}
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1 border-stone-300 text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center border-t-4 border-red-500">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-stone-600 mb-8 leading-relaxed">
              Are you sure you want to remove this member? This action is
              irreversible.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Delete"
                )}
              </Button>
              <Button
                onClick={() => setDeleteId(null)}
                variant="outline"
                className="flex-1 border-stone-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Members Grid */}
      {fetching ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
          <p className="text-orange-600 font-medium">
            Loading Temple Community...
          </p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-stone-200 shadow-sm mx-auto max-w-2xl">
          <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-stone-700 mb-2">
            No Members Found
          </h3>
          <p className="text-stone-500 mb-8 max-w-md mx-auto">
            {filterType !== "all"
              ? `No members found in the ${
                  filterType === "register"
                    ? "Register"
                    : filterType === "utsav"
                    ? "Utsav"
                    : "Mahila Mandal"
                } Committee. Switch tabs or add a new entry.`
              : "Get started by adding the first committee member to the system."}
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className={`!w-auto px-6 ${THEME.primary} text-white`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Member
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 text-sm font-medium text-stone-500 flex justify-end items-center">
            <span>
              Showing {filteredMembers.length} member
              {filteredMembers.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className={`group bg-white rounded-2xl shadow-sm ${THEME.cardHover} transition-all duration-300 overflow-hidden border border-stone-100 flex flex-col`}
              >
                {/* Image Section */}
                <div className="relative h-56 bg-gradient-to-t from-stone-200 to-stone-100 overflow-hidden">
                  {member.imageUrl ? (
                    <img
                      src={getImageUrl(member.imageUrl)}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}

                  {/* Fallback Image */}
                  <div
                    className={`w-full h-full flex flex-col items-center justify-center bg-orange-50 ${
                      member.imageUrl ? "hidden" : ""
                    }`}
                  >
                    <ImageIcon className="w-16 h-16 text-orange-200 mb-2" />
                    <span className="text-stone-400 text-xs font-medium">
                      No Photo
                    </span>
                  </div>

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                  {/* Badges */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full shadow-lg backdrop-blur-md ${
                        member.committeeType === "register"
                          ? "bg-green-500/90 text-white"
                          : member.committeeType === "utsav"
                          ? "bg-orange-500/90 text-white"
                          : "bg-pink-600/90 text-white"
                      }`}
                    >
                      {member.committeeType === "register"
                        ? "Register"
                        : member.committeeType === "utsav"
                        ? "Utsav"
                        : "Mahila"}
                    </span>
                  </div>

                  {!member.isActive && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 text-xs font-bold bg-stone-800/80 text-white rounded-full backdrop-blur-md">
                        Inactive
                      </span>
                    </div>
                  )}

                  {member.order > 0 && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded border border-white/30 backdrop-blur-sm">
                        #{member.order}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3
                      className="font-serif font-bold text-xl text-stone-800 mb-1 leading-tight line-clamp-1"
                      title={member.name}
                    >
                      {member.name}
                    </h3>
                    <p className="text-orange-600 font-medium text-sm flex items-center gap-1.5 mb-4">
                      <Briefcase className="w-3.5 h-3.5" />
                      {member.role}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-stone-100">
                    <Button
                      onClick={() => handleEdit(member)}
                      variant="outline"
                      className="flex-1 !w-auto text-sm border-stone-200 text-stone-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => promptDelete(member._id)}
                      className="flex-1 !w-auto text-sm bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MembersView;
