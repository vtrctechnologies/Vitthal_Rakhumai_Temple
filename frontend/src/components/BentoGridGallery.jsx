import React, { memo, useState, useEffect } from "react";
import { ZoomIn, MapPin, Calendar, Music, Camera } from "lucide-react";
import { galleryAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { Loader2 } from "lucide-react";

const BentoGridGallery = memo(() => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  // Fetch unique years and latest images
  useEffect(() => {
    const initGallery = async () => {
      try {
        setLoading(true);
        const [imagesResponse] = await Promise.all([
          galleryAPI.getImages({ limit: 100 })
        ]);

        if (imagesResponse?.status === "success") {
          const data = imagesResponse.data || [];
          setImages(data);

          const years = [...new Set(data.map(img => img.year))].filter(Boolean).sort((a, b) => b - a);
          setAvailableYears(years);
          if (years.length > 0 && !years.includes(activeYear)) {
            setActiveYear(years[0]);
          }
        }
      } catch (err) {
        console.error("Error initializing gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    initGallery();
  }, []);

  const filteredImages = images.filter(img => img.year === activeYear).slice(0, 7);

  const getThumbnailUrl = (url) => {
    if (!url) return null;
    if (url.includes('cloudinary.com') && (url.includes('/video/upload/') || url.match(/\.(mp4|mov|avi|mkv|webm)$/i))) {
      return url.replace(/\/video\/upload\/(v\d+\/)?/, '/video/upload/so_auto,f_auto,q_auto/').replace(/\.[^.]+$/, '.jpg');
    }
    return url;
  };

  // Create gallery items from fetched images or use fallback
  const galleryItems =
    filteredImages.length > 0
      ? [
        // --- COLUMN 1 (Left Stack) ---
        {
          id: filteredImages[0]?._id || 1,
          type: "tall",
          className: "lg:col-span-2 lg:row-span-1 lg:col-start-1 lg:row-start-1 h-48 lg:h-auto",
          image: filteredImages[0]?.imageUrl,
          resourceType: filteredImages[0]?.resourceType,
          title: filteredImages[0]?.title || "Temple Image",
          subtitle: filteredImages[0]?.category?.name || "Gallery",
        },
        {
          id: filteredImages[1]?._id || 2,
          type: "tall",
          className: "lg:col-span-2 lg:row-span-1 lg:col-start-1 lg:row-start-2 h-48 lg:h-auto",
          image: filteredImages[1]?.imageUrl,
          resourceType: filteredImages[1]?.resourceType,
          title: filteredImages[1]?.title || "Temple Image",
          subtitle: filteredImages[1]?.category?.name || "Gallery",
        },

        // --- COLUMN 2 (Left Tall) ---
        {
          id: filteredImages[2]?._id || 3,
          type: "tall",
          className: "lg:col-span-2 lg:row-span-2 lg:col-start-3 lg:row-start-1 h-64 lg:h-auto",
          image: filteredImages[2]?.imageUrl,
          resourceType: filteredImages[2]?.resourceType,
          title: filteredImages[2]?.title || "Temple Image",
          subtitle: filteredImages[2]?.category?.name || "Gallery",
        },

        // --- COLUMN 3 (Center Featured) ---
        {
          id: filteredImages[3]?._id || 4,
          type: "featured",
          className: "lg:col-span-4 lg:row-span-2 lg:col-start-5 lg:row-start-1 h-80 lg:h-auto",
          image: filteredImages[3]?.imageUrl,
          resourceType: filteredImages[3]?.resourceType,
          title: filteredImages[3]?.title || "Shree Vitthal Rakhumai",
          description: filteredImages[3]?.description || "Witnessing the vibrant colors, thundering drums, and shared devotion of the annual gathering.",
          location: "Amberkarwadi",
          event: `${filteredImages[3]?.category?.name || 'Festival'} ${activeYear}`,
        },

        // --- COLUMN 4 (Right Tall) ---
        {
          id: filteredImages[4]?._id || 5,
          type: "tall",
          className: "lg:col-span-2 lg:row-span-2 lg:col-start-9 lg:row-start-1 h-64 lg:h-auto",
          image: filteredImages[4]?.imageUrl,
          resourceType: filteredImages[4]?.resourceType,
          title: filteredImages[4]?.title || "Temple Image",
          subtitle: filteredImages[4]?.category?.name || "Gallery",
        },

        // --- COLUMN 5 (Right Stack) ---
        {
          id: filteredImages[5]?._id || 6,
          type: "tall",
          className: "lg:col-span-2 lg:row-span-1 lg:col-start-11 lg:row-start-1 h-48 lg:h-auto",
          image: filteredImages[5]?.imageUrl,
          resourceType: filteredImages[5]?.resourceType,
          title: filteredImages[5]?.title || "Temple Image",
          subtitle: filteredImages[5]?.category?.name || "Gallery",
        },
        {
          id: filteredImages[6]?._id || 7,
          type: "tall",
          className: "lg:col-span-2 lg:row-span-1 lg:col-start-11 lg:row-start-2 h-48 lg:h-auto",
          image: filteredImages[6]?.imageUrl,
          resourceType: filteredImages[6]?.resourceType,
          title: filteredImages[6]?.title || "Temple Image",
          subtitle: filteredImages[6]?.category?.name || "Gallery",
        },
      ]
      : [];

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

            {/* Year Selector */}
            {availableYears.length > 0 && (
              <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-orange-100">
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setActiveYear(year)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeYear === year
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-4 h-auto lg:h-[600px]">
            {loading ? (
              <div className="col-span-12 flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : galleryItems.length > 0 ? (
              galleryItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer bg-gray-800 ${item.className}`}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Media Layer */}
                  {item.image ? (
                    <div className="absolute inset-0 w-full h-full">
                      {(item.resourceType === 'video' || item.image.includes('/video/upload/')) ? (
                        <div className="w-full h-full">
                          <img
                            src={getThumbnailUrl(getImageUrl(item.image))}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hoveredId === item.id ? 'opacity-0' : 'opacity-100'}`}
                            alt={item.title}
                          />
                          {hoveredId === item.id && (
                            <video
                              src={getImageUrl(item.image)}
                              className="absolute inset-0 w-full h-full object-cover scale-110"
                              muted
                              loop
                              autoPlay
                              playsInline
                            />
                          )}
                        </div>
                      ) : (
                        <div
                          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${getImageUrl(item.image)})` }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-300 flex items-center justify-center">
                      <Camera className="text-gray-400" size={48} />
                    </div>
                  )}

                  {/* Content Layer */}
                  <div className="relative h-full w-full">
                    {renderItemContent(item)}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-12 flex items-center justify-center py-20">
                <div className="text-gray-500">No gallery images available</div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
});

BentoGridGallery.displayName = "BentoGridGallery";

export default BentoGridGallery;
