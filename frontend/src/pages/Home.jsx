import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../config/api.config'
import { propertyService } from '../services'
import { UpgradeAdvertisement } from '../components/UpgradeAdvertisement'

const PropertyCard = ({ id, image, title, location, price, available, offers, rating, onCardClick }) => (
  <div 
    onClick={() => onCardClick(id)}
    className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
  >
    <img src={image} alt={title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm font-medium">{rating}</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-2">{location}</p>
      
      {/* Offers */}
      {offers && offers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {offers.slice(0, 2).map((offer, i) => (
            <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              {offer}
            </span>
          ))}
          {offers.length > 2 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              +{offers.length - 2} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="font-bold text-gray-900">Rs {price.toLocaleString()}<span className="text-xs font-normal text-gray-500">/month</span></p>
      </div>
      {available && <p className="text-xs text-gray-500 mt-1">Available: {available}</p>}
    </div>
  </div>
)

const RoommateCard = ({ id, image, name, age, location, bio, interests, verified, onCardClick }) => (
  <div
    onClick={() => onCardClick(id)}
    className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
  >
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


export default function Home() {
  const navigate = useNavigate()
  const [searchLocation, setSearchLocation] = useState('')
  const [properties, setProperties] = useState([])
  const [roommates, setRoommates] = useState([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [isLoadingRoommates, setIsLoadingRoommates] = useState(false)
  const [propertiesError, setPropertiesError] = useState('')
  const [roommatesError, setRoommatesError] = useState('')

  const handlePropertyCardClick = (propertyId) => {
    navigate(`/property/${propertyId}`)
  }

  const handleRoommateCardClick = (roommateId) => {
    navigate(`/roommate/${roommateId}`)
  }

  const fetchFeatured = async (location) => {
    setIsLoadingProperties(true)
    setIsLoadingRoommates(true)
    setPropertiesError('')
    setRoommatesError('')

    try {
      // Fetch properties from backend
      const propertiesData = await propertyService.getAllProperties()
      
      // Transform backend data to match UI component expectations
      const transformedProperties = Array.isArray(propertiesData) 
        ? propertiesData.slice(0, 4).map(prop => ({
            id: prop.id,
            image: prop.images && prop.images.length > 0 ? prop.images[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
            title: prop.title || 'Property',
            location: prop.location || 'Location not specified',
            price: prop.rent || 0,
            available: prop.availableFrom || 'TBD',
            offers: prop.offers || [],
            rating: 0,
          }))
        : []

      setProperties(transformedProperties)

      // Fetch roommates from backend
      const roommatesResponse = await apiClient.get('/roommates')
      const roommatesData = roommatesResponse?.data
      const transformedRoommates = Array.isArray(roommatesData)
        ? roommatesData
            .filter((post) => {
              if (!location) {
                return true
              }
              return (post.location || '').toLowerCase().includes(location.toLowerCase())
            })
            .slice(0, 4)
            .map((post) => {
              const name = post.poster?.fullName || post.poster?.email || 'Anonymous'
              const interests = post.interests
                ? post.interests.split(',').map((interest) => interest.trim()).filter(Boolean)
                : []

              return {
                id: post.id,
                image: post.poster?.profilePictureUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                name,
                age: post.age || '',
                location: post.location || 'Location not specified',
                bio: post.bio || 'No bio provided',
                interests,
                verified: Boolean(post.poster?.verified),
              }
            })
        : []

      setRoommates(transformedRoommates)
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load properties.'
      setPropertiesError(message)
      setRoommatesError('Failed to load roommates.')
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
  const displayedProperties = showFallbackProperties ? fallbackProperties : properties
  const displayedRoommates = roommates

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
            {displayedProperties.map((prop) => (
              <PropertyCard key={prop.id} {...prop} onCardClick={handlePropertyCardClick} />
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

          {roommatesError && (
            <p className="text-sm text-red-600 mb-6" role="alert">
              {roommatesError}
            </p>
          )}

          {!roommatesError && !isLoadingRoommates && roommates.length === 0 && (
            <p className="text-sm text-gray-600 mb-6">
              No roommates found for this location.
            </p>
          )}

          <div className="grid grid-cols-4 gap-6 mb-8">
            {displayedRoommates.map((roommate) => (
              <RoommateCard key={roommate.id} {...roommate} onCardClick={handleRoommateCardClick} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/roommates" className="text-blue-600 hover:text-blue-700 font-medium">
              View all roommates →
            </Link>
          </div>
        </div>
      </section>
      
      {/* Upgrade Advertisement */}
      <div className="max-w-6xl mx-auto px-4">
        <UpgradeAdvertisement />
      </div>
    </>
  )
}
