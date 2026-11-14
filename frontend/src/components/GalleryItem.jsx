import { memo, useState } from "react";
import { Sparkles } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";

/* Corner accents for sacred temple artwork framing */
const CornerAccents = () => (
  <>
    <span className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-4 border-l-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-4 border-r-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-4 border-l-4 border-saffron z-30 pointer-events-none" />
    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-4 border-r-4 border-saffron z-30 pointer-events-none" />
  </>
);

const GalleryItem = memo(({ image, index, onClick }) => {
  const isTall = image.size === "tall";
  const isWide = image.size === "wide";
  const spanClass = isTall
    ? "row-span-2"
    : isWide
      ? "col-span-1 sm:col-span-2"
      : "col-span-1";

  const [isHovered, setIsHovered] = useState(false);

  const rawUrl = image.imageUrl || image.mediaUrl || "";
  // Use utility function for image URL
  const imageUrl = getImageUrl(rawUrl);

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
    rawUrl.match(/\.(mp4|mov|avi|mkv|webm)$/i) ||
    rawUrl.includes("/video/");

  return (
    <div
      className={`group relative ${spanClass} bg-cream-dk border-2 border-gold rounded-sm p-1.5 sm:p-2 shadow-sm hover:shadow-xl cursor-pointer transition-shadow duration-300`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 4 Saffron Corner Brackets */}
      <CornerAccents />

      {/* Inner Framed Media Container */}
      <div className="w-full h-full border border-saffron-lt/60 rounded-sm overflow-hidden relative bg-maroon-dk">
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
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"></div>

        {/* Content */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 z-20 pointer-events-none"
          style={{ transform: "translateZ(0)" }}
        >
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={11} className="text-amber-400 shrink-0" />
              <span className="text-amber-300 text-[10.5px] font-heading font-bold uppercase tracking-wider">
                {image.category?.name || "Uncategorized"}
              </span>
            </div>
            <h3 className="text-white font-heading text-base sm:text-lg font-bold leading-snug drop-shadow-md group-hover:text-amber-200 transition-colors line-clamp-2">
              {image.title}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
});

GalleryItem.displayName = "GalleryItem";

export default GalleryItem;
