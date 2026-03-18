import { memo, useCallback } from "react";
import GalleryItem from "./GalleryItem";

const GalleryGrid = memo(({ images, onImageClick }) => {
  const handleClick = useCallback(
    (index) => {
      onImageClick(index);
    },
    [onImageClick]
  );
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-stone-500 text-lg">No images found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[300px] gap-8">
      {images.map((image, index) => (
        <GalleryItem
          key={image._id || image.id}
          image={image}
          index={index}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
});

GalleryGrid.displayName = "GalleryGrid";

export default GalleryGrid;

