import React, { memo, useState } from "react";
import { ZoomIn, MapPin, Calendar, Music, Camera } from "lucide-react";
import HeroImg from "../assets/HeroImg.jpeg";
import templeMain from "../assets/temple-main.png";
import HeroBg from "../assets/HeroBg.jpeg";
import templeHero from "../assets/temple-hero.jpg";

const BentoGridGallery = memo(() => {
  const [hoveredId, setHoveredId] = useState(null);

  // Static images for the gallery
  const galleryItems = [
    // --- COLUMN 1 (Left Stack) ---
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

    // --- COLUMN 2 (Left Tall) ---
    {
      id: 3,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-2 lg:col-start-3 lg:row-start-1 h-64 lg:h-auto",
      image: templeHero,
      title: "Festival Celebration",
      subtitle: "Annual Gathering",
    },

    // --- COLUMN 3 (Center Featured) ---
    {
      id: 4,
      type: "featured",
      className: "lg:col-span-4 lg:row-span-2 lg:col-start-5 lg:row-start-1 h-80 lg:h-auto",
      image: HeroBg,
      title: "Shree Vitthal Rakhumai",
      description: "Witnessing the vibrant colors, thundering drums, and shared devotion of the annual gathering at Amberkarwadi.",
      location: "Amberkarwadi",
      event: "Kartiki Ekadashi",
    },

    // --- COLUMN 4 (Right Tall) ---
    {
      id: 5,
      type: "tall",
      className: "lg:col-span-2 lg:row-span-2 lg:col-start-9 lg:row-start-1 h-64 lg:h-auto",
      image: HeroImg,
      title: "Evening Aarti",
      subtitle: "Peaceful Moments",
    },

    // --- COLUMN 5 (Right Stack) ---
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-90 lg:opacity-70 transition-opacity duration-300 group-hover:opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 lg:p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <span className="bg-orange-600 text-white text-[10px] lg:text-xs font-bold px-2 py-1 rounded mb-3 inline-block uppercase tracking-wider">
                Featured
              </span>
              <h3 className="text-white text-xl lg:text-3xl font-bold leading-tight">
                {item.title}
              </h3>
              <div className="flex items-center text-orange-200 text-xs lg:text-sm mt-2 lg:mt-3 space-x-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" /> {item.event}
                </span>
                <span className="flex items-center">
                  <MapPin size={14} className="mr-1" /> {item.location}
                </span>
              </div>
              <p className="text-gray-300 text-xs lg:text-sm mt-2 line-clamp-2 lg:line-clamp-none max-w-md hidden lg:block">
                {item.description}
              </p>
            </div>
          </>
        );
      case "tall":
        return (
          <>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
            <div className="absolute bottom-0 left-0 p-4 lg:p-6 w-full bg-gradient-to-t from-black/90 to-transparent">
              <h3 className="text-white font-bold text-lg group-hover:text-orange-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-gray-300 mt-1">{item.subtitle}</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className=" bg-gray-50 font-sans selection:bg-orange-200">
      <section className="py-16 px-4 bg-orange-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 animate-fade-in-up">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <span className="uppercase tracking-widest text-orange-600 font-semibold text-sm">
                Gallery Glimpse
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mt-2">
                Captured Moments
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-4 h-auto lg:h-[600px]">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className={`relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer bg-gray-800 ${item.className}`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Media Layer */}
                <div className="absolute inset-0 w-full h-full">
                  <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                </div>

                {/* Content Layer */}
                <div className="relative h-full w-full">
                  {renderItemContent(item)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
});

BentoGridGallery.displayName = "BentoGridGallery";

export default BentoGridGallery;
