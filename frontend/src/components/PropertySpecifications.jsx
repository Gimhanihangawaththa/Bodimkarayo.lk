export function PropertySpecifications({ bedrooms, kitchens, bathrooms }) {
  return (
    <div className="mb-6 pb-6 border-b">
      <h3 className="text-lg font-semibold mb-4">Room Details</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-600 text-sm mb-2">Bedrooms</label>
          <input
            type="number"
            value={bedrooms}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-2">Kitchens</label>
          <input
            type="number"
            value={kitchens}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-2">Bathrooms</label>
          <input
            type="number"
            value={bathrooms}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
}
