import { useState } from "react";

export function AddReview({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      alert("Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ rating, text: reviewText.trim() });
      setReviewText("");
      setRating(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 pb-6 border-b">
      <h4 className="text-lg font-semibold mb-4">Share Your Experience</h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl transition-transform hover:scale-110"
              >
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill={star <= rating ? "#facc15" : "none"}
                  stroke="#facc15"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Your Review
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this property... (minimum 10 characters)"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="4"
            minLength="10"
            maxLength="500"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500">
            {reviewText.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || reviewText.trim().length < 10}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {isSubmitting ? "Posting..." : "Post Review"}
        </button>
      </form>
    </div>
  );
}
