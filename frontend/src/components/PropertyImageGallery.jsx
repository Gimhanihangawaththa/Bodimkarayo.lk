// export function PropertyImageGallery({ images }) {
//   return (
//     <div className="grid grid-cols-3 gap-3 mb-6">
//       {/* Main large image */}
//       <div className="col-span-1 row-span-2">
//         <img
//           src={images[0]}
//           alt="Main property image"
//           className="w-full h-64 object-cover rounded-lg"
//         />
//       </div>
      
//       {/* 4 smaller images */}
//       <div className="col-span-1">
//         <img
//           src={images[1]}
//           alt="Property image 2"
//           className="w-full h-32 object-cover rounded-lg"
//         />
//       </div>
//       <div className="col-span-1">
//         <img
//           src={images[2]}
//           alt="Property image 3"
//           className="w-full h-32 object-cover rounded-lg"
//         />
//       </div>
//       <div className="col-span-1">
//         <img
//           src={images[3]}
//           alt="Property image 4"
//           className="w-full h-32 object-cover rounded-lg"
//         />
//       </div>
//       <div className="col-span-1">
//         <img
//           src={images[4]}
//           alt="Property image 5"
//           className="w-full h-32 object-cover rounded-lg"
//         />
//       </div>
//     </div>
//   );
// }


// export function PropertyImageGallery({ images }) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
//       {/* Main large image */}
//       <div className="md:col-span-2 md:row-span-2">
//         <img
//           src={images[0]}
//           alt="Main property image"
//           className="w-full h-[420px] object-cover rounded-lg"
//         />
//       </div>

//       {images.slice(1, 5).map((img, idx) => (
//         <div key={idx}>
//           <img
//             src={img}
//             alt={`Property image ${idx + 2}`}
//             className="w-full h-[200px] object-cover rounded-lg"
//           />
//         </div>
//       ))}
//     </div>
//   );
// }
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
