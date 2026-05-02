import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { searchService } from '../services'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
const DEFAULT_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=600'

const PropertyResult = ({ property, onPropertyClick }) => {
  const image = property.imageUrls?.[0] || DEFAULT_PROPERTY_IMAGE
  
  return (
    <div
      onClick={() => onPropertyClick(property.id)}
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition w-full cursor-pointer border border-gray-200"
    >
      <div className="relative w-full" style={{ paddingBottom: '66.67%' }}>
        <img 
          src={image} 
          alt={property.title} 
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.src = DEFAULT_PROPERTY_IMAGE
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{property.title}</h3>
        {property.location && (
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            📍 {property.location}
          </p>
        )}
        {property.rent && (
          <p className="text-sm font-semibold text-blue-600 mb-2">
            LKR {property.rent.toLocaleString()}/month
          </p>
        )}
        <div className="flex gap-2 mb-2">
          {property.bedrooms && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              🛏️ {property.bedrooms} bed
            </span>
          )}
          {property.bathrooms && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              🚿 {property.bathrooms} bath
            </span>
          )}
        </div>
        {property.description && (
          <p className="text-xs text-gray-600 line-clamp-2">{property.description}</p>
        )}
      </div>
    </div>
  )
}

const RoommateResult = ({ roommate, onRoommateClick }) => {
  const name = roommate.poster?.fullName || roommate.poster?.email || 'Anonymous'
  const avatar = roommate.poster?.profilePictureUrl || DEFAULT_AVATAR
  const verified = roommate.poster?.verified || false

  return (
    <div
      onClick={() => onRoommateClick(roommate.id)}
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition w-full cursor-pointer border border-gray-200"
    >
      <div className="relative w-full" style={{ paddingBottom: '75%' }}>
        <img 
          src={avatar} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.src = DEFAULT_AVATAR
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {name}{roommate.age ? `, ${roommate.age}` : ''}
            </h3>
            {roommate.occupation && (
              <p className="text-xs text-gray-500 truncate">{roommate.occupation}</p>
            )}
            {roommate.gender && (
              <p className="text-xs text-gray-500">{roommate.gender}</p>
            )}
          </div>
          {verified && <span className="text-blue-600 font-bold text-lg ml-2 flex-shrink-0">✓</span>}
        </div>
        {roommate.location && (
          <p className="text-sm text-gray-600 mb-2 truncate">📍 {roommate.location}</p>
        )}
        {roommate.budget && (
          <p className="text-sm text-gray-600 mb-2">💰 LKR {roommate.budget.toLocaleString()}/month</p>
        )}
        {roommate.bio && (
          <p className="text-xs text-gray-700 line-clamp-2">{roommate.bio}</p>
        )}
      </div>
    </div>
  )
}

export default function SearchResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [properties, setProperties] = useState([])
  const [roommates, setRoommates] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const keyword = new URLSearchParams(location.search).get('keyword') || ''

  useEffect(() => {
    setSearchQuery(keyword)
  }, [keyword])

  useEffect(() => {
    if (keyword.trim()) {
      performSearch(keyword)
    }
  }, [keyword])

  const performSearch = async (query) => {
    if (!query.trim()) {
      setProperties([])
      setRoommates([])
      setHasSearched(false)
      return
    }

    try {
      setLoading(true)
      setHasSearched(true)
      const results = await searchService.globalSearch(query)
      setProperties(Array.isArray(results.properties) ? results.properties : [])
      setRoommates(Array.isArray(results.roommates) ? results.roommates : [])
    } catch (error) {
      console.error('Error performing search:', error)
      setProperties([])
      setRoommates([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    navigate(trimmed ? `/search?keyword=${encodeURIComponent(trimmed)}` : '/search')
  }

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`)
  }

  const handleRoommateClick = (roommateId) => {
    navigate(`/roommate/${roommateId}`)
  }

  const totalResults = properties.length + roommates.length

  return (
    <>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} className="py-12 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Global Search</h1>
          <p className="text-base text-gray-100 mb-6">
            Search across properties and roommates
          </p>
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="bg-white rounded-full p-1 flex items-center max-w-2xl shadow-lg overflow-hidden">
            <span className="pl-4 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search properties, roommates, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-3 text-gray-900 outline-none bg-white"
              autoFocus
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2">
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Searching...</p>
            </div>
          ) : !hasSearched ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Enter a search query to find properties and roommates</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No results found for "{keyword}"</p>
              <p className="text-gray-400 text-sm mt-2">Try different keywords or check back later</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Properties Results */}
              {properties.length > 0 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Properties ({properties.length})
                    </h2>
                    <p className="text-gray-600">
                      Found {properties.length} matching propert{properties.length !== 1 ? 'ies' : 'y'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map((property) => (
                      <PropertyResult
                        key={property.id}
                        property={property}
                        onPropertyClick={handlePropertyClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Roommates Results */}
              {roommates.length > 0 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Roommates ({roommates.length})
                    </h2>
                    <p className="text-gray-600">
                      Found {roommates.length} matching roommate{roommates.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {roommates.map((roommate) => (
                      <RoommateResult
                        key={roommate.id}
                        roommate={roommate}
                        onRoommateClick={handleRoommateClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
