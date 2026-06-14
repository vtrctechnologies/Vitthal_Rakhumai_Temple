import { memo } from "react";
import React from "react";
import { Sparkles } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";

const getShapeClass = (index, size) => {
  if (size === "tall") return "rounded-t-[8rem] rounded-b-xl";
  if (size === "wide")
    return "rounded-tl-[4rem] rounded-br-[4rem] rounded-tr-xl rounded-bl-xl";
  return index % 2 === 0 ? "rounded-xl" : "rounded-[2rem]";
};

const GalleryItem = memo(({ image, index, onClick }) => {
  const isTall = image.size === "tall";
  const isWide = image.size === "wide";
  const spanClass = isTall
    ? "row-span-2"
    : isWide
      ? "col-span-1 sm:col-span-2"
      : "col-span-1";

  const [isHovered, setIsHovered] = React.useState(false);

  // Use utility function for image URL
  const imageUrl = getImageUrl(image.imageUrl);

  // Construct video thumbnail URL (Cloudinary specific optimization)
  const getThumbnailUrl = (url) => {
    if (!url) return null;
    if (url.includes('cloudinary.com') && (url.includes('/video/upload/') || url.match(/\.(mp4|mov|avi|mkv|webm)$/i))) {
      // Replace extension with .jpg and add transformation for auto-thumbnail
      return url.replace(/\/video\/upload\/(v\d+\/)?/, '/video/upload/so_auto,f_auto,q_auto/').replace(/\.[^.]+$/, '.jpg');
    }
    return url;
  };

  const isVideo = image.resourceType === 'video' ||
    image.imageUrl?.match(/\.(mp4|mov|avi|mkv|webm)$/i) ||
    image.imageUrl?.includes("/video/");

  return (
    <div
      className={`group relative ${spanClass} ${getShapeClass(
        index,
        image.size
      )} overflow-hidden bg-black shadow-xl cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold-dk/10`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inner Border Frame (The "Gold" Reveal) */}
      <div
        className={`absolute inset-3 border border-gold/0 group-hover:border-gold/80 z-20 transition-all duration-700 ${getShapeClass(
          index,
          image.size
        )} pointer-events-none scale-95 group-hover:scale-100`}
      ></div>

      {/* Media Content */}
      <div className="w-full h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-cream-dk animate-pulse -z-10"></div>
        {imageUrl ? (
          isVideo ? (
            <div className="w-full h-full relative">
              {/* Thumbnail - Always present or replaced by video on hover */}
              <img
                src={getThumbnailUrl(imageUrl)}
                alt={image.title}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                loading="lazy"
              />
              {/* Video - Rendered/Played only on hover for performance */}
              {isHovered && (
                <video
                  src={imageUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              )}
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={image.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              style={{ transform: "translateZ(0)" }}
              loading="lazy"
              decoding="async"
              fetchpriority={index < 6 ? "high" : "low"}
            />
          )
        ) : null}
        <div
          className="image-placeholder absolute inset-0 w-full h-full flex items-center justify-center bg-cream-dk"
          style={{ display: imageUrl ? "none" : "flex" }}
        >
          <Sparkles className="w-12 h-12 text-gold" />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-dark/95 via-ink-dark/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>
      </div>

      {/* Content - Always visible but moves */}
      <div
        className="absolute bottom-0 left-0 right-0 p-6 z-30 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2 transition-opacity duration-300">
            <Sparkles size={12} className="text-saffron-lt" />
            <span className="text-saffron-lt text-xs font-heading font-bold uppercase tracking-widest">
              {image.category?.name || "Uncategorized"}
            </span>
          </div>
          <h3 className="text-white font-heading text-2xl leading-none mb-2 drop-shadow-md group-hover:text-gold-lt transition-colors">
            {image.title}
          </h3>
          <div className="h-0.5 w-0 group-hover:w-12 bg-saffron transition-all duration-500"></div>
        </div>
      </div>
    </div>
  );
});

GalleryItem.displayName = "GalleryItem";

export default GalleryItem;
