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
    otp: "",
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
        phone: formData.phone,
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
        otp: formData.otp,
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="border border-gold/40 rounded-lg shadow-2xl w-full max-w-md overflow-hidden bg-cream relative animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Royal Maroon Header (Matches Navbar & Footer) */}
          <div className="relative p-5 sm:p-6 bg-maroon-dk text-cream border-b-2 border-gold/40 overflow-hidden">
            {/* Diagonal Gold Pattern */}
            <div
              className="absolute inset-0 z-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 50%)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent z-10" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-3.5 top-3.5 z-20 w-8 h-8 rounded-md bg-amber-500/10 border border-gold/30 flex items-center justify-center text-gold-lt hover:bg-amber-500/25 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="relative z-10 flex items-center gap-3 mb-1.5 pr-8">
              <div className="w-10 h-10 rounded-md bg-amber-500/15 border border-gold/40 flex items-center justify-center text-gold-lt shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-marathi text-[11px] text-saffron-lt tracking-widest uppercase font-semibold">
                  {isMarathi ? "|| नित्य दर्शन व उत्सव ||" : "|| Temple Updates ||"}
                </span>
                <h3
                  className={`text-lg sm:text-xl font-bold text-gold-lt leading-tight ${
                    isMarathi ? "font-marathi" : "font-display"
                  }`}
                >
                  {isMarathi ? "सबस्क्राईब करा" : "Subscribe Now"}
                </h3>
              </div>
            </div>
            <p className="relative z-10 font-body text-xs sm:text-sm text-cream/85 mt-1">
              {isMarathi
                ? "आमच्या अपडेट्स थेट तुमच्या मोबाईलवर मिळवा"
                : "Get updates directly on your mobile and email"}
            </p>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 bg-cream">
            {error && (
              <div className="mb-4 p-3 bg-vermillion/10 text-vermillion border border-vermillion/30 rounded-md text-xs sm:text-sm flex items-start gap-2 font-body">
                <span className="font-bold">!</span>
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-heading text-[11px] font-bold text-maroon uppercase tracking-[0.14em] ml-0.5">
                    {isMarathi ? "नाव" : "Full Name"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-saffron" />
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gold/40 rounded-md focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-saffron transition-all text-sm text-ink-dark placeholder:text-ink-light/60 font-body"
                      placeholder={isMarathi ? "तुमचे पूर्ण नाव" : "Enter your name"}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-heading text-[11px] font-bold text-maroon uppercase tracking-[0.14em] ml-0.5">
                    {isMarathi ? "ईमेल" : "Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-saffron" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gold/40 rounded-md focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-saffron transition-all text-sm text-ink-dark placeholder:text-ink-light/60 font-body"
                      placeholder="example@mail.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-heading text-[11px] font-bold text-maroon uppercase tracking-[0.14em] ml-0.5">
                    {isMarathi ? "मोबाईल नंबर" : "Mobile Number"}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-saffron" />
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gold/40 rounded-md focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-saffron transition-all text-sm text-ink-dark placeholder:text-ink-light/60 font-body"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-md font-heading text-xs sm:text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-[#2b0808] border border-amber-400/70 shadow-md hover:shadow-[0_4px_18px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{isMarathi ? "पुढील" : "Next"}</span>
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 bg-amber-500/15 border border-gold/40 rounded-full mb-3">
                    <ShieldCheck className="w-7 h-7 text-saffron" />
                  </div>
                  <h4
                    className={`text-lg font-bold text-maroon ${
                      isMarathi ? "font-marathi" : "font-display"
                    }`}
                  >
                    {isMarathi ? "OTP व्हेरिफाय करा" : "Verify OTP"}
                  </h4>
                  <p className="font-body text-xs sm:text-sm text-ink-mid mt-1">
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
                  className="w-full text-center text-2xl font-bold tracking-[0.75em] py-3 bg-white border border-gold/40 rounded-md focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-saffron transition-all text-maroon font-heading"
                  placeholder="000000"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-md font-heading text-xs sm:text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-[#2b0808] border border-amber-400/70 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isMarathi ? (
                    "व्हेरिफाय करा"
                  ) : (
                    "Verify & Subscribe"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs font-heading uppercase tracking-wider text-ink-light hover:text-maroon transition-colors font-semibold cursor-pointer py-1"
                >
                  {isMarathi ? "नंबर बदला" : "Change Phone Number"}
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="py-6 text-center animate-in zoom-in duration-500">
                <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-600/30 rounded-full mb-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-700" />
                </div>
                <h4
                  className={`text-2xl font-bold text-maroon mb-2 ${
                    isMarathi ? "font-marathi" : "font-display"
                  }`}
                >
                  {isMarathi ? "अभिनंदन!" : "Success!"}
                </h4>
                <p className="font-body text-sm text-ink-mid">
                  {isMarathi
                    ? "तुम्ही यशस्वीरित्या सबस्क्राईब केले आहे."
                    : "You have successfully subscribed to our updates."}
                </p>
                <p className="font-marathi text-xs text-saffron font-semibold mt-3">
                  || राम कृष्ण हरी ||
                </p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
