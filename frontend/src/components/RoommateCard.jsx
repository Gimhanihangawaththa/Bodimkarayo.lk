import React from "react";

const RoommateCard = ({
  name,
  age,
  occupation,
  location,
  rating,
  tags = [],
  bio,
  avatarUrl,
  onConnect,
  className = "",
}) => {
  return (
    <div
      className={`group relative flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <img
          src={avatarUrl}
          alt={`${name} avatar`}
          className="h-14 w-14 rounded-full object-cover ring-1 ring-gray-200"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <StarRating value={rating} />
          </div>
          <p className="text-sm text-gray-600">
            {age} • {occupation}
          </p>
          {location && <p className="text-xs text-gray-500">{location}</p>}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4">
          {tags.map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </div>
      )}

      {/* Bio */}
      {bio && (
        <p className="px-4 pt-3 pb-4 text-sm text-gray-700 leading-relaxed">
          {bio}
        </p>
      )}

      {/* Actions */}
      <div className="mt-auto border-t border-gray-100 p-4">
        <button
          onClick={onConnect}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Connect
        </button>
      </div>
    </div>
  );
};

const Badge = ({ label }) => (
  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
    {label}
  </span>
);

const StarRating = ({ value = 0, max = 5 }) => {
  const fullStars = Math.floor(value);
  const hasHalf = value % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} type="full" />
      ))}
      {hasHalf && <Star type="half" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} type="empty" />
      ))}
      <span className="ml-1 text-xs text-gray-600">{value.toFixed(1)}</span>
    </div>
  );
};

const Star = ({ type }) => {
  const base = "h-4 w-4";
  if (type === "full") {
    return (
      <svg className={`${base} text-yellow-500`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
      </svg>
    );
  }
  if (type === "half") {
    return (
      <svg className={`${base}`} viewBox="0 0 24 24">
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill="url(#halfGrad)"
        />
      </svg>
    );
  }
  return (
    <svg className={`${base} text-gray-300`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
    </svg>
  );
};

export default RoommateCard;