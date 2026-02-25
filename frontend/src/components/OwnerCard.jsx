export function OwnerCard({ owner, price, priceRange, availableFrom, onMessage }) {
  return (
    <div className="sticky top-8 p-6 border border-gray-300 rounded-xl bg-white shadow-lg">
      {/* Price Section */}
      <div className="mb-6 pb-6 border-b">
        <p className="text-2xl font-bold text-gray-900">Rs {price}<span className="text-gray-600 text-lg">/{priceRange}</span></p>
        <p className="text-gray-600 text-sm mt-2">Available from {availableFrom}</p>
      </div>

      {/* Hosted By Section */}
      <div className="mb-6 pb-6 border-b">
        <p className="text-sm font-semibold text-gray-700 mb-3">Hosted by</p>
        <div className="flex items-center gap-3 mb-4">
          <img
            src={owner.avatar}
            alt={owner.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-900">{owner.name}</p>
            <p className="text-xs text-gray-600">Verified Owner</p>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <p className="font-semibold text-gray-900">{owner.rating}</p>
            <p className="text-xs">rating</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onMessage}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Message
      </button>
    </div>
  );
}
