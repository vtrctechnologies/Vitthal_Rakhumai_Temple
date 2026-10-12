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
      className: "lg:col-span-2 lg:row-span-1 h-48 lg:h-auto",
      image: HeroImg,
      title: "Temple Morning",
      subtitle: "Divine Atmosphere",
    },
    {
      id: 2,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-1 h-48 lg:h-auto",
      image: templeMain,
      title: "Shree Vitthal",
      subtitle: "Main Sanctum",
    },
    {
      id: 3,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-2 h-64 lg:h-auto",
      image: templeHero,
      title: "Festival Celebration",
      subtitle: "Annual Gathering",
    },
    {
      id: 4,
      type: "featured",
      className: "lg:col-span-4 lg:row-span-2 h-80 lg:h-auto",
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
      className: "lg:col-span-2 lg:row-span-2 h-64 lg:h-auto",
      image: HeroImg,
      title: "Evening Aarti",
      subtitle: "Peaceful Moments",
    },
    {
      id: 6,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-1 h-48 lg:h-auto",
      image: templeMain,
      title: "Temple Entrance",
      subtitle: "Welcoming Devotees",
    },
    {
      id: 7,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-1 h-48 lg:h-auto",
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
            <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-inset ring-[#d4af37]/60 transition-all duration-500 rounded-2xl pointer-events-none" />

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
            <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-inset ring-[#d4af37]/50 transition-all duration-500 rounded-2xl pointer-events-none" />

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
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-3 lg:gap-4 h-auto lg:h-[600px]">
        {/* Row 1: col1(2) + col2-top(2) + featured(4) + col4(2) + col5-top(2) */}
        {/* Row 2: col1(2) + col2-bottom(hidden, merged) + featured continues + col4 continues + col5-bottom(2) */}

        {/* Cell 1 – top-left */}
        {galleryItems.filter((i) => i.id === 1).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className={`relative group overflow-hidden rounded-2xl cursor-pointer ${item.className} lg:col-start-1 lg:row-start-1`}
            style={{
              boxShadow: hoveredId === item.id ? "0 0 0 2px #d4af37, 0 8px 32px rgba(107,26,26,0.25)" : "0 4px 16px rgba(44,26,14,0.18)",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="relative h-full w-full">{renderItemContent(item)}</div>
          </motion.div>
        ))}

        {/* Cell 2 – bottom-left */}
        {galleryItems.filter((i) => i.id === 2).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`relative group overflow-hidden rounded-2xl cursor-pointer ${item.className} lg:col-start-1 lg:row-start-2`}
            style={{
              boxShadow: hoveredId === item.id ? "0 0 0 2px #d4af37, 0 8px 32px rgba(107,26,26,0.25)" : "0 4px 16px rgba(44,26,14,0.18)",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="relative h-full w-full">{renderItemContent(item)}</div>
          </motion.div>
        ))}

        {/* Cell 3 – left tall (2 rows) */}
        {galleryItems.filter((i) => i.id === 3).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className={`relative group overflow-hidden rounded-2xl cursor-pointer ${item.className} lg:col-start-3 lg:row-start-1`}
            style={{
              boxShadow: hoveredId === item.id ? "0 0 0 2px #d4af37, 0 8px 32px rgba(107,26,26,0.25)" : "0 4px 16px rgba(44,26,14,0.18)",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="relative h-full w-full">{renderItemContent(item)}</div>
          </motion.div>
        ))}

        {/* Cell 4 – featured center (2 rows) */}
        {galleryItems.filter((i) => i.id === 4).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`relative group overflow-hidden rounded-2xl cursor-pointer ${item.className} lg:col-start-5 lg:row-start-1`}
            style={{
              boxShadow: hoveredId === item.id ? "0 0 0 2px #d4af37, 0 12px 40px rgba(107,26,26,0.35)" : "0 6px 24px rgba(44,26,14,0.2)",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="relative h-full w-full">{renderItemContent(item)}</div>
          </motion.div>
        ))}

        {/* Cell 5 – right tall (2 rows) */}
        {galleryItems.filter((i) => i.id === 5).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className={`relative group overflow-hidden rounded-2xl cursor-pointer ${item.className} lg:col-start-9 lg:row-start-1`}
            style={{
              boxShadow: hoveredId === item.id ? "0 0 0 2px #d4af37, 0 8px 32px rgba(107,26,26,0.25)" : "0 4px 16px rgba(44,26,14,0.18)",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="relative h-full w-full">{renderItemContent(item)}</div>
          </motion.div>
        ))}

        {/* Cell 6 – top-right */}
        {galleryItems.filter((i) => i.id === 6).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`relative group overflow-hidden rounded-2xl cursor-pointer ${item.className} lg:col-start-11 lg:row-start-1`}
            style={{
              boxShadow: hoveredId === item.id ? "0 0 0 2px #d4af37, 0 8px 32px rgba(107,26,26,0.25)" : "0 4px 16px rgba(44,26,14,0.18)",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="relative h-full w-full">{renderItemContent(item)}</div>
          </motion.div>
        ))}

        {/* Cell 7 – bottom-right */}
        {galleryItems.filter((i) => i.id === 7).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className={`relative group overflow-hidden rounded-2xl cursor-pointer ${item.className} lg:col-start-11 lg:row-start-2`}
            style={{
              boxShadow: hoveredId === item.id ? "0 0 0 2px #d4af37, 0 8px 32px rgba(107,26,26,0.25)" : "0 4px 16px rgba(44,26,14,0.18)",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="relative h-full w-full">{renderItemContent(item)}</div>
          </motion.div>
        ))}
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
          className="group flex items-center gap-2.5 border border-[#d4af37]/70 rounded-md px-8 py-3 font-heading text-sm font-semibold tracking-widest text-[#6b1a1a] uppercase transition-all duration-300 hover:bg-[#d4af37]/15 hover:-translate-y-0.5 hover:border-[#d4af37] hover:shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
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
