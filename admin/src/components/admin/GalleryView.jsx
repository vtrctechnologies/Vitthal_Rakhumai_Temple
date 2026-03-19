import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  X,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Folder,
  Tag,
} from "lucide-react";
import { galleryAPI } from "../../services/api";
import { Button, InputField } from "../customUi/AdminShared";
import { getImageUrl } from "../../utils/imageUrl";

const GalleryView = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showImageForm, setShowImageForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteImageId, setDeleteImageId] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showInactive, setShowInactive] = useState(false);
  const [activeTab, setActiveTab] = useState("images"); // "images" or "categories"

  const [imageFormData, setImageFormData] = useState({
    title: "",
    category: "",
    order: 0,
    image: null,
    isActive: true,
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    order: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setFetching(true);
    try {
      const response = await galleryAPI.getImagesAdmin();
      if (response && response.status === "success") {
        const imagesData = Array.isArray(response.data) ? response.data : [];
        setImages(imagesData);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      setMessage({
        type: "error",
        text: `Failed to load images: ${error.message}`,
      });
      setImages([]);
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await galleryAPI.getCategoriesAdmin();
      if (response && response.status === "success") {
        const categoriesData = Array.isArray(response.data) ? response.data : [];
        setCategories(categoriesData);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage({
        type: "error",
        text: `Failed to load categories: ${error.message}`,
      });
      setCategories([]);
    }
  };

  const validateImageForm = () => {
    const newErrors = {};
    if (!imageFormData.title.trim()) newErrors.title = "Title is required.";
    if (!imageFormData.category) newErrors.category = "Category is required.";
    if (!editingImage && !imageFormData.image) {
      newErrors.image = "Image file is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCategoryForm = () => {
    const newErrors = {};
    if (!categoryFormData.name.trim()) newErrors.name = "Category name is required.";
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
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, image: "Only common image and video formats are allowed." });
        return;
      }
      setImageFormData({ ...imageFormData, image: file });
      
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // For video, we can't easily preview with FileReader for large files, 
        // but we can create an object URL for preview.
        setImagePreview(URL.createObjectURL(file));
      }
      setErrors({ ...errors, image: "" });
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!validateImageForm()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", imageFormData.title);
      formDataToSend.append("category", imageFormData.category);
      formDataToSend.append("order", imageFormData.order.toString());
      formDataToSend.append("isActive", imageFormData.isActive.toString());
      if (imageFormData.image) {
        formDataToSend.append("image", imageFormData.image);
      }

      let response;
      if (editingImage) {
        response = await galleryAPI.updateImage(editingImage._id, formDataToSend);
      } else {
        response = await galleryAPI.createImage(formDataToSend);
      }

      if (response.status === "success") {
        setMessage({
          type: "success",
          text: editingImage ? "Image updated successfully!" : "Image created successfully!",
        });
        resetImageForm();
        fetchImages();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save image.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!validateCategoryForm()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let response;
      if (editingCategory) {
        response = await galleryAPI.updateCategory(editingCategory._id, categoryFormData);
      } else {
        response = await galleryAPI.createCategory(categoryFormData);
      }

      if (response.status === "success") {
        setMessage({
          type: "success",
          text: editingCategory
            ? "Category updated successfully!"
            : "Category created successfully!",
        });
        resetCategoryForm();
        fetchCategories();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save category.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = (image) => {
    setEditingImage(image);
    setImageFormData({
      title: image.title || "",
      category: image.category?._id || image.category || "",
      order: image.order || 0,
      image: null,
      isActive: image.isActive !== undefined ? image.isActive : true,
    });
    setImagePreview(image.imageUrl ? getImageUrl(image.imageUrl) : null);
    setShowImageForm(true);
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name || "",
      description: category.description || "",
      order: category.order || 0,
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setShowCategoryForm(true);
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const promptDeleteImage = (id) => {
    setDeleteImageId(id);
  };

  const promptDeleteCategory = (id) => {
    setDeleteCategoryId(id);
  };

  const confirmDeleteImage = async () => {
    if (!deleteImageId) return;

    setLoading(true);
    try {
      const response = await galleryAPI.deleteImage(deleteImageId);
      if (response.status === "success") {
        setMessage({ type: "success", text: "Image deleted successfully!" });
        fetchImages();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete image.",
      });
    } finally {
      setLoading(false);
      setDeleteImageId(null);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    setLoading(true);
    try {
      const response = await galleryAPI.deleteCategory(deleteCategoryId);
      if (response.status === "success") {
        setMessage({ type: "success", text: "Category deleted successfully!" });
        fetchCategories();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete category.",
      });
    } finally {
      setLoading(false);
      setDeleteCategoryId(null);
    }
  };

  const resetImageForm = () => {
    setImageFormData({
      title: "",
      category: "",
      order: 0,
      image: null,
      isActive: true,
    });
    setErrors({});
    setImagePreview(null);
    setEditingImage(null);
    setShowImageForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      order: 0,
      isActive: true,
    });
    setErrors({});
    setEditingCategory(null);
    setShowCategoryForm(false);
  };


  const filteredImages = images
    .filter((img) => {
      if (filterCategory !== "all" && img.category?._id !== filterCategory) return false;
      if (!showInactive && !img.isActive) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Gallery Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage gallery images and categories. Title and category are shown on hover.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setActiveTab("categories");
              setShowCategoryForm(true);
            }}
            variant="outline"
            className="flex items-center gap-2 !w-auto"
          >
            <Folder className="w-4 h-4" />
            Add Category
          </Button>
          <Button
            onClick={() => {
              setActiveTab("images");
              setShowImageForm(true);
            }}
            className="flex items-center gap-2 !w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("images")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "images"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          Images ({filteredImages.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "categories"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Filter for Images */}
      {activeTab === "images" && (
        <div className="mb-6 space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-500 outline-none text-sm"
            >
              <option value="all">All Categories</option>
              {categories
                .filter((cat) => cat.isActive || showInactive)
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
            <div className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                id="showInactiveImages"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="showInactiveImages" className="text-sm text-gray-700 cursor-pointer">
                Show inactive images
              </label>
            </div>
          </div>
        </div>
      )}

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

      {/* Image Form Modal */}
      {showImageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingImage ? "Edit Image" : "Add New Image"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingImage
                      ? "Update image information below"
                      : "Fill in the details to add a new gallery image"}
                  </p>
                </div>
                <button
                  onClick={resetImageForm}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleImageSubmit} className="space-y-4">
                <InputField
                  label="Title"
                  type="text"
                  placeholder="Enter image title"
                  icon={ImageIcon}
                  value={imageFormData.title}
                  onChange={(e) =>
                    setImageFormData({ ...imageFormData, title: e.target.value })
                  }
                  error={errors.title}
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                    Category *
                  </label>
                  <select
                    value={imageFormData.category}
                    onChange={(e) =>
                      setImageFormData({ ...imageFormData, category: e.target.value })
                    }
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 outline-none text-gray-800"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1 ml-1">{errors.category}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                      Order (for sorting)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={imageFormData.order}
                      onChange={(e) =>
                        setImageFormData({
                          ...imageFormData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 outline-none text-gray-800"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-1">Lower numbers appear first</p>
                  </div>
                  <div className="flex items-end">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                        Status
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="isActiveImage"
                          checked={imageFormData.isActive}
                          onChange={(e) =>
                            setImageFormData({ ...imageFormData, isActive: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor="isActiveImage"
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          Active Image
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image File {!editingImage && "*"}
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
                        Supported formats: JPEG, PNG, GIF, WebP, MP4, MOV (Max 50MB)
                      </p>
                      {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                    </div>
                    {imagePreview && (
                      <div className="relative">
                        {imageFormData.image?.type?.startsWith("video/") || (typeof imagePreview === 'string' && (imagePreview.includes("video") || imagePreview.endsWith(".mp4") || imagePreview.endsWith(".mov"))) ? (
                          <video
                            src={imagePreview}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                            controls={false}
                            muted
                          />
                        ) : (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFormData({ ...imageFormData, image: null });
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
                    ) : editingImage ? (
                      "Update Image"
                    ) : (
                      "Create Image"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetImageForm}
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

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingCategory
                      ? "Update category information below"
                      : "Fill in the details to add a new category"}
                  </p>
                </div>
                <button
                  onClick={resetCategoryForm}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <InputField
                  label="Category Name"
                  type="text"
                  placeholder="Enter category name (e.g., Temple, Festival, Art)"
                  icon={Tag}
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, name: e.target.value })
                  }
                  error={errors.name}
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 outline-none text-gray-800"
                    placeholder="Enter category description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                      Order (for sorting)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={categoryFormData.order}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 outline-none text-gray-800"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                        Status
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="isActiveCategory"
                          checked={categoryFormData.isActive}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor="isActiveCategory"
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          Active Category
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : editingCategory ? (
                      "Update Category"
                    ) : (
                      "Create Category"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetCategoryForm}
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

      {/* Delete Image Confirmation Modal */}
      {deleteImageId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button onClick={confirmDeleteImage} variant="danger" className="flex-1">
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
                onClick={() => setDeleteImageId(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deleteCategoryId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? This action cannot be undone. Make
              sure no images are using this category.
            </p>
            <div className="flex gap-3">
              <Button onClick={confirmDeleteCategory} variant="danger" className="flex-1">
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
                onClick={() => setDeleteCategoryId(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Images Tab Content */}
      {activeTab === "images" && (
        <>
          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-600 mb-2">No Images Found</h3>
              <p className="text-gray-500 mb-4">
                {filterCategory !== "all"
                  ? "No images in this category. Try changing the filter or add a new image."
                  : "Get started by adding your first gallery image."}
              </p>
              <div className="flex justify-center">
                <Button onClick={() => setShowImageForm(true)} className="!w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Image
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredImages.length} image{filteredImages.length !== 1 ? "s" : ""}
                {filterCategory !== "all" &&
                  ` in ${categories.find((c) => c._id === filterCategory)?.name || "category"}`}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image) => (
                  <div
                    key={image._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 group relative"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {image.imageUrl ? (
                        image.imageUrl.match(/\.(mp4|mov|avi|mkv|webm)$/i) || 
                        image.imageUrl.includes("/video/") ||
                        (image.imageUrl.includes("/upload/v") && !image.imageUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) ? (
                          <div className="w-full h-full relative">
                            <video
                              src={getImageUrl(image.imageUrl)}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              autoPlay
                              playsInline
                              onMouseOver={(e) => e.target.play()}
                              onMouseOut={(e) => {
                                e.target.pause();
                                e.target.currentTime = 0;
                              }}
                            />
                            <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full">
                               <Loader2 className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={getImageUrl(image.imageUrl)}
                            alt={image.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        )
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center ${
                          image.imageUrl ? "hidden" : ""
                        }`}
                      >
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                      {/* Hover Overlay with Title and Category */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-center text-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-amber-400">
                            {image.category?.name || "Uncategorized"}
                          </p>
                          <p className="text-lg font-bold">{image.title}</p>
                        </div>
                      </div>
                      {image.order !== undefined && image.order > 0 && (
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          Order: {image.order}
                        </div>
                      )}
                      {!image.isActive && (
                        <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
                          Inactive
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditImage(image)}
                          variant="outline"
                          className="flex-1 !w-auto text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => promptDeleteImage(image._id)}
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
        </>
      )}

      {/* Categories Tab Content */}
      {activeTab === "categories" && (
        <>
          {categories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-600 mb-2">No Categories Found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first category.</p>
              <div className="flex justify-center">
                <Button onClick={() => setShowCategoryForm(true)} className="!w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Category
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const imageCount = images.filter(
                  (img) => img.category?._id === category._id
                ).length;
                return (
                  <div
                    key={category._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 mb-1">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          )}
                        </div>
                        {!category.isActive && (
                          <span className="px-2 py-1 text-xs font-bold bg-gray-200 text-gray-600 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{imageCount} image{imageCount !== 1 ? "s" : ""}</span>
                        {category.order !== undefined && category.order > 0 && (
                          <span>Order: {category.order}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditCategory(category)}
                          variant="outline"
                          className="flex-1 !w-auto text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => promptDeleteCategory(category._id)}
                          variant="danger"
                          className="flex-1 !w-auto text-sm"
                          disabled={imageCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                      {imageCount > 0 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Cannot delete: {imageCount} image{imageCount !== 1 ? "s" : ""} using this
                          category
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GalleryView;

