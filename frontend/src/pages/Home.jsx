import { useState } from 'react'

const PropertyCard = ({ image, title, location, rating, reviews, amenities, price, available }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
    <img src={image} alt={title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">⭐</span>
          <span className="text-sm font-medium">{rating}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2">{location}</p>
      <p className="text-xs text-gray-500 mb-3">({reviews} reviews)</p>
      <div className="flex gap-2 mb-3 text-xs text-gray-600">
        {amenities.map((a, i) => (
          <span key={i} className="flex items-center gap-1">
            <span>{a.icon}</span>
            {a.label}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="font-bold text-gray-900">Rs {price.toLocaleString()}<span className="text-xs font-normal text-gray-500">/month</span></p>
      </div>
      <p className="text-xs text-gray-500 mt-1">Available: {available}</p>
    </div>
  </div>
)

export default function Home() {
  const [searchLocation, setSearchLocation] = useState('')

  const properties = [
    {
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      title: 'Cinnamon Gardens, Colombo',
      location: 'Queen Anne\'s Court (Colombo 7)',
      rating: 4.8,
      reviews: 124,
      price: 40000,
      available: 'Nov 1',
      amenities: [
        { icon: '📶', label: 'WiFi' },
        { icon: '❄️', label: 'AC' },
      ],
    },
    {
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400',
      title: 'Cinnamon Gardens, Colombo',
      location: 'Queen Anne\'s Court (Colombo 7)',
      rating: 4.8,
      reviews: 124,
      price: 45000,
      available: 'Nov 1',
      amenities: [
        { icon: '📶', label: 'WiFi' },
        { icon: '❄️', label: 'AC' },
      ],
    },
    {
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      title: 'Cinnamon Gardens, Colombo',
      location: 'Queen Anne\'s Court (Colombo 7)',
      rating: 4.8,
      reviews: 124,
      price: 40000,
      available: 'Nov 1',
      amenities: [
        { icon: '📶', label: 'WiFi' },
        { icon: '❄️', label: 'AC' },
      ],
    },
    {
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      title: 'Cinnamon Gardens, Colombo',
      location: 'Queen Anne\'s Court (Colombo 7)',
      rating: 4.8,
      reviews: 124,
      price: 60000,
      available: 'Nov 1',
      amenities: [
        { icon: '📶', label: 'WiFi' },
        { icon: '❄️', label: 'AC' },
      ],
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #93a5cf 0%, #a8b8d8 50%, #c5d4e8 100%)' }} className="py-16 text-gray-900 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Find your perfect boarding in Sri Lanka
          </h1>
          <p className="text-base text-gray-700 mb-8">
            Discover comfortable rooms and great roommates across the island
          </p>
          
          {/* Search Box */}
          <div className="bg-white rounded-full p-1 flex items-center max-w-2xl shadow-lg overflow-hidden">
            <span className="pl-4 text-gray-400">📍</span>
            <input
              type="text"
              placeholder="where do you want to stay ?"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-1 px-3 py-3 text-gray-900 outline-none bg-white"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2">
              <span>🔍</span>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured Boardings */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2">Featured Boardings</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Handpicked properties for you</h2>
          </div>
          
          <div className="grid grid-cols-4 gap-6 mb-8">
            {properties.map((prop, i) => (
              <PropertyCard key={i} {...prop} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
