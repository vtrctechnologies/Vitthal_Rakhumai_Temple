import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";

const GalleryLightbox = ({ image, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  // Lock page & html scroll while lightbox is open (prevents mobile/tablet scrollbars)
  useEffect(() => {
    if (!image) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft" && hasPrev) onPrev?.();
      if (e.key === "ArrowRight" && hasNext) onNext?.();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [image, onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!image) return null;

  const rawUrl = image.imageUrl || image.mediaUrl || "";
  const imageUrl = getImageUrl(rawUrl);

  const isVideo =
    rawUrl.match(/\.(mp4|mov|avi|mkv|webm)$/i) ||
    rawUrl.includes("/video/") ||
    (rawUrl.includes("/upload/v") && !rawUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i));

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden bg-ink-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in overscroll-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Close Button - Floating Top Right */}
      <button
        type="button"
        aria-label="Close"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10010] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-black/55 border border-gold/45 text-gold-lt hover:bg-maroon hover:text-white hover:border-gold transition-all cursor-pointer shadow-lg"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={22} />
      </button>

      {/* Desktop Side Navigation Arrows */}
      {hasPrev && (
        <button
          type="button"
          aria-label="Previous image"
          className="fixed left-4 top-1/2 -translate-y-1/2 z-[10010] p-3 text-gold-lt/70 hover:text-gold-lt hover:bg-white/10 rounded-full transition-all hidden md:flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <ChevronLeft size={44} strokeWidth={1.5} />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          aria-label="Next image"
          className="fixed right-4 top-1/2 -translate-y-1/2 z-[10010] p-3 text-gold-lt/70 hover:text-gold-lt hover:bg-white/10 rounded-full transition-all hidden md:flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <ChevronRight size={44} strokeWidth={1.5} />
        </button>
      )}

      {/* Main Content Wrapper - Fits cleanly inside 100dvh without scrolling */}
      <div
        className="relative w-full max-w-5xl max-h-full flex flex-col items-center justify-center px-1 sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Framed Media Container */}
        <div className="relative shadow-2xl shadow-black/80 overflow-hidden rounded-sm border-2 border-gold/60 bg-black/60 flex items-center justify-center max-w-full max-h-[58dvh] sm:max-h-[65dvh] md:max-h-[72dvh]">
          {imageUrl ? (
            isVideo ? (
              <video
                src={imageUrl}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-auto h-auto max-h-[58dvh] sm:max-h-[65dvh] md:max-h-[72dvh] max-w-full object-contain block"
              />
            ) : (
              <img
                src={imageUrl}
                alt={image.title}
                className="w-auto h-auto max-h-[58dvh] sm:max-h-[65dvh] md:max-h-[72dvh] max-w-full object-contain block"
                onError={(e) => {
                  e.target.style.display = "none";
                  const placeholder = e.target.parentElement?.querySelector(".image-placeholder");
                  if (placeholder) {
                    placeholder.style.display = "flex";
                  }
                }}
              />
            )
          ) : null}
          <div
            className="image-placeholder w-full min-w-[260px] min-h-[240px] sm:min-h-[320px] flex items-center justify-center bg-ink-dark/60"
            style={{ display: imageUrl ? "none" : "flex" }}
          >
            <p className="text-gold-lt/60 font-heading italic text-sm">Image not available</p>
          </div>
        </div>

        {/* Info Caption - Compact & Responsive */}
        <div className="mt-4 sm:mt-6 max-w-2xl text-center space-y-2 sm:space-y-3 animate-fade-in-up px-2">
          <div className="flex items-center justify-center gap-3 text-saffron-lt text-[11px] sm:text-xs font-heading font-bold tracking-[0.2em] uppercase">
            <span className="w-6 sm:w-8 h-px bg-saffron/45"></span>
            <span>{image.category?.name || "Uncategorized"}</span>
            <span className="w-6 sm:w-8 h-px bg-saffron/45"></span>
          </div>

          <h2 className="text-lg sm:text-2xl md:text-3xl font-heading font-bold text-cream-dk tracking-tight line-clamp-2">
            {image.title}
          </h2>
        </div>

        {/* Mobile & Tablet Prev/Next Controls */}
        {(hasPrev || hasNext) && (
          <div className="flex md:hidden items-center justify-center gap-4 mt-4">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={onPrev}
              aria-label="Previous image"
              className="flex items-center gap-1.5 px-4 py-2 rounded-sm border border-gold/45 bg-black/50 text-gold-lt text-xs font-heading font-bold uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={onNext}
              aria-label="Next image"
              className="flex items-center gap-1.5 px-4 py-2 rounded-sm border border-gold/45 bg-black/50 text-gold-lt text-xs font-heading font-bold uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default GalleryLightbox;
