import { ReviewItem } from "./ReviewItem";

export function ReviewsList({ reviews, reviewCount, onDeleteReview }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="mb-6 pb-6 border-b">
      <h3 className="text-lg font-semibold mb-4">Reviews ({reviewCount})</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            onDelete={onDeleteReview}
          />
        ))}
      </div>
    </div>
  );
}
