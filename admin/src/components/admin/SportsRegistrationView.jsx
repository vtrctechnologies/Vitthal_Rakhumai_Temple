import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Trophy, Download, Search, Filter, Trash2, Loader2, Calendar,
  Users, Settings, Phone, MapPin, RefreshCw, X, AlertCircle,
  Plus, Edit2, ToggleLeft, ToggleRight, CheckCircle, Clock,
} from "lucide-react";
import { sportsAPI } from "../../services/api";
import { Button } from "../customUi/AdminShared";
import Swal from "sweetalert2";

// ─────────────────────────────────────────────────────────────────────────────
// Blank form defaults
// ─────────────────────────────────────────────────────────────────────────────
const blankForm = () => ({
  name: "",
  description: "",
  category: "Sports",
  rules: "",
  entryFee: "Free",
  prizes: "",
  registrationType: "individual",
  isRegistrationOpen: false,
  registrationStartDate: "",
  registrationEndDate: "",
  maxParticipants: "",
  year: String(new Date().getFullYear()),
});

const compToForm = (c) => ({
  name:                  c.name || "",
  description:           c.description || "",
  category:              c.category || "Sports",
  rules:                 c.rules || "",
  entryFee:              c.entryFee || "Free",
  prizes:                c.prizes || "",
  registrationType:      c.registrationType || "individual",
  isRegistrationOpen:    !!c.isRegistrationOpen,
  registrationStartDate: c.registrationStartDate
    ? new Date(c.registrationStartDate).toISOString().slice(0, 16) : "",
  registrationEndDate:   c.registrationEndDate
    ? new Date(c.registrationEndDate).toISOString().slice(0, 16) : "",
  maxParticipants:       c.maxParticipants != null ? String(c.maxParticipants) : "0",
  year:                  c.year ? String(c.year) : String(new Date().getFullYear()),
});

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  open:      { cls: "bg-green-100 text-green-700 border-green-300",     label: "Open" },
  scheduled: { cls: "bg-blue-100 text-blue-700 border-blue-300",        label: "Opening Soon" },
  closed:    { cls: "bg-red-100 text-red-700 border-red-300",           label: "Closed" },
  expired:   { cls: "bg-orange-100 text-orange-700 border-orange-300",  label: "Expired" },
  full:      { cls: "bg-purple-100 text-purple-700 border-purple-300",  label: "Full" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.closed;
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${s.cls}`}>
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Countdown hook
// ─────────────────────────────────────────────────────────────────────────────
const useCountdown = (targetDate, onExpire) => {
  const expiredRef = useRef(false);
  const calc = useCallback(() => {
    if (!targetDate) return null;
    const diff = new Date(targetDate) - Date.now();
    if (diff <= 0) return { expired: true, d: 0, h: 0, m: 0, s: 0 };
    return {
      expired: false,
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [targetDate]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    expiredRef.current = false;
    setTime(calc());
    const id = setInterval(() => {
      const t = calc();
      setTime(t);
      if (t?.expired && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [calc, onExpire]);

  return time;
};

// ─────────────────────────────────────────────────────────────────────────────
// Inline timer display (admin card)
// ─────────────────────────────────────────────────────────────────────────────
const InlineTimer = ({ label, date, color = "amber", onExpire }) => {
  const t = useCountdown(date, onExpire);
  if (!t || t.expired) return null;
  const colMap = {
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    blue:  "text-blue-700 bg-blue-50 border-blue-200",
    red:   "text-red-700 bg-red-50 border-red-200",
  };
  const fmt = (v) => String(v).padStart(2, "0");
  return (
    <div className={`text-xs px-2 py-1 rounded border font-mono font-semibold flex items-center gap-1 ${colMap[color]}`}>
      <Clock className="w-3 h-3" />
      <span className="font-sans font-medium mr-1 opacity-70">{label}</span>
      {t.d > 0 && `${t.d}d `}{fmt(t.h)}:{fmt(t.m)}:{fmt(t.s)}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Competition Create / Edit Form Modal
// ─────────────────────────────────────────────────────────────────────────────
const CompetitionFormModal = ({ initial, onClose, onSaved }) => {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState(isEdit ? compToForm(initial) : blankForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Generic change handler — works for text, number, select, checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Competition name is required.");
      return;
    }

    const payload = {
      name:                 form.name.trim(),
      description:          form.description.trim(),
      category:             form.category,
      rules:                form.rules.trim(),
      entryFee:             form.entryFee.trim(),
      prizes:               form.prizes.trim(),
      registrationType:     form.registrationType,
      isRegistrationOpen:   form.isRegistrationOpen,
      registrationStartDate: form.registrationStartDate || null,
      registrationEndDate:   form.registrationEndDate   || null,
      maxParticipants:       parseInt(form.maxParticipants, 10) || 0,
      year:                  parseInt(form.year, 10) || new Date().getFullYear(),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await sportsAPI.updateCompetition(initial._id, payload);
      } else {
        await sportsAPI.createCompetition(payload);
      }
      Swal.fire({ icon: "success", title: isEdit ? "Updated!" : "Created!", timer: 1400, showConfirmButton: false });
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              {isEdit ? "Edit Competition" : "Create New Competition"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit ? `Editing: ${initial.name}` : "Set up a new competition registration event"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
              <AlertCircle size={15} className="flex-shrink-0" /> {error}
            </div>
          )}

          {/* Name + Year */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Competition Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Kabaddi Championship 2025"
                className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="2025"
                className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Category + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                {["Sports","Cultural","Games","Athletics","Music","Dance","Rangoli","Other"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Registration Type</label>
              <select
                name="registrationType"
                value={form.registrationType}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="individual">Individual</option>
                <option value="team">Team</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description about the competition…"
              rows={2}
              className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none bg-white"
            />
          </div>

          {/* Rules */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Rules & Guidelines</label>
            <textarea
              name="rules"
              value={form.rules}
              onChange={handleChange}
              placeholder="List competition rules, eligibility criteria…"
              rows={3}
              className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none bg-white"
            />
          </div>

          {/* Prizes + Entry Fee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Prizes</label>
              <input
                type="text"
                name="prizes"
                value={form.prizes}
                onChange={handleChange}
                placeholder="e.g. 1st: ₹5000, 2nd: ₹3000"
                className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Entry Fee</label>
              <input
                type="text"
                name="entryFee"
                value={form.entryFee}
                onChange={handleChange}
                placeholder="e.g. Free / ₹100"
                className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Registration Open/Close times */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Registration Timer Settings</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Opens On (Date & Time)
                </label>
                <input
                  type="datetime-local"
                  name="registrationStartDate"
                  value={form.registrationStartDate}
                  onChange={handleChange}
                  className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Leave blank to open immediately when toggled ON.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Closes On (Deadline)
                </label>
                <input
                  type="datetime-local"
                  name="registrationEndDate"
                  value={form.registrationEndDate}
                  onChange={handleChange}
                  className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Automatically closes when this time passes.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Max Participants (0 = unlimited)</label>
              <input
                type="number"
                name="maxParticipants"
                value={form.maxParticipants}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Open Registration Toggle */}
          <label
            className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer select-none hover:bg-amber-100/60 transition-colors"
          >
            <div>
              <span className="font-semibold text-gray-800 text-sm block">Open Registration Now</span>
              <span className="text-xs text-gray-500">
                Enable public registration form on the website immediately.
                {form.registrationStartDate && " (Start date takes priority if set in future.)"}
              </span>
            </div>
            <input
              type="checkbox"
              name="isRegistrationOpen"
              checked={form.isRegistrationOpen}
              onChange={handleChange}
              className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
            />
          </label>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="!w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="!w-auto flex items-center gap-2">
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <CheckCircle className="w-4 h-4" />}
              {isEdit ? "Update Competition" : "Create Competition"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Quick Timer / Settings Modal
// ─────────────────────────────────────────────────────────────────────────────
const TimerModal = ({ comp, onClose, onSaved }) => {
  const [form, setForm] = useState({
    isRegistrationOpen:    !!comp.isRegistrationOpen,
    registrationStartDate: comp.registrationStartDate
      ? new Date(comp.registrationStartDate).toISOString().slice(0, 16) : "",
    registrationEndDate:   comp.registrationEndDate
      ? new Date(comp.registrationEndDate).toISOString().slice(0, 16) : "",
    maxParticipants:       comp.maxParticipants != null ? String(comp.maxParticipants) : "0",
  });
  const [saving, setSaving] = useState(false);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sportsAPI.toggleRegistration(comp._id, {
        ...form,
        maxParticipants: parseInt(form.maxParticipants, 10) || 0,
        registrationStartDate: form.registrationStartDate || null,
        registrationEndDate:   form.registrationEndDate   || null,
      });
      Swal.fire({ icon: "success", title: "Saved!", timer: 1400, showConfirmButton: false });
      onSaved();
    } catch {
      Swal.fire("Error", "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <div>
            <h3 className="font-bold text-gray-900">Timer & Registration Settings</h3>
            <p className="text-xs text-amber-700 font-medium">{comp.name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Toggle */}
          <label className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200 cursor-pointer">
            <div>
              <span className="font-semibold text-gray-800 text-sm">Open Registration</span>
              <p className="text-xs text-gray-500">Toggle public form on/off manually.</p>
            </div>
            <input
              type="checkbox"
              name="isRegistrationOpen"
              checked={form.isRegistrationOpen}
              onChange={change}
              className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
            />
          </label>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Opens Date & Time (Auto-open timer)</label>
            <input
              type="datetime-local"
              name="registrationStartDate"
              value={form.registrationStartDate}
              onChange={change}
              className="w-full text-sm px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">If set, website shows "Opening Soon" countdown until this time.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Closes Date & Time (Auto-close timer)</label>
            <input
              type="datetime-local"
              name="registrationEndDate"
              value={form.registrationEndDate}
              onChange={change}
              className="w-full text-sm px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">Website shows "Closing Soon" countdown. Auto-closes when expired.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Max Participants (0 = unlimited)</label>
            <input
              type="number"
              name="maxParticipants"
              min="0"
              value={form.maxParticipants}
              onChange={change}
              className="w-full text-sm px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="!w-auto">Cancel</Button>
            <Button type="submit" disabled={saving} className="!w-auto flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Admin Component
// ─────────────────────────────────────────────────────────────────────────────
const SportsRegistrationView = () => {
  const [activeTab, setActiveTab]           = useState("competitions");
  const [competitions, setCompetitions]     = useState([]);
  const [registrations, setRegistrations]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedSport, setSelectedSport]   = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery]       = useState("");
  const [exporting, setExporting]           = useState(false);
  const [formModal, setFormModal]           = useState(null); // null | {} | comp
  const [timerModal, setTimerModal]         = useState(null); // null | comp

  useEffect(() => { fetchData(); }, [selectedSport, selectedStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compsRes, regsRes] = await Promise.all([
        sportsAPI.getAllCompetitions(),
        sportsAPI.getRegistrations({
          sportId: selectedSport !== "all" ? selectedSport : undefined,
          status:  selectedStatus !== "all" ? selectedStatus : undefined,
        }),
      ]);
      setCompetitions(Array.isArray(compsRes?.data) ? compsRes.data : []);
      setRegistrations(Array.isArray(regsRes?.data) ? regsRes.data : []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickToggle = async (comp) => {
    try {
      await sportsAPI.toggleRegistration(comp._id, {
        isRegistrationOpen: !comp.isRegistrationOpen,
      });
      setCompetitions((prev) =>
        prev.map((c) =>
          c._id === comp._id
            ? {
                ...c,
                isRegistrationOpen: !c.isRegistrationOpen,
                computedStatus: !c.isRegistrationOpen ? "open" : "closed",
              }
            : c
        )
      );
    } catch {
      Swal.fire("Error", "Failed to toggle registration.", "error");
    }
  };

  const handleDeleteCompetition = async (comp) => {
    const result = await Swal.fire({
      title: `Delete "${comp.name}"?`,
      html: `<p class="text-sm text-gray-600">This will permanently delete the competition and all <b>${comp.registrationCount || 0} registration(s)</b>.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete everything",
    });
    if (!result.isConfirmed) return;
    try {
      await sportsAPI.deleteCompetition(comp._id);
      setCompetitions((prev) => prev.filter((c) => c._id !== comp._id));
      setRegistrations((prev) => prev.filter((r) => r.sport?._id !== comp._id));
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1400, showConfirmButton: false });
    } catch {
      Swal.fire("Error", "Failed to delete competition.", "error");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await sportsAPI.updateRegistrationStatus(id, newStatus);
      setRegistrations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      );
    } catch {
      Swal.fire("Error", "Failed to update status.", "error");
    }
  };

  const handleDeleteRegistration = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Registration?",
      text: "Remove this participant's registration entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });
    if (!confirm.isConfirmed) return;
    try {
      await sportsAPI.deleteRegistration(id);
      setRegistrations((prev) => prev.filter((r) => r._id !== id));
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire("Error", "Failed to delete entry.", "error");
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const name =
        selectedSport !== "all"
          ? competitions.find((c) => c._id === selectedSport)?.name?.replace(/[^a-zA-Z0-9_-]/g, "_") || "Sport"
          : "All_Registrations";
      const downloadFileName = `Registrations_${name}_${new Date().toISOString().slice(0, 10)}.csv`;

      let csvText = "";

      // 1. Attempt to fetch from backend export endpoint
      try {
        const res = await sportsAPI.exportRegistrationsExcel(selectedSport);
        if (res instanceof Blob) {
          csvText = await res.text();
        } else if (typeof res === "string" && res.trim().length > 0) {
          csvText = res;
        } else if (typeof res?.data === "string" && res.data.trim().length > 0) {
          csvText = res.data;
        }
      } catch (err) {
        console.warn("Backend export request issue, using client data:", err);
      }

      // 2. Fallback / Guarantee: If csvText is empty, build from loaded registrations
      if (!csvText || csvText.trim().length === 0) {
        const list = selectedSport !== "all"
          ? registrations.filter((r) => r.sport?._id === selectedSport || r.sport === selectedSport)
          : registrations;

        const escape = (val) => {
          if (val === undefined || val === null) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        };

        let localCsv = "\uFEFF";
        localCsv += "Sr No,Registration ID,Competition / Sport,Type,Participant / Player Name,Team Name,Contact Mobile,Email,Address / City,Notes,Status,Registration Date\n";

        list.forEach((r, idx) => {
          const sName = r.sport?.name || r.sportName || "N/A";
          const isTeam = r.sport?.registrationType === "team" || !!r.teamName;
          const regDate = r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : "";

          localCsv += [
            idx + 1,
            escape(r._id),
            escape(sName),
            escape(isTeam ? "Team" : "Individual"),
            escape(r.participantName || ""),
            escape(r.teamName || ""),
            escape(r.mobile || ""),
            escape(r.email || ""),
            escape(r.villageOrCity || ""),
            escape(r.notes || ""),
            escape(r.status || "confirmed"),
            escape(regDate),
          ].join(",") + "\n";
        });

        csvText = localCsv;
      }

      // 3. Trigger file download
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", downloadFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Excel / CSV Downloaded!",
        text: `Exported ${downloadFileName} successfully`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Export error:", err);
      Swal.fire("Export Failed", "Could not export registration data.", "error");
    } finally {
      setExporting(false);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.participantName?.toLowerCase().includes(q) ||
      r.teamName?.toLowerCase().includes(q) ||
      r.mobile?.includes(q) ||
      r.villageOrCity?.toLowerCase().includes(q) ||
      r.sportName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Competition & Sports Registrations</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Create competitions, manage registrations, set timers, and export data.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={fetchData} variant="outline" className="!w-auto flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button
            onClick={() => setFormModal({})}
            className="!w-auto flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="w-4 h-4" /> New Competition
          </Button>
          <Button
            onClick={handleExportExcel}
            disabled={exporting || registrations.length === 0}
            className="!w-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Excel
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: "competitions", label: `Competitions (${competitions.length})` },
          { id: "registrations", label: `Participants (${registrations.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-amber-700 shadow-sm border border-amber-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── COMPETITIONS TAB ── */}
      {activeTab === "competitions" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-sm">All Competitions</h3>
            <span className="text-xs text-gray-500">Toggle = manual open/close · Gear = timer settings · Pencil = edit · Trash = delete</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : competitions.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-gray-700">No Competitions Yet</h4>
              <p className="text-sm text-gray-400 mt-1">Click "New Competition" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {competitions.map((comp) => (
                <div
                  key={comp._id}
                  className="p-4 rounded-xl border bg-gradient-to-br from-amber-50/40 to-orange-50/10 hover:border-amber-300 transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    {/* Title + Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-gray-900 text-base leading-tight">{comp.name}</h4>
                      <StatusBadge status={comp.computedStatus} />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {comp.category && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {comp.category}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        comp.registrationType === "team"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {comp.registrationType === "team" ? "Team" : "Individual"}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          Registrations: <strong>{comp.registrationCount || 0}</strong>
                          {comp.maxParticipants > 0 ? (
                            <> / {comp.maxParticipants} <span className="text-amber-700 font-semibold">({Math.max(0, comp.maxParticipants - (comp.registrationCount || 0))} slots left)</span></>
                          ) : (
                            " (unlimited)"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Live admin timers */}
                    <div className="mt-2 space-y-1">
                      {/* Opens soon timer */}
                      {comp.isRegistrationOpen && comp.registrationStartDate &&
                        new Date(comp.registrationStartDate) > new Date() && (
                        <InlineTimer
                          label="Opens in:"
                          date={comp.registrationStartDate}
                          color="blue"
                          onExpire={fetchData}
                        />
                      )}
                      {/* Closing soon timer */}
                      {comp.isRegistrationOpen && comp.registrationEndDate &&
                        new Date(comp.registrationEndDate) > new Date() && (
                        <InlineTimer
                          label="Closes in:"
                          date={comp.registrationEndDate}
                          color="red"
                          onExpire={fetchData}
                        />
                      )}
                      {/* Expired label */}
                      {comp.registrationEndDate &&
                        new Date(comp.registrationEndDate) < new Date() && (
                        <div className="text-xs text-orange-600 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Deadline passed —{" "}
                          {new Date(comp.registrationEndDate).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t flex items-center justify-between">
                    {/* Manual toggle */}
                    <button
                      onClick={() => handleQuickToggle(comp)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                        comp.isRegistrationOpen
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                      title="Manual toggle open/close"
                    >
                      {comp.isRegistrationOpen
                        ? <><ToggleRight className="w-4 h-4" /> Open</>
                        : <><ToggleLeft className="w-4 h-4" /> Closed</>}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setFormModal(comp)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit competition details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTimerModal(comp)}
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        title="Timer & settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCompetition(comp)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete competition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REGISTRATIONS TAB ── */}
      {activeTab === "registrations" && (
        <>
          <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="text-sm border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Competitions</option>
                  {competitions.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-sm border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search participant, phone, team…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">
                Registered Participants ({filteredRegistrations.length})
              </h3>
              <span className="text-xs text-gray-500">Click status dropdown to change</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-gray-700">No Registrations Found</h4>
                <p className="text-sm text-gray-400 mt-1">Participants will appear once they register on the website.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-gray-600 font-semibold text-xs uppercase tracking-wider border-b">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Participant / Team</th>
                      <th className="py-3 px-4">Competition</th>
                      <th className="py-3 px-4">Mobile & Info</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRegistrations.map((reg, idx) => (
                      <tr key={reg._id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{reg.participantName}</div>
                          {reg.teamName && reg.teamName !== reg.participantName && (
                            <div className="text-xs text-purple-700 font-semibold">
                              Team: {reg.teamName}{reg.captainName ? ` (Capt: ${reg.captainName})` : ""}
                            </div>
                          )}
                          {reg.notes && (
                            <div className="text-[11px] text-gray-500 italic mt-0.5 max-w-xs truncate" title={reg.notes}>
                              Note: {reg.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{reg.sport?.name || reg.sportName}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-mono text-gray-800">
                            <Phone className="w-3 h-3 text-gray-400" />{reg.mobile}
                          </div>
                          {reg.email && <div className="text-xs text-gray-500">{reg.email}</div>}
                          {reg.age && <div className="text-xs text-gray-400">Age: {reg.age}{reg.gender ? ` • ${reg.gender}` : ""}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />{reg.villageOrCity || "—"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={reg.status || "confirmed"}
                            onChange={(e) => handleStatusChange(reg._id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none ${
                              reg.status === "confirmed" ? "bg-green-100 text-green-800 border-green-200"
                              : reg.status === "pending"  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteRegistration(reg._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create / Edit Modal */}
      {formModal !== null && (
        <CompetitionFormModal
          initial={formModal?._id ? formModal : null}
          onClose={() => setFormModal(null)}
          onSaved={() => { setFormModal(null); fetchData(); }}
        />
      )}

      {/* Timer / Settings Modal */}
      {timerModal && (
        <TimerModal
          comp={timerModal}
          onClose={() => setTimerModal(null)}
          onSaved={() => { setTimerModal(null); fetchData(); }}
        />
      )}
    </div>
  );
};

export default SportsRegistrationView;
