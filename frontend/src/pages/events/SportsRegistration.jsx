import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sportsRegistrationAPI } from "../../services/api";
import {
  Trophy, Clock, Users, ChevronRight, CheckCircle,
  AlertCircle, Loader2, Calendar, MapPin, Phone,
  User, Mail, Info, X, Lock, Hourglass, Sparkles,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

/* ── Sacred Diamond Divider ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-3 justify-center">
    <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="11"
        y="1"
        width="13"
        height="13"
        rx="1"
        transform="rotate(45 11 1)"
        className="fill-saffron opacity-80"
      />
      <rect
        x="11"
        y="4"
        width="9"
        height="9"
        rx="0.5"
        transform="rotate(45 11 4)"
        fill="none"
        className="stroke-gold-lt"
        strokeWidth="0.8"
      />
    </svg>
    <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
  </div>
);

/* ── Corner Accents for Cards ── */
const CornerAccents = () => (
  <>
    <span className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 border-t-2 border-l-2 border-saffron z-20" />
    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 border-t-2 border-r-2 border-saffron z-20" />
    <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 border-b-2 border-l-2 border-saffron z-20" />
    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-b-2 border-r-2 border-saffron z-20" />
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Countdown hook
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
// Timer display blocks
// ─────────────────────────────────────────────────────────────────────────────
const TimerUnit = ({ value, label }) => (
  <div className="flex flex-col items-center min-w-[2.8rem]">
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-white border border-gold/45 shadow-xs flex items-center justify-center text-sm sm:text-base font-bold font-heading text-maroon">
      {String(value).padStart(2, "0")}
    </div>
    <span className="text-[10px] mt-1 uppercase tracking-wider font-heading font-semibold text-saffron-dk">
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
      <span className="text-base pb-3 text-gold-dk font-bold">:</span>
      <TimerUnit value={t.h} label="Hrs" />
      <span className="text-base pb-3 text-gold-dk font-bold">:</span>
      <TimerUnit value={t.m} label="Min" />
      <span className="text-base pb-3 text-gold-dk font-bold">:</span>
      <TimerUnit value={t.s} label="Sec" />
    </div>
  );
};

const getStatus = (comp) => {
  const now = Date.now();
  if (!comp.isRegistrationOpen) return "closed";
  if (comp.registrationStartDate && new Date(comp.registrationStartDate) > now) return "scheduled";
  if (comp.registrationEndDate && new Date(comp.registrationEndDate) < now) return "expired";
  if (comp.maxParticipants > 0 && (comp.registrationCount || 0) >= comp.maxParticipants) return "full";
  return "open";
};

// ─────────────────────────────────────────────────────────────────────────────
// Registration form modal
// ─────────────────────────────────────────────────────────────────────────────
const RegistrationModal = ({ competition, onClose, onSuccess }) => {
  const isTeam = competition.registrationType === "team";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    participantName: "",
    teamName: "",
    email: "",
    phone: "",
    age: "",
    gender: "male",
    address: "",
    teamMembers: "",
    emergencyContact: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isTeam && !form.participantName.trim()) {
      setError("Please enter participant name");
      return;
    }
    if (isTeam && !form.teamName.trim()) {
      setError("Please enter team name");
      return;
    }
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter email address");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        competitionId: competition._id,
        ...form,
        age: form.age ? Number(form.age) : undefined,
        teamMembers: isTeam
          ? form.teamMembers.split("\n").map((m) => m.trim()).filter(Boolean)
          : undefined,
      };
      const res = await sportsRegistrationAPI.registerParticipant(payload);
      onSuccess(res?.data || { ...payload, _id: "success" });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl max-h-[90vh] bg-cream rounded-md border border-gold/50 shadow-2xl flex flex-col overflow-hidden text-ink-dark"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-[#1c0505] to-[#120202] text-cream border-b border-amber-500/30">
          <div>
            <span className="text-[10px] font-heading font-bold text-amber-300 uppercase tracking-widest block">
              Sports Registration
            </span>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">
              {competition.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-amber-200/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-vermillion/10 border border-vermillion/30 text-vermillion text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isTeam ? (
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                Team Name *
              </label>
              <input
                type="text"
                name="teamName"
                value={form.teamName}
                onChange={handleChange}
                placeholder="e.g. Amberkarwadi Warriors"
                className="w-full px-3 py-2 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                Participant Name *
              </label>
              <input
                type="text"
                name="participantName"
                value={form.participantName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                className="w-full px-3 py-2 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-3 py-2 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="Age in years"
                className="w-full px-3 py-2 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {isTeam && (
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                Squad Members (One per line)
              </label>
              <textarea
                name="teamMembers"
                value={form.teamMembers}
                onChange={handleChange}
                rows={3}
                placeholder="Player 1 (Captain)&#10;Player 2&#10;Player 3"
                className="w-full px-3 py-2 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
              Residential Address
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Village / City"
              className="w-full px-3 py-2 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-gold/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs font-heading font-bold text-ink-mid hover:text-maroon border border-gold/30 hover:bg-cream-dk transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-md text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Submit Registration</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Success Modal
// ─────────────────────────────────────────────────────────────────────────────
const SuccessModal = ({ data, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm rounded-md p-6 text-center shadow-2xl bg-gradient-to-b from-[#1c0505] to-[#0c0202] border border-amber-500/40 text-cream"
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-amber-400/20 border-2 border-amber-400 text-amber-300">
        <CheckCircle size={32} />
      </div>
      <h2 className="text-xl font-display font-bold text-white mb-1">
        Registration Recorded!
      </h2>
      <p className="text-xs text-cream/80 mb-3">
        Welcome, <span className="font-bold text-amber-300">{data?.teamName || data?.participantName}</span>!
      </p>
      {data?._id && (
        <p className="text-[11px] mb-4 p-2 rounded-md bg-black/50 border border-amber-500/30 font-mono text-amber-200">
          ID: {String(data._id).slice(-8).toUpperCase()}
        </p>
      )}
      <button
        onClick={onClose}
        className="w-full py-2.5 rounded-md font-heading font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-xs cursor-pointer"
      >
        Done
      </button>
    </motion.div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Competition Card Component (Rectangular Theme)
// ─────────────────────────────────────────────────────────────────────────────
const CompetitionCard = ({ comp, onRegister, onRefresh }) => {
  const [status, setStatus] = useState(() => getStatus(comp));
  useEffect(() => { setStatus(getStatus(comp)); }, [comp]);

  const isTeam = comp.registrationType === "team";
  const max = comp.maxParticipants || 0;
  const currentCount = comp.registrationCount || 0;
  const spotsLeft = max > 0 ? Math.max(0, max - currentCount) : null;
  const fillPct = max > 0 ? Math.min(100, Math.round((currentCount / max) * 100)) : 0;

  const onOpenExpire = useCallback(() => { setStatus("open"); onRefresh?.(); }, [onRefresh]);
  const onCloseExpire = useCallback(() => { setStatus("expired"); onRefresh?.(); }, [onRefresh]);

  const isOpen = status === "open";
  const isSched = status === "scheduled";
  const isFull = max > 0 && currentCount >= max;
  const canReg = isOpen && !isFull;

  const BADGE = {
    open: { bg: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "Registration Open" },
    scheduled: { bg: "bg-sky-100 text-sky-800 border-sky-300", label: "Opening Soon" },
    closed: { bg: "bg-red-100 text-red-800 border-red-300", label: "Closed" },
    expired: { bg: "bg-amber-100 text-amber-800 border-amber-300", label: "Ended" },
    full: { bg: "bg-purple-100 text-purple-800 border-purple-300", label: "Full" },
  };
  const badge = BADGE[status] || BADGE.closed;

  return (
    <div className="group relative bg-cream-dk rounded-md border border-gold/45 p-6 flex flex-col justify-between shadow-xs hover:border-gold hover:shadow-md transition-colors duration-200 overflow-hidden">
      {/* Saffron Corner Accents */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <CornerAccents />
      </div>

      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-md bg-white border border-gold/40 flex items-center justify-center text-maroon shadow-xs shrink-0">
              <Trophy size={18} className="text-saffron" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-maroon leading-tight">
                {comp.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {comp.category && (
                  <span className="text-[10px] font-heading font-semibold px-2 py-0.5 rounded-sm bg-cream border border-gold/30 text-ink-mid">
                    {comp.category}
                  </span>
                )}
                <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-sm bg-maroon/10 text-maroon border border-maroon/20">
                  {isTeam ? "Team Event" : "Individual"}
                </span>
              </div>
            </div>
          </div>

          <span className={`text-[10px] font-heading font-bold px-2.5 py-0.5 rounded-sm border uppercase tracking-wider ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        {comp.description && (
          <p className="text-xs text-ink-light font-body line-clamp-2 mb-3">
            {comp.description}
          </p>
        )}

        {/* Capacity Indicator */}
        <div className="bg-white rounded-md p-3 border border-gold/30 mb-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-mid font-medium flex items-center gap-1">
              <Users size={12} className="text-saffron" />
              <span>Slots: <strong>{currentCount}</strong> {max > 0 ? `/ ${max}` : ""}</span>
            </span>
            {max > 0 && (
              <span className="text-[10px] font-heading font-bold text-saffron-dk">
                {spotsLeft <= 0 ? "0 Left (Full)" : `${spotsLeft} Slots Left`}
              </span>
            )}
          </div>
          {max > 0 && (
            <div className="w-full h-1.5 bg-cream-dk rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${fillPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Timers */}
        {isSched && comp.registrationStartDate && (
          <div className="mb-3 p-3 bg-white rounded-md border border-sky-300/60 text-center">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-sky-800 block mb-2">
              Registration Opening In
            </span>
            <div className="flex justify-center">
              <TimerDisplay date={comp.registrationStartDate} onExpire={onOpenExpire} />
            </div>
          </div>
        )}

        {isOpen && comp.registrationEndDate && (
          <div className="mb-3 p-3 bg-white rounded-md border border-gold/45 text-center">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-saffron-dk block mb-2">
              Registration Closing In
            </span>
            <div className="flex justify-center">
              <TimerDisplay date={comp.registrationEndDate} onExpire={onCloseExpire} />
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gold/30 mt-auto">
        <button
          onClick={() => canReg && onRegister(comp)}
          disabled={!canReg}
          className={`w-full py-2.5 rounded-md text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            canReg
              ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-xs hover:shadow-md"
              : "bg-cream border border-gold/30 text-ink-light cursor-not-allowed"
          }`}
        >
          {canReg ? (
            <>Register Now <ChevronRight size={14} /></>
          ) : status === "full" ? (
            "Registrations Full"
          ) : status === "scheduled" ? (
            "Opening Soon"
          ) : (
            "Registration Closed"
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SportsRegistration() {
  const { isMarathi } = useLanguage();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComp, setSelectedComp] = useState(null);
  const [successData, setSuccessData] = useState(null);

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

  const visible = competitions.filter((c) => {
    const s = c.computedStatus || getStatus(c);
    return s !== "closed";
  });

  const handleSuccess = (data) => {
    const regCompId = selectedComp?._id;
    setSelectedComp(null);
    setSuccessData(data);
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
    load();
  };

  return (
    <div className="w-full bg-cream font-body text-ink-dark min-h-screen relative overflow-hidden">
      {/* ═══════════ 1. CINEMATIC HERO BANNER ═══════════ */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 bg-gradient-to-b from-[#180303] via-[#100202] to-[#180303] text-cream border-b border-amber-500/25 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12)_0%,_rgba(24,4,4,0.40)_65%,_rgba(12,2,2,0.95)_100%)] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 40px)",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            className="inline-flex items-center gap-2 bg-black/45 border border-amber-400/40 rounded-full px-4 py-1.5 font-heading text-xs sm:text-[0.82rem] font-medium text-amber-200 tracking-wide mb-4 shadow-sm backdrop-blur-xs select-none"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <Trophy size={13} className="text-amber-300 shrink-0" />
            <span>{isMarathi ? "स्पर्धा प्रवेश व नोंदणी" : "Participant Entry Portal"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center select-none"
          >
            <span className="font-heading text-[clamp(2rem,5.5vw,4rem)] font-black text-white leading-tight tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              {isMarathi ? "क्रीडा स्पर्धा नोंदणी" : "Sports Registration"}
            </span>
            <span className="font-heading text-[clamp(1.1rem,3vw,2rem)] font-bold tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] mt-1 block">
              {isMarathi ? "श्री विठ्ठल रखुमाई मंदिर ट्रस्ट" : "Shree Vitthal Rakhumai Mandir Trust"}
            </span>
          </motion.h1>

          <DiamondDivider />

          <motion.p
            className="max-w-2xl mx-auto text-base sm:text-lg text-cream/85 font-body leading-relaxed mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isMarathi
              ? "“वार्षिक क्रीडा महोत्सवात सहभागी होण्यासाठी आपला संघ किंवा वैयक्तिक नोंदणी करा.”"
              : "“Register your team or individual entry for the annual village tournaments and sports festivals.”"}
          </motion.p>
        </div>
      </section>

      {/* ═══════════ 2. SACRED SHLOKA STRIP ═══════════ */}
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />
      <div className="relative bg-maroon px-6 py-7 sm:py-8 text-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(212,175,55,0.15) 0, rgba(212,175,55,0.15) 1px, transparent 0, transparent 60px)",
          }}
        />
        <p className="relative z-10 font-marathi text-[clamp(1.1rem,2.8vw,1.5rem)] text-gold-lt tracking-wide leading-relaxed">
          || क्रीडा सेवा — युवक सहभाग व नोंदणी ||
        </p>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />

      {/* ═══════════ 3. MAIN REGISTRATIONS GRID ═══════════ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-light">
            <Loader2 className="w-10 h-10 animate-spin text-saffron mb-3" />
            <p className="font-heading text-xs sm:text-sm tracking-widest uppercase text-maroon font-bold">
              {isMarathi ? "नोंदणी माहिती लोड होत आहे..." : "Loading competitions…"}
            </p>
          </div>
        ) : error ? (
          <div className="bg-cream-dk border border-vermillion/40 rounded-md p-8 text-center max-w-lg mx-auto shadow-sm">
            <AlertCircle size={32} className="text-vermillion mx-auto mb-2" />
            <p className="text-vermillion font-medium">{error}</p>
            <button
              onClick={load}
              className="mt-3 px-4 py-1.5 rounded-md text-xs font-heading font-bold bg-maroon text-gold-lt cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-cream-dk rounded-md border border-gold/40 p-12 text-center max-w-md mx-auto shadow-xs">
            <Trophy className="w-10 h-10 text-gold-dk mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-maroon mb-1.5">
              {isMarathi ? "नोंदणी उपलब्ध नाही" : "No Open Registrations"}
            </h3>
            <p className="font-body text-sm text-ink-light">
              {isMarathi
                ? "सध्या कोणत्याही क्रीडा स्पर्धेची नोंदणी खुली नाही. कृपया नंतर पहा."
                : "There are no competitions open or scheduled at the moment. Please check back later."}
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
      </main>

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

      {/* ═══════════ 4. FOOTER STRIP ═══════════ */}
      <div className="bg-ink-dark border-t-4 border-gold py-6 text-center">
        <p className="font-marathi text-[1.1rem] text-gold-lt tracking-wide">
          || पुंडलिका वरदा हरी विठ्ठल — श्री ज्ञानदेव तुकाराम ||
        </p>
        <p className="font-body italic text-cream/45 text-[0.85rem] mt-1 tracking-wider">
          Shree Vitthal Rakhumai Temple · Amberkarwadi, Ratnagiri
        </p>
      </div>
    </div>
  );
}
