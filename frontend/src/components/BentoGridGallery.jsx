import React, { memo, useState, useEffect } from "react";
import { ZoomIn, MapPin, Calendar, Music, Camera } from "lucide-react";
import { galleryAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";

const BentoGridGallery = memo(() => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch images from backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await galleryAPI.getImages();

        let imagesData = [];
        if (
          response &&
          response.status === "success" &&
          Array.isArray(response.data)
        ) {
          imagesData = response.data;
        } else if (Array.isArray(response)) {
          imagesData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          imagesData = response.data;
        }

        // Take first 7 images for the bento grid
        setImages(imagesData.slice(0, 7));
      } catch (err) {
        console.error("Error fetching gallery images:", err);
        // Fallback to empty array, will show placeholder
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Create gallery items from fetched images or use fallback
  const galleryItems =
    images.length > 0
      ? [
          // --- COLUMN 1 (Left Stack) ---
          {
            id: images[0]?._id || 1,
            type: "tall",
            className:
              "lg:col-span-2 lg:row-span-1 lg:col-start-1 lg:row-start-1 h-48 lg:h-auto",
            image: getImageUrl(images[0]?.imageUrl),
            title: images[0]?.title || "Temple Image",
            subtitle: images[0]?.category?.name || "Gallery",
          },
          {
            id: images[1]?._id || 2,
            type: "tall",
            className:
              "lg:col-span-2 lg:row-span-1 lg:col-start-1 lg:row-start-2 h-48 lg:h-auto",
            image: getImageUrl(images[1]?.imageUrl),
            title: images[1]?.title || "Temple Image",
            subtitle: images[1]?.category?.name || "Gallery",
          },

          // --- COLUMN 2 (Left Tall) ---
          {
            id: images[2]?._id || 3,
            type: "tall",
            className:
              "lg:col-span-2 lg:row-span-2 lg:col-start-3 lg:row-start-1 h-64 lg:h-auto",
            image: getImageUrl(images[2]?.imageUrl),
            title: images[2]?.title || "Temple Image",
            subtitle: images[2]?.category?.name || "Gallery",
          },

          // --- COLUMN 3 (Center Featured) ---
          {
            id: images[3]?._id || 4,
            type: "featured",
            className:
              "lg:col-span-4 lg:row-span-2 lg:col-start-5 lg:row-start-1 h-80 lg:h-auto",
            image: getImageUrl(images[3]?.imageUrl),
            title: images[3]?.title || "Shree Vitthal Rakhumai",
            description:
              images[3]?.description ||
              "Witnessing the vibrant colors, thundering drums, and shared devotion of the annual gathering.",
            location: "Amberkarwadi",
            event: "Kartiki Ekadashi Utsav 2025",
          },

          // --- COLUMN 4 (Right Tall) ---
          {
            id: images[4]?._id || 5,
            type: "tall",
            className:
              "lg:col-span-2 lg:row-span-2 lg:col-start-9 lg:row-start-1 h-64 lg:h-auto",
            image: getImageUrl(images[4]?.imageUrl),
            title: images[4]?.title || "Temple Image",
            subtitle: images[4]?.category?.name || "Gallery",
          },

          // --- COLUMN 5 (Right Stack) ---
          {
            id: images[5]?._id || 6,
            type: "tall",
            className:
              "lg:col-span-2 lg:row-span-1 lg:col-start-11 lg:row-start-1 h-48 lg:h-auto",
            image: getImageUrl(images[5]?.imageUrl),
            title: images[5]?.title || "Temple Image",
            subtitle: images[5]?.category?.name || "Gallery",
          },
          {
            id: images[6]?._id || 7,
            type: "tall",
            className:
              "lg:col-span-2 lg:row-span-1 lg:col-start-11 lg:row-start-2 h-48 lg:h-auto",
            image: getImageUrl(images[6]?.imageUrl),
            title: images[6]?.title || "Temple Image",
            subtitle: images[6]?.category?.name || "Gallery",
          },
        ]
      : [];

  const renderItemContent = (item) => {
    switch (item.type) {
      case "featured":
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-90 lg:opacity-70 transition-opacity duration-300 group-hover:opacity-90"></div>
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
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300"></div>
            <div className="absolute bottom-0 left-0 p-4 lg:p-6 w-full bg-gradient-to-t from-black/90 to-transparent">
              <h3 className="text-white font-bold text-lg group-hover:text-orange-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-gray-300 mt-1">{item.subtitle}</p>
            </div>
          </>
        );
      case "caption":
        return (
          <div className="absolute bottom-0 w-full bg-black/90 p-3 lg:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <p className="text-white text-center text-sm font-medium">
              {item.title}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className=" bg-gray-50 font-sans selection:bg-orange-200">
      <section className="py-16 px-4 bg-orange-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="uppercase tracking-widest text-orange-600 font-semibold text-sm">
              Gallery Glimpse
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mt-2 mb-3">
              Captured Moments
            </h2>
            <div className="h-1.5 w-24 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          {/* GRID STRUCTURE FIX: 
              - Added 'lg:h-[600px]' to force a fixed height on desktop so rows don't collapse.
              - Added 'lg:grid-rows-2' to explicitly divide that height into 2 equal rows.
              - Items use 'relative' and images use 'absolute inset-0' to fill the shape perfectly.
          */}
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-4 h-auto lg:h-[600px]">
            {loading ? (
              <div className="col-span-12 flex items-center justify-center py-20">
                <div className="text-orange-600 animate-pulse">
                  Loading gallery...
                </div>
              </div>
            ) : galleryItems.length > 0 ? (
              galleryItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer bg-gray-800 ${item.className}`}
                >
                  {/* Use background-image on an absolute div to display images reliably */}
                  {item.image ? (
                    <div
                      className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${item.image})`,
                        transform: "translateZ(0)",
                        willChange: "transform",
                      }}
                      role="img"
                      aria-label={item.title || "Gallery Image"}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.willChange = "transform";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.willChange = "auto";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-300 flex items-center justify-center">
                      <Camera className="text-gray-400" size={48} />
                    </div>
                  )}

                  {/* Content Layer */}
                  <div className="relative h-full w-full pointer-events-none">
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
