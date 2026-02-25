import { useState } from "react";

export function AddReview({ onSubmit, userName = "You" }) {
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
      const newReview = {
        id: Date.now(),
        author: userName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
        rating: rating,
        text: reviewText,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };

      await onSubmit(newReview);
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
                className={`text-2xl transition-transform hover:scale-110 ${
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ⭐
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
