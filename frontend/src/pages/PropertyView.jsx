import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PropertyImageGallery } from "../components/PropertyImageGallery";
import { PropertyDetailsCard } from "../components/PropertyDetailsCard";
import { PropertySpecifications } from "../components/PropertySpecifications";
import { PropertyOffers } from "../components/PropertyOffers";
import { ReviewsList } from "../components/ReviewsList";
import { OwnerCard } from "../components/OwnerCard";


const sampleProperty = {
  id: 1,
  title: "Modern Apartment",
  price: "45,000",
  priceRange: "month",
  availableFrom: "Nov 20",
  location: "Downtown Area, City",
  type: "Apartment",
  numberOfPeople: "4",
  images: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1536245109352-a92145e2b86f?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1516489720963-1e621e27d008?w=500&h=400&fit=crop",
  ],
  bedrooms: 2,
  kitchens: 1,
  bathrooms: 2,
  description: "Beautiful modern apartment with stunning city views. Newly renovated with high-end fixtures and appliances. Perfect for professionals or small families.",
  offers: [
    "High-Speed WiFi",
    "Parking Available",
    "Air Conditioning",
    "Fully Furnished",
    "Cable TV",
    "Gym Access",
  ],
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

export default function PropertyView() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        
        setProperty(sampleProperty);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const handleMessageOwner = () => {
    alert(`Message sent to ${property?.owner.name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-600">
          <p className="text-lg font-semibold">Property not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full lg:w-[80%] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <PropertyImageGallery images={property.images} />
            <PropertyDetailsCard
              price={property.price}
              priceRange={property.priceRange}
              location={property.location}
              type={property.type}
              numberOfPeople={property.numberOfPeople}
            />
            <PropertySpecifications
              bedrooms={property.bedrooms}
              kitchens={property.kitchens}
              bathrooms={property.bathrooms}
            />
            <PropertyOffers offers={property.offers} />
            <ReviewsList
              reviews={property.reviews}
              reviewCount={property.reviews.length}
            />
          </div>

          {/* Sidebar */}
          <div>
            <OwnerCard
              owner={property.owner}
              price={property.price}
              priceRange={property.priceRange}
              availableFrom={property.availableFrom}
              onMessage={handleMessageOwner}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
