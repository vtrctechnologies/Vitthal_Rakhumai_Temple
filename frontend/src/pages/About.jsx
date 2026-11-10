import { useState, useCallback, memo } from "react";
import { useInView } from "react-intersection-observer";
import {
  Target,
  Heart,
  Users,
  MapPin,
  Clock,
  BookOpen,
  Sun,
  ArrowRight,
  Flower2,
  CalendarDays,
  Landmark,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

const templeHero = "/gallery/Temple3D.png";
const villageImage = "/gallery/village.jpg";

/* ── Shared Sacred Ornamental Components (mirrors Home.jsx) ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-5 justify-center">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent max-w-[140px]" />
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
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent max-w-[140px]" />
  </div>
);

const SectionHeader = ({
  eyebrow,
  title,
  titleMr,
  subtitle,
  center = true,
  titleColor,
  subtitleColor,
}) => (
  <div className={`mb-10 ${center ? "text-center" : "text-left"}`}>
    {eyebrow && (
      <span className="block font-heading text-xs tracking-[0.28em] uppercase text-saffron mb-1.5">
        {eyebrow}
      </span>
    )}
    <h2
      className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight mb-2"
      style={{ color: titleColor || undefined }}
      {...(!titleColor && {
        className:
          "font-display text-[clamp(1.8rem,4vw,3rem)] font-bold text-maroon leading-tight mb-2",
      })}
    >
      {title}
    </h2>
    {titleMr && (
      <p
        className="font-marathi text-[clamp(1.3rem,3.2vw,2.2rem)] font-semibold mb-4"
        style={{ color: subtitleColor || undefined }}
        {...(!subtitleColor && {
          className:
            "font-marathi text-[clamp(1.3rem,3.2vw,2.2rem)] text-ink-mid font-semibold mb-4",
        })}
      >
        {titleMr}
      </p>
    )}
    <DiamondDivider />
    {subtitle && (
      <p
        className={`text-lg leading-relaxed max-w-[640px] ${center ? "mx-auto" : ""
          }`}
        style={{ color: subtitleColor || undefined }}
        {...(!subtitleColor && {
          className: `text-lg leading-relaxed text-ink-mid max-w-[640px] ${center ? "mx-auto" : ""
            }`,
        })}
      >
        {subtitle}
      </p>
    )}
  </div>
);

/* Corner accent used on temple image frames (mirrors Home.jsx) */
const CornerAccents = () => (
  <>
    <span className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-4 border-l-4 border-saffron z-10" />
    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-4 border-r-4 border-saffron z-10" />
    <span className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-4 border-l-4 border-saffron z-10" />
    <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-4 border-r-4 border-saffron z-10" />
  </>
);

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT: ABOUT US
   Redesigned to perfectly harmonize with Home.jsx theme & layout
══════════════════════════════════════════════════════════════ */
const About = memo(() => {
  const navigate = useNavigate();
  const { isMarathi } = useLanguage();
  const [activeTab, setActiveTab] = useState("story");

  const [ref2, inView2] = useInView({
    triggerOnce: true,
    threshold: 0.05,
    rootMargin: "50px",
  });

  const handleDonateClick = useCallback(() => navigate("/donation"), [navigate]);
  const handleEventsClick = useCallback(() => navigate("/events"), [navigate]);

  return (
    <div className="w-full overflow-x-hidden bg-cream font-body text-ink-dark">
      {/* ══ 1. GRAND CINEMATIC HERO (Mirrors Home.jsx Architecture) ══ */}
      <header className="relative min-h-[82vh] sm:min-h-[88vh] flex items-center justify-center overflow-hidden">
        {/* Subtle Light Gold Arch Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent z-10 opacity-70" />

        {/* Cinematic Divine Background Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={templeHero}
            alt="Shree Vitthal Rakhumai Sanctum"
            fetchpriority="high"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center brightness-[0.65] contrast-[1.08]"
          />

          {/* Directional Lighting Overlays (Exact match to Home.jsx) */}
          {/* 1. Top Navbar Contrast Bleed */}
          <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#180303]/90 via-[#180303]/45 to-transparent" />

          {/* 2. Center Cinematic Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(24,4,4,0.30)_0%,_rgba(18,3,3,0.70)_75%,_rgba(12,2,2,0.92)_100%)]" />

          {/* 3. Bottom Smooth Fade to Section */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#140202] via-[#140202]/70 to-transparent" />
        </div>

        {/* Hero Content Center Stack */}
        <div className="relative z-10 max-w-4xl mx-auto pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 text-center flex flex-col items-center justify-center my-auto">
          {/* Sacred Heritage Announcement Badge */}

          {/* Main Titles */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center select-none"
          >
            <span className="font-heading text-[clamp(2.1rem,6.2vw,4.8rem)] font-black text-white leading-tight tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              {isMarathi ? "आमच्या मंदिराविषयी" : "About Our Temple"}
            </span>
          </motion.h1>

          {/* Sacred Diamond Divider */}
          <div className="flex items-center gap-3 my-1.5 sm:my-2 w-full max-w-[320px] sm:max-w-[420px]">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-amber-300 border border-amber-200/60 shadow-xs shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
          </div>

          {/* Subtitle Description */}
          <motion.p
            className="font-body text-[clamp(0.95rem,2.2vw,1.2rem)] text-cream/90 mt-0.5 leading-relaxed max-w-[620px] font-normal drop-shadow-sm px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isMarathi
              ? "आंबेकरवाडीच्या निसर्गरम्य भूमीत वसलेले, भक्ती, शांती आणि अखंड सामुदायिक सेवेचे प्रतीक. पिढ्यान्पिढ्या सुरू असलेला भक्तीचा अखंड प्रवास."
              : "A sanctuary of devotion, peace, and timeless community service nestled in Amberkarwadi, guiding generations toward spiritual fulfillment."}
          </motion.p>
        </div>

        {/* Modern Bottom Info Dock (Exact match to Home.jsx) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-amber-400/20 bg-[#140303]/90 backdrop-blur-xs">
          <div className="max-w-6xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs sm:text-[0.82rem]">
            {/* Location */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-cream/90 truncate min-w-0">
              <MapPin size={14} className="text-amber-400 shrink-0" />
              <span className="truncate">
                {isMarathi
                  ? "आंबेकरवाडी, गावडे अंबेरे, रत्नागिरी"
                  : "Amberkarwadi, Gavade Ambere, Ratnagiri"}
              </span>
            </div>

            {/* Timing */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-cream/90 whitespace-nowrap shrink-0">
              <Clock size={14} className="text-amber-400 shrink-0" />
              <span>
                {isMarathi
                  ? "२४ तास खुले | प्रवेश विनामूल्य"
                  : "Open 24 Hours · Free Entry"}
              </span>
            </div>

            {/* Sacred Mantra */}
            <div className="hidden md:flex items-center gap-1.5 text-amber-200/85 font-marathi whitespace-nowrap shrink-0">
              <span>|| राम कृष्ण हरी ||</span>
            </div>
          </div>
        </div>
      </header>

      {/* ══ 2. SACRED SHLOKA STRIP (Mirrors Home.jsx) ══ */}
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />
      <div className="relative bg-maroon px-6 py-9 text-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(212,175,55,0.15) 0, rgba(212,175,55,0.15) 1px, transparent 0, transparent 60px)",
          }}
        />
        <p className="relative z-10 font-marathi text-[clamp(1.2rem,3vw,1.7rem)] text-gold-lt tracking-wide leading-relaxed">
          पुंडलिका वरदा हरी विठ्ठल — श्री ज्ञानदेव तुकाराम
        </p>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />

      {/* ══ 3. TEMPLE LEGACY & VISION (Story / Vision Tabs) ══ */}
      <section className="relative px-6 pt-20 pb-16 bg-cream overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-saffron) 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div {...fadeUp}>
            <SectionHeader
              eyebrow="|| Itihas ||"
              title="Our Temple's Legacy"
              titleMr="मंदिराचा इतिहास व वारसा"
              subtitle={
                isMarathi
                  ? "श्रद्धा, त्याग आणि गावकर्‍यांच्या अखंड एकतेतून उभारलेले हे पवित्र मंदिर आजही सर्व भक्तांना शांती आणि सकारात्मक ऊर्जेची प्रचिती देते."
                  : "Built on unwavering faith and village harmony, the temple stands as a spiritual beacon for devotees near and far."
              }
            />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mt-6">
            {/* Framed Image Column (Home.jsx Signature Frame) */}
            <motion.div
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
            >
              <div className="relative border-2 border-gold rounded-sm p-2 bg-cream-dk shadow-md">
                <CornerAccents />
                <div className="border border-saffron-lt/60 rounded-sm overflow-hidden relative">
                  <img
                    src={templeHero}
                    alt="Vitthal Rakhumai Temple Sanctum"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-[380px] sm:h-[440px] object-cover block saturate-105 sepia-[0.08]"
                  />
                  {/* Floating Sanctum Badges Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#160303]/90 backdrop-blur-sm border-t border-amber-400/30 px-5 py-3.5">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm text-cream font-body">
                      <div className="flex items-center gap-1.5 text-amber-200">
                        <MapPin size={15} className="text-amber-400 shrink-0" />
                        <span>Amberkarwadi, Ratnagiri</span>
                      </div>
                      <div className="hidden sm:block w-px h-3.5 bg-amber-400/30" />
                      <div className="flex items-center gap-1.5 text-amber-200">
                        <Clock size={15} className="text-amber-400 shrink-0" />
                        <span>{isMarathi ? "५०+ वर्षे अखंड भक्ती" : "50+ Years of Devotion"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center font-body italic text-[0.9rem] text-ink-light tracking-wide">
                {isMarathi
                  ? "श्री विठ्ठल रखुमाई मंदिर — आंबेकरवाडी, रत्नागिरी"
                  : "Shree Vitthal Rakhumai Temple — Amberkarwadi, Ratnagiri"}
              </p>
            </motion.div>

            {/* Content Column with Themed Rectangular Tabs & Fixed Height */}
            <motion.div className="order-1 lg:order-2 space-y-6" {...fadeUp}>
              {/* Rectangular Tab Selector */}
              <div className="flex gap-1.5 p-1 bg-[#180404]/8 border border-amber-500/25 rounded-md w-fit">
                {[
                  { id: "story", en: "Our Story", mr: "आमची कथा" },
                  { id: "vision", en: "Our Vision", mr: "आमचे ध्येय" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2 rounded-md font-heading text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-xs border border-amber-400/50"
                        : "text-ink-mid hover:text-maroon hover:bg-black/5"
                    }`}
                  >
                    {isMarathi ? tab.mr : tab.en}
                  </button>
                ))}
              </div>

              {/* Fixed Height Grid Stack (both tabs occupy the exact same cell so height never changes and image never moves) */}
              <div className="grid grid-cols-1 grid-rows-1">
                {/* Story Tab */}
                <div
                  className={`col-start-1 row-start-1 transition-opacity duration-200 ${
                    activeTab === "story"
                      ? "opacity-100 z-10 pointer-events-auto"
                      : "opacity-0 z-0 pointer-events-none invisible"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-400/15 border border-amber-400/30 rounded-xl mt-1 shrink-0 text-maroon">
                      <BookOpen size={22} className="text-maroon" />
                    </div>
                    <div>
                      <h3 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold text-maroon mb-2">
                        {isMarathi ? "मंदिराची स्थापना व इतिहास" : "The Sacred Journey"}
                      </h3>
                      <p className="font-body text-ink-mid leading-relaxed text-base sm:text-lg">
                        {isMarathi
                          ? "सुमारे ५० वर्षांपूर्वी गावच्या निष्ठावंत भाविकांनी विठ्ठल-रखुमाईच्या अपार प्रेमातून आणि भक्तीतून या मंदिराची स्थापना केली."
                          : "The Vitthal-Rakhumai Temple was founded over 50 years ago by devout villagers driven by unwavering faith and profound reverence for the divine couple."}
                      </p>
                      <p className="font-body text-ink-mid leading-relaxed text-base sm:text-lg mt-3">
                        {isMarathi
                          ? "एक छोट्या भक्तीस्थळापासून सुरू झालेला हा प्रवास आज संपूर्ण पंचक्रोशीच्या अध्यात्मिक आणि सामाजिक एकतेचे केंद्र बनला आहे. दररोज होणाऱ्या आरत्या, भजन आणि कीर्तनांनी परिसर सदैव पावन राहतो."
                          : "What began as a humble prayer shelter has blossomed into the spiritual beating heart of Amberkarwadi. Generations find solace, strength, and collective joy within its sacred halls."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vision Tab */}
                <div
                  className={`col-start-1 row-start-1 transition-opacity duration-200 ${
                    activeTab === "vision"
                      ? "opacity-100 z-10 pointer-events-auto"
                      : "opacity-0 z-0 pointer-events-none invisible"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-400/15 border border-amber-400/30 rounded-xl mt-1 shrink-0 text-maroon">
                      <Target size={22} className="text-maroon" />
                    </div>
                    <div>
                      <h3 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold text-maroon mb-2">
                        {isMarathi ? "आमचा संकल्प व उद्दिष्टे" : "Our Divine Vision"}
                      </h3>
                      <p className="font-body text-ink-mid leading-relaxed text-base sm:text-lg">
                        {isMarathi
                          ? "वाढत्या भाविकांच्या सोयीसाठी आणि भावी पिढ्यांसाठी आम्ही भव्य नूतन मंदिर संकुलाची उभारणी करत आहोत."
                          : "We are constructing an expanded Sanctum Complex to welcome thousands of arriving pilgrims with elevated facilities and peace."}
                      </p>
                      <p className="font-body text-ink-mid leading-relaxed text-base sm:text-lg mt-3">
                        {isMarathi
                          ? "केवळ दगड-मातीचे बांधकाम न करता वारकरी संस्कृती, संतांचे विचार आणि अध्यात्मिक ज्ञानाचा प्रसार करणे हेच आमचे अंतिम ध्येय आहे."
                          : "Our purpose is to safeguard our spiritual legacy — creating space for grander festivals, cultural education, and community meals."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rectangular Action Buttons with Refined Hover Animations */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  to="/donation"
                  className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-md font-heading text-xs sm:text-[0.8rem] font-bold tracking-widest uppercase bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk border border-amber-400/70 shadow-[0_3px_12px_rgba(245,158,11,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(245,158,11,0.45)] hover:border-amber-300 active:translate-y-0 active:scale-98 select-none overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  <Heart size={15} className="fill-maroon-dk text-maroon-dk shrink-0 transition-transform duration-200 group-hover:scale-120" />
                  <span className="relative z-10">{isMarathi ? "देणगी अर्पण करा" : "Donate Now"}</span>
                </Link>

                <Link
                  to="/gallery"
                  className="group inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-md font-heading text-xs sm:text-[0.8rem] font-bold tracking-widest uppercase bg-white/90 hover:bg-maroon text-maroon hover:text-amber-100 border border-amber-500/40 hover:border-maroon shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(107,26,26,0.3)] active:translate-y-0 active:scale-98 select-none"
                >
                  <span className="transition-transform duration-200 group-hover:scale-105">
                    {isMarathi ? "गॅलरी पहा" : "View Gallery"}
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 4. SACRED DUALITY (Elevated Sanctum Noir Theme) ══ */}
      <section
        ref={ref2}
        className="relative py-20 sm:py-24 px-4 overflow-hidden bg-gradient-to-b from-[#180303] via-[#100202] to-[#180303] border-y border-amber-500/20 text-cream"
      >
        {/* Ambient Divine Glow Halos */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-amber-500/30 blur-sm" />
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full border-2 border-amber-500/20 blur-md" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full border border-orange-400/10" />
        </div>

        <div
          className={`container mx-auto max-w-6xl relative z-10 transition-opacity duration-1000 ${inView2 ? "opacity-100" : "opacity-0"
            }`}
        >
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <span className="text-amber-400 font-heading font-bold tracking-[0.28em] uppercase text-xs mb-3 block">
              {isMarathi ? "|| परम पावन स्वरूप ||" : "The Divine Presence"}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 mb-4 drop-shadow-sm">
              {isMarathi ? "अलौकिक विठ्ठल-रखुमाई रूप" : "Sacred Duality"}
            </h2>
            <div className="flex items-center justify-center gap-4 text-amber-400/60">
              <span className="h-px w-12 bg-amber-400/40" />
              <Flower2 size={20} className="animate-pulse text-amber-400" />
              <span className="h-px w-12 bg-amber-400/40" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-20 relative">
            {/* Center Vertical Divider (Desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400/35 to-transparent -translate-x-1/2" />

            {/* Lord Vitthal Card */}
            <div className="relative group text-center md:text-right bg-black/25 md:bg-transparent p-6 sm:p-8 md:p-0 rounded-2xl border border-amber-500/20 md:border-none">
              <div className="mb-6 flex justify-center md:justify-end">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600/30 to-amber-400/30 border border-amber-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all duration-500">
                  <Sun className="text-amber-300" size={32} />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-amber-100 mb-3 tracking-wide">
                {isMarathi ? "भगवान श्री विठ्ठल" : "Lord Vitthal"}
              </h3>
              <p className="text-cream/80 leading-relaxed text-base sm:text-lg mb-6 font-body">
                {isMarathi
                  ? "विटेवर समचरण उभा राहून भक्तांची अखंड प्रतीक्षा करणारा करुणामय परमेश्वर. हातामध्ये कर ठेवून संपूर्ण विश्वाला प्रेम, शांती आणि क्षमाशीलतेची शिकवण देणारा पांडुरंग."
                  : "Standing eternally upon the sacred brick with hands upon hips, He embodies infinite patience. As the sustainer of the cosmos, Vithoba welcomes every soul with unconditional love."}
              </p>
              <div className="inline-block border-b border-amber-400/40 pb-1 text-xs sm:text-sm text-amber-300 tracking-widest font-heading font-bold uppercase">
                {isMarathi ? "जगन्नियंता · सहनशीलता व प्रेम" : "The Preserver · Infinite Grace"}
              </div>
            </div>

            {/* Goddess Rakhumai Card */}
            <div className="relative group text-center md:text-left bg-black/25 md:bg-transparent p-6 sm:p-8 md:p-0 rounded-2xl border border-amber-500/20 md:border-none">
              <div className="mb-6 flex justify-center md:justify-start">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600/30 to-amber-400/30 border border-red-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all duration-500">
                  <Heart className="text-red-400 fill-red-400/30" size={30} />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-amber-100 mb-3 tracking-wide">
                {isMarathi ? "माता श्री रखुमाई" : "Goddess Rakhumai"}
              </h3>
              <p className="text-cream/80 leading-relaxed text-base sm:text-lg mb-6 font-body">
                {isMarathi
                  ? "भक्ती आणि समर्पणाची मूर्तिमंत देवता. माऊलीच्या वात्सल्याने प्रत्येक भक्ताच्या दुःखाचे निवारण करणारी, भक्तीच्या मार्गावरून मोक्षाकडे नेणारी ममतामयी आई."
                  : "The very essence of pure devotion and divine consort. Rakhumai (Rukmini) is the nurturing mother who guides the seeker towards ultimate peace and eternal liberation."}
              </p>
              <div className="inline-block border-b border-red-400/40 pb-1 text-xs sm:text-sm text-red-300 tracking-widest font-heading font-bold uppercase">
                {isMarathi ? "भक्तीस्वरूप · वात्सल्य व मातृत्व" : "The Devotion · Mother of All"}
              </div>
            </div>
          </div>

          {/* Devotional Bottom Quote */}
          <div className="mt-16 text-center max-w-2xl mx-auto px-4">
            <p className="font-serif italic text-amber-200/80 text-lg sm:text-xl">
              {isMarathi
                ? '"विठ्ठल रखुमाई दोन्ही रूपे एकचि, भक्ती आणि प्रेमाचा चिरंतन संगम."'
                : '"Together they stand, not as two, but as one eternal truth of Love, Existence, and Devotion."'}
            </p>
          </div>
        </div>
      </section>

      {/* ══ 5. PILLARS OF OUR TEMPLE (Rich Maroon Section matching Home.jsx) ══ */}
      <section className="relative bg-maroon px-6 py-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(212,175,55,0.2) 0, rgba(212,175,55,0.2) 1px, transparent 0, transparent 60px)",
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10 text-white">
          <motion.div {...fadeUp}>
            <SectionHeader
              eyebrow="|| Aadhaarstambha ||"
              title="Pillars of Our Temple"
              titleMr="मंदिराचे तीन आधारस्तंभ"
              titleColor="#fef6e4"
              subtitleColor="#f5e6c8"
              subtitle={
                isMarathi
                  ? "पूजन, समुदाय आणि संस्कार — ज्या मूल्यांवर आपल्या मंदिराची अखंड परंपरा आधारलेली आहे."
                  : "Worship, community unity, and sacred learning — the three enduring foundations of our sanctum."
              }
            />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              {
                icon: Landmark,
                title: "Sacred Worship",
                titleMr: "नित्य पूजा-अर्चा",
                desc: isMarathi
                  ? "काकड आरतीपासून शेजारतीपर्यंत अहोरात्र चालणारी विधीवत सेवा व दीपप्रज्वलन."
                  : "Daily Kakad Aarti at dawn and Shej Aarti at dusk. The flame of devotion never rests.",
              },
              {
                icon: Users,
                title: "Community Unity",
                titleMr: "सामाजिक एकता",
                desc: isMarathi
                  ? "आषाढी-कार्तिकी एकादशी, अखंड हरिनाम सप्ताह आणि वारकरी वारीने जोडलेले भक्तगण."
                  : "Festivals binding thousands of families together — Ekadashi, Diwali, and grand Wari processions.",
              },
              {
                icon: BookOpen,
                title: "Spiritual Learning",
                titleMr: "संस्कार व ज्ञान",
                desc: isMarathi
                  ? "साप्ताहिक कीर्तन, प्रवचने आणि संतांच्या साहित्याचा पुढील पिढीला परिचय."
                  : "Weekly Kirtans, Bhajan gatherings and Pravachans illuminating the eternal teachings of saints.",
              },
            ].map(({ icon: Icon, title, titleMr, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative bg-maroon-dk/90 border border-gold/30 border-t-4 border-t-amber-400 p-7 rounded-2xl text-center group hover:-translate-y-1.5 transition-all duration-300 shadow-md backdrop-blur-xs"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center group-hover:border-amber-300 group-hover:bg-amber-400/25 transition-all duration-300">
                  <Icon size={26} className="text-amber-300" />
                </div>
                <h3 className="font-display text-lg font-bold text-amber-200 mb-1 tracking-wide">
                  {title}
                </h3>
                <p className="font-marathi text-sm text-saffron-lt font-semibold mb-3">
                  {titleMr}
                </p>
                <p className="font-body text-cream/75 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 6. AMBERKARWADI VILLAGE HERITAGE (Stone Texture matching Home.jsx) ══ */}
      <section className="relative bg-stone px-6 py-20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon via-gold via-saffron to-maroon" />

        {/* Subtle radial dot pattern matching Home.jsx */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-maroon) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div {...fadeUp}>
            <SectionHeader
              eyebrow="|| Aapli Wadi ||"
              title="Amberkarwadi Village"
              titleMr="आपली पावन आंबेकरवाडी"
              subtitle={
                isMarathi
                  ? "रत्नागिरीच्या विस्तीर्ण कोकण किनाऱ्यावरील गावडे अंबेरे-आंबेकरवाडी हे भक्ती, निसर्ग आणि आतिथ्यशीलतेचे प्रतीक आहे."
                  : "Nestled in the serene Konkan coastal haven of Ratnagiri, Amberkarwadi is a village whose heart beats with devotion and timeless camaraderie."
              }
            />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mt-8">
            {/* Image Column */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              <div className="relative border-2 border-gold rounded-sm p-2 bg-cream-dk shadow-md">
                <CornerAccents />
                <div className="border border-saffron-lt/50 rounded-sm overflow-hidden relative">
                  <img
                    src={villageImage}
                    alt="Amberkarwadi Village Panorama"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-[360px] object-cover block"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-dark/60 via-transparent to-transparent" />

                  {/* Population / Village Badge */}
                  <div className="absolute bottom-4 left-4 bg-maroon/95 backdrop-blur-sm border border-gold/40 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-sm">
                    <Users size={20} className="text-amber-300 shrink-0" />
                    <div>
                      <p className="font-heading text-[0.62rem] tracking-widest uppercase text-amber-200/80">
                        {isMarathi ? "ग्रामस्थ संख्या" : "Village Devotees"}
                      </p>
                      <p className="font-display text-xl font-bold text-amber-100 leading-tight">
                        2,500+
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center font-body italic text-[0.9rem] text-ink-light tracking-wide">
                {isMarathi
                  ? "आंबेकरवाडी — खारवीवाडा, रत्नागिरी (महाराष्ट्र)"
                  : "Amberkarwadi — Kharviwada, Ratnagiri (Maharashtra)"}
              </p>
            </motion.div>

            {/* Content Column */}
            <motion.div className="space-y-6" {...fadeUp}>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-saffron flex-shrink-0" />
                  <span className="font-heading text-xs tracking-[0.28em] uppercase text-saffron font-semibold">
                    {isMarathi ? "वारकरी वारसा" : "Our Heritage"}
                  </span>
                </div>
                <p className="font-body text-ink-mid leading-relaxed text-lg mb-3">
                  {isMarathi
                    ? "आंबेकरवाडी ही केवळ एक भौगोलिक वस्ती नसून, ती शांतता आणि भक्तीचा पावन ठेवा आहे. शतकानुशतके सुरू असलेली वारकरी संतांची परंपरा आजही प्रत्येक घरात तेवत आहे."
                    : "Amberkarwadi is far more than a geography — it is a sanctuary of peace. Deeply steeped in Varkari spirituality, the village breathes devotional songs and shared fellowship."}
                </p>
                <p className="font-body text-ink-mid leading-relaxed">
                  {isMarathi
                    ? "दरवर्षी आषाढी व कार्तिकी एकादशीला हजारोंच्या संख्येने भाविक या पावन भूमीत दाखल होतात आणि संपूर्ण गाव भक्तीमय वातावरणात न्हाऊन निघते."
                    : "Every year during Ashadhi and Kartiki Ekadashi, pilgrims flock here, turning the entire village into an ecstatic festival of song, rhythm, and shared meals."}
                </p>
              </div>

              {/* Devotional Quote Card */}
              <div className="relative bg-cream-dk border-l-4 border-gold px-6 py-5 rounded-r-xl shadow-xs">
                <p className="font-marathi text-maroon text-lg sm:text-xl leading-relaxed font-semibold italic">
                  "गावाचा जीव म्हणजे मंदिर, मंदिराचा जीव म्हणजे भक्ती."
                </p>
                <p className="font-body text-sm text-ink-light mt-1.5 italic">
                  "The soul of the village is the temple; the soul of the temple is pure devotion."
                </p>
              </div>

              {/* Stats Row with Rounded Cards matching Home */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  {
                    value: "50+",
                    label: isMarathi ? "वर्षे अखंड\nभक्ती" : "Years of\nDevotion",
                  },
                  {
                    value: "1",
                    label: isMarathi ? "भव्य वार्षिक\nमहोत्सव" : "Grand Annual\nFestival",
                  },
                  {
                    value: "24h",
                    label: isMarathi ? "मंदिर खुले\nदर्शन" : "Temple\nOpen Daily",
                  },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="bg-cream border border-gold/40 border-t-2 border-t-saffron p-3.5 sm:p-4 text-center rounded-xl shadow-xs"
                  >
                    <div className="font-display text-xl sm:text-2xl font-bold text-maroon leading-tight">
                      {value}
                    </div>
                    <div className="font-heading text-[0.62rem] tracking-wide uppercase text-ink-light mt-1 leading-tight whitespace-pre-line font-medium">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons matching Home */}
              <div className="flex flex-wrap gap-3.5 pt-2">
                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full font-heading text-xs sm:text-[0.8rem] font-bold tracking-widest uppercase bg-gradient-to-r from-maroon via-maroon-lt to-maroon hover:from-maroon-dk hover:to-maroon text-gold-lt shadow-[0_4px_16px_rgba(107,26,26,0.35)] active:scale-95 transition-all select-none"
                >
                  <span>{isMarathi ? "दर्शनासाठी या" : "Visit Us"}</span>
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>

                <Link
                  to="/events"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full font-heading text-xs sm:text-[0.8rem] font-bold tracking-widest uppercase bg-white/70 hover:bg-white border border-maroon/40 text-maroon hover:text-maroon-dk transition-all active:scale-95 shadow-xs"
                >
                  <CalendarDays size={15} />
                  <span>{isMarathi ? "उत्सव दिनदर्शिका" : "View Festivals"}</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 7. FOOTER MANTRA STRIP (Exact match to Home.jsx) ══ */}
      <div className="bg-ink-dark border-t-4 border-gold p-6 text-center">
        <p className="font-marathi text-[1.1rem] text-gold-lt tracking-wide">
          || पुंडलिका वरदा हरी विठ्ठल — पांडुरंग ||
        </p>
        <p className="font-body italic text-cream-dk/50 text-[0.9rem] mt-1.5">
          Shree Vitthal Rakhumai Temple, Amberkarwadi · Open 24 Hours
        </p>
      </div>
    </div>
  );
});

About.displayName = "About";
export default About;
