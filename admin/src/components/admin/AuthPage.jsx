import React, { useState } from "react";
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  Landmark,
  ArrowLeft,
  KeyRound,
  Phone,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { Button, InputField, BackgroundPattern } from "../customUi/AdminShared";

const AuthPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  // VIEW STATES: 'login', 'register', 'forgot-email', 'forgot-otp'
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);

  // FORM DATA
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    otp: "", // New OTP field
    forgotUsername: "", // Username for forgot password
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const resetFormState = (newView) => {
    setErrors({});
    setApiError("");
    setApiSuccess("");
    setView(newView);
    // We keep forgotUsername in formData when switching between forgot-email and forgot-otp
    if (newView === "login") {
      setFormData({ ...formData, password: "", otp: "", forgotUsername: "" });
    }
  };

  // --- VALIDATION ---
  const validate = () => {
    const newErrors = {};

    if (view === "forgot-email") {
      if (!formData.forgotUsername || formData.forgotUsername.length < 3)
        newErrors.forgotUsername = "Username is required (min 3 characters).";
    } else if (view !== "forgot-otp") {
      if (!formData.email.includes("@"))
        newErrors.email = "Valid email is required.";
    }

    if (view === "login" || view === "register") {
      if (formData.password.length < 6)
        newErrors.password = "Min 6 characters.";
    }

    if (view === "register") {
      if (formData.username.length < 3)
        newErrors.username = "Min 3 characters.";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Match password.";
      if (!formData.phone || formData.phone.length < 10) {
        newErrors.phone = "Valid phone number with country code is required (e.g., +1234567890).";
      }
    }

    if (view === "forgot-otp") {
      if (formData.otp.length !== 6)
        newErrors.otp = "Enter a valid 6-digit OTP.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    setApiSuccess("");

    try {
      // 1. FORGOT PASSWORD: GENERATE OTP
      if (view === "forgot-email") {
        const res = await authAPI.forgotPassword(null, formData.forgotUsername);
        setApiSuccess(res.message);
        setView("forgot-otp");
        // Start cooldown timer (60 seconds)
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      // 2. FORGOT PASSWORD: VERIFY OTP
      else if (view === "forgot-otp") {
        const res = await authAPI.verifyOTP(null, formData.forgotUsername, formData.otp);
        if (res.status === "success") {
          // Store token
          localStorage.setItem("temple_admin_token", res.token);

          // Switch to Victory view
          setApiSuccess("Identity Verified!");
          setView("victory");

          const userData = res.admin;

          // Automatic transition after a few seconds
          setTimeout(() => {
            // Notify parent to update app state
            onLoginSuccess(userData);
            // Redirect to Settings page for password reset
            navigate("/admin/settings");
          }, 3500);
        }
      }
      // 3. REGISTER
      else if (view === "register") {
        const res = await authAPI.register(
          formData.username,
          formData.email,
          formData.password,
          formData.phone
        );
        if (res.success) {
          if (res.data.role !== "admin" && res.data.role !== "superadmin") {
            setApiSuccess("Account created successfully. Note: Administrative privileges must be assigned by an existing administrator or server CLI seed script before you can access the admin dashboard.");
            setView("login");
            return;
          }
          localStorage.setItem("temple_admin_token", res.data.token);
          onLoginSuccess({ id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role });
        }
      }
      // 4. LOGIN
      else {
        const res = await authAPI.login(formData.email, formData.password);
        if (res.success) {
          if (res.data.role !== "admin" && res.data.role !== "superadmin") {
            setApiError("Access denied. Only administrators are authorized to log in to this portal.");
            return;
          }
          localStorage.setItem("temple_admin_token", res.data.token);
          onLoginSuccess({ id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role });
        }
      }
    } catch (error) {
      setApiError(
        error.message || error.response?.data?.message || "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      return; // Still in cooldown
    }

    setResendLoading(true);
    setApiError("");
    setApiSuccess("");

    try {
      const res = await authAPI.resendOTP(null, formData.forgotUsername);
      setApiSuccess(res.message);
      // Start cooldown timer (60 seconds)
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setApiError(
        error.message || error.response?.data?.message || "Failed to resend OTP."
      );
    } finally {
      setResendLoading(false);
    }
  };

  // --- UI HELPERS ---
  const getTitle = () => {
    if (view === "forgot-email") return "Reset Password";
    if (view === "forgot-otp") return "Enter OTP";
    if (view === "victory") return "Access Granted";
    return view === "register" ? "Join the Trust" : "Welcome Back";
  };

  const getSubtitle = () => {
    if (view === "forgot-email") return "Enter your username to receive an OTP code via SMS on your registered phone number.";
    if (view === "forgot-otp") return `OTP sent to your registered phone number for username: ${formData.forgotUsername}`;
    if (view === "victory") return "Identity verified successfully. Entering portal...";
    return view === "register"
      ? "Create an account to manage activities."
      : "Sign in to your account.";
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 py-28 font-sans text-gray-800 relative">
      <BackgroundPattern />

      <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-fade-in-up">
        {/* Left Side: Visual */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-orange-600 to-red-700 p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Landmark size={28} className="text-yellow-300" />
              </div>
              <span className="font-bold text-xl tracking-wider text-yellow-300">
                ADMIN PORTAL
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
              Shri Vitthal <br /> Rakhumai
            </h1>
            <p className="text-orange-100 text-lg opacity-90">
              {view.includes("forgot")
                ? "Securely recover access to your account via OTP verification."
                : "Manage devotees, events, and temple services efficiently."}
            </p>
          </div>
          <div className="relative z-10 text-xs text-orange-200/60 mt-auto pt-8">
            © 2025 Shri Vitthal Rakhumai Temple Seva Mandal.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
          {view !== "victory" && (
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {getTitle()}
              </h2>
              <p className="text-gray-500">{getSubtitle()}</p>
            </div>
          )}

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {apiError}
            </div>
          )}
          {apiSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {apiSuccess}
            </div>
          )}

          {view !== "victory" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* REGISTER: Username */}
              {view === "register" && (
                <InputField
                  label="Username"
                  placeholder="e.g. rahul_patil"
                  type="text"
                  icon={User}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  error={errors.username}
                />
              )}

              {/* REGISTER: Phone Number */}
              {view === "register" && (
                <InputField
                  label="Phone Number"
                  placeholder="+1234567890 (with country code)"
                  type="tel"
                  icon={Phone}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  error={errors.phone}
                />
              )}

              {/* FORGOT PASSWORD: Username Input */}
              {view === "forgot-email" && (
                <InputField
                  label="Username"
                  placeholder="Enter your username"
                  type="text"
                  icon={User}
                  value={formData.forgotUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, forgotUsername: e.target.value })
                  }
                  error={errors.forgotUsername}
                />
              )}

              {/* ALL VIEWS: Email (except forgot password views) */}
              {view !== "forgot-email" && view !== "forgot-otp" && (
                <InputField
                  label="Email Address"
                  placeholder="admin@temple.com"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={errors.email}
                />
              )}

              {/* OTP VIEW: Show username (readonly) */}
              {view === "forgot-otp" && (
                <InputField
                  label="Username"
                  placeholder="Your username"
                  type="text"
                  icon={User}
                  value={formData.forgotUsername}
                  readOnly={true}
                  onChange={() => { }}
                  error={errors.forgotUsername}
                />
              )}

              {/* OTP VIEW: OTP Input */}
              {view === "forgot-otp" && (
                <>
                  <InputField
                    label="One-Time Password (OTP)"
                    placeholder="123456"
                    type="text"
                    icon={KeyRound}
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                    error={errors.otp}
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendLoading || resendCooldown > 0}
                      className={`
                        text-sm font-medium transition-colors
                        ${resendLoading || resendCooldown > 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-orange-600 hover:text-orange-700"
                        }
                      `}
                    >
                      {resendLoading
                        ? "Sending..."
                        : resendCooldown > 0
                          ? `Resend OTP (${resendCooldown}s)`
                          : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}

              {/* LOGIN/REGISTER: Password */}
              {(view === "login" || view === "register") && (
                <>
                  <InputField
                    label="Password"
                    placeholder="••••••••"
                    type="password"
                    icon={Lock}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    error={errors.password}
                  />
                  {view === "register" && (
                    <InputField
                      label="Confirm Password"
                      placeholder="••••••••"
                      type="password"
                      icon={Lock}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      error={errors.confirmPassword}
                    />
                  )}
                </>
              )}

              {/* Forgot Password Link */}
              {view === "login" && (
                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => resetFormState("forgot-email")}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button type="submit" isLoading={loading}>
                  {view === "forgot-email" && "Send OTP"}
                  {view === "forgot-otp" && "Verify & Login"}
                  {view === "login" && "Sign In"}
                  {view === "register" && "Create Account"}
                  {!loading && <ArrowRight size={18} />}
                </Button>
              </div>
            </form>
          )}

          {/* Footer / Back Buttons */}
          {view !== "victory" && (
            <div className="mt-8 text-center">
              {view.includes("forgot") ? (
                <button
                  onClick={() => resetFormState("login")}
                  className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-2 w-full"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  {view === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={() =>
                      resetFormState(view === "login" ? "register" : "login")
                    }
                    className="font-bold text-orange-600 hover:text-orange-700"
                  >
                    {view === "login" ? "Sign up" : "Log in"}
                  </button>
                </p>
              )}
            </div>
          )}

          {/* VICTORY VIEW: Celebratory UI */}
          {view === "victory" && (
            <div className="flex flex-col items-center justify-center space-y-8 py-10 animate-in fade-in zoom-in duration-700">
              <div className="relative">
                {/* Spiritual Glowing Rings */}
                <div className="absolute inset-0 bg-orange-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute inset-0 bg-yellow-300 rounded-full blur-2xl opacity-20 animate-ping duration-1000"></div>

                <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-full text-white shadow-2xl transform hover:scale-105 transition-transform">
                  <Sparkles size={64} className="animate-spin" style={{ animationDuration: '4s' }} />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-white">
                    <CheckCircle2 size={24} />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-4xl font-serif font-bold text-gray-900 tracking-tight animate-bounce">
                  Ram Krishna Hari!
                </h2>
                <p className="text-xl text-gray-600 font-medium">
                  Authentication Successful
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="bg-orange-50 px-8 py-4 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4 group">
                  <div className="relative">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-orange-600 rounded-full opacity-75"></div>
                  </div>
                  <span className="text-orange-800 font-bold text-sm tracking-widest uppercase">
                    Entering Seva Dashboard...
                  </span>
                </div>

                <p className="text-xs text-gray-400 font-medium animate-pulse">
                  Preparing your sacred management portal
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
