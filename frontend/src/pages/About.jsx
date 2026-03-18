import { useInView } from "react-intersection-observer";
import Card from "@/components/base/Card";
import {
  Target,
  Heart,
  Users,
  ChevronRight,
  MapPin,
  Clock,
  BookOpen,
  Sun,
  ArrowRight,
  Flower2, // Added for the new section
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Using a placeholder image since the local asset was causing build errors
const templeHero = "/gallery/Temple3D.png";
const villageImage = "/gallery/village.jpg";

// --- Components ---

import Button from "@/components/base/Button";

const About = () => {
  const [activeTab, setActiveTab] = useState("story");

  // Optimize intersection observers - use rootMargin to trigger earlier and reduce work
  const [ref1, inView1] = useInView({
    triggerOnce: true,
    threshold: 0.05, // Lower threshold for faster trigger
    rootMargin: "50px", // Start loading 50px before element enters viewport
  });
  const [ref2, inView2] = useInView({
    triggerOnce: true,
    threshold: 0.05,
    rootMargin: "50px",
  });
  // eslint-disable-next-line no-unused-vars
  const [ref3, inView3] = useInView({
    triggerOnce: true,
    threshold: 0.05,
    rootMargin: "50px",
  });

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gradient mb-6 animate-fade-in">
            About Our Temple
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
          <p className="text-xl text-muted-foreground">
            A legacy of devotion, spirituality, and community service
          </p>
        </div>
      </section>

      {/* Temple History */}
      <section ref={ref1} className="max-w-7xl mx-auto px-4 pt-20 pb-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Image Grid */}
          <div className="relative order-2 lg:order-1">
            {/* Main Image Frame */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src={templeHero}
                alt="Temple Interior"
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                loading="eager"
                decoding="async"
                fetchpriority="high"
                width="800"
                height="500"
              />

              {/* Floating Info Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-4 rounded-xl border border-orange-100 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                      Location
                    </p>
                    <p className="font-serif text-lg font-bold text-gray-800 flex items-center gap-2">
                      <MapPin size={18} className="text-red-500" />
                      Gavade Ambere Village
                    </p>
                  </div>
                  <div className="h-2 w-px md:h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                      Founded
                    </p>
                    <p className="font-serif text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Clock size={18} className="text-red-500" />
                      50+ Years Ago
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Pattern Dot */}
            <div className="absolute -z-10 top-12 -left-12 grid grid-cols-4 gap-2 opacity-20">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-orange-600 rounded-full"
                ></div>
              ))}
            </div>
          </div>

          {/* Right Column: Text Content */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Navigation Tabs */}
            <div className="flex space-x-2 p-1 bg-gray-100/50 rounded-xl w-fit">
              {["story", "vision"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                    activeTab === tab
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  Our {tab}
                </button>
              ))}
            </div>

            {/* Dynamic Content Area */}
            <div className="min-h-[300px]">
              {activeTab === "story" ? (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl mt-1">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-serif font-bold text-gray-800 mb-3">
                        Temple Story
                      </h2>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        The{" "}
                        <span className="font-semibold text-orange-800">
                          Vithal-Rakhumai Temple
                        </span>{" "}
                        was founded over 50 years ago by devoted villagers
                        driven by unwavering faith.
                      </p>
                      <p className="text-gray-600 leading-relaxed mt-4">
                        What started as a humble gathering spot has blossomed
                        into the spiritual heart of our community. For decades,
                        these hallowed grounds have guided generations toward
                        peace, devotion, and unity, standing tall as a testament
                        to our collective spirit.
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-1 flex items-center gap-2">
                        <Users size={16} /> Community Led
                      </h4>
                      <p className="text-sm text-gray-600">
                        Maintained entirely by local villagers.
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-1 flex items-center gap-2">
                        <Heart size={16} /> Spiritual Hub
                      </h4>
                      <p className="text-sm text-gray-600">
                        Daily aartis and festive celebrations.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl mt-1">
                      <Target size={24} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-serif font-bold text-gray-800 mb-3">
                        Our Vision
                      </h2>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        We are currently constructing a{" "}
                        <span className="font-semibold text-orange-800">
                          New Temple
                        </span>{" "}
                        to serve our growing family of devotees.
                      </p>
                      <p className="text-gray-600 leading-relaxed mt-4">
                        Our goal is not just to build walls, but to preserve our
                        cultural and spiritual heritage for the future. The new
                        structure will allow us to host larger gatherings,
                        educational programs, and community feasts, ensuring the
                        light of devotion burns brighter than ever.
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar Simulation */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mt-4">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-gray-700">
                        Construction Goal
                      </span>
                      <span className="text-sm font-bold text-orange-600">
                        In Progress
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full w-3/5 animate-pulse"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Join us in building this legacy.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button onClick={() => window.location.href="/donation"} variant="primary" rounded="full">
                Donate Now
                <ChevronRight size={18} />
              </Button>
              <Button onClick={() => window.location.href="/gallery"} variant="outline" rounded="full">
                View Gallery
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lord Vitthal & Rakhumai - NEW DARK THEME DESIGN */}
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
          className={`container mx-auto max-w-6xl relative z-10 transition-opacity duration-1000 ${
            inView2 ? "opacity-100" : "opacity-0"
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
                Standing eternally on a brick, hands on hips, He embodies
                infinite patience. As the sustainer of the universe, Vithoba
                represents the accessible divine—waiting for every devotee with
                unconditional love.
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
                The essence of devotion and the divine consort. Rakhumai
                (Rukmini) completes the cosmic cycle. She is the silent
                strength, the nurturing mother who guides the soul towards
                ultimate liberation through Bhakti.
              </p>
              <div className="inline-block border-b border-red-500/30 pb-1 text-sm text-red-400 tracking-wider font-semibold">
                THE DEVOTION
              </div>
            </div>
          </div>

          {/* Bottom quote */}
          <div className="mt-20 text-center max-w-2xl mx-auto">
            <p className="font-serif italic text-amber-200/60 text-lg">
              "Together they stand, not as two, but as one eternal truth of Love
              and Existence."
            </p>
          </div>
        </div>
      </section>

      {/* ABC Village */}
      <section className="relative bg-[#FFF8F0] py-20 px-6 md:px-12 overflow-hidden font-sans">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side: Image Composition */}
            <div className="relative group">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                {/* Placeholder for Village Image */}
                <div className="w-full h-96 bg-stone-300 flex items-center justify-center relative">
                  <img
                    src={villageImage}
                    alt="Village Temple"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              </div>

              {/* Decorative Frame behind image */}
              <div className="absolute -bottom-6 -left-6 w-full h-full border-2 border-orange-400/30 rounded-2xl -z-0 hidden md:block transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>

              {/* Floating Stats Badge */}
              <div className="absolute -right-4 top-10 z-20 bg-white p-4 rounded-xl shadow-lg border-l-4 border-orange-500 animate-fade-in-up hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                      Population
                    </p>
                    <p className="text-lg font-bold text-[#5e1313]">2,500+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="space-y-8 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-orange-500"></span>
                  <span className="text-orange-600 font-bold uppercase tracking-widest text-xs">
                    Our Heritage
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-[#5e1313] font-serif leading-tight mb-6">
                  About <span className="text-orange-600">ABC Village</span>
                </h2>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Nestled in the heart of Maharashtra, ABC Village is more than
                  just a location—it is a sanctuary of peace. Known for its
                  deep-rooted cultural unity, our village stands as a testament
                  to tradition.
                </p>

                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-orange-100">
                  <p className="text-[#5e1313] italic font-serif text-lg leading-relaxed">
                    "The village celebrates Kartiki Ekadashi with great devotion
                    every year, drawing pilgrims and families together in a
                    vibrant display of faith."
                  </p>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Button onClick={() => window.location.href="/contact"} variant="primary" rounded="full" className="px-8 py-3">
                  Visit Us <ArrowRight className="w-4 h-4" />
                </Button>
                <Button onClick={() => window.location.href="/about"} variant="outline" rounded="full" className="px-8 py-3">
                  Our History
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
