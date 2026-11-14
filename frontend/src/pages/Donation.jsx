import { useState, memo } from "react";
import {
  QrCode,
  Copy,
  Check,
  Building2,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Share2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/* ── Sacred Diamond Divider (mirrors Gallery, Banners & Home) ── */
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

/* ── 4 Saffron Corner Brackets ── */
const CornerAccents = () => (
  <>
    <span className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-4 border-l-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-4 border-r-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-4 border-l-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-4 border-r-4 border-saffron z-30 pointer-events-none" />
  </>
);

const Donation = memo(() => {
  const { isMarathi } = useLanguage();
  const [copiedField, setCopiedField] = useState(null);

  const bankDetails = {
    accountName: isMarathi
      ? "श्री विठ्ठल रखुमाई मंदिर देवस्थान ट्रस्ट"
      : "Shree Vitthal Rakhumai Mandir Trust",
    bankName: isMarathi ? "स्टेट बँक ऑफ इंडिया" : "State Bank of India (SBI)",
    accountNumber: "39485720194",
    ifscCode: "SBIN0001234",
    branch: isMarathi ? "अंबेरे - रत्नागिरी शाखा" : "Ambere, Ratnagiri Branch",
    accountType: isMarathi ? "चालू खाते (Current Account)" : "Current Account",
    upiId: "vitthalrakhumai@sbi",
    contactPhone: "+91 98765 43210",
  };

  const copyToClipboard = (text, fieldName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2200);
    }
  };

  const copyAllDetails = () => {
    const fullText = `*${bankDetails.accountName}*\nBank: ${bankDetails.bankName}\nA/C No: ${bankDetails.accountNumber}\nIFSC: ${bankDetails.ifscCode}\nBranch: ${bankDetails.branch}\nUPI ID: ${bankDetails.upiId}`;
    copyToClipboard(fullText, "all");
  };

  return (
    <div className="w-full bg-cream font-body text-ink-dark min-h-screen relative overflow-x-clip">
      {/* ═══════════ 1. CINEMATIC TEMPLE HERO BANNER (Gallery Theme) ═══════════ */}
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
          <div className="inline-flex items-center gap-2 bg-black/45 border border-amber-400/40 rounded-full px-4 py-1.5 font-heading text-xs sm:text-[0.82rem] font-medium text-amber-200 tracking-wide mb-4 shadow-sm select-none">
            <span className="inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <Sparkles size={13} className="text-amber-300 shrink-0" />
            <span>
              {isMarathi
                ? "पवित्र देणगी व सेवा समर्पण"
                : "Sacred Offering & Devotion"}
            </span>
          </div>

          <h1 className="flex flex-col items-center select-none">
            <span className="font-heading text-[clamp(2rem,5.5vw,4rem)] font-bold text-white leading-tight tracking-wider [text-shadow:0_4px_18px_rgba(0,0,0,0.85)]">
              {isMarathi ? "मंदिर सेवा व देणगी" : "Temple Donation"}
            </span>
            <span className="font-heading text-[clamp(1.1rem,3vw,2rem)] font-bold tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 mt-1 block">
              {isMarathi
                ? "श्री विठ्ठल रखुमाई मंदिर ट्रस्ट"
                : "Shree Vitthal Rakhumai Mandir Trust"}
            </span>
          </h1>

          <DiamondDivider />

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-cream/85 font-body leading-relaxed mt-2">
            {isMarathi
              ? "“मंदिराच्या नित्य सेवा, दीपोत्सव, अन्नदान आणि संवर्धन कार्यासाठी थेट युपीआय किंवा बँकेद्वारे आपले पवित्र योगदान अर्पण करा.”"
              : "“Support daily seva, annadan, and sacred sanctuary maintenance. Contribute directly via official UPI QR Code or Bank Transfer.”"}
          </p>
        </div>
      </section>

      {/* ═══════════ 2. SACRED SHLOKA STRIP (Gallery Signature) ═══════════ */}
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
          || सेवा धर्म परमो धर्मः — विठ्ठल चरणी समर्पण ||
        </p>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />

      {/* ═══════════ 3. MAIN OFFERING SECTION (QR CODE + BANK DETAILS) ═══════════ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* ── CARD 1: OFFICIAL UPI QR CODE (5 Cols) ── */}
          <div className="lg:col-span-5 relative bg-cream-dk border-2 border-gold rounded-sm p-1.5 sm:p-2 shadow-sm flex flex-col">
            <CornerAccents />

            <div className="relative border border-saffron-lt/60 rounded-sm overflow-hidden bg-gradient-to-b from-[#250707] via-[#1c0404] to-[#120202] text-white p-5 sm:p-7 text-center flex-1 flex flex-col justify-between">
              <div className="relative z-10">
                <span className="font-heading text-[11px] tracking-[0.18em] uppercase text-amber-300 font-semibold block mb-1">
                  {isMarathi ? "|| थेट युपीआय स्कॅन ||" : "|| Direct UPI Scan ||"}
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-amber-100 mb-1">
                  {isMarathi ? "स्कॅन करून देणगी द्या" : "Instant Scan & Pay"}
                </h2>
                <p className="text-xs sm:text-sm text-amber-100/75 font-body mb-5">
                  {isMarathi
                    ? "कोणत्याही युपीआय ॲपद्वारे थेट मंदिराच्या खात्यात जमा करा"
                    : "Scan with any UPI app to transfer directly to temple trust"}
                </p>

                {/* QR Code Container */}
                <div className="relative inline-block p-4 sm:p-5 bg-white rounded-sm border-2 border-gold shadow-lg mb-5">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 flex flex-col items-center justify-center relative">
                    <QrCode className="w-full h-full text-[#250707]" strokeWidth={1.5} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#250707] border-2 border-amber-400 flex items-center justify-center shadow-md">
                        <span className="font-marathi font-bold text-amber-300 text-lg leading-none">
                          ॐ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UPI ID Pill with Quick Copy */}
                <div className="bg-black/45 border border-amber-400/40 rounded-sm p-2.5 flex items-center justify-between gap-2 max-w-xs mx-auto mb-5">
                  <div className="text-left min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-amber-300/80 font-heading block">
                      UPI ID
                    </span>
                    <span className="font-body text-xs sm:text-sm font-semibold text-amber-100 truncate block">
                      {bankDetails.upiId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bankDetails.upiId, "upi")}
                    className="px-3 py-1.5 rounded-sm bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk text-xs font-heading font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95"
                    title="Copy UPI ID"
                  >
                    {copiedField === "upi" ? (
                      <>
                        <Check size={13} className="text-emerald-700" />
                        <span>{isMarathi ? "कॉपी झाले" : "Copied"}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>{isMarathi ? "कॉपी" : "Copy"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Supported UPI Apps Row */}
                <div>
                  <span className="text-[10px] font-heading uppercase tracking-wider text-cream/70 block mb-2">
                    {isMarathi ? "सर्व युपीआय ॲप्स समर्थित" : "Accepted via Any UPI App"}
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-[10px] font-heading font-semibold uppercase tracking-wider text-amber-100">
                    {["G-Pay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                      <div
                        key={app}
                        className="py-1.5 bg-black/40 border border-amber-400/30 rounded-sm text-center"
                      >
                        {app}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: OFFICIAL BANK ACCOUNT DETAILS (7 Cols) ── */}
          <div className="lg:col-span-7 relative bg-cream-dk border-2 border-gold rounded-sm p-1.5 sm:p-2 shadow-sm flex flex-col">
            <CornerAccents />

            <div className="border border-saffron-lt/60 rounded-sm overflow-hidden bg-cream/95 p-5 sm:p-7 flex-1 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gold/30">
                  <div>
                    <span className="font-heading text-[11px] tracking-[0.18em] uppercase text-saffron font-semibold block mb-1">
                      {isMarathi ? "|| अधिकृत बँक तपशील ||" : "|| Bank Transfer Details ||"}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-heading font-bold text-maroon flex items-center gap-2">
                      <Building2 size={20} className="text-saffron shrink-0" />
                      <span>{isMarathi ? "थेट बँक खाते तपशील" : "Temple Bank Account"}</span>
                    </h2>
                  </div>

                  {/* Copy All Details Button */}
                  <button
                    type="button"
                    onClick={copyAllDetails}
                    className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 rounded-sm bg-cream-dk hover:bg-amber-100/80 border border-gold/50 text-maroon text-xs font-heading font-semibold transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    {copiedField === "all" ? (
                      <>
                        <Check size={13} className="text-emerald-700" />
                        <span>{isMarathi ? "सर्व कॉपी झाले!" : "All Copied!"}</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={13} />
                        <span>{isMarathi ? "सर्व तपशील कॉपी करा" : "Copy All Details"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bank Details Field List */}
                <div className="divide-y divide-gold/25 py-2">
                  {/* Account Name */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-heading font-semibold text-ink-light uppercase tracking-wider">
                      {isMarathi ? "खातेदाराचे नाव" : "Account Holder"}
                    </span>
                    <span className="font-body font-semibold text-maroon text-sm sm:text-base sm:text-right">
                      {bankDetails.accountName}
                    </span>
                  </div>

                  {/* Bank Name */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-heading font-semibold text-ink-light uppercase tracking-wider">
                      {isMarathi ? "बँकेचे नाव" : "Bank Name"}
                    </span>
                    <span className="font-body font-semibold text-ink-dark text-sm sm:text-base sm:text-right">
                      {bankDetails.bankName}
                    </span>
                  </div>

                  {/* Account Number with Copy */}
                  <div className="py-3 px-3 my-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-cream-dk/70 border border-gold/30 rounded-sm">
                    <div>
                      <span className="text-xs font-heading font-semibold text-maroon uppercase tracking-wider block">
                        {isMarathi ? "बँक खाते क्रमांक" : "Account Number"}
                      </span>
                      <span className="font-body text-base sm:text-lg font-bold text-maroon tracking-wide">
                        {bankDetails.accountNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankDetails.accountNumber, "acc")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border border-amber-500/60 text-xs font-heading font-bold shadow-xs active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
                    >
                      {copiedField === "acc" ? (
                        <>
                          <Check size={13} className="text-emerald-700" />
                          <span>{isMarathi ? "कॉपी झाले!" : "Copied!"}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>{isMarathi ? "खाते क्र. कॉपी करा" : "Copy Account No"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* IFSC Code with Copy */}
                  <div className="py-3 px-3 my-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-cream-dk/70 border border-gold/30 rounded-sm">
                    <div>
                      <span className="text-xs font-heading font-semibold text-maroon uppercase tracking-wider block">
                        {isMarathi ? "आय.एफ.एस.सी. कोड (IFSC)" : "IFSC Code"}
                      </span>
                      <span className="font-body text-base sm:text-lg font-bold text-maroon tracking-wide">
                        {bankDetails.ifscCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankDetails.ifscCode, "ifsc")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border border-amber-500/60 text-xs font-heading font-bold shadow-xs active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
                    >
                      {copiedField === "ifsc" ? (
                        <>
                          <Check size={13} className="text-emerald-700" />
                          <span>{isMarathi ? "कॉपी झाले!" : "Copied!"}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>{isMarathi ? "IFSC कॉपी करा" : "Copy IFSC"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Branch */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-heading font-semibold text-ink-light uppercase tracking-wider">
                      {isMarathi ? "शाखा" : "Branch"}
                    </span>
                    <span className="font-body font-medium text-ink-dark text-sm sm:text-base sm:text-right">
                      {bankDetails.branch}
                    </span>
                  </div>

                  {/* Account Type */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-heading font-semibold text-ink-light uppercase tracking-wider">
                      {isMarathi ? "खात्याचा प्रकार" : "Account Type"}
                    </span>
                    <span className="font-body font-medium text-ink-dark text-sm sm:text-base sm:text-right">
                      {bankDetails.accountType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Devotee Assistance Notice */}
              <div className="mt-4 p-4 rounded-sm border border-gold/35 bg-cream-dk/70 flex items-start gap-3">
                <div className="w-8 h-8 rounded-sm bg-amber-400/20 border border-gold/40 flex items-center justify-center text-maroon shrink-0 mt-0.5">
                  <ShieldCheck size={17} />
                </div>
                <div className="text-xs sm:text-sm leading-relaxed">
                  <span className="font-heading font-bold text-maroon block mb-0.5">
                    {isMarathi ? "पावती व देणगी पडताळणी" : "Official Receipt & Verification"}
                  </span>
                  <p className="text-ink-mid font-body">
                    {isMarathi
                      ? `देणगी ट्रान्सफर केल्यानंतर अधिकृत पावतीसाठी कृपया व्यवहार स्क्रीनशॉट अथवा UTR नंबर मंदिर कार्यालयाच्या ${bankDetails.contactPhone} क्रमांकावर WhatsApp द्वारे पाठवावा.`
                      : `After transferring, please share your payment screenshot / UTR number via WhatsApp to ${bankDetails.contactPhone} to receive your official temple seva receipt.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. SACRED TRUST & TRANSPARENCY NOTICE ── */}
        <div className="mt-8 relative bg-cream-dk border-2 border-gold rounded-sm p-1.5 sm:p-2 shadow-sm">
          <CornerAccents />
          <div className="border border-saffron-lt/60 rounded-sm bg-cream/95 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-amber-400/20 border border-gold/40 flex items-center justify-center text-maroon shrink-0">
                <PhoneCall size={19} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-heading font-bold text-maroon uppercase tracking-wider">
                  {isMarathi ? "मंदिर व्यवस्थापन व संपर्क" : "Temple Trust Seva Assistance"}
                </h3>
                <p className="text-xs sm:text-sm text-ink-light font-body mt-0.5">
                  {isMarathi
                    ? `काही शंका अथवा मदतीसाठी थेट मंदिर विश्वस्तांशी संपर्क साधा: ${bankDetails.contactPhone}`
                    : `For donation inquiries, receipts, or direct assistance: ${bankDetails.contactPhone}`}
                </p>
              </div>
            </div>

            <a
              href={`tel:${bankDetails.contactPhone}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border border-amber-500/60 font-heading text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md active:scale-95 transition-all shrink-0 select-none"
            >
              <PhoneCall size={13} />
              <span>{isMarathi ? "संपर्क करा" : "Call Office"}</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
});

Donation.displayName = "Donation";
export default Donation;
