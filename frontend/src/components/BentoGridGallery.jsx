import React, { memo, useState } from "react";
import { ZoomIn, MapPin, Calendar, Camera } from "lucide-react";
import HeroImg from "../assets/HeroImg.jpeg";
import templeMain from "../assets/temple-main.png";
import HeroBg from "../assets/HeroBg.jpeg";
import templeHero from "../assets/temple-hero.jpg";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BentoGridGallery = memo(() => {
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  const galleryItems = [
    {
      id: 1,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-1 lg:col-start-1 lg:row-start-1 h-48 lg:h-auto",
      image: HeroImg,
      title: "Temple Morning",
      subtitle: "Divine Atmosphere",
    },
    {
      id: 2,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-1 lg:col-start-1 lg:row-start-2 h-48 lg:h-auto",
      image: templeMain,
      title: "Shree Vitthal",
      subtitle: "Main Sanctum",
    },
    {
      id: 3,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-2 lg:col-start-3 lg:row-start-1 h-64 lg:h-auto",
      image: templeHero,
      title: "Festival Celebration",
      subtitle: "Annual Gathering",
    },
    {
      id: 4,
      type: "featured",
      className: "lg:col-span-4 lg:row-span-2 lg:col-start-5 lg:row-start-1 h-80 lg:h-auto",
      image: HeroBg,
      title: "Shree Vitthal Rakhumai",
      description:
        "Witnessing the vibrant colors, thundering drums, and shared devotion of the annual gathering at Amberkarwadi.",
      location: "Amberkarwadi",
      event: "Kartiki Ekadashi",
    },
    {
      id: 5,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-2 lg:col-start-9 lg:row-start-1 h-64 lg:h-auto",
      image: HeroImg,
      title: "Evening Aarti",
      subtitle: "Peaceful Moments",
    },
    {
      id: 6,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-1 lg:col-start-11 lg:row-start-1 h-48 lg:h-auto",
      image: templeMain,
      title: "Temple Entrance",
      subtitle: "Welcoming Devotees",
    },
    {
      id: 7,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-1 lg:col-start-11 lg:row-start-2 h-48 lg:h-auto",
      image: templeHero,
      title: "Cultural Program",
      subtitle: "Community Unity",
    },
  ];

  const renderItemContent = (item) => {
    switch (item.type) {
      case "featured":
        return (
          <>
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a0e]/90 via-[#6b1a1a]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Gold border glow on hover */}
            <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-inset ring-[#d4af37]/60 transition-all duration-500 rounded-sm pointer-events-none" />

            {/* Featured badge + content */}
            <div className="absolute bottom-0 left-0 p-6 lg:p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <span
                className="text-[10px] lg:text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block uppercase tracking-wider"
                style={{
                  background:
                    "linear-gradient(135deg, #d4af37 0%, #e8650a 100%)",
                  color: "#2c1a0e",
                }}
              >
                ✦ Featured
              </span>
              <h3 className="font-heading text-white text-xl lg:text-3xl font-bold leading-tight drop-shadow-lg">
                {item.title}
              </h3>
              <div className="flex items-center text-[#f0d060] text-xs lg:text-sm mt-2 lg:mt-3 space-x-4 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="shrink-0" />
                  {item.event}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="shrink-0" />
                  {item.location}
                </span>
              </div>
              <p className="text-[#f5e6c8]/80 text-xs lg:text-sm mt-3 line-clamp-2 max-w-md hidden lg:block font-body">
                {item.description}
              </p>
            </div>

            {/* Zoom icon */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(212,175,55,0.25)", backdropFilter: "blur(6px)", border: "1px solid rgba(212,175,55,0.5)" }}
              >
                <ZoomIn size={16} className="text-[#f0d060]" />
              </div>
            </div>
          </>
        );

      case "tall":
      default:
        return (
          <>
            {/* Bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a0e]/80 via-transparent to-[#6b1a1a]/10 group-hover:from-[#2c1a0e]/70 transition-all duration-300" />

            {/* Gold border glow on hover */}
            <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-inset ring-[#d4af37]/50 transition-all duration-500 rounded-sm pointer-events-none" />

            {/* Zoom icon */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(212,175,55,0.2)", backdropFilter: "blur(6px)", border: "1px solid rgba(212,175,55,0.45)" }}
              >
                <ZoomIn size={14} className="text-[#f0d060]" />
              </div>
            </div>

            {/* Text */}
            <div className="absolute bottom-0 left-0 p-4 lg:p-5 w-full">
              <h3
                className="font-heading text-white font-bold text-sm lg:text-base group-hover:text-[#f0d060] transition-colors duration-300 drop-shadow"
              >
                {item.title}
              </h3>
              <p className="text-[#f5e6c8]/70 text-xs mt-0.5 font-body italic">
                {item.subtitle}
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2 gap-3 lg:gap-4 h-auto lg:h-[600px]">
        {galleryItems.map((item, idx) => {
          const isFeatured = item.type === "featured";
          return (
            <motion.div
              key={item.id}
              initial={isFeatured ? { opacity: 0, scale: 0.97 } : { opacity: 0, y: 20 }}
              whileInView={isFeatured ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: isFeatured ? 0.6 : 0.5, delay: 0.05 * (idx + 1) }}
              className={`relative group border-2 border-gold rounded-sm p-1.5 bg-cream-dk cursor-pointer ${item.className}`}
              style={{
                boxShadow:
                  hoveredId === item.id
                    ? isFeatured
                      ? "0 0 0 1px #d4af37, 0 12px 40px rgba(107,26,26,0.35)"
                      : "0 0 0 1px #d4af37, 0 8px 32px rgba(107,26,26,0.25)"
                    : isFeatured
                      ? "0 6px 24px rgba(44,26,14,0.2)"
                      : "0 4px 16px rgba(44,26,14,0.18)",
                transition: "box-shadow 0.3s ease",
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Sacred 4-Corner Saffron Frame Brackets */}
              <span className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-4 border-l-4 border-saffron z-30 pointer-events-none" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-4 border-r-4 border-saffron z-30 pointer-events-none" />
              <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-4 border-l-4 border-saffron z-30 pointer-events-none" />
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-4 border-r-4 border-saffron z-30 pointer-events-none" />

              {/* Inner Framed Image Container */}
              <div className="relative w-full h-full border border-saffron-lt/60 rounded-sm overflow-hidden">
                <div
                  className={`absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 ${
                    isFeatured ? "group-hover:scale-105" : "group-hover:scale-110"
                  }`}
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="relative h-full w-full">{renderItemContent(item)}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View Full Gallery CTA */}
      <motion.div
        className="flex justify-center mt-10"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button
          onClick={() => navigate("/gallery")}
          className="group cursor-pointer flex items-center gap-2.5 border border-[#d4af37]/70 rounded-md px-8 py-3 font-heading text-sm font-semibold tracking-widest text-[#6b1a1a] uppercase transition-all duration-300 hover:bg-[#d4af37]/15 hover:-translate-y-0.5 hover:border-[#d4af37] hover:shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
          style={{ background: "rgba(254,246,228,0.6)" }}
        >
          <Camera size={16} className="group-hover:text-[#e8650a] transition-colors duration-200" />
          View Full Gallery
        </button>
      </motion.div>
    </div>
  );
});

BentoGridGallery.displayName = "BentoGridGallery";

export default BentoGridGallery;
