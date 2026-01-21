import { useState } from 'react'

const RoommateCard = ({ image, name, age, location, bio, interests, verified }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
    <img src={image} alt={name} className="w-full h-48 object-cover" />
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{name}, {age}</h3>
        </div>
        {verified && <span className="text-blue-600 font-bold text-lg">✓</span>}
      </div>
      <p className="text-sm text-gray-600 mb-3">📍 {location}</p>
      <p className="text-sm text-gray-700 mb-3">{bio}</p>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest, i) => (
          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {interest}
          </span>
        ))}
      </div>
    </div>
  </div>
)

export default function Roommates() {
  const roommates = [
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      name: 'Kasun',
      age: 23,
      location: 'Colombo 7',
      bio: 'Engineering student looking for a friendly roommate',
      interests: ['Tech', 'Sports', 'Music'],
      verified: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      name: 'Amelia',
      age: 24,
      location: 'Colombo 5',
      bio: 'Marketing professional seeking a roommate',
      interests: ['Books', 'Yoga', 'Cooking'],
      verified: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      name: 'Ravi',
      age: 22,
      location: 'Colombo 6',
      bio: 'Medical student, quiet and focused',
      interests: ['Reading', 'Gaming', 'Photography'],
      verified: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1517841905240-74ab9f1122d0?w=400',
      name: 'Shenal',
      age: 25,
      location: 'Colombo 4',
      bio: 'Software developer open to sharing apartment',
      interests: ['Coding', 'Movies', 'Travel'],
      verified: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      name: 'Maya',
      age: 23,
      location: 'Colombo 3',
      bio: 'Graphic designer looking for creative roommate',
      interests: ['Design', 'Art', 'Coffee'],
      verified: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1519462220952-a5a1d594f4e9?w=400',
      name: 'Arjun',
      age: 26,
      location: 'Colombo 2',
      bio: 'Business analyst with great social skills',
      interests: ['Networking', 'Fitness', 'Cooking'],
      verified: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      name: 'Sarah',
      age: 24,
      location: 'Colombo 7',
      bio: 'Law student, friendly and outgoing',
      interests: ['Debates', 'Movies', 'Hiking'],
      verified: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      name: 'Nimesh',
      age: 25,
      location: 'Colombo 6',
      bio: 'Finance professional seeking like-minded roommate',
      interests: ['Trading', 'Gym', 'Technology'],
      verified: true,
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #93a5cf 0%, #a8b8d8 50%, #c5d4e8 100%)' }} className="py-12 text-gray-900 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Find your perfect roommate
          </h1>
          <p className="text-base text-gray-700 mb-6">
            Connect with verified roommates across Sri Lanka
          </p>
          
          {/* Search Box */}
          <div className="bg-white rounded-full p-1 flex items-center max-w-2xl shadow-lg overflow-hidden">
            <span className="pl-4 text-gray-400">📍</span>
            <input
              type="text"
              placeholder="Search by location"
              className="flex-1 px-3 py-3 text-gray-900 outline-none bg-white"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2">
              <span>🔍</span>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* All Roommates */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Available Roommates</h2>
            <p className="text-gray-600 mt-1">Showing {roommates.length} verified roommates</p>
          </div>
          
          <div className="grid grid-cols-4 gap-6">
            {roommates.map((roommate, i) => (
              <RoommateCard key={i} {...roommate} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
