export function ReviewItem({ review, onDelete }) {
  return (
    <div className="pb-4 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <img
            src={review.avatar}
            alt={review.author}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{review.author}</p>
              <span className="text-yellow-500">{"⭐".repeat(review.rating)}</span>
            </div>
            {review.date && (
              <p className="text-gray-400 text-xs mt-0.5">{review.date}</p>
            )}
            <p className="text-gray-600 text-sm mt-1">{review.text}</p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className="text-gray-400 hover:text-red-500 transition text-xs font-medium"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
