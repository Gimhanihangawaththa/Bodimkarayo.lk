export function ImageUploadBox({ onClick, previewSrc }) {
  return (
    <div
      onClick={onClick}
      className="w-full aspect-square min-h-[130px] bg-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-400 transition overflow-hidden relative"
    >
      {previewSrc ? (
        <img
          src={previewSrc}
          alt="Selected property"
          className="w-full h-full object-cover"
        />
      ) : (
        <svg
          className="w-12 h-12 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      )}
    </div>
  );
}
