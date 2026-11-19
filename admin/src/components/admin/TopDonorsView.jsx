import React, { useState, useEffect } from "react";
import {
  Heart,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { donationAPI } from "../../services/api";
import { Button, InputField } from "../customUi/AdminShared";

const TopDonorsView = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    marathiName: "",
    tag: "दानशूर",
    order: 0,
    isActive: true,
  });

  const fetchTopDonors = async () => {
    setLoading(true);
    try {
      const res = await donationAPI.getTopDonorsAdmin();
      if (res?.status === "success" && Array.isArray(res.data)) {
        setDonors(res.data);
      } else {
        setDonors([]);
      }
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Failed to load top donors.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopDonors();
  }, []);

  const openCreateModal = () => {
    setEditingDonor(null);
    setFormData({
      name: "",
      marathiName: "",
      tag: "दानशूर",
      order: donors.length,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (donor) => {
    setEditingDonor(donor);
    setFormData({
      name: donor.name || "",
      marathiName: donor.marathiName || "",
      tag: donor.tag || "दानशूर",
      order: donor.order ?? 0,
      isActive: donor.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFeedback({ type: "error", text: "Donor name is required." });
      return;
    }

    setSaving(true);
    setFeedback({ type: "", text: "" });
    try {
      const payload = {
        name: formData.name.trim(),
        marathiName: formData.marathiName.trim(),
        tag: formData.tag.trim() || "दानशूर",
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
      };

      if (editingDonor) {
        await donationAPI.updateTopDonor(editingDonor._id, payload);
        setFeedback({ type: "success", text: "Top donor updated successfully." });
      } else {
        await donationAPI.createTopDonor(payload);
        setFeedback({ type: "success", text: "Top donor added to homepage ticker." });
      }
      setShowModal(false);
      fetchTopDonors();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Failed to save top donor.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (donor) => {
    try {
      await donationAPI.updateTopDonor(donor._id, {
        isActive: !donor.isActive,
      });
      setDonors((prev) =>
        prev.map((d) =>
          d._id === donor._id ? { ...d, isActive: !d.isActive } : d
        )
      );
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Failed to update visibility.",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await donationAPI.deleteTopDonor(id);
      setDonors((prev) => prev.filter((d) => d._id !== id));
      setDeleteId(null);
      setFeedback({ type: "success", text: "Top donor removed." });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Failed to delete top donor.",
      });
    }
  };

  const activeDonors = donors.filter((d) => d.isActive !== false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading-temple font-bold text-[#6b1a1a] flex items-center gap-2.5">
            <Heart className="text-[#e8650a]" size={24} />
            Top Donors &amp; Scrolling Ticker
          </h2>
          <p className="text-sm text-[#8b5e3c] mt-1">
            Add and order donor names displayed in the homepage scrolling ticker animation.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="!w-auto !px-5 !py-2.5 !text-sm"
        >
          <Plus size={18} />
          <span>Add Top Donor</span>
        </Button>
      </div>

      {/* Feedback Banner */}
      {feedback.text && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-sm font-medium ${
            feedback.type === "error"
              ? "bg-[#c0392b]/10 border-[#c0392b]/30 text-[#c0392b]"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: "", text: "" })}
            className="opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Live Website Ticker Preview */}
      <div className="temple-hero-pattern rounded-2xl p-4 border border-[#d4af37]/40 overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f0d060] flex items-center gap-1.5">
            <Sparkles size={12} />
            Homepage Ticker Preview ({activeDonors.length} Active)
          </span>
        </div>
        {activeDonors.length === 0 ? (
          <p className="text-xs text-[#ffebc8]/70 py-2">
            No active custom donors added yet. The website will show default donors until you add names here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5 py-1">
            {activeDonors.map((donor) => (
              <span
                key={donor._id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fef6e4]/10 border border-[#d4af37]/35 text-xs text-[#fef6e4]"
              >
                <span className="font-semibold text-[#f0d060]">{donor.name}</span>
                {donor.tag && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#f5a623]">
                    {donor.tag}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Donors List */}
      <div className="temple-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#8b5e3c]">
            <Loader2 className="w-8 h-8 animate-spin text-[#6b1a1a]" />
            <p className="text-sm font-medium">Loading top donors...</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="py-16 px-6 text-center text-[#8b5e3c]">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-25 text-[#6b1a1a]" />
            <p className="text-base font-semibold text-[#6b1a1a] font-heading-temple">
              No Top Donors Added Yet
            </p>
            <p className="text-sm mt-1 mb-5">
              Add donor names to feature them in the homepage scrolling animation.
            </p>
            <Button
              variant="outline"
              onClick={openCreateModal}
              className="!w-auto !px-5 !mx-auto"
            >
              <Plus size={16} /> Add First Donor
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5e6c8]/55 border-b border-[#d4af37]/30 text-xs font-bold uppercase tracking-wider text-[#5c3317]">
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Donor Name</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Marathi Name</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Seva Tag</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/20 text-sm">
                {donors.map((donor) => (
                  <tr
                    key={donor._id}
                    className="hover:bg-[#fef6e4]/70 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#8b5e3c]">
                      #{donor.order ?? 0}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2c1a0e]">
                      {donor.name}
                    </td>
                    <td className="py-3.5 px-4 text-[#5c3317] hidden md:table-cell">
                      {donor.marathiName || "—"}
                    </td>
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f5e6c8] text-[#6b1a1a] border border-[#d4af37]/35">
                        {donor.tag || "दानशूर"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(donor)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          donor.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {donor.isActive !== false ? (
                          <>
                            <Eye size={12} /> Active
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} /> Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(donor)}
                          className="p-2 rounded-lg text-[#5c3317] hover:bg-[#f5e6c8] hover:text-[#6b1a1a] transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(donor._id)}
                          className="p-2 rounded-lg text-[#c0392b] hover:bg-[#c0392b]/10 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2c1a0e]/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#fffdf8] border border-[#d4af37]/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-subtle-pop">
            <div className="px-6 py-4 border-b border-[#d4af37]/30 bg-[#fef6e4] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#6b1a1a] font-heading-temple">
                {editingDonor ? "Edit Top Donor" : "Add Top Donor"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#8b5e3c] hover:text-[#6b1a1a] hover:bg-[#f5e6c8] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-1">
              <InputField
                label="Donor Name (English) *"
                type="text"
                placeholder="e.g., Shri. Suresh Kulkarni & Family"
                icon={Heart}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <InputField
                label="Donor Name (Marathi - Optional)"
                type="text"
                placeholder="e.g., श्री. सुरेश कुलकर्णी व परिवार"
                icon={Sparkles}
                value={formData.marathiName}
                onChange={(e) =>
                  setFormData({ ...formData, marathiName: e.target.value })
                }
              />
              <InputField
                label="Seva Tag (Optional)"
                type="text"
                placeholder="e.g., अन्नदान / सुवर्ण सेवा"
                value={formData.tag}
                onChange={(e) =>
                  setFormData({ ...formData, tag: e.target.value })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <InputField
                  label="Display Order"
                  type="number"
                  placeholder="0"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: e.target.value })
                  }
                />
                <label className="flex items-center gap-2.5 cursor-pointer pt-2 sm:pt-4">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#6b1a1a] rounded"
                  />
                  <span className="text-sm font-semibold text-[#5c3317]">
                    Show in Homepage Ticker
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" isLoading={saving}>
                  {editingDonor ? "Update Donor" : "Add Donor"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-[#2c1a0e]/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#fffdf8] border border-[#d4af37]/50 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-subtle-pop">
            <h3 className="text-lg font-bold text-[#6b1a1a] font-heading-temple mb-2">
              Remove Top Donor?
            </h3>
            <p className="text-sm text-[#8b5e3c] mb-6">
              This donor name will be removed from the homepage scrolling ticker.
            </p>
            <div className="flex gap-3">
              <Button
                variant="dangerPrimary"
                onClick={() => handleDelete(deleteId)}
              >
                Remove
              </Button>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopDonorsView;
