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
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const templeHero = "/gallery/Temple3D.png";
const villageImage = "/gallery/village.jpg";

/* ── Shared ornamental components (mirrors Home.jsx) ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-5 justify-center">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent max-w-[120px]" />
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="11" y="1" width="13" height="13" rx="1"
        transform="rotate(45 11 1)" className="fill-saffron opacity-80" />
      <rect x="11" y="4" width="9" height="9" rx="0.5"
        transform="rotate(45 11 4)" fill="none"
        className="stroke-gold-lt" strokeWidth="0.8" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent max-w-[120px]" />
  </div>
);

const SectionHeader = ({ eyebrow, title, titleMr, subtitle, titleColor, subtitleColor }) => (
  <div className="mb-10 text-center">
    {eyebrow && (
      <span className="block font-heading text-xs tracking-[0.28em] uppercase text-saffron mb-1.5">
        {eyebrow}
      </span>
    )}
    <h2
      className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight mb-2"
      style={{ color: titleColor || undefined }}
      {...(!titleColor && { className: "font-display text-[clamp(1.8rem,4vw,3rem)] font-bold text-maroon leading-tight mb-2" })}
    >
      {title}
    </h2>
    {titleMr && (
      <p
        className="font-marathi text-[clamp(1.3rem,3vw,2rem)] font-semibold mb-4"
        style={{ color: subtitleColor || undefined }}
        {...(!subtitleColor && { className: "font-marathi text-[clamp(1.3rem,3vw,2rem)] text-ink-mid font-semibold mb-4" })}
      >
        {titleMr}
      </p>
    )}
    <DiamondDivider />
    {subtitle && (
      <p
        className="text-lg leading-relaxed max-w-[640px] mx-auto"
        style={{ color: subtitleColor || undefined }}
        {...(!subtitleColor && { className: "text-lg leading-relaxed text-ink-mid max-w-[640px] mx-auto" })}
      >
        {subtitle}
      </p>
    )}
  </div>
);

/* corner accent used on image frames */
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
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const About = () => {
  const [activeTab, setActiveTab] = useState("story");

  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.05, rootMargin: "50px" });

  return (
    <div className="w-full overflow-x-hidden bg-cream font-body text-ink-dark">

      {/* ══ HERO BANNER ══ */}
      <section className="relative flex items-center justify-center overflow-hidden min-h-[340px] md:min-h-[400px]">
        {/* Top arch color stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-maroon via-gold via-saffron to-maroon z-10" />

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={templeHero}
            alt="Shree Vitthal Rakhumai Temple"
            fetchpriority="high"
            loading="eager"
            className="w-full h-full object-cover object-top brightness-60 saturate-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-dark/60 via-maroon/40 to-ink-dark/90" />
          {/* Diamond grid overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,var(--color-gold) 0,var(--color-gold) 1px,transparent 0,transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 pt-20 pb-16 max-w-3xl mx-auto flex flex-col items-center">
          <motion.div
            className="inline-flex items-center gap-2 bg-gold/30 border border-gold/70 rounded-full px-5 py-1.5 text-sm font-heading text-gold-lt tracking-wide mb-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="w-2 h-2 rounded-full bg-saffron animate-pulse-slow" />
            || राम कृष्ण हरी ||
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="font-heading text-[clamp(2rem,6vw,4.5rem)] font-black text-white leading-tight tracking-wide drop-shadow-2xl">
              About Our Temple
            </span>
            <span className="font-marathi text-[clamp(1.2rem,3.5vw,2.2rem)] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-lt via-saffron-lt to-gold">
              आमच्या मंदिराविषयी
            </span>
          </motion.h1>

          <div className="flex items-center gap-3 my-5 w-full max-w-[360px]">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="w-2.5 h-2.5 bg-gold rotate-45 shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>

          <motion.p
            className="font-body text-[clamp(0.95rem,2.2vw,1.2rem)] text-cream-dk/80 leading-loose max-w-[520px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            A legacy of devotion, spirituality, and community service spanning over five decades.
          </motion.p>
        </div>

        {/* Bottom stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-maroon via-gold via-saffron to-maroon z-10" />
      </section>

      {/* ══ SHLOKA STRIP ══ */}
      <div className="relative bg-maroon px-6 py-8 text-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,rgba(212,175,55,0.15) 0,rgba(212,175,55,0.15) 1px,transparent 0,transparent 60px)",
          }}
        />
        <p className="relative z-10 font-marathi text-[clamp(1rem,2.8vw,1.5rem)] text-gold-lt tracking-wide leading-relaxed">
          पुंडलिका वरदा हरी विठ्ठल — श्री ज्ञानदेव तुकाराम
        </p>
      </div>

      {/* ══ TEMPLE HISTORY (Story / Vision tabs) ══ */}
      <section className="relative px-6 pt-20 pb-16 bg-cream overflow-hidden">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle,var(--color-saffron) 1.5px,transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div {...fadeUp}>
            <SectionHeader
              eyebrow="|| Itihas ||"
              title="Our Temple's Legacy"
              titleMr="मंदिराचा इतिहास"
            />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mt-4">
            {/* Image column */}
            <motion.div
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
            >
              <div className="relative border-2 border-gold rounded-sm p-2 bg-cream-dk">
                <CornerAccents />
                <div className="border border-saffron-lt/60 rounded-sm overflow-hidden relative">
                  <img
                    src={templeHero}
                    alt="Vitthal Rakhumai Temple"
                    loading="eager"
                    decoding="async"
                    className="w-full h-[400px] md:h-[460px] object-cover block saturate-105 sepia-[0.08]"
                  />
                  {/* Info strip on image */}
                  <div className="absolute bottom-0 left-0 right-0 bg-ink-dark/80 backdrop-blur-sm border-t border-gold/30 px-5 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-cream-dk font-body text-sm">
                        <MapPin size={16} className="text-saffron-lt shrink-0" />
                        <span>Amberkarwadi, Ratnagiri</span>
                      </div>
                      <div className="hidden sm:block w-px h-4 bg-gold/30" />
                      <div className="flex items-center gap-2 text-cream-dk font-body text-sm">
                        <Clock size={16} className="text-saffron-lt shrink-0" />
                        <span>50+ Years of Devotion</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center font-body italic text-[0.9rem] text-ink-light tracking-wide">
                श्री विठ्ठल रखुमाई मंदिर — आंबेकरवाडी
              </p>
            </motion.div>

            {/* Content column */}
            <motion.div className="order-1 lg:order-2 space-y-7" {...fadeUp}>
              {/* Tab pills — themed */}
              <div className="flex gap-2 p-1 bg-maroon-dk/10 border border-gold/20 rounded-sm w-fit">
                {["story", "vision"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 font-heading text-[0.72rem] font-semibold tracking-widest uppercase transition-all duration-200 rounded-sm ${activeTab === tab
                      ? "bg-maroon text-gold border border-gold/40 shadow-sm"
                      : "text-ink-mid hover:text-maroon hover:bg-gold/10"
                      }`}
                  >
                    Our {tab}
                  </button>
                ))}
              </div>

              {/* Story Tab */}
              {activeTab === "story" && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-maroon/10 border border-maroon/20 rounded-sm mt-1 shrink-0">
                      <BookOpen size={22} className="text-maroon" />
                    </div>
                    <div>
                      <h3 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold text-maroon mb-3">
                        Temple Story
                      </h3>
                      <p className="font-body text-ink-mid leading-relaxed text-lg">
                        The{" "}
                        <span className="font-semibold text-maroon-lt">
                          Vitthal-Rakhumai Temple
                        </span>{" "}
                        was founded over 50 years ago by devoted villagers driven by unwavering faith and a deep reverence for Lord Vitthal.
                      </p>
                      <p className="font-body text-ink-mid leading-relaxed mt-4">
                        What started as a humble gathering spot has blossomed into the spiritual heart of our community. For decades, these hallowed grounds have guided generations toward peace, devotion, and unity — standing tall as a testament to our collective spirit.
                      </p>
                    </div>
                  </div>

                  {/* Two info cards */}
                  <div className="grid sm:grid-cols-2 gap-4 mt-2">
                    {[
                      { icon: Users, label: "Community Led", desc: "Maintained entirely by local devoted villagers." },
                      { icon: Heart, label: "Spiritual Hub", desc: "Daily aartis, bhajans & festive celebrations." },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div
                        key={label}
                        className="bg-stone border border-gold/30 border-t-4 border-t-saffron p-4 rounded-sm shadow-sm"
                      >
                        <h4 className="font-heading text-xs font-semibold tracking-wide text-maroon uppercase mb-1 flex items-center gap-2">
                          <Icon size={14} className="shrink-0" />
                          {label}
                        </h4>
                        <p className="font-body text-sm text-ink-light">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vision Tab */}
              {activeTab === "vision" && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-maroon/10 border border-maroon/20 rounded-sm mt-1 shrink-0">
                      <Target size={22} className="text-maroon" />
                    </div>
                    <div>
                      <h3 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold text-maroon mb-3">
                        Our Vision
                      </h3>
                      <p className="font-body text-ink-mid leading-relaxed text-lg">
                        We are constructing a{" "}
                        <span className="font-semibold text-maroon-lt">New Temple</span>{" "}
                        to serve our growing family of devotees with expanded sacred spaces.
                      </p>
                      <p className="font-body text-ink-mid leading-relaxed mt-4">
                        Our goal is not just to build walls, but to preserve our cultural and spiritual heritage for generations to come — hosting larger gatherings, educational programs, and community feasts.
                      </p>
                    </div>
                  </div>

                  {/* Construction progress — styled */}
                  <div className="bg-stone border border-gold/30 p-5 rounded-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-heading text-xs font-bold tracking-widest uppercase text-maroon">
                        Construction Progress
                      </span>
                      <span className="font-heading text-xs font-bold text-saffron tracking-wider border border-saffron/40 px-3 py-1 rounded-sm">
                        In Progress
                      </span>
                    </div>
                    <div className="w-full bg-cream-dk rounded-full h-3 overflow-hidden border border-gold/20">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: "62%",
                          background: "linear-gradient(90deg,var(--color-maroon),var(--color-gold),var(--color-saffron))",
                        }}
                      />
                    </div>
                    <p className="font-body italic text-ink-light text-sm mt-2">
                      Join us in building this sacred legacy — every contribution matters.
                    </p>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/donation"
                  className="group relative flex items-center gap-2.5 bg-gradient-to-br from-vermillion to-saffron-dk rounded-sm px-8 py-3.5 font-heading text-[0.85rem] font-semibold tracking-widest text-white uppercase overflow-hidden shadow-[0_4px_20px_rgba(192,57,43,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(192,57,43,0.5)]"
                >
                  <Heart size={16} className="shrink-0" />
                  Donate Now
                </Link>
                <Link
                  to="/gallery"
                  className="flex items-center gap-2 border border-maroon/50 rounded-sm px-8 py-3.5 font-heading text-[0.85rem] font-semibold tracking-widest text-maroon uppercase transition-all duration-200 hover:bg-maroon/5 hover:-translate-y-0.5"
                >
                  View Gallery
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ SACRED DUALITY SECTION — PRESERVED EXACTLY ══ */}
      <section
        ref={ref2}
        className="relative py-24 px-4 overflow-hidden bg-gradient-to-b from-orange-950 to-black text-orange-50"
      >
        {/* Abstract Golden Circles Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-orange-500/30 blur-sm"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full border-2 border-amber-500/20 blur-md"></div>
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full border border-orange-400/10"></div>
        </div>

        <div
          className={`container mx-auto max-w-6xl relative z-10 transition-opacity duration-1000 ${inView2 ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="text-center mb-20">
            <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
              The Divine Presence
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 mb-6 drop-shadow-sm">
              Sacred Duality
            </h2>
            <div className="flex items-center justify-center gap-4 text-amber-500/60">
              <span className="h-px w-12 bg-amber-500/40"></span>
              <Flower2 size={20} className="animate-pulse" />
              <span className="h-px w-12 bg-amber-500/40"></span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 relative">
            {/* Central Divider (Hidden on Mobile) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/30 to-transparent -translate-x-1/2"></div>

            {/* Lord Vitthal Side */}
            <div className="relative group text-center md:text-right">
              <div className="mb-6 flex justify-center md:justify-end">
                <div className="w-16 h-16 rounded-full bg-orange-900/50 border border-orange-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] transition-all duration-500">
                  <Sun className="text-amber-400" size={32} />
                </div>
              </div>
              <h3 className="text-3xl font-display font-bold text-amber-100 mb-4 tracking-wide">
                Lord Vitthal
              </h3>
              <p className="text-orange-200/80 leading-relaxed text-lg mb-6">
                Standing eternally on a brick, hands on hips, He embodies infinite patience. As the sustainer of the universe, Vithoba represents the accessible divine—waiting for every devotee with unconditional love.
              </p>
              <div className="inline-block border-b border-amber-500/30 pb-1 text-sm text-amber-400 tracking-wider font-semibold">
                THE PRESERVER
              </div>
            </div>

            {/* Goddess Rakhumai Side */}
            <div className="relative group text-center md:text-left mt-12 md:mt-0">
              <div className="mb-6 flex justify-center md:justify-start">
                <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all duration-500">
                  <Heart className="text-red-400" size={32} />
                </div>
              </div>
              <h3 className="text-3xl font-display font-bold text-amber-100 mb-4 tracking-wide">
                Goddess Rakhumai
              </h3>
              <p className="text-orange-200/80 leading-relaxed text-lg mb-6">
                The essence of devotion and the divine consort. Rakhumai (Rukmini) completes the cosmic cycle. She is the silent strength, the nurturing mother who guides the soul towards ultimate liberation through Bhakti.
              </p>
              <div className="inline-block border-b border-red-500/30 pb-1 text-sm text-red-400 tracking-wider font-semibold">
                THE DEVOTION
              </div>
            </div>
          </div>

          {/* Bottom quote */}
          <div className="mt-20 text-center max-w-2xl mx-auto">
            <p className="font-serif italic text-amber-200/60 text-lg">
              "Together they stand, not as two, but as one eternal truth of Love and Existence."
            </p>
          </div>
        </div>
      </section>

      {/* ══ TEMPLE PILLARS — 3 core values ══ */}
      <section className="relative bg-maroon px-6 py-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,rgba(212,175,55,0.12) 0,rgba(212,175,55,0.12) 1px,transparent 0,transparent 60px)",
          }}
        />
        <div className="max-w-5xl mx-auto relative z-10" style={{ color: "white" }}>
          <motion.div {...fadeUp}>
            <SectionHeader
              eyebrow="|| Aadhaarstaambha ||"
              title="Pillars of Our Temple"
              titleMr="मंदिराचे आधारस्तंभ"
              titleColor="#f5e6c8"
              subtitleColor="#e8c97a"
            />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {[
              {
                icon: Landmark,
                title: "Sacred Worship",
                titleMr: "पूजा-अर्चना",
                desc: "Daily Kakad Aarti at dawn and Shej Aarti at dusk. The flame of devotion never rests.",
              },
              {
                icon: Users,
                title: "Community Unity",
                titleMr: "सामाजिक एकता",
                desc: "Festivals that bind families together — Ekadashi, Diwali, and the grand Wari procession.",
              },
              {
                icon: BookOpen,
                title: "Spiritual Learning",
                titleMr: "आध्यात्मिक ज्ञान",
                desc: "Weekly Kirtans, Bhajan sessions and Pravachans spreading the wisdom of the saints.",
              },
            ].map(({ icon: Icon, title, titleMr, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative bg-maroon-dk border border-gold/20 border-t-[3px] border-t-gold p-7 text-center group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors duration-300">
                  <Icon size={26} className="text-gold-lt" />
                </div>
                <h3 className="font-display text-lg font-bold text-gold mb-1 tracking-wide">{title}</h3>
                <p className="font-marathi text-sm text-saffron-lt mb-3">{titleMr}</p>
                <p className="font-body text-cream-dk/70 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VILLAGE SECTION ══ */}
      <section className="relative bg-stone px-6 py-20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon via-gold via-saffron to-maroon" />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle,var(--color-maroon) 1.5px,transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div {...fadeUp}>
            <SectionHeader
              eyebrow="|| Aapli Wadi ||"
              title="Amberkarwadi"
              titleMr="आंबेकरवाडी"
              subtitle="Nestled in the serene Konkan coast of Gavade Ambere Amberkarwadi, Ratnagiri is a village whose soul is woven with devotion, heritage and community spirit."
            />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mt-6">
            {/* Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              <div className="relative border-2 border-gold rounded-sm p-2 bg-cream-dk">
                <CornerAccents />
                <div className="border border-saffron-lt/50 rounded-sm overflow-hidden relative">
                  <img
                    src={villageImage}
                    alt="Amberkarwadi Village"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-[360px] object-cover block"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-dark/50 to-transparent" />
                  {/* Population badge */}
                  <div className="absolute bottom-4 left-4 bg-maroon/90 backdrop-blur-sm border border-gold/40 px-4 py-2 rounded-sm flex items-center gap-3">
                    <Users size={18} className="text-gold-lt shrink-0" />
                    <div>
                      <p className="font-heading text-[0.6rem] tracking-widest uppercase text-gold/70">Village Population</p>
                      <p className="font-display text-xl font-bold text-gold-lt leading-tight">2,500+</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center font-body italic text-[0.9rem] text-ink-light tracking-wide">
                आंबेकरवाडी — खारवीवाडा, रत्नागिरी
              </p>
            </motion.div>

            {/* Content */}
            <motion.div className="space-y-7" {...fadeUp}>
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="h-px w-8 bg-saffron flex-shrink-0" />
                  <span className="font-heading text-xs tracking-[0.28em] uppercase text-saffron">Our Heritage</span>
                </div>
                <p className="font-body text-ink-mid leading-relaxed text-lg mb-4">
                  Amberkarwadi, part of the Gavade Ambere village cluster, is more than a location — it is a sanctuary of peace. Known for its deep-rooted cultural unity, the village stands as a testament to the living tradition of Varkari spirituality.
                </p>
                <p className="font-body text-ink-mid leading-relaxed">
                  Every year, thousands of pilgrims flock here during <span className="font-semibold text-maroon">Ashadhi & Kartiki Ekadashi</span>, converging in a vibrant celebration of faith, music, and community.
                </p>
              </div>

              {/* Quote block */}
              <div className="relative bg-maroon-dk/5 border-l-4 border-gold px-6 py-5 rounded-sm">
                <div className="absolute -top-3 -left-2 text-gold font-display text-4xl leading-none opacity-40">"</div>
                <p className="font-marathi text-ink-mid text-lg leading-relaxed italic">
                  "गावाचा जीव म्हणजे मंदिर, मंदिराचा जीव म्हणजे भक्ती."
                </p>
                <p className="font-body text-sm text-ink-light mt-2 italic">
                  "The soul of the village is the temple; the soul of the temple is devotion."
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "50+", label: "Years of\nDevotion" },
                  { value: "1", label: "Grand Annual\nFestival" },
                  { value: "24h", label: "Temple\nOpen" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="bg-cream border border-gold/30 border-t-2 border-t-saffron p-4 text-center rounded-sm"
                  >
                    <div className="font-display text-2xl font-bold text-maroon leading-tight">{value}</div>
                    <div className="font-heading text-[0.62rem] tracking-wide uppercase text-ink-light mt-1 leading-tight whitespace-pre-line">{label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4 pt-1">
                <Link
                  to="/contact"
                  className="group flex items-center gap-2.5 bg-gradient-to-br from-maroon to-maroon-lt rounded-sm px-8 py-3.5 font-heading text-[0.85rem] font-semibold tracking-widest text-gold-lt uppercase shadow-[0_4px_20px_rgba(107,26,26,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(107,26,26,0.5)]"
                >
                  Visit Us
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/events"
                  className="flex items-center gap-2 border border-maroon/50 rounded-sm px-8 py-3.5 font-heading text-[0.85rem] font-semibold tracking-widest text-maroon uppercase transition-all duration-200 hover:bg-maroon/5 hover:-translate-y-0.5"
                >
                  <CalendarDays size={15} />
                  Festivals
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon via-gold via-saffron to-maroon" />
      </section>

      {/* ══ FOOTER STRIP ══ */}
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
};

export default About;
