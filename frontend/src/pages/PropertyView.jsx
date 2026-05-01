import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LocationMap } from "../components/LocationMap";
import { OwnerCard } from "../components/OwnerCard";
import { PropertyImageViewer } from "../components/PropertyImageViewer";
import { PropertyOffers } from "../components/PropertyOffers";
import { PropertySpecifications } from "../components/PropertySpecifications";
import { ReviewsList } from "../components/ReviewsList";
import { AddReview } from "../components/AddReview";
import { InfoPill } from "../components/ui/InfoPill";
import { SectionCard } from "../components/ui/SectionCard";
import { propertyService, reviewService } from "../services";

const sampleProperty = {
  id: 1,
  title: "Modern Apartment in Downtown",
  price: "45,000",
  priceRange: "month",
  availableFrom: "Nov 20",
  location: "Downtown Area, Colombo 3",
  address: "32 Galle Road, Colombo 03, Sri Lanka",
  type: "Apartment",
  numberOfPeople: "4",
  rating: 4.8,
  images: [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=800&fit=crop",
  ],
  bedrooms: 2,
  kitchens: 1,
  bathrooms: 2,
  sizeSqft: "1,150 sq ft",
  floor: "6th floor",
  furnished: "Fully furnished",
  parking: "1 reserved slot",
  security: "24/7 security",
  petsAllowed: "No pets",
  yearBuilt: "2019",
  description:
    "Beautiful modern apartment with stunning city views. Newly renovated with high-end fixtures and appliances. Perfect for professionals or small families. Enjoy bright interiors, smart storage, and quick access to restaurants, supermarkets, and the beach.",
  highlights: [
    "Sunset balcony with city skyline views",
    "Quiet building with concierge service",
    "Walking distance to metro and supermarkets",
  ],
  offers: [
    "High-Speed WiFi",
    "Parking Available",
    "Air Conditioning",
    "Fully Furnished",
    "Cable TV",
    "Gym Access",
    "Swimming Pool",
  ],
  rules: ["No smoking", "No loud parties", "Minimum stay 6 months"],
  nearby: ["Galle Face Green - 10 min", "Colombo Fort - 15 min", "Odel Mall - 8 min"],
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63372.98961097214!2d79.8358033!3d6.927079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593b8f0a0a2f%3A0x6c1f3a8025a1f879!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1707450000000!5m2!1sen!2slk",
  reviews: [
    {
      id: 1,
      author: "Janaka Perera",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Janaka",
      rating: 5,
      text: "Great place! Very comfortable and well-maintained. The host was very responsive and helpful.",
    },
    {
      id: 2,
      author: "Priya Silva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      rating: 5,
      text: "Loved staying here. The location is perfect and the amenities are excellent. Highly recommended!",
    },
    {
      id: 3,
      author: "Roshan Kumar",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roshan",
      rating: 4,
      text: "Good place overall. Nice setup and good facilities. Would stay again.",
    },
  ],
  owner: {
    name: "Sunil Perera",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunil",
    rating: 4.9,
  },
};

const normalizeProperty = (propertyData) => {
  if (!propertyData) return null;

  const normalizedImages = Array.isArray(propertyData.images) && propertyData.images.length > 0
    ? propertyData.images
    : propertyData.imageUrl
    ? [propertyData.imageUrl]
    : [];

  return {
    ...propertyData,
    images: normalizedImages,
    price: propertyData.price ?? propertyData.rent ?? 0,
    priceRange: propertyData.priceRange ?? "month",
    type: propertyData.type ?? propertyData.propertyType ?? "Property",
    title: propertyData.title ?? "Property",
    location: propertyData.location ?? "Location not specified",
    address: propertyData.address ?? propertyData.location ?? "Address not available",
    availableFrom: propertyData.availableFrom ?? "TBD",
    numberOfPeople: propertyData.numberOfPeople ?? "N/A",
    rating: typeof propertyData.rating === "number" ? propertyData.rating : 0,
    offers: propertyData.offers ?? [],
    highlights: propertyData.highlights ?? [],
    rules: propertyData.rules ?? [],
    nearby: propertyData.nearby ?? [],
  };
};

