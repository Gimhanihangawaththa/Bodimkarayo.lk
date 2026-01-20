export function ReviewsList({ reviews, reviewCount }) {
  return (
    <div className="mb-6 pb-6 border-b">
      <h3 className="text-lg font-semibold mb-4">Reviews ({reviewCount})</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="pb-4 border-b last:border-b-0">
            <div className="flex items-start gap-3">
              <img
                src={review.avatar}
                alt={review.author}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{review.author}</p>
                  <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{review.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
