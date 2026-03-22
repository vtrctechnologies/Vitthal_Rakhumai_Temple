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
  Image as ImageIcon,
  User,
  Briefcase,
} from "lucide-react";
import { committeeAPI } from "../../services/api";
import { Button, InputField } from "../customUi/AdminShared";
import { getImageUrl } from "../../utils/imageUrl";

const CommitteeView = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    committeeType: "register",
    year: new Date().getFullYear(),
    position: "",
    order: 0,
    image: null,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [filterYear]);

  const fetchInitialData = async () => {
    await fetchYears();
    await fetchMembers();
  };

  const fetchYears = async () => {
    try {
      const response = await committeeAPI.getCommitteeYears();
      if (response && response.status === "success" && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          setAvailableYears(response.data);
          // Set filter year to latest available if current year not in list
          if (!response.data.includes(filterYear)) {
            setFilterYear(response.data[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching committee years:", error);
    }
  };

  const fetchMembers = async () => {
    setFetching(true);
    try {
      // Fetch all members (including inactive) for admin panel
      const response = await committeeAPI.getMembersAdmin({ year: filterYear });
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
    if (!formData.committeeType) newErrors.committeeType = "Committee type is required.";
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
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, image: "Only JPEG, PNG, GIF, and WebP images are allowed." });
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
      formDataToSend.append("year", formData.year.toString());
      formDataToSend.append("position", formData.position || "");
      formDataToSend.append("order", formData.order.toString());
      formDataToSend.append("isActive", formData.isActive.toString());
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      let response;
      if (editingMember) {
        response = await committeeAPI.updateMember(editingMember._id, formDataToSend);
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
      year: member.year || new Date().getFullYear(),
      position: member.position || "",
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
      year: new Date().getFullYear(),
      position: "",
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
    });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Committee Members
        </h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("register")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "register"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Register Committee
          </button>
          <button
            onClick={() => setFilterType("utsav")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "utsav"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Utsav Committee
          </button>
          <button
            onClick={() => setFilterType("mahila")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "mahila"
                ? "bg-pink-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Mahila Mandal
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showInactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showInactive" className="text-sm text-gray-700 cursor-pointer">
            Show inactive members
          </label>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Year:</label>
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(parseInt(e.target.value));
              // fetchMembers will be triggered by useEffect or manual call
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Button 
            onClick={fetchMembers} 
            variant="outline" 
            className="!w-auto py-1 px-3 text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingMember ? "Edit Member" : "Add New Member"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingMember
                      ? "Update member information below"
                      : "Fill in the details to add a new committee member"}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Name"
                  type="text"
                  placeholder="Enter member name"
                  icon={User}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  error={errors.name}
                  required
                />

                <InputField
                  label="Role"
                  type="text"
                  placeholder="Enter role/position"
                  icon={Briefcase}
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  error={errors.role}
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                    Committee Type *
                  </label>
                  <select
                    value={formData.committeeType}
                    onChange={(e) =>
                      setFormData({ ...formData, committeeType: e.target.value })
                    }
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 outline-none text-gray-800"
                    required
                  >
                    <option value="register">Register Committee</option>
                    <option value="utsav">Utsav Committee</option>
                    <option value="mahila">Mahila Mandal Committee</option>
                  </select>
                  {errors.committeeType && (
                    <p className="text-red-500 text-sm mt-1 ml-1">{errors.committeeType}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                      Position (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 outline-none text-gray-800"
                      placeholder="e.g. President"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 outline-none text-gray-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                      Order (for sorting)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 outline-none text-gray-800"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      Lower numbers appear first
                    </p>
                  </div>
                  <div className="flex items-end">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                        Status
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({ ...formData, isActive: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
                          Active Member
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Photo
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                      </p>
                      {errors.image && (
                        <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, image: null });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : editingMember ? (
                      "Update Member"
                    ) : (
                      "Create Member"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this member? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button onClick={confirmDelete} variant="danger" className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
              <Button
                onClick={() => setDeleteId(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Members Grid */}
      {fetching ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">No Members Found</h3>
          <p className="text-gray-500 mb-4">
            {filterType !== "all"
              ? `No members in ${filterType === "register" ? "Register" : filterType === "utsav" ? "Utsav" : "Mahila Mandal"} Committee. Try changing the filter or add a new member.`
              : "Get started by adding your first committee member."}
          </p>
          {filterType !== "all" && (
            <Button onClick={() => setFilterType("all")} variant="outline" className="!w-auto">
              View All Members
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
            {filterType !== "all" && ` in ${filterType === "register" ? "Register" : filterType === "utsav" ? "Utsav" : "Mahila Mandal"} Committee`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 bg-gray-100">
                  {member.imageUrl ? (
                    <img
                      src={getImageUrl(member.imageUrl)}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      member.imageUrl ? "hidden" : ""
                    }`}
                  >
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded shadow-sm ${
                        member.committeeType === "register"
                          ? "bg-green-500 text-white"
                          : member.committeeType === "utsav"
                          ? "bg-blue-500 text-white"
                          : "bg-pink-500 text-white"
                      }`}
                    >
                      {member.committeeType === "register"
                        ? "Register"
                        : member.committeeType === "utsav"
                        ? "Utsav"
                        : "Mahila"}
                    </span>
                  </div>
                  {member.order !== undefined && member.order > 0 && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Order: {member.order}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1" title={member.name}>
                        {member.name}
                      </h3>
                      <p className="text-sm text-orange-600 font-medium">{member.role}</p>
                    </div>
                    {!member.isActive && (
                      <span className="px-2 py-1 text-xs font-bold bg-gray-200 text-gray-600 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => handleEdit(member)}
                      variant="outline"
                      className="flex-1 !w-auto text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => promptDelete(member._id)}
                      variant="danger"
                      className="flex-1 !w-auto text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
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

export default CommitteeView;

