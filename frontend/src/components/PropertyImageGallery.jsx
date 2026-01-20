export function PropertyImageGallery({ images }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {/* Main large image */}
      <div className="col-span-1 row-span-2">
        <img
          src={images[0]}
          alt="Main property image"
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>
      
      {/* 4 smaller images */}
      <div className="col-span-1">
        <img
          src={images[1]}
          alt="Property image 2"
          className="w-full h-32 object-cover rounded-lg"
        />
      </div>
      <div className="col-span-1">
        <img
          src={images[2]}
          alt="Property image 3"
          className="w-full h-32 object-cover rounded-lg"
        />
      </div>
      <div className="col-span-1">
        <img
          src={images[3]}
          alt="Property image 4"
          className="w-full h-32 object-cover rounded-lg"
        />
      </div>
      <div className="col-span-1">
        <img
          src={images[4]}
          alt="Property image 5"
          className="w-full h-32 object-cover rounded-lg"
        />
      </div>
    </div>
  );
}
