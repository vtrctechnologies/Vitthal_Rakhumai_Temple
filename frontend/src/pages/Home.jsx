import { useState, useEffect, memo, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Heart, MapPin, Info } from "lucide-react";
import HeroImg from "../assets/HeroImg.jpeg";
import templeMain from "../assets/temple-main.png";
import { useLanguage } from "../context/LanguageContext";
import { heroSectionAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { motion } from "framer-motion";

const BentoGridGallery = lazy(() => import("@/components/BentoGridGallery"));
const EventsSection = lazy(() => import("@/components/EventsSection"));
const DonationTicker = lazy(() => import("@/components/DonationTicker"));
const GuestSection = lazy(() => import("@/components/GuestSection"));
const BannerSection = lazy(() => import("@/components/BannerSection"));
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
  <div className="mb-10 text-center">
    {eyebrow && (
      <span className="block font-heading text-xs tracking-[0.28em] uppercase text-saffron mb-1.5">
        {eyebrow}
      </span>
    )}
    <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold text-maroon leading-tight mb-2">
      {title}
    </h2>
    {titleMr && (
      <p className="font-marathi text-[clamp(1.5rem,3.5vw,2.4rem)] text-ink-mid font-semibold mb-4">
        {titleMr}
      </p>
    )}
    <DiamondDivider />
    {subtitle && (
      <p
        className={`text-lg leading-relaxed text-ink-mid max-w-[600px] ${center ? "mx-auto" : ""
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
      } catch { }
    };
    fetchHeroData();
  }, []);

  const bgSrc =
    heroData.backgroundUrl === HeroImg
      ? HeroImg
      : getImageUrl(heroData.backgroundUrl);

  const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <div className="w-full overflow-x-hidden bg-cream font-body text-ink-dark">
      {/* ── HERO ── */}
      <header className="relative flex items-center justify-center overflow-hidden">
        {/* Top arch border motif */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-maroon via-gold via-saffron to-maroon z-10" />

        {/* Background */}
        <div className="absolute inset-0 z-0">
          {heroData.resourceType === "video" ? (
            <video
              src={bgSrc}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={bgSrc}
              alt="Temple"
              fetchpriority="high"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center saturate-50 brightness-75"
            />
          )}

          {/* Layered temple-like overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink-dark/55 via-maroon-lt/35 to-ink-dark/95 via-40% to-85%" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto pt-28 pb-30 px-8 text-center flex flex-col items-center">
          <motion.div
            className="inline-flex items-center gap-2.5 bg-gold/40 border border-gold/90 rounded-full px-5 py-1.5 font-body text-sm font-medium  text-gold-lt tracking-wide mb-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="w-2 h-2  rounded-full bg-saffron animate-pulse-slow" />
            {isMarathi ? heroData.festivalTitleMarathi : heroData.festivalTitle}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <span className="font-heading text-[clamp(2.6rem,7vw,5.5rem)] font-black text-white leading-tight tracking-wide drop-shadow-2xl">
              {isMarathi ? heroData.mainTitleMarathi : heroData.mainTitle}
            </span>
            <span className="font-heading text-[clamp(1.6rem,4vw,3rem)] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-lt via-saffron-lt to-gold tracking-wider mt-1 block">
              {isMarathi ? heroData.accentTitleMarathi : heroData.accentTitle}
            </span>
          </motion.h1>

          <div className="flex items-center gap-3 my-6 w-full max-w-[440px]">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="w-2.5 h-2.5 bg-gold rotate-45 shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>

          <motion.p
            className="font-marathi text-[clamp(1rem,2.5vw,1.35rem)] text-cream-dk/80 mt-6 leading-loose max-w-[600px] font-normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            {isMarathi ? heroData.subTitleMarathi : heroData.subTitle}
          </motion.p>

          <motion.div
            className="flex gap-4 flex-wrap justify-center mt-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <button
              onClick={handleDonateClick}
              className="group relative flex items-center gap-2.5 bg-gradient-to-br from-vermillion to-saffron-dk border-none rounded-md px-8 py-3.5 font-heading text-[0.95rem] font-semibold tracking-widest text-white cursor-pointer uppercase overflow-hidden shadow-[0_4px_20px_rgba(192,57,43,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(192,57,43,0.55)] active:translate-y-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-saffron-lt/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <Heart size={18} strokeWidth={2} className="relative z-10" />
              <span className="relative z-10">
                {isMarathi ? "देणगी द्या" : "Donate Now"}
              </span>
            </button>
            <button
              onClick={handleEventsClick}
              className="flex items-center gap-2.5 bg-transparent border border-gold/80 rounded-md px-8 py-3.5 font-heading text-[0.95rem] font-semibold tracking-widest text-gold-lt cursor-pointer uppercase transition-all duration-200 hover:bg-gold/10 hover:-translate-y-0.5"
            >
              <Calendar size={18} strokeWidth={2} />
              {isMarathi ? "कार्यक्रम" : "View Events"}
            </button>
          </motion.div>
        </div>

        {/* Bottom info strip */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-gold/40 bg-ink-dark/75 backdrop-blur-md">
          <div className="max-w-[1100px] mx-auto px-6 py-3.5 flex flex-wrap gap-4 items-center justify-between sm:flex-col sm:items-start md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-cream-dk font-body text-base">
              <MapPin size={18} className="text-saffron-lt shrink-0" />
              <span>
                {isMarathi
                  ? "आंबेकरवाडी, गावडे अंबेरे, रत्नागिरी"
                  : "Amberkarwadi, Gavade Ambere, Ratnagiri, Maharashtra"}
              </span>
            </div>
            <div className="hidden md:block w-px h-5 bg-gold/40" />
            <div className="flex items-center gap-2 text-cream-dk font-body text-base">
              <Info size={18} className="text-saffron-lt shrink-0" />
              <span>
                {isMarathi
                  ? "२४ तास खुले | प्रवेश विनामूल्य"
                  : "Open 24 Hours · Free Entry"}
              </span>
            </div>
            <div className="hidden md:block w-px h-5 bg-gold/40" />
            <div className="flex items-center gap-2 text-gold-lt/75 font-body text-base italic">
              || राम कृष्ण हरी ||
            </div>
          </div>
        </div>
      </header>

      {/* ── DONATION TICKER ── */}
      <Suspense fallback={<div className="h-[52px] bg-maroon border-y-2 border-gold" />}>
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
      <section className="relative px-6 pt-20 pb-16 bg-cream overflow-hidden">
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

            {/* Three sacred pillars */}
            {/* <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                {
                  icon: "🪔",
                  label: isMarathi ? "दैनंदिन आरती" : "Daily Aarti",
                  detail: isMarathi ? "पहाटे व सायंकाळ" : "Dawn & Dusk",
                },
                {
                  icon: "📿",
                  label: isMarathi ? "भजन-कीर्तन" : "Bhajan Kirtan",
                  detail: isMarathi ? "आठवड्यातून दोनदा" : "Twice a week",
                },
                {
                  icon: "🌺",
                  label: isMarathi ? "पूजा सेवा" : "Pooja Seva",
                  detail: isMarathi ? "नावनोंदणी उपलब्ध" : "By registration",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-cream-dk border border-gold/60 border-t-4 border-t-saffron p-4 text-center rounded-sm shadow-sm"
                >
                  <div className="text-3xl mb-1.5">{item.icon}</div>
                  <div className="font-heading text-xs font-semibold tracking-wide text-maroon uppercase">
                    {item.label}
                  </div>
                  <div className="font-body text-sm text-ink-light mt-1 italic">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div> */}
          </motion.div>

          {/* Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            <div className="relative border-2 border-gold rounded-sm p-2 bg-cream-dk">
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
                  className="w-full h-[340px] object-cover block saturate-105 sepia-[0.08]"
                />
              </div>
            </div>
            <p className="mt-3 text-center font-body italic text-[0.9rem] text-ink-light tracking-wide">
              {isMarathi
                ? "श्री विठ्ठल रखुमाई मंदिर — आंबेकरवाडी"
                : "Shree Vitthal Rakhumai Temple, Amberkarwadi"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <div className="relative px-6 py-16 bg-stone">
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
              <div className="flex items-center justify-center p-16 font-body italic text-ink-light text-lg gap-3">
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
      <motion.section className="px-6 py-20 bg-cream" {...fadeUp}>
        <div className="max-w-6xl mx-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-16 font-body italic text-ink-light text-lg gap-3">
                <OmSymbol /> Loading committee…
              </div>
            }
          >
            <StaticCommitteeMembers />
          </Suspense>
        </div>
      </motion.section>

      {/* ── GALLERY ── */}
      <div className="relative px-6 py-16 bg-stone overflow-hidden">
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
              <div className="flex items-center justify-center p-16 font-body italic text-ink-light text-lg gap-3">
                <OmSymbol /> Loading gallery…
              </div>
            }
          >
            <BentoGridGallery />
          </Suspense>
        </div>
      </div>

      {/* ── FOOTER STRIP ── */}
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

Home.displayName = "Home";
export default Home;
