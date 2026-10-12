import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sportsRegistrationAPI } from "../../services/api";
import {
  Trophy, Clock, Users, ChevronRight, CheckCircle,
  AlertCircle, Loader2, Calendar, MapPin, Phone,
  User, Mail, Info, X, Lock, Hourglass,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Countdown hook — calls onExpire once when timer reaches zero
// ─────────────────────────────────────────────────────────────────────────────
const useCountdown = (targetDate, onExpire) => {
  const firedRef = useRef(false);

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
    firedRef.current = false;
    setTime(calc());
    const id = setInterval(() => {
      const t = calc();
      setTime(t);
      if (t?.expired && !firedRef.current) {
        firedRef.current = true;
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [calc, onExpire]);

  return time;
};

// ─────────────────────────────────────────────────────────────────────────────
// Timer display blocks (D:H:M:S)
// ─────────────────────────────────────────────────────────────────────────────
const TimerUnit = ({ value, label }) => (
  <div className="flex flex-col items-center min-w-[3rem]">
    <div
      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold font-mono"
      style={{
        background: "rgba(212,175,55,0.15)",
        color: "#d4af37",
        border: "1px solid rgba(212,175,55,0.3)",
      }}
    >
      {String(value).padStart(2, "0")}
    </div>
    <span className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.55)" }}>
      {label}
    </span>
  </div>
);

const TimerDisplay = ({ date, onExpire }) => {
  const t = useCountdown(date, onExpire);
  if (!t || t.expired) return null;
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <TimerUnit value={t.d} label="Days" />
      <span className="text-lg pb-4" style={{ color: "rgba(212,175,55,0.5)" }}>:</span>
      <TimerUnit value={t.h} label="Hrs" />
      <span className="text-lg pb-4" style={{ color: "rgba(212,175,55,0.5)" }}>:</span>
      <TimerUnit value={t.m} label="Min" />
      <span className="text-lg pb-4" style={{ color: "rgba(212,175,55,0.5)" }}>:</span>
      <TimerUnit value={t.s} label="Sec" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Compute the real-time status of a competition (mirrors backend logic)
// ─────────────────────────────────────────────────────────────────────────────
const getStatus = (comp) => {
  const now = Date.now();
  if (!comp.isRegistrationOpen) return "closed";
  if (comp.registrationStartDate && new Date(comp.registrationStartDate) > now) return "scheduled";
  if (comp.registrationEndDate   && new Date(comp.registrationEndDate)   < now) return "expired";
  if (comp.maxParticipants > 0 && (comp.registrationCount || 0) >= comp.maxParticipants) return "full";
  return "open";
};

// ─────────────────────────────────────────────────────────────────────────────
// Registration form modal
// ─────────────────────────────────────────────────────────────────────────────
const RegistrationModal = ({ competition, onClose, onSuccess }) => {
  const isTeam = competition?.registrationType === "team";

  const [form, setForm] = useState({
    playerName: "",
    teamName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isTeam) {
      if (!form.teamName.trim()) { setError("Team name is required."); return; }
    } else {
      if (!form.playerName.trim()) { setError("Player name is required."); return; }
    }
    if (!form.phone.trim()) { setError("Contact phone number is required."); return; }

    setLoading(true);
    try {
      const payload = isTeam
        ? {
            teamName: form.teamName.trim(),
            participantName: form.teamName.trim(),
            mobile: form.phone.trim(),
            email: form.email.trim(),
            villageOrCity: form.address.trim(),
            notes: form.notes.trim(),
          }
        : {
            participantName: form.playerName.trim(),
            teamName: "",
            mobile: form.phone.trim(),
            email: form.email.trim(),
            villageOrCity: form.address.trim(),
            notes: form.notes.trim(),
          };

      const res = await sportsRegistrationAPI.register(competition._id, payload);
      if (res?.status === "success") {
        onSuccess(res.data);
      } else {
        setError(res?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(212,175,55,0.2)",
    color: "#fff",
  };
  const focusStyle = (e) => (e.target.style.borderColor = "rgba(212,175,55,0.6)");
  const blurStyle  = (e) => (e.target.style.borderColor = "rgba(212,175,55,0.2)");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(20,5,5,0.88)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1a0505", border: "1px solid rgba(212,175,55,0.3)" }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex justify-between items-center"
          style={{ background: "linear-gradient(135deg,#3d0f0f,#5a1515)", borderBottom: "1px solid rgba(212,175,55,0.2)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1"
                style={{
                  background: isTeam ? "rgba(168,85,247,0.25)" : "rgba(59,130,246,0.25)",
                  color: isTeam ? "#d8b4fe" : "#93c5fd",
                  border: `1px solid ${isTeam ? "rgba(168,85,247,0.35)" : "rgba(59,130,246,0.35)"}`,
                }}
              >
                {isTeam ? <Users size={12} /> : <User size={12} />}
                {isTeam ? "Team Registration" : "Individual Registration"}
              </span>
            </div>
            <h2 className="font-bold text-lg" style={{ color: "#f0d060", fontFamily: '"Cinzel",serif' }}>
              {isTeam ? "Team Entry Form" : "Player Entry Form"}
            </h2>
            <p className="text-xs" style={{ color: "rgba(212,175,55,0.6)" }}>{competition.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: "rgba(212,175,55,0.6)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {error && (
            <div
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg"
              style={{ background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.3)" }}
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Conditional Primary Name: Team Name vs Player Name */}
          {isTeam ? (
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(212,175,55,0.8)" }}>
                Team Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(212,175,55,0.4)" }} />
                <input
                  type="text"
                  name="teamName"
                  value={form.teamName}
                  onChange={change}
                  placeholder="e.g. Thunder Strikers XI"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(212,175,55,0.8)" }}>
                Player Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(212,175,55,0.4)" }} />
                <input
                  type="text"
                  name="playerName"
                  value={form.playerName}
                  onChange={change}
                  placeholder="Enter your full name"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                  required
                />
              </div>
            </div>
          )}

          {/* Contact No + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(212,175,55,0.8)" }}>
                Contact No <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(212,175,55,0.4)" }} />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={change}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(212,175,55,0.8)" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(212,175,55,0.4)" }} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={change}
                  placeholder={isTeam ? "team@example.com (optional)" : "player@example.com (optional)"}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>
          </div>

          {/* Address / Team Address */}
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(212,175,55,0.8)" }}>
              {isTeam ? "Team Address" : "Address"}
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(212,175,55,0.4)" }} />
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={change}
                placeholder={isTeam ? "Village, City or Club address (optional)" : "Your village or city address (optional)"}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(212,175,55,0.8)" }}>
              Notes <span className="opacity-60 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={change}
              rows={2}
              placeholder={isTeam ? "Any team details, roster or special notes (optional)" : "Any additional notes or preferences (optional)"}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2"
            style={{
              background: loading ? "rgba(212,175,55,0.3)" : "linear-gradient(135deg,#d4af37,#f0c040)",
              color: "#3d0f0f",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {loading ? "Submitting Registration…" : isTeam ? "Register Team" : "Register Player"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Success modal
// ─────────────────────────────────────────────────────────────────────────────
const SuccessModal = ({ data, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(20,5,5,0.88)", backdropFilter: "blur(6px)" }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl"
      style={{ background: "#1a0505", border: "1px solid rgba(212,175,55,0.4)" }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: "rgba(212,175,55,0.15)", border: "2px solid rgba(212,175,55,0.5)" }}
      >
        <CheckCircle size={40} style={{ color: "#d4af37" }} />
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: "#f0d060", fontFamily: '"Cinzel",serif' }}>
        Registration Successful!
      </h2>
      <p className="text-sm mb-1" style={{ color: "rgba(212,175,55,0.7)" }}>
        Welcome, <span className="font-semibold text-yellow-300">{data?.teamName || data?.participantName}</span>!
      </p>
      {data?._id && (
        <p className="text-xs mt-2 mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(212,175,55,0.08)", color: "rgba(255,235,200,0.6)" }}>
          Registration ID: <span className="font-mono font-bold text-yellow-300">{String(data._id).slice(-8).toUpperCase()}</span>
        </p>
      )}
      <p className="text-xs mb-6" style={{ color: "rgba(255,200,100,0.5)" }}>
        Your slot has been recorded successfully. You may be contacted for further details.
      </p>
      <button
        onClick={onClose}
        className="px-6 py-2.5 rounded-xl font-bold text-sm"
        style={{ background: "linear-gradient(135deg,#d4af37,#f0c040)", color: "#3d0f0f" }}
      >
        Done
      </button>
    </motion.div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Competition card — handles all 5 states
// ─────────────────────────────────────────────────────────────────────────────
const CompetitionCard = ({ comp, onRegister, onRefresh }) => {
  const [status, setStatus] = useState(() => getStatus(comp));

  // Re-derive status from props (in case parent refreshed)
  useEffect(() => { setStatus(getStatus(comp)); }, [comp]);

  const isTeam = comp.registrationType === "team";
  const max = comp.maxParticipants || 0;
  const currentCount = comp.registrationCount || 0;
  const spotsLeft = max > 0 ? Math.max(0, max - currentCount) : null;
  const fillPct = max > 0 ? Math.min(100, Math.round((currentCount / max) * 100)) : 0;

  // When "opening" timer expires → refresh so backend confirms the new status
  const onOpenExpire  = useCallback(() => { setStatus("open");   onRefresh?.(); }, [onRefresh]);
  // When "closing" timer expires → mark locally then refresh
  const onCloseExpire = useCallback(() => { setStatus("expired"); onRefresh?.(); }, [onRefresh]);

  const isOpen   = status === "open";
  const isSched  = status === "scheduled";
  const isFull   = max > 0 && currentCount >= max;
  const canReg   = isOpen && !isFull;

  // Badge
  const BADGE = {
    open:      { bg: "rgba(34,197,94,0.15)",   color: "#4ade80",  border: "rgba(34,197,94,0.3)",   label: "Registration Open" },
    scheduled: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa",  border: "rgba(59,130,246,0.3)",   label: "Opening Soon" },
    closed:    { bg: "rgba(239,68,68,0.12)",   color: "#f87171",  border: "rgba(239,68,68,0.3)",    label: "Closed" },
    expired:   { bg: "rgba(249,115,22,0.12)",  color: "#fb923c",  border: "rgba(249,115,22,0.3)",   label: "Registration Ended" },
    full:      { bg: "rgba(168,85,247,0.12)",  color: "#c084fc",  border: "rgba(168,85,247,0.3)",   label: "Registrations Full" },
  };
  const badge = BADGE[status] || BADGE.closed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.2)" }}
    >
      {/* Card Header */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)" }}
            >
              <Trophy size={20} style={{ color: "#d4af37" }} />
            </div>
            <div>
              <h3
                className="font-bold text-base leading-tight"
                style={{ color: "#f0d060", fontFamily: '"Cinzel",serif' }}
              >
                {comp.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                {comp.category && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(212,175,55,0.12)", color: "rgba(212,175,55,0.8)" }}
                  >
                    {comp.category}
                  </span>
                )}
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold"
                  style={{
                    background: isTeam ? "rgba(168,85,247,0.18)" : "rgba(59,130,246,0.18)",
                    color: isTeam ? "#d8b4fe" : "#93c5fd",
                    border: `1px solid ${isTeam ? "rgba(168,85,247,0.35)" : "rgba(59,130,246,0.35)"}`,
                  }}
                >
                  {isTeam ? <Users size={11} /> : <User size={11} />}
                  {isTeam ? "Team Event" : "Individual"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
            style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
          >
            {badge.label}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 py-4 space-y-4 flex-1 flex flex-col">
        {comp.description && (
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,235,200,0.5)" }}>
            {comp.description}
          </p>
        )}

        {/* Live Slot Capacity Box */}
        <div
          className="rounded-xl p-3 space-y-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.15)" }}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5" style={{ color: "rgba(255,235,200,0.7)" }}>
              <Users size={13} style={{ color: "#d4af37" }} />
              <span>
                {max > 0 ? (
                  <>Slots: <strong className="text-yellow-300 font-mono text-sm">{currentCount}</strong> / {max}</>
                ) : (
                  <>Registered: <strong className="text-yellow-300 font-mono text-sm">{currentCount}</strong></>
                )}
              </span>
            </span>

            {max > 0 ? (
              <span
                className="font-bold px-2 py-0.5 rounded text-xs"
                style={{
                  background: spotsLeft <= 0 ? "rgba(239,68,68,0.2)" : spotsLeft <= 5 ? "rgba(249,115,22,0.2)" : "rgba(34,197,94,0.2)",
                  color: spotsLeft <= 0 ? "#f87171" : spotsLeft <= 5 ? "#fb923c" : "#4ade80",
                  border: `1px solid ${spotsLeft <= 0 ? "rgba(239,68,68,0.35)" : spotsLeft <= 5 ? "rgba(249,115,22,0.35)" : "rgba(34,197,94,0.35)"}`,
                }}
              >
                {spotsLeft <= 0 ? "0 slots left (Full)" : `${spotsLeft} slots left`}
              </span>
            ) : (
              <span className="text-emerald-400 font-medium text-xs">Unlimited slots</span>
            )}
          </div>

          {max > 0 && (
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${fillPct}%`,
                  background: fillPct >= 100 ? "#ef4444" : fillPct >= 80 ? "#f97316" : "#eab308",
                }}
              />
            </div>
          )}
        </div>

        {/* Meta (Fee & End Date) */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {comp.registrationEndDate && (
            <div className="flex items-center gap-2">
              <Calendar size={12} style={{ color: "rgba(212,175,55,0.5)" }} />
              <span style={{ color: "rgba(255,235,200,0.45)" }}>
                {isOpen ? "Closes" : "Closed"}{" "}
                {new Date(comp.registrationEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
          )}
          {comp.entryFee && (
            <div className="flex items-center gap-2">
              <span style={{ color: "rgba(212,175,55,0.5)" }}>Fee:</span>
              <span style={{ color: "rgba(255,235,200,0.65)" }}>{comp.entryFee}</span>
            </div>
          )}
        </div>

        {/* Rules */}
        {comp.rules && (
          <div
            className="text-xs px-3 py-2 rounded-lg"
            style={{
              background: "rgba(212,175,55,0.06)",
              color: "rgba(255,235,200,0.4)",
              borderLeft: "3px solid rgba(212,175,55,0.2)",
            }}
          >
            <span className="font-semibold block mb-0.5" style={{ color: "rgba(212,175,55,0.6)" }}>Rules</span>
            {comp.rules}
          </div>
        )}

        {/* ── Timer Section ── */}
        <div className="space-y-3 flex-1 flex flex-col justify-end">
          {/* OPENING SOON timer */}
          {isSched && comp.registrationStartDate && (
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <Hourglass size={14} style={{ color: "#60a5fa" }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#60a5fa" }}>
                  Registration Opening In
                </span>
              </div>
              <div className="flex justify-center">
                <TimerDisplay date={comp.registrationStartDate} onExpire={onOpenExpire} />
              </div>
            </div>
          )}

          {/* CLOSING SOON timer */}
          {isOpen && comp.registrationEndDate && (
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <Clock size={14} style={{ color: "#d4af37" }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.7)" }}>
                  Registration Closing In
                </span>
              </div>
              <div className="flex justify-center">
                <TimerDisplay date={comp.registrationEndDate} onExpire={onCloseExpire} />
              </div>
            </div>
          )}

          {/* Register / Disabled button */}
          <button
            onClick={() => canReg && onRegister(comp)}
            disabled={!canReg}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 group"
            style={{
              background: canReg
                ? "linear-gradient(135deg,#d4af37,#f0c040)"
                : "rgba(255,255,255,0.04)",
              color:  canReg ? "#3d0f0f" : "rgba(255,255,255,0.25)",
              cursor: canReg ? "pointer"  : "not-allowed",
              border: canReg ? "none"     : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {canReg ? (
              <>Register <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
            ) : status === "full" ? (
              <><Users size={15} /> Registrations Full</>
            ) : status === "scheduled" ? (
              <><Hourglass size={15} /> Opens Soon</>
            ) : status === "expired" ? (
              <><Lock size={15} /> Registration Ended</>
            ) : (
              <><Lock size={15} /> Registration Closed</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function SportsRegistration() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [selectedComp, setSelectedComp] = useState(null);
  const [successData, setSuccessData]   = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await sportsRegistrationAPI.getOpenCompetitions();
      setCompetitions(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setError("Failed to load competitions. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter — show all except permanently closed (no open flag and no schedule)
  const visible = competitions.filter((c) => {
    const s = c.computedStatus || getStatus(c);
    return s !== "closed"; // hide competitions that are off entirely
  });

  const handleSuccess = (data) => {
    const regCompId = selectedComp?._id;
    setSelectedComp(null);
    setSuccessData(data);
    // Live slot update immediately without delay
    if (regCompId) {
      setCompetitions((prev) =>
        prev.map((c) => {
          if (c._id === regCompId) {
            const nextCount = (c.registrationCount || 0) + 1;
            const isFull = c.maxParticipants > 0 && nextCount >= c.maxParticipants;
            return {
              ...c,
              registrationCount: nextCount,
              computedStatus: isFull ? "full" : c.computedStatus,
            };
          }
          return c;
        })
      );
    }
    // Refresh to synchronize with backend database
    load();
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#1a0505 0%,#0d0202 100%)" }}>
      {/* Page Header */}
      <div
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(212,175,55,0.08) 0%,transparent 65%)" }}
        />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy size={32} style={{ color: "#d4af37" }} />
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold"
              style={{ color: "#f0d060", fontFamily: '"Cinzel",serif', letterSpacing: "0.04em" }}
            >
              Sports Registrations
            </h1>
          </div>
          <p className="max-w-lg mx-auto text-sm sm:text-base" style={{ color: "rgba(255,235,200,0.5)" }}>
            Register for upcoming competitions and sports events organised by Vitthal Rakhumai Seva Mandal.
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <Loader2 size={40} className="animate-spin" style={{ color: "#d4af37" }} />
            <p className="text-sm" style={{ color: "rgba(212,175,55,0.5)" }}>Loading competitions…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <AlertCircle size={40} style={{ color: "#f87171" }} />
            <p className="text-sm" style={{ color: "rgba(248,113,113,0.8)" }}>{error}</p>
            <button
              onClick={load}
              className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(212,175,55,0.15)", color: "#d4af37", border: "1px solid rgba(212,175,55,0.3)" }}
            >
              Try Again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(212,175,55,0.08)" }}
            >
              <Trophy size={36} style={{ color: "rgba(212,175,55,0.3)" }} />
            </div>
            <h3
              className="font-bold text-lg"
              style={{ color: "rgba(240,208,96,0.6)", fontFamily: '"Cinzel",serif' }}
            >
              No Open Registrations
            </h3>
            <p className="text-sm max-w-xs" style={{ color: "rgba(255,235,200,0.35)" }}>
              There are no competitions open or scheduled at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visible.map((comp) => (
              <CompetitionCard
                key={comp._id}
                comp={comp}
                onRegister={setSelectedComp}
                onRefresh={load}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedComp && (
          <RegistrationModal
            key="form"
            competition={selectedComp}
            onClose={() => setSelectedComp(null)}
            onSuccess={handleSuccess}
          />
        )}
        {successData && (
          <SuccessModal
            key="success"
            data={successData}
            onClose={() => setSuccessData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
