export function ImageUploadBox({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="w-full h-48 bg-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-400 transition"
    >
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
    </div>
  );
}
