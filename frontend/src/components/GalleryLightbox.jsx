import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";

const GalleryLightbox = ({ image, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  if (!image) return null;

  const imageUrl = getImageUrl(image.imageUrl);

  return (
    <div
      className="fixed inset-0 z-1000 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in"
      onClick={onClose}
    >
      {/* Close Button - Floating Top Right */}
      <button
        className="absolute top-6 right-6 z-1020 text-stone-400 hover:text-amber-500 transition-colors p-2 hover:bg-white/5 rounded-full"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      {/* Navigation - Minimalist Arrows */}
      {hasPrev && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-1010 p-4 text-stone-500 hover:text-amber-100 hover:bg-white/5 rounded-full transition-all hidden md:block"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <ChevronLeft size={48} strokeWidth={1} />
        </button>
      )}

      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-1010 p-4 text-stone-500 hover:text-amber-100 hover:bg-white/5 rounded-full transition-all hidden md:block"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <ChevronRight size={48} strokeWidth={1} />
        </button>
      )}

      {/* Main Content Wrapper */}
      <div
        className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Container */}
        <div className="relative group shadow-2xl shadow-black/60 max-h-[70vh] overflow-hidden rounded-lg border border-white/10 bg-white">
          {imageUrl ? (
            image.imageUrl?.match(/\.(mp4|mov|avi|mkv|webm)$/i) || 
            image.imageUrl?.includes("/video/") ||
            image.imageUrl?.includes("/upload/v") && !image.imageUrl?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? (
              <video
                src={imageUrl}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-auto h-auto max-h-[70vh] max-w-full object-contain"
              />
            ) : (
              <img
                src={imageUrl}
                alt={image.title}
                className="w-auto h-auto max-h-[70vh] max-w-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  const placeholder = e.target.parentElement?.querySelector('.image-placeholder');
                  if (placeholder) {
                    placeholder.style.display = "flex";
                  }
                }}
              />
            )
          ) : null}
          <div className="image-placeholder w-full h-full min-h-[400px] flex items-center justify-center bg-stone-800" style={{ display: imageUrl ? "none" : "flex" }}>
            <p className="text-stone-400">Image not available</p>
          </div>

          {/* Subtle gradient for depth */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 rounded-lg"></div>
        </div>

        {/* Info Caption - "Museum Label" Style */}
        <div className="mt-8 max-w-2xl text-center space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 text-amber-500/80 text-xs font-bold tracking-[0.2em] uppercase">
            <span className="w-8 h-px bg-amber-500/50"></span>
            {image.category?.name || "Uncategorized"}
            <span className="w-8 h-px bg-amber-500/50"></span>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif text-stone-100 tracking-tight">
            {image.title}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default GalleryLightbox;

