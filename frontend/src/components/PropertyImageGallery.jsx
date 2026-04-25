
export function PropertyImageGallery({ images }) {
  console.log("Gallery images:", images); // DEBUG

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {/* LEFT BIG IMAGE */}
      <div className="md:col-span-2">
        <img
          src={images[0]}
          alt="Main property"
          className="h-[460px] w-full rounded-xl object-cover"
        />
      </div>

      {/* RIGHT 4 IMAGES */}
      <div className="grid grid-cols-2 gap-3">
        {images.slice(1, 5).map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Property ${idx + 2}`}
            className="h-[220px] w-full rounded-xl object-cover"
          />
        ))}
      </div>
    </div>
  );
}
