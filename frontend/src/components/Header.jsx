import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-center text-gray-800">BODIMKARAYO</h1>
        </div>
        <div className="flex gap-2">
          <button className="text-gray-600 hover:text-gray-900">Share</button>
          <button className="text-gray-600 hover:text-gray-900">❤️</button>
        </div>
      </div>
    </div>
  );
}
