import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

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

const fallbackProperties = [
  {
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    title: 'Cinnamon Gardens, Colombo',
    location: "Queen Anne's Court (Colombo 7)",
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
    location: "Queen Anne's Court (Colombo 7)",
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
    location: "Queen Anne's Court (Colombo 7)",
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
    location: "Queen Anne's Court (Colombo 7)",
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

const fallbackRoommates = [
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
]

export default function Home() {
  const [searchLocation, setSearchLocation] = useState('')
  const [properties, setProperties] = useState([])
  const [roommates, setRoommates] = useState([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [isLoadingRoommates, setIsLoadingRoommates] = useState(false)
  const [propertiesError, setPropertiesError] = useState('')
  const [roommatesError, setRoommatesError] = useState('')

  const fetchFeatured = async (location) => {
    setIsLoadingProperties(true)
    setIsLoadingRoommates(true)
    setPropertiesError('')
    setRoommatesError('')

    try {
      const [propertiesResponse, roommatesResponse] = await Promise.all([
        axios.get('/api/properties', {
          params: {
            location: location || undefined,
            limit: 4,
            sort: 'latest'
          }
        }),
        axios.get('/api/roommates', {
          params: {
            location: location || undefined,
            limit: 4,
            sort: 'latest'
          }
        })
      ])

      setProperties(Array.isArray(propertiesResponse.data) ? propertiesResponse.data : [])
      setRoommates(Array.isArray(roommatesResponse.data) ? roommatesResponse.data : [])
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load data.'
      setPropertiesError(message)
      setRoommatesError(message)
      setProperties([])
      setRoommates([])
    } finally {
      setIsLoadingProperties(false)
      setIsLoadingRoommates(false)
    }
  }

  useEffect(() => {
    fetchFeatured('')
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchFeatured(searchLocation.trim())
  }

  const isSearching = !!searchLocation.trim()
  const showFallbackProperties = !isSearching && (propertiesError || (!isLoadingProperties && properties.length === 0))
  const showFallbackRoommates = !isSearching && (roommatesError || (!isLoadingRoommates && roommates.length === 0))
  const displayedProperties = showFallbackProperties ? fallbackProperties : properties
  const displayedRoommates = showFallbackRoommates ? fallbackRoommates : roommates

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
          <form onSubmit={handleSearch} className="bg-white rounded-full p-1 flex items-center max-w-2xl shadow-lg overflow-hidden">
            <span className="pl-4 text-gray-400">📍</span>
            <input
              type="text"
              placeholder="where do you want to stay ?"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-1 px-3 py-3 text-gray-900 outline-none bg-white"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2"
            >
              <span>🔍</span>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured Boardings */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2">Featured Boardings</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Handpicked properties for you</h2>
          </div>
          
          {!showFallbackProperties && propertiesError && (
            <p className="text-sm text-red-600 mb-6" role="alert">
              {propertiesError}
            </p>
          )}

          {!showFallbackProperties && !propertiesError && !isLoadingProperties && properties.length === 0 && (
            <p className="text-sm text-gray-600 mb-6">
              No properties found for this location.
            </p>
          )}

          {showFallbackProperties && (
            <p className="text-sm text-gray-600 mb-6">
              Showing demo properties until the backend is ready.
            </p>
          )}

          <div className="grid grid-cols-4 gap-6 mb-8">
            {displayedProperties.map((prop, i) => (
              <PropertyCard key={i} {...prop} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/properties" className="text-blue-600 hover:text-blue-700 font-medium">
              View all properties →
            </Link>
          </div>
        </div>
      </section>

      {/* Roommates */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2">Find Roommates</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connect with verified roommates</h2>
          </div>

          {!showFallbackRoommates && roommatesError && (
            <p className="text-sm text-red-600 mb-6" role="alert">
              {roommatesError}
            </p>
          )}

          {!showFallbackRoommates && !roommatesError && !isLoadingRoommates && roommates.length === 0 && (
            <p className="text-sm text-gray-600 mb-6">
              No roommates found for this location.
            </p>
          )}

          {showFallbackRoommates && (
            <p className="text-sm text-gray-600 mb-6">
              Showing demo roommates until the backend is ready.
            </p>
          )}

          <div className="grid grid-cols-4 gap-6 mb-8">
            {displayedRoommates.map((roommate, i) => (
              <RoommateCard key={i} {...roommate} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/roommates" className="text-blue-600 hover:text-blue-700 font-medium">
              View all roommates →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
