import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const sampleRoommate = {
  id: 1,
  name: "Priya Perera",
  age: 24,
  occupation: "Software Engineer",
  location: "Colombo 7",
  rating: 4.8,
  tags: ["Cooking", "Reading", "Yoga", "Writing"],
  bio: "Friendly and tidy. Loves quiet evenings, good food, and weekend hikes. Looking for a respectful roommate.",
  avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
  about: "I'm a software engineer working at a tech company. I value cleanliness and respect for shared spaces. I enjoy cooking and often prepare meals for myself.",
  interests: ["Cooking", "Reading", "Yoga", "Writing", "Hiking", "Photography"],
  preferences: {
    lookingFor: "1-2 roommates",
    budget: "Rs. 15,000 - 20,000",
    preferredLocation: "Colombo 3-7",
    moveInDate: "Flexible",
  },
  reviews: [
    {
      id: 1,
      author: "Samith Kumar",
      rating: 5,
      text: "Great roommate! Very respectful and clean. Highly recommended!",
    },
    {
      id: 2,
      author: "Jessica Wong",
      rating: 4.5,
      text: "Nice person, good to live with. Communication could be better but overall positive experience.",
    },
  ],
};

export default function RoommateView() {
  const { roommateId } = useParams();
  const [roommate, setRoommate] = useState(sampleRoommate);

  useEffect(() => {
    // TODO: Fetch roommate data based on roommateId from backend
    console.log("Loading roommate:", roommateId);
  }, [roommateId]);

  const handleConnect = () => {
    alert(`Connection request sent to ${roommate.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={roommate.avatarUrl}
                alt={roommate.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>

            {/* Basic Info */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">{roommate.name}</h1>
              <p className="text-gray-600 mt-2">{roommate.occupation}</p>
              <p className="text-gray-500 text-sm">{roommate.location}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(roommate.rating) ? "text-lg" : "text-lg opacity-30"}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600">({roommate.rating} rating)</span>
              </div>

              {/* Action Button */}
              <button
                onClick={handleConnect}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
              >
                Send Connection Request
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 leading-relaxed mb-4">{roommate.about}</p>
          <p className="text-gray-700">{roommate.bio}</p>
        </div>

        {/* Interests */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {roommate.interests.map((interest) => (
              <span key={interest} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Preferences</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Looking For</p>
              <p className="text-gray-900 font-medium">{roommate.preferences.lookingFor}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Budget</p>
              <p className="text-gray-900 font-medium">{roommate.preferences.budget}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Preferred Location</p>
              <p className="text-gray-900 font-medium">{roommate.preferences.preferredLocation}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Move In Date</p>
              <p className="text-gray-900 font-medium">{roommate.preferences.moveInDate}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
          <div className="space-y-4">
            {roommate.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{review.author}</p>
                    <div className="flex text-yellow-400 text-sm mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "" : "opacity-30"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
