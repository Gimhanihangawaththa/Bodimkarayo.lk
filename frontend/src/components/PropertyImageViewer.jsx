import { useEffect, useState } from "react";

export function PropertyImageViewer({ images = [], title = "Property image" }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  if (!images.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        No images available
      </div>
    );
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={images[activeIndex]}
          alt={`${title} ${activeIndex + 1}`}
          className="h-[420px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900">
          {activeIndex + 1} / {images.length}
        </div>
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900 shadow-lg transition hover:bg-white"
          aria-label="Previous image"
        >
          &#8592;
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900 shadow-lg transition hover:bg-white"
          aria-label="Next image"
        >
          &#8594;
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((img, index) => (
          <button
            type="button"
            key={img}
            onClick={() => setActiveIndex(index)}
            className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
              index === activeIndex ? "border-blue-600" : "border-transparent"
            }`}
          >
            <img src={img} alt={`${title} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
            {index === activeIndex && (
              <span className="absolute inset-0 rounded-xl ring-2 ring-blue-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
