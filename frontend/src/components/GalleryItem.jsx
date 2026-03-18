import { memo } from "react";
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

  // Use utility function for image URL
  const imageUrl = getImageUrl(image.imageUrl);

  return (
    <div
      className={`group relative ${spanClass} ${getShapeClass(
        index,
        image.size
      )} overflow-hidden bg-black shadow-xl cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/20`}
      onClick={onClick}
    >
      {/* Inner Border Frame (The "Gold" Reveal) */}
      <div
        className={`absolute inset-3 border border-amber-400/0 group-hover:border-amber-400/80 z-20 transition-all duration-700 ${getShapeClass(
          index,
          image.size
        )} pointer-events-none scale-95 group-hover:scale-100`}
      ></div>

      {/* Image */}
      <div className="w-full h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-stone-200 animate-pulse -z-10"></div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={image.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ transform: "translateZ(0)" }}
            loading="lazy"
            decoding="async"
            fetchpriority={index < 6 ? "high" : "low"}
            onError={(e) => {
              e.target.style.display = "none";
              const placeholder =
                e.target.parentElement?.querySelector(".image-placeholder");
              if (placeholder) {
                placeholder.style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className="image-placeholder absolute inset-0 w-full h-full flex items-center justify-center bg-stone-200"
          style={{ display: imageUrl ? "none" : "flex" }}
        >
          <Sparkles className="w-12 h-12 text-stone-400" />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
      </div>

      {/* Content - Always visible but moves */}
      <div
        className="absolute bottom-0 left-0 right-0 p-6 z-30 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              {image.category?.name || "Uncategorized"}
            </span>
          </div>
          <h3 className="text-white font-serif text-2xl leading-none mb-2 drop-shadow-md group-hover:text-amber-100 transition-colors">
            {image.title}
          </h3>
          <div className="h-0.5 w-0 group-hover:w-12 bg-amber-500 transition-all duration-500"></div>
        </div>
      </div>
    </div>
  );
});

GalleryItem.displayName = "GalleryItem";

export default GalleryItem;
