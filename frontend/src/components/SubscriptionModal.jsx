import React, { useState } from "react";
import { X, Send, CheckCircle2, Loader2, Phone, Mail, User, ShieldCheck } from "lucide-react";
import { subscriberAPI } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

const SubscriptionModal = ({ isOpen, onClose }) => {
  const { isMarathi } = useLanguage();
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    otp: ""
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await subscriberAPI.subscribe({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      if (response.status === "success") {
        setStep(2);
      } else {
        setError(response.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await subscriberAPI.verifyOTP({
        phone: formData.phone,
        otp: formData.otp
      });
      if (response.status === "success") {
        setStep(3); // Success
        setTimeout(() => {
          onClose();
          setStep(1);
          setFormData({ name: "", email: "", phone: "", otp: "" });
        }, 3000);
      } else {
        setError(response.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="relative p-6 bg-primary text-primary-foreground">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold">
              {isMarathi ? "सबस्क्राईब करा" : "Subscribe Now"}
            </h3>
          </div>
          <p className="text-sm opacity-90">
            {isMarathi 
              ? "आमच्या अपडेट्स थेट तुमच्या मोबाईलवर मिळवा" 
              : "Get updates directly on your mobile and email"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm flex items-start gap-2 animate-in slide-in-from-top-2 duration-300">
              <span className="font-bold">!</span> {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                  {isMarathi ? "नाव" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-black"
                    placeholder={isMarathi ? "तुमच नाव" : "Enter your name"}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                  {isMarathi ? "ईमेल" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-black"
                    placeholder="example@mail.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                  {isMarathi ? "मोबाईल नंबर" : "Mobile Number"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-black"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>{isMarathi ? "पुढील" : "Next"}</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-orange-50 rounded-full mb-3">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-bold text-gray-800">
                  {isMarathi ? "OTP व्हेरिफाय करा" : "Verify OTP"}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {isMarathi 
                    ? `${formData.phone} वर पाठवलेला 6-अंकी OTP टाका` 
                    : `Enter the 6-digit code sent to ${formData.phone}`}
                </p>
              </div>

              <input
                required
                type="text"
                maxLength="6"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="w-full text-center text-2xl font-bold tracking-[1em] py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black"
                placeholder="000000"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  isMarathi ? "व्हेरिफाय करा" : "Verify & Subscribe"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-400 hover:text-primary transition-colors font-medium"
              >
                {isMarathi ? "नंबर बदला" : "Change Phone Number"}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="py-8 text-center animate-in zoom-in duration-500">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h4 className="text-2xl font-display font-bold text-gray-800 mb-2">
                {isMarathi ? "अभिनंदन!" : "Success!"}
              </h4>
              <p className="text-gray-500">
                {isMarathi 
                  ? "तुम्ही यशस्वीरित्या सबस्क्राईब केले आहे." 
                  : "You have successfully subscribed to our updates."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
