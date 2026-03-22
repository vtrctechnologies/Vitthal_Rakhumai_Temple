import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Sparkles,
  Upload,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { heroSectionAPI } from "../../services/api";
import { Button } from "../customUi/AdminShared";
import { getImageUrl } from "../../utils/imageUrl";

const HeroSectionView = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [formData, setFormData] = useState({
    mainTitle: "",
    mainTitleMarathi: "",
    accentTitle: "",
    accentTitleMarathi: "",
    subTitle: "",
    subTitleMarathi: "",
    festivalTitle: "Next Festival: Kartiki Ekadashi",
    festivalTitleMarathi: "पुढील उत्सव: कार्तिकी एकादशी",
    isActive: true,
  });
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    setLoading(true);
    try {
      const response = await heroSectionAPI.getAllHeroes();
      if (response && response.status === "success") {
        setHeroes(Array.isArray(response.data) ? response.data : []);
      } else {
        setHeroes([]);
      }
    } catch (error) {
      console.error("Error fetching heroes:", error);
      setMessage({ type: "error", text: "Failed to load hero sections" });
      setHeroes([]);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      mainTitle: "",
      mainTitleMarathi: "",
      accentTitle: "",
      accentTitleMarathi: "",
      subTitle: "",
      subTitleMarathi: "",
      festivalTitle: "Next Festival: Kartiki Ekadashi",
      festivalTitleMarathi: "पुढील उत्सव: कार्तिकी एकादशी",
      isActive: true,
    });
    setBackgroundFile(null);
    setBackgroundPreview(null);
    setErrors({});
    setEditingHero(null);
    setShowForm(false);
  };

  const handleEdit = (hero) => {
    setEditingHero(hero);
    setFormData({
      mainTitle: hero.mainTitle || "",
      mainTitleMarathi: hero.mainTitleMarathi || "",
      accentTitle: hero.accentTitle || "",
      accentTitleMarathi: hero.accentTitleMarathi || "",
      subTitle: hero.subTitle || "",
      subTitleMarathi: hero.subTitleMarathi || "",
      festivalTitle: hero.festivalTitle || "Next Festival: Kartiki Ekadashi",
      festivalTitleMarathi: hero.festivalTitleMarathi || "पुढील उत्सव: कार्तिकी एकादशी",
      isActive: hero.isActive !== undefined ? hero.isActive : true,
    });
    setBackgroundPreview(getImageUrl(hero.backgroundUrl));
    setErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.mainTitle.trim()) {
      newErrors.mainTitle = "Main title is required";
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
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (backgroundFile) {
        data.append("background", backgroundFile);
      }

      let response;
      if (editingHero) {
        response = await heroSectionAPI.updateHero(editingHero._id, data);
      } else {
        response = await heroSectionAPI.createHero(data);
      }

      if (response && response.status === "success") {
        setMessage({
          type: "success",
          text: editingHero
            ? "Hero section updated successfully"
            : "Hero section created successfully",
        });
        resetForm();
        await fetchHeroes();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: "Unexpected response from server",
        });
      }
    } catch (error) {
      console.error("Error saving hero:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to save hero section",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await heroSectionAPI.deleteHero(id);
      setMessage({ type: "success", text: "Hero section deleted successfully" });
      setDeleteId(null);
      await fetchHeroes();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting hero:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to delete hero section",
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
            Hero Section Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage the main top section of your home page
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="!w-auto"
        >
          <Plus size={18} className="mr-2" /> Create New Hero Section
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-display font-bold">
                {editingHero ? "Edit Hero Section" : "Create Hero Section"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Titles Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-primary border-b pb-2">Titles & Content</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Main Title (English) *
                    </label>
                    <input
                      type="text"
                      name="mainTitle"
                      value={formData.mainTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Shree Vitthal"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary ${
                        errors.mainTitle ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Main Title (Marathi)
                    </label>
                    <input
                      type="text"
                      name="mainTitleMarathi"
                      value={formData.mainTitleMarathi}
                      onChange={handleInputChange}
                      placeholder="उदा. श्री विठ्ठल"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accent Title (English)
                    </label>
                    <input
                      type="text"
                      name="accentTitle"
                      value={formData.accentTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Rakhumai Temple"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accent Title (Marathi)
                    </label>
                    <input
                      type="text"
                      name="accentTitleMarathi"
                      value={formData.accentTitleMarathi}
                      onChange={handleInputChange}
                      placeholder="उदा. रखुमाई मंदिर"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub Title (English)
                    </label>
                    <textarea
                      name="subTitle"
                      value={formData.subTitle}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub Title (Marathi)
                    </label>
                    <textarea
                      name="subTitleMarathi"
                      value={formData.subTitleMarathi}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Media & Other Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-primary border-b pb-2">Media & Badge</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Festival Badge (English)
                    </label>
                    <input
                      type="text"
                      name="festivalTitle"
                      value={formData.festivalTitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Festival Badge (Marathi)
                    </label>
                    <input
                      type="text"
                      name="festivalTitleMarathi"
                      value={formData.festivalTitleMarathi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Media (Image or Video)
                    </label>
                    <div
                      className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => document.getElementById("backgroundInput").click()}
                    >
                      {backgroundPreview ? (
                        formData.resourceType === 'video' || (backgroundFile && backgroundFile.type.startsWith('video')) ? (
                          <div className="flex flex-col items-center">
                            <Video className="w-12 h-12 text-primary mb-2" />
                            <p className="text-xs text-center line-clamp-1">{backgroundFile ? backgroundFile.name : 'Video Selected'}</p>
                          </div>
                        ) : (
                          <img
                            src={backgroundPreview}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          />
                        )
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500">Click to upload Image/Video</p>
                        </>
                      )}
                      <input
                        type="file"
                        id="backgroundInput"
                        name="background"
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center pt-4">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 font-bold">
                      Set as Active Hero Section
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
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
                  ) : editingHero ? (
                    "Update Hero Section"
                  ) : (
                    "Create Hero Section"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Heroes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : heroes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Hero Sections</h3>
          <p className="text-gray-500 mb-8">Create your first dynamic hero section</p>
          <Button onClick={() => setShowForm(true)} className="!w-auto">
            <Plus size={18} className="mr-2" /> Create Hero Section
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {heroes.map((hero) => (
            <div
              key={hero._id}
              className={`bg-white rounded-xl shadow-md border-2 transition-all p-1 overflow-hidden ${
                hero.isActive ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {hero.resourceType === 'video' ? (
                  <Video className="w-12 h-12 text-gray-300" />
                ) : hero.backgroundUrl ? (
                  <img
                    src={getImageUrl(hero.backgroundUrl)}
                    alt={hero.mainTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-200" />
                )}
                
                {hero.isActive && (
                  <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Active
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 p-4">
                  <h3 className="text-white font-bold truncate">{hero.mainTitle} {hero.accentTitle}</h3>
                  <p className="text-white/70 text-xs truncate">{hero.festivalTitle}</p>
                </div>
              </div>

              <div className="p-4 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Updated: {new Date(hero.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(hero)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteId(hero._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
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
              Delete Hero Section?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this hero configuration? This will remove all associated media.
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
                Delete Hero
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSectionView;
