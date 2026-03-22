import { useState, useEffect, memo, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Heart, MapPin, Info } from "lucide-react";
import HeroBg12 from "../assets/HeroBg12.jpg";
import templeMain from "../assets/temple-main.png";
import { useLanguage } from "../context/LanguageContext";
import { heroSectionAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";

import { motion } from "framer-motion";

// Lazy load heavy components
const BentoGridGallery = lazy(() => import("@/components/BentoGridGallery"));
const EventsSection = lazy(() => import("@/components/EventsSection"));
const DonationTicker = lazy(() => import("@/components/DonationTicker"));
const BannerSection = lazy(() => import("@/components/BannerSection"));
const StaticCommitteeMembers = lazy(
  () => import("@/components/StaticCommitteeMembers"),
);

const Home = memo(() => {
  const navigate = useNavigate();
  const { isMarathi } = useLanguage();
  const [heroData, setHeroData] = useState({
    mainTitle: "Shree Vitthal",
    mainTitleMarathi: "श्री विठ्ठल",
    accentTitle: "Rakhumai Temple",
    accentTitleMarathi: "रखुमाई मंदिर",
    subTitle: "Experience divine grace in the heart of Amberkarwadi. A sacred sanctuary of devotion, peace, and unity for all devotees.",
    subTitleMarathi: "आंबेकरवाडीच्या हृदयात दैवी कृपेचा अनुभव घ्या. सर्व भक्तांसाठी भक्ती, शांती आणि एकतेचे पवित्र स्थान.",
    festivalTitle: "Next Festival: Kartiki Ekadashi",
    festivalTitleMarathi: "पुढील उत्सव: कार्तिकी एकादशी",
    backgroundUrl: HeroBg12,
    resourceType: "image"
  });

  const handleDonateClick = useCallback(() => {
    navigate("/donation");
  }, [navigate]);

  const handleEventsClick = useCallback(() => {
    navigate("/events");
  }, [navigate]);

  // Fetch hero section data
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await heroSectionAPI.getHeroSection();
        if (response && response.status === "success" && response.data) {
          setHeroData({
            mainTitle: response.data.mainTitle || "Shree Vitthal",
            mainTitleMarathi: response.data.mainTitleMarathi || "श्री विठ्ठल",
            accentTitle: response.data.accentTitle || "Rakhumai Temple",
            accentTitleMarathi: response.data.accentTitleMarathi || "रखुमाई मंदिर",
            subTitle: response.data.subTitle || "Experience divine grace in the heart of Amberkarwadi. A sacred sanctuary of devotion, peace, and unity for all devotees.",
            subTitleMarathi: response.data.subTitleMarathi || "आंबेकरवाडीच्या हृदयात दैवी कृपेचा अनुभव घ्या. सर्व भक्तांसाठी भक्ती, शांती आणि एकतेचे पवित्र स्थान.",
            festivalTitle: response.data.festivalTitle || "Next Festival: Kartiki Ekadashi",
            festivalTitleMarathi: response.data.festivalTitleMarathi || "पुढील उत्सव: कार्तिकी एकादशी",
            backgroundUrl: response.data.backgroundUrl || HeroBg12,
            resourceType: response.data.resourceType || "image"
          });
        }
      } catch (error) {
        console.error("Error fetching hero data:", error);
      }
    };
    fetchHeroData();
  }, []);

  // Helper to get background source
  const getBackgroundSrc = (url) => {
    if (!url) return HeroBg12;
    // If it's the static import or a relative frontend path, return as is
    if (url === HeroBg12 || url.startsWith('/src/') || url.startsWith('data:')) {
      return url;
    }
    return getImageUrl(url);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">
      {/* Hero Section */}
      <header className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden py-32 lg:py-44">
        {/* Optimized Background Image Layer */}
        <div className="absolute inset-0 z-0">
          {heroData.resourceType === 'video' ? (
            <video
              src={getBackgroundSrc(heroData.backgroundUrl)}
              autoPlay
              muted
              loop
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <img
              src={getImageUrl(heroData.backgroundUrl)}
              alt="Temple Background"
              className="h-full w-full object-cover object-center"
              fetchpriority="high"
              decoding="async"
              loading="eager"
            />
          )}
          {/* Gradient Overlay - Reduced opacity for performance */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/90" />

          {/* Pattern Overlay - Using CSS blend mode for better performance */}
          <div
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"
            aria-hidden="true"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-950/80 px-4 py-1.5 text-sm font-semibold text-orange-200"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            {isMarathi ? heroData.festivalTitleMarathi : heroData.festivalTitle}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-5xl font-bold leading-tight text-white drop-shadow-2xl md:text-7xl lg:text-8xl">
              {isMarathi ? heroData.mainTitleMarathi : heroData.mainTitle} <br />
              <span className="bg-gradient-to-r from-orange-200 to-amber-500 bg-clip-text text-transparent">
                {isMarathi ? heroData.accentTitleMarathi : heroData.accentTitle}
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-slate-200 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isMarathi ? heroData.subTitleMarathi : heroData.subTitle}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button
              onClick={handleDonateClick}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-orange-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:bg-orange-700 hover:scale-105 active:scale-95"
            >
              <Heart className="h-5 w-5 fill-white/20 transition-transform group-hover:scale-110" />
              {isMarathi ? "देणगी" : "Donate Now"}
            </button>

            <button
              onClick={handleEventsClick}
              className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-lg font-bold text-white transition-transform hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <Calendar className="h-5 w-5" />
              {isMarathi ? "कार्यक्रम " : "View Events"}
            </button>
          </motion.div>
        </div>

        {/* Bottom Info Strip - Optimized rendering */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/60">
          <div className="container mx-auto flex flex-col justify-between gap-4 px-6 py-4 text-white/90 md:flex-row md:items-center md:py-6">
            <div className="flex items-center gap-3">
              <MapPin className="text-orange-400" size={20} />
              <span className="text-sm md:text-base">
                {isMarathi
                  ? "आंबेकरवाडी, गावडे अंबेरे, रत्नागिरी महाराष्ट्र"
                  : "Amberkarwadi, Gavade Ambere, Ratnagiri Maharashtra"}
              </span>
            </div>
            <div className="hidden h-4 w-px bg-white/20 md:block" />
            <div className="flex items-center gap-3">
              <Info className="text-orange-400" size={20} />
              <span className="text-sm md:text-base">
                {isMarathi ? "२४ तास खुले" : "Open 24 Hours"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="h-10 w-full bg-orange-50" />}>
        <DonationTicker />
      </Suspense>

      {/* About Summary */}
      <section className="relative pb-0 pt-20 bg-[#fffbf5] lg:pb-5 lg:pt-20">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#d97706 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="container relative z-10 mx-auto flex flex-col gap-0 px-4 text-center md:gap-12 lg:flex-row">
          <div className="flex-1">
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="mb-3 font-serif text-2xl font-bold tracking-wide text-orange-800 md:text-4xl">
                || राम कृष्ण हरी ||
              </h3>
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-12 bg-orange-300" />
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
                  || Ram Krishn Hari ||
                </p>
                <div className="h-[1px] w-12 bg-orange-300" />
              </div>
            </motion.div>

            <motion.h2
              className="mb-8 font-serif text-5xl font-medium tracking-tight text-stone-800 md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {isMarathi ? "आमच्या मंदिराविषयी" : "About Our Temple"}
            </motion.h2>

            <motion.p
              className="mx-auto mb-12 max-w-2xl text-xl font-light leading-relaxed text-stone-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isMarathi ? (
                <>
                  <span className="font-semibold text-orange-700">
                    आंबेकरवाडी, खारवीवाडा
                  </span>{" "}
                  येथील निसर्गरम्य परिसरात वसलेले विठ्ठल रखुमाई मंदिर भक्तीचे एक
                  चिरंतन प्रतीक आहे. भगवान विठ्ठल आणि माता रखुमाई यांच्या शाश्वत
                  प्रेमाला समर्पित, आम्ही तुम्हाला या पवित्र भिंतींमध्ये शांती,
                  उद्देश आणि प्रार्थना शोधण्यासाठी आमंत्रित करतो.
                </>
              ) : (
                <>
                  Nestled in the serene landscapes of{" "}
                  <span className="font-semibold text-orange-700">
                    Amberkarwadi, Kharviwada
                  </span>
                  , The Vitthal Rakhumai Temple stands as a timeless testament
                  to devotion. Dedicated to the eternal love of Lord Vitthal and
                  Goddess Rakhumai, we invite you to find peace, purpose, and
                  prayer within these sacred walls.
                </>
              )}
            </motion.p>
          </div>

          {/* Optimized Image Container */}
          <motion.div
            className="relative mx-auto mb-12 h-28 flex-1 overflow-hidden rounded-full bg-white p-3 shadow-2xl md:h-72 lg:h-96 max-w-3xl will-change-transform"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <img
              src={templeMain}
              alt="Temple Panorama"
              className="h-full w-full scale-125 object-cover"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="will-change-contents"
      >
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="animate-pulse text-orange-500">
                Loading events...
              </div>
            </div>
          }
        >
          <EventsSection />
        </Suspense>
      </motion.section>

      {/* Committee Members */}
      <motion.section
        className="px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Suspense
          fallback={
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="animate-pulse text-orange-500">
                Loading committee...
              </div>
            </div>
          }
        >
          <StaticCommitteeMembers />
        </Suspense>
      </motion.section>

      {/* Banner Section */}
      <Suspense fallback={<div className="h-64 bg-stone-50" />}>
        <BannerSection />
      </Suspense>

      {/* Gallery Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Suspense
          fallback={
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="animate-pulse text-orange-500">
                Loading gallery...
              </div>
            </div>
          }
        >
          <BentoGridGallery />
        </Suspense>
      </motion.section>
    </div>
  );
});

Home.displayName = "Home";

export default Home;
