import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  isLoading = false,
}) => {
  const baseStyle =
    "w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 shadow-md";
  const variants = {
    primary:
      "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 hover:shadow-lg",
    outline: "border-2 border-orange-600 text-orange-700 hover:bg-orange-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 shadow-none",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    dangerPrimary: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`${baseStyle} ${variants[variant]} ${className} ${
        isLoading ? "opacity-75 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
        {label}
      </label>
      <div
        className={`relative flex items-center border-2 rounded-lg bg-gray-50 transition-colors focus-within:bg-white ${
          error
            ? "border-red-400"
            : "border-gray-200 focus-within:border-orange-500"
        }`}
      >
        <div className="pl-3 text-gray-400">
          <Icon size={20} />
        </div>
        <input
          type={inputType}
          className="w-full py-3 px-3 bg-transparent outline-none text-gray-800 placeholder-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-3 text-gray-400 hover:text-orange-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
};

export const BackgroundPattern = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100" />
    <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
    <div
      className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
      style={{ animationDelay: "2s" }}
    />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-orange-200/40 rounded-full" />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-orange-300/30 rounded-full" />
  </div>
);

export const StatCard = ({ title, value, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
      <div
        className={`p-3 rounded-lg ${color} bg-opacity-10 text-${color.replace(
          "bg-",
          ""
        )}`}
      >
        <Icon size={20} className={color.replace("bg-", "text-")} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs text-gray-500">
      <span className="text-green-500 font-medium bg-green-50 px-2 py-0.5 rounded-full mr-2">
        {trend}
      </span>
    </div>
  </div>
);
