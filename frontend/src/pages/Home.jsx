import { useState, useEffect, memo, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Heart, MapPin, Sparkles, Clock } from "lucide-react";
import HeroImg from "../assets/HeroImg.jpeg";
import HeroBgMobile from "../assets/HeroBgMobile.png";
import templeMain from "../assets/temple-main.png";
import { useLanguage } from "../context/LanguageContext";
import { heroSectionAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { motion } from "framer-motion";

const BentoGridGallery = lazy(() => import("@/components/BentoGridGallery"));
const EventsSection = lazy(() => import("@/components/EventsSection"));
const DonationTicker = lazy(() => import("@/components/DonationTicker"));
const GuestSection = lazy(() => import("@/components/GuestSection"));
const StaticCommitteeMembers = lazy(
  () => import("@/components/StaticCommitteeMembers"),
);

/* ── Tiny ornamental SVG ── */
const OmSymbol = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-middle"
  >
    <text
      x="18"
      y="27"
      textAnchor="middle"
      fontSize="26"
      className="font-serif fill-gold"
    >
      ॐ
    </text>
  </svg>
);

const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-5 justify-center">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
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
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
  </div>
);

const SectionHeader = ({
  eyebrow,
  title,
  titleMr,
  subtitle,
  center = false,
}) => (
  <div className="mb-8 sm:mb-10 text-center px-2">
    {eyebrow && (
      <span className="block font-heading text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.28em] uppercase text-saffron mb-1 sm:mb-1.5">
        {eyebrow}
      </span>
    )}
    <h2 className="font-display text-[clamp(1.6rem,4vw,2.8rem)] font-bold text-maroon leading-tight mb-1 sm:mb-2">
      {title}
    </h2>
    {titleMr && (
      <p className="font-marathi text-[clamp(1.3rem,3.2vw,2.2rem)] text-ink-mid font-semibold mb-3 sm:mb-4">
        {titleMr}
      </p>
    )}
    <DiamondDivider />
    {subtitle && (
      <p
        className={`text-sm sm:text-base md:text-lg leading-relaxed text-ink-mid max-w-[600px] ${center ? "mx-auto" : ""
          }`}
      >
        {subtitle}
      </p>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const Home = memo(() => {
  const navigate = useNavigate();
  const { isMarathi } = useLanguage();
  const [heroData, setHeroData] = useState({
    mainTitle: "Shree Vitthal",
    mainTitleMarathi: "श्री विठ्ठल",
    accentTitle: "Rakhumai Temple",
    accentTitleMarathi: "रखुमाई मंदिर",
    subTitle:
      "Experience divine grace in the heart of Amberkarwadi. A sacred sanctuary of devotion, peace, and unity for all devotees.",
    subTitleMarathi:
      "आंबेकरवाडीच्या हृदयात दैवी कृपेचा अनुभव घ्या. सर्व भक्तांसाठी भक्ती, शांती आणि एकतेचे पवित्र स्थान.",
    festivalTitle: "Next Festival: Kartiki Ekadashi",
    festivalTitleMarathi: "पुढील उत्सव: कार्तिकी एकादशी",
    backgroundUrl: HeroImg,
    resourceType: "image",
  });

  const handleDonateClick = useCallback(
    () => navigate("/donation"),
    [navigate],
  );
  const handleEventsClick = useCallback(() => navigate("/events"), [navigate]);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await heroSectionAPI.getHeroSection();
        if (response?.status === "success" && response.data) {
          setHeroData((prev) => ({ ...prev, ...response.data }));
        }
      } catch (err) {
        // Fallback to default heroData
        console.debug("Using fallback hero content:", err);
      }
    };
    fetchHeroData();
  }, []);

  const bgSrc =
    heroData.backgroundUrl === HeroImg
      ? HeroImg
      : getImageUrl(heroData.backgroundUrl);

  const fadeUp = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -40px 0px" },
    transition: { duration: 0.4, ease: "easeOut" },
  };

  return (
    <div className="w-full overflow-x-hidden bg-cream font-body text-ink-dark">
      {/* ── HERO ── */}
      <header className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Subtle Light Gold Arch Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent z-10 opacity-70" />

        {/* Cinematic Divine Background Layer */}
        <div className="absolute inset-0 z-0 w-full h-full">
          {heroData.resourceType === "video" ? (
            <>
              <img
                src={HeroBgMobile}
                alt="Temple Sanctum"
                fetchpriority="high"
                loading="eager"
                decoding="async"
                className="block md:hidden absolute inset-0 w-full h-full object-cover object-center brightness-[0.78] contrast-[1.05]"
              />
              <video
                src={bgSrc}
                autoPlay
                muted
                loop
                playsInline
                className="hidden md:block absolute inset-0 w-full h-full object-cover object-center"
              />
            </>
          ) : (
            <picture className="absolute inset-0 w-full h-full block">
              <source media="(max-width: 767px)" srcSet={HeroBgMobile} />
              <img
                src={bgSrc}
                alt="Temple Sanctum"
                fetchpriority="high"
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.78] contrast-[1.05]"
              />
            </picture>
          )}

          {/* Balanced Directional Overlays (Guarantees background photo is fully visible on mobile & tablet while text stays readable) */}
          {/* 1. Global Ambient Scrim */}
          <div className="absolute inset-0 bg-black/40 sm:bg-black/35" />

          {/* 2. Top Header Bleed (harmonizes with royal maroon navbar) */}
          <div className="absolute top-0 left-0 right-0 h-28 sm:h-36 bg-gradient-to-b from-[#3d0f0f]/85 via-[#250707]/35 to-transparent" />

          {/* 3. Bottom Smooth Fade to Info Dock */}
          <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-[#140202]/95 via-[#140202]/40 to-transparent" />
        </div>

        {/* Hero Content Center Stack */}
        <div className="relative z-10 max-w-4xl mx-auto pt-20 sm:pt-24 md:pt-28 pb-14 sm:pb-16 md:pb-20 px-3 sm:px-6 text-center flex flex-col items-center justify-center my-auto">
          {/* Festival Announcement Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-black/45 border border-amber-400/40 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 font-heading text-[0.70rem] sm:text-[0.82rem] font-medium text-amber-200 tracking-wide mb-3 sm:mb-6 shadow-sm backdrop-blur-xs select-none max-w-[92vw] truncate"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <Sparkles size={12} className="text-amber-300 shrink-0" />
            <span className="truncate">
              {isMarathi ? heroData.festivalTitleMarathi : heroData.festivalTitle}
            </span>
          </motion.div>

          {/* Main Titles */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center select-none w-full"
          >
            <span className="font-heading text-[clamp(1.75rem,5.6vw,4.5rem)] font-black text-white leading-tight tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] px-2">
              {isMarathi ? heroData.mainTitleMarathi : heroData.mainTitle}
            </span>
            <span className="font-heading text-[clamp(1.15rem,3.4vw,2.4rem)] font-bold tracking-[0.14em] sm:tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] mt-1 sm:mt-1.5 block px-2">
              {isMarathi ? heroData.accentTitleMarathi : heroData.accentTitle}
            </span>
          </motion.h1>

          {/* Sacred Diamond Divider */}
          <div className="flex items-center gap-3 my-3 sm:my-5 w-full max-w-[280px] sm:max-w-[420px]">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-amber-300 border border-amber-200/60 shadow-xs shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
          </div>

          {/* Subtitle Description */}
          <motion.p
            className="font-body text-[clamp(0.85rem,2vw,1.15rem)] text-cream/90 mt-0.5 sm:mt-2 leading-relaxed max-w-[620px] font-normal drop-shadow-sm px-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isMarathi ? heroData.subTitleMarathi : heroData.subTitle}
          </motion.p>

          {/* Interactive CTAs - Exactly matching proportions on all devices */}
          <motion.div
            className="flex flex-row gap-3 sm:gap-4 justify-center items-center mt-6 sm:mt-8 w-full max-w-sm sm:max-w-none px-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Primary Donate CTA */}
            <button
              type="button"
              onClick={handleDonateClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-10 sm:h-12 px-4 sm:px-8 sm:min-w-[170px] rounded-md font-heading text-xs sm:text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#2b0808] border border-amber-400/60 shadow-xs hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer select-none"
            >
              <Heart
                size={14}
                className="fill-[#2b0808] text-[#2b0808] shrink-0"
              />
              <span className="whitespace-nowrap">
                {isMarathi ? "देणगी" : "Donate Now"}
              </span>
            </button>

            {/* Secondary Events CTA */}
            <button
              type="button"
              onClick={handleEventsClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-10 sm:h-12 px-4 sm:px-8 sm:min-w-[170px] rounded-md font-heading text-xs sm:text-sm font-bold tracking-wider uppercase bg-white/10 hover:bg-white/15 border border-amber-300/40 hover:border-amber-300 text-amber-100 hover:text-white backdrop-blur-xs shadow-xs transition-all duration-200 active:scale-95 cursor-pointer select-none"
            >
              <Calendar
                size={14}
                className="text-amber-300 shrink-0"
              />
              <span className="whitespace-nowrap">
                {isMarathi ? "कार्यक्रम" : "View Events"}
              </span>
            </button>
          </motion.div>
        </div>

        {/* Modern Responsive Bottom Info Dock */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-amber-400/20 bg-[#140303]/90 backdrop-blur-xs">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 text-[0.66rem] sm:text-[0.80rem]">
            {/* Location */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-cream/90 truncate min-w-0">
              <MapPin size={12} className="text-amber-400 shrink-0 sm:w-3.5 sm:h-3.5" />
              <span className="truncate">
                {isMarathi
                  ? "आंबेकरवाडी, रत्नागिरी"
                  : "Ambekarwadi, Ratnagiri"}
              </span>
            </div>

            {/* Timing */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-cream/90 whitespace-nowrap shrink-0">
              <Clock size={12} className="text-amber-400 shrink-0 sm:w-3.5 sm:h-3.5" />
              <span>
                {isMarathi
                  ? "२४ तास खुले | विनामूल्य"
                  : "Open 24 Hours · Free"}
              </span>
            </div>

            {/* Sacred Mantra */}
            <div className="hidden md:flex items-center gap-1.5 text-amber-200/85 font-marathi whitespace-nowrap shrink-0">
              <span>|| राम कृष्ण हरी ||</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── DONATION TICKER ── */}
      <Suspense fallback={<div className="h-[46px] bg-[#160303] border-y border-amber-400/25" />}>
        <DonationTicker />
      </Suspense>

      {/* ── SHLOKA STRIP ── */}
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

      {/* ── ABOUT SECTION ── */}
      <section className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-cream overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-saffron) 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center max-w-6xl mx-auto relative z-10">
          {/* Text */}
          <motion.div {...fadeUp}>
            <SectionHeader
              eyebrow="|| Ram Krishn Hari ||"
              title="About Our Temple"
              titleMr="आमच्या मंदिराविषयी"
              subtitle={
                isMarathi
                  ? "आंबेकरवाडी, खारवीवाडा येथील निसर्गरम्य परिसरात वसलेले विठ्ठल रखुमाई मंदिर भक्तीचे एक चिरंतन प्रतीक आहे. भगवान विठ्ठल आणि माता रखुमाई यांच्या शाश्वत प्रेमाला समर्पित, आम्ही तुम्हाला या पवित्र भिंतींमध्ये शांती, उद्देश आणि प्रार्थना शोधण्यासाठी आमंत्रित करतो."
                  : "Nestled in the serene landscapes of Amberkarwadi, Kharviwada, the Vitthal Rakhumai Temple stands as a timeless testament to devotion. Dedicated to the eternal love of Lord Vitthal and Goddess Rakhumai, we invite you to find peace, purpose, and prayer within these sacred walls."
              }
            />
          </motion.div>

          {/* Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            <div className="relative border-2 border-gold rounded-sm p-1.5 sm:p-2 bg-cream-dk">
              <span className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-4 border-l-4 border-saffron" />
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-4 border-r-4 border-saffron" />
              <span className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-4 border-l-4 border-saffron" />
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-4 border-r-4 border-saffron" />
              <div className="border border-saffron-lt/60 rounded-sm overflow-hidden relative">
                <img
                  src={templeMain}
                  alt="Vitthal Rakhumai Temple"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[220px] xs:h-[260px] sm:h-[300px] md:h-[340px] object-cover block saturate-105 sepia-[0.08]"
                />
              </div>
            </div>
            <p className="mt-3 text-center font-body italic text-[0.85rem] sm:text-[0.9rem] text-ink-light tracking-wide">
              {isMarathi
                ? "श्री विठ्ठल रखुमाई मंदिर — आंबेकरवाडी"
                : "Shree Vitthal Rakhumai Temple, Amberkarwadi"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <div className="relative px-4 sm:px-6 py-12 sm:py-16 bg-stone">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon via-gold via-saffron to-maroon" />
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp}>
            <SectionHeader
              eyebrow="Utsav Calendar"
              title="Upcoming Events"
              titleMr="आगामी कार्यक्रम"
              center
            />
          </motion.div>
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-12 sm:p-16 font-body italic text-ink-light text-base sm:text-lg gap-3">
                <OmSymbol /> Loading sacred calendar…
              </div>
            }
          >
            <EventsSection />
          </Suspense>
        </div>
      </div>

      {/* ── GUESTS ── */}
      <Suspense fallback={<div className="h-[200px] bg-stone" />}>
        <GuestSection />
      </Suspense>

      {/* ── COMMITTEE ── */}
      <motion.section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-cream" {...fadeUp}>
        <div className="max-w-6xl mx-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-12 sm:p-16 font-body italic text-ink-light text-base sm:text-lg gap-3">
                <OmSymbol /> Loading committee…
              </div>
            }
          >
            <StaticCommitteeMembers />
          </Suspense>
        </div>
      </motion.section>

      {/* ── GALLERY ── */}
      <div className="relative px-4 sm:px-6 py-12 sm:py-16 bg-stone overflow-hidden">
        {/* Top accent border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon via-gold via-saffron to-maroon" />
        {/* Subtle radial dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-maroon) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div {...fadeUp}>
            <SectionHeader
              eyebrow="|| Darshan Gallery ||"
              title="Captured Moments"
              titleMr="पवित्र क्षण"
              center
            />
          </motion.div>
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-12 sm:p-16 font-body italic text-ink-light text-base sm:text-lg gap-3">
                <OmSymbol /> Loading gallery…
              </div>
            }
          >
            <BentoGridGallery />
          </Suspense>
        </div>
      </div>
    </div>
  );
});

Home.displayName = "Home";
export default Home;
