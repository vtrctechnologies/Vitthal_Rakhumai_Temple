import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ChevronDown, Check } from "lucide-react";

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  isLoading = false,
  disabled = false,
}) => {
  const baseStyle =
    "w-full py-2.5 sm:py-3 px-4 rounded-xl font-medium transition-all duration-200 ease-out transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2";
  const variants = {
    primary:
      "bg-gradient-to-r from-[#6b1a1a] via-[#7c1f1f] to-[#4a0f0f] text-[#fef6e4] border border-[#d4af37]/40 shadow-md hover:from-[#7c1f1f] hover:to-[#5a1515] hover:border-[#d4af37]/80 hover:shadow-[0_10px_24px_-8px_rgba(107,26,26,0.5)]",
    saffron:
      "bg-gradient-to-r from-[#e8650a] to-[#f5a623] text-white border border-[#f0d060]/50 shadow-md hover:from-[#d95b06] hover:to-[#e89818] hover:shadow-[0_10px_24px_-8px_rgba(232,101,10,0.45)]",
    outline:
      "border border-[#d4af37]/65 bg-[#fffaf0] text-[#6b1a1a] shadow-sm hover:bg-[#d4af37]/15 hover:border-[#d4af37] hover:shadow-md",
    ghost:
      "bg-transparent text-[#5c3317] hover:bg-[#f5e6c8]/70 hover:text-[#6b1a1a] shadow-none",
    danger:
      "bg-[#c0392b]/10 text-[#c0392b] hover:bg-[#c0392b]/15 border border-[#c0392b]/30 shadow-none",
    dangerPrimary:
      "bg-gradient-to-r from-[#c0392b] to-[#96281b] text-white shadow-md hover:from-[#a93226] hover:to-[#7b241c] hover:shadow-lg",
  };

  const isDisabled = isLoading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className} ${
        isDisabled ? "opacity-65 cursor-not-allowed hover:translate-y-0" : "cursor-pointer"
      }`}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

export const InputField = ({
  label,
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  readOnly = false,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs sm:text-sm font-semibold text-[#5c3317] mb-1.5 ml-0.5 tracking-wide">
          {label}
        </label>
      )}
      <div
        className={`group relative flex items-center border rounded-xl transition-all duration-200 ${
          readOnly || disabled
            ? "bg-[#f5e6c8]/40 border-[#d4af37]/30 opacity-85"
            : "bg-[#fffaf0] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#d4af37]/25"
        } ${
          error
            ? "border-[#c0392b]"
            : "border-[#d4af37]/40 focus-within:border-[#e8650a]"
        }`}
      >
        {Icon && (
          <div className="pl-3.5 text-[#8b5e3c] group-focus-within:text-[#e8650a] transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          type={inputType}
          readOnly={readOnly}
          disabled={disabled}
          className="w-full py-2.5 sm:py-3 px-3 bg-transparent outline-none text-sm sm:text-base text-[#2c1a0e] placeholder-[#8b5e3c]/60"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-3.5 text-[#8b5e3c] hover:text-[#6b1a1a] transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-[#c0392b] mt-1 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
};

export const BackgroundPattern = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(135deg, #fef6e4 0%, #f9ebd2 50%, #f5e6c8 100%)",
      }}
    />
    <div
      className="absolute -top-24 -right-24 w-96 h-96 rounded-full filter blur-2xl opacity-20"
      style={{ background: "#d4af37" }}
    />
    <div
      className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full filter blur-2xl opacity-15"
      style={{ background: "#e8650a" }}
    />
    <div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[820px] h-[820px] border rounded-full"
      style={{ borderColor: "rgba(212,175,55,0.22)" }}
    />
    <div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border rounded-full"
      style={{ borderColor: "rgba(107,26,26,0.1)" }}
    />
  </div>
);

export const StatCard = ({
  title,
  value,
  trend,
  icon: Icon,
  accent = "saffron",
  onClick,
}) => {
  const accentStyles = {
    saffron: {
      iconBg: "bg-[#e8650a]/10 border-[#e8650a]/25 text-[#e8650a]",
      topBar: "from-[#e8650a] via-[#f5a623] to-[#d4af37]",
      pill: "bg-[#e8650a]/10 text-[#b8440a] border border-[#e8650a]/20",
    },
    maroon: {
      iconBg: "bg-[#6b1a1a]/10 border-[#6b1a1a]/25 text-[#6b1a1a]",
      topBar: "from-[#4a0f0f] via-[#6b1a1a] to-[#d4af37]",
      pill: "bg-[#6b1a1a]/10 text-[#6b1a1a] border border-[#6b1a1a]/20",
    },
    gold: {
      iconBg: "bg-[#d4af37]/15 border-[#d4af37]/35 text-[#a07820]",
      topBar: "from-[#a07820] via-[#d4af37] to-[#f0d060]",
      pill: "bg-[#d4af37]/15 text-[#7a5a12] border border-[#d4af37]/30",
    },
  };

  const style = accentStyles[accent] || accentStyles.saffron;

  return (
    <div
      onClick={onClick}
      className={`temple-card relative overflow-hidden p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div
        className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${style.topBar}`}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#8b5e3c]">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#6b1a1a] mt-1.5 font-heading-temple truncate">
            {value}
          </h3>
        </div>
        <div
          className={`p-3 rounded-xl border flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${style.iconBg}`}
        >
          <Icon size={22} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span
            className={`font-semibold px-2.5 py-0.5 rounded-full ${style.pill}`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};


export const TempleSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  icon: Icon,
  className = "",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const normalizedOptions = options.map((opt) =>
    typeof opt === "object" ? opt : { value: opt, label: String(opt) }
  );

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
          open
            ? "bg-white border-[#e8650a] ring-2 ring-[#d4af37]/25 text-[#6b1a1a]"
            : "bg-[#fffaf0] border-[#d4af37]/50 text-[#2c1a0e] hover:border-[#d4af37] hover:bg-white"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {Icon && <Icon size={15} className="text-[#e8650a] shrink-0" />}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`text-[#8b5e3c] shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-[#e8650a]" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 min-w-[160px] max-h-60 overflow-y-auto bg-[#fffdf8] border border-[#d4af37]/55 rounded-xl shadow-xl z-50 py-1 animate-subtle-pop">
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-left text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#fef6e4] text-[#6b1a1a] font-semibold"
                    : "text-[#5c3317] hover:bg-[#f5e6c8]/50 hover:text-[#6b1a1a]"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={14} className="text-[#e8650a] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
