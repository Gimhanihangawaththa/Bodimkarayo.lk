import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { searchService } from '../services'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
const DEFAULT_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=600'

const resolvePropertyImage = (property) => {
  if (!property) return DEFAULT_PROPERTY_IMAGE

  if (Array.isArray(property.images) && property.images.length > 0 && property.images[0]) {
    return property.images[0]
  }

  if (Array.isArray(property.imageUrls) && property.imageUrls.length > 0 && property.imageUrls[0]) {
    return property.imageUrls[0]
  }

  if (property.imageUrl) {
    return property.imageUrl
  }

  return DEFAULT_PROPERTY_IMAGE
}

const PropertyResult = ({ property, onPropertyClick }) => {
  const image = resolvePropertyImage(property)
  
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
            e.target.onerror = null
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
        <div className="flex flex-wrap gap-1.5 mb-2">
          {property.numberOfPeople && (
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
              👥 {property.numberOfPeople}
            </span>
          )}
          {property.genderPreference && property.genderPreference !== 'Both' && property.genderPreference !== 'Any' && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
              🚻 {property.genderPreference}
            </span>
          )}
          {property.suitableFor && property.suitableFor !== 'Any' && (
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
              🎯 {property.suitableFor}
            </span>
          )}
          {property.bedrooms && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              🛏️ {property.bedrooms} bed
            </span>
          )}
          {property.bathrooms && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
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
  const [properties, setProperties] = useState([])
  const [roommates, setRoommates] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const keyword = new URLSearchParams(location.search).get('keyword') || ''

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

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`)
  }

  const handleRoommateClick = (roommateId) => {
    navigate(`/roommate/${roommateId}`)
  }

  const totalResults = properties.length + roommates.length

  return (
    <>
      <section className="bg-white border-b border-gray-200 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Results</h1>
          <p className="text-base text-gray-700 mb-3">
            Results for <span className="font-semibold">"{keyword || 'your search'}"</span>
          </p>
          <p className="text-sm text-gray-500">
            Use the header search bar to refine your query anytime.
          </p>
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
            <div className="text-center py-12 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-blue-50 text-[#3488c3] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                🔍
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Explore Bodimkarayo.lk</h3>
              <p className="text-slate-600 text-sm mb-6">Type a keyword in the search bar above or choose a popular category below to start browsing.</p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Popular:</span>
                {['Colombo', 'Kandy', 'Malabe', 'Students', 'Female Only', 'Single Room', 'Couples', 'Furnished'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      navigate(`/search?keyword=${encodeURIComponent(tag)}`)
                    }}
                    className="text-xs font-semibold bg-slate-100 hover:bg-[#3488c3] hover:text-white text-slate-700 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/properties')}
                  className="px-5 py-2.5 bg-[#3488c3] hover:bg-[#2978b3] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#3488c3]/20 cursor-pointer"
                >
                  🏠 Browse All Properties
                </button>
                <button
                  onClick={() => navigate('/roommates')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer"
                >
                  👥 Find Roommates
                </button>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-12 max-w-xl mx-auto">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                🏠
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">No matches found for "{keyword}"</h3>
              <p className="text-slate-500 text-sm mb-6">Try searching with broader keywords, different locations, or check your spelling.</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => navigate('/properties')}
                  className="px-4 py-2 bg-[#3488c3] hover:bg-[#2978b3] text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  View All Properties
                </button>
              </div>
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
