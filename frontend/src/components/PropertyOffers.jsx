export function PropertyOffers({ offers }) {
  return (
    <div className="mb-6 pb-6 border-b">
      <h3 className="text-lg font-semibold mb-4">What this place offers</h3>
      <div className="grid grid-cols-2 gap-3">
        {offers.map((offer, index) => (
          <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
            ✓ {offer}
          </div>
        ))}
      </div>
    </div>
  );
}