export default function PropertyView() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch property data from backend
        const propertyData = await propertyService.getPropertyById(propertyId);
        setProperty(normalizeProperty(propertyData));

        // Fetch reviews for this property
        setReviewsLoading(true);
        try {
          const reviewsData = await reviewService.getReviewsByPropertyId(propertyId);
          setReviews(reviewsData);
        } catch (reviewErr) {
          console.error("Error fetching reviews:", reviewErr);
          // Don't fail the whole page if reviews fail to load
          setReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        
        // Check if it's a network error (backend not running)
        if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
          console.log("Backend not available - Using sample data for development");
          // Use sample data without showing error
          setProperty(sampleProperty);
          setReviews(sampleProperty.reviews);
          setError(null); // Clear error when using fallback
        } else {
          // Show error for other types of errors
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to load property";
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const handleMessageOwner = () => {
    alert(`Message sent to ${property?.owner.name}`);
  };

  const handleScheduleVisit = () => {
    alert("Visit scheduled! The owner will confirm a time.");
  };

  const handleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  const handleAddReview = async (newReview) => {
    try {
      // Submit review to backend
      const createdReview = await reviewService.createReview(propertyId, newReview);

      // Add the new review to the list
      setReviews((prevReviews) => [createdReview, ...prevReviews]);
      alert("Thank you for your review!");
    } catch (err) {
      console.error("Error adding review:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to add review. Please try again.";
      alert(errorMessage);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        // Delete review from backend
        await reviewService.deleteReview(reviewId);

        // Remove review from UI
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== reviewId)
        );
        alert("Review deleted successfully");
      } catch (err) {
        console.error("Error deleting review:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete review. Please try again.";
        alert(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600"></div>
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="text-4xl">⚠️</div>
          <p className="mt-3 text-lg font-semibold text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="text-4xl">🏠</div>
          <p className="mt-3 text-lg font-semibold text-slate-600">Property not found</p>
        </div>
      </div>
    );
  }

  const detailItems = [
    { label: "Bedrooms", value: property.bedrooms },
    { label: "Bathrooms", value: property.bathrooms },
    { label: "Kitchens", value: property.kitchens },
    { label: "Size", value: property.sizeSqft },
    { label: "Floor", value: property.floor },
    { label: "Furnished", value: property.furnished },
    { label: "Parking", value: property.parking },
    { label: "Security", value: property.security },
    { label: "Pets", value: property.petsAllowed },
    { label: "Year Built", value: property.yearBuilt },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-400/30 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-10 text-white">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                <InfoPill label={property.type} tone="blue" />
                <InfoPill label={`Available from ${property.availableFrom}`} tone="emerald" />
                <InfoPill label={`Up to ${property.numberOfPeople} people`} tone="amber" />
              </div>
              <h1 className="mt-4 text-3xl font-bold md:text-4xl">{property.title}</h1>
              <p className="mt-2 text-sm text-slate-200">{property.address}</p>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-200">
                <span className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} className={index < Math.round(property.rating) ? "" : "opacity-30"}>
                      ★
                    </span>
                  ))}
                </span>
                <span className="text-slate-300">{property.rating} rating</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{property.location}</span>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-200">Monthly rent</p>
              <p className="mt-2 text-4xl font-bold text-white">Rs {property.price}</p>
              <p className="mt-1 text-sm text-slate-300">/{property.priceRange}</p>
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleMessageOwner}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Message Owner
                </button>
                <button
                  type="button"
                  onClick={handleScheduleVisit}
                  className="w-full rounded-xl border border-white/30 px-4 py-3 text-sm font-semibold text-white transition hover:border-white"
                >
                  Schedule a Visit
                </button>
                <button
                  type="button"
                  onClick={handleFavorite}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isFavorite
                      ? "bg-rose-500 text-white hover:bg-rose-600"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {isFavorite ? "Saved to Favorites" : "Save to Favorites"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Gallery" subtitle="Swipe through images" icon={<span>🖼️</span>}>
              <PropertyImageViewer images={property.images || []} title={property.title} />
            </SectionCard>

            <SectionCard title="Overview" subtitle="Everything you need to know" icon={<span>✨</span>}>
              <p className="text-base leading-relaxed text-slate-600">{property.description}</p>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                {detailItems.map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-400">{item.label}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Specifications" icon={<span>🏡</span>}>
              <PropertySpecifications
                bedrooms={property.bedrooms}
                kitchens={property.kitchens}
                bathrooms={property.bathrooms}
              />
            </SectionCard>

            <SectionCard title="Amenities" subtitle="Comforts and extras" icon={<span>🛋️</span>}>
              <PropertyOffers offers={property.offers || []} />
            </SectionCard>

            <SectionCard title="Highlights" icon={<span>🎯</span>}>
              <ul className="space-y-3 text-sm text-slate-600">
                {(property.highlights || []).map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2">
                    <span className="text-emerald-500">●</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="House Rules" icon={<span>📌</span>}>
              <div className="flex flex-wrap gap-2">
                {(property.rules || []).map((rule) => (
                  <InfoPill key={rule} label={rule} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Nearby" subtitle="Popular places around" icon={<span>🧭</span>}>
              <div className="grid gap-3 sm:grid-cols-2">
                {(property.nearby || []).map((spot) => (
                  <div key={spot} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                    {spot}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Location" icon={<span>📍</span>}>
              <LocationMap title={property.location} address={property.address} mapEmbedUrl={property.mapEmbedUrl} />
            </SectionCard>

            <SectionCard title={`Reviews (${reviews.length})`} icon={<span>⭐</span>}>
              <AddReview onSubmit={handleAddReview} userName="Current User" />
              <ReviewsList
                reviews={reviews}
                reviewCount={reviews.length}
                onDeleteReview={handleDeleteReview}
              />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <div className="sticky top-6 space-y-6">
              <OwnerCard
                owner={property.owner}
                price={property.price}
                priceRange={property.priceRange}
                availableFrom={property.availableFrom}
                onMessage={handleMessageOwner}
              />

              <SectionCard title="Quick Facts" icon={<span>⚡</span>}>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Move-in date</span>
                    <span className="font-semibold text-slate-800">{property.availableFrom}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Preferred tenants</span>
                    <span className="font-semibold text-slate-800">{property.numberOfPeople} people</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Property type</span>
                    <span className="font-semibold text-slate-800">{property.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Neighborhood</span>
                    <span className="font-semibold text-slate-800">{property.location}</span>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
