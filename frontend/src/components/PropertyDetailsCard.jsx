export function PropertyDetailsCard({ price, priceRange, location, type, numberOfPeople }) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-blue-600">Rs {price}</span>
            <span className="text-gray-500 text-lg">/{priceRange}</span>
          </div>
          <p className="text-gray-600 mt-2">📍 {location}</p>
          <div className="flex gap-4 mt-3 text-sm text-gray-600">
            <span>🏠 {type}</span>
            <span>👥 {numberOfPeople} people</span>
          </div>
        </div>
      </div>
    </div>
  );
}
