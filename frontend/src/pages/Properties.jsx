import { useEffect, useState } from 'react'
import { propertyService } from '../services'

const PropertyCard = ({ image, title, location, price, available, offers, rating }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
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

export default function Properties() {
  const [searchLocation, setSearchLocation] = useState('')
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch all properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await propertyService.getAllProperties()
        const transformed = Array.isArray(data) 
          ? data.map(prop => ({
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
        setProperties(transformed)
      } catch (err) {
        setError(err?.message || 'Failed to load properties')
        setProperties([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Filter properties based on search location
  const filteredProperties = properties.filter(prop =>
    prop.location.toLowerCase().includes(searchLocation.toLowerCase())
  )

  return (
    <>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #93a5cf 0%, #a8b8d8 50%, #c5d4e8 100%)' }} className="py-12 text-gray-900 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Find your perfect boarding
          </h1>
          <p className="text-base text-gray-700 mb-6">
            Browse through all available properties
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
            <button 
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2"
              onClick={() => {}}
            >
              <span>🔍</span>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* All Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">All Properties</h2>
            <p className="text-gray-600 mt-1">
              {isLoading ? 'Loading...' : `Showing ${filteredProperties.length} properties`}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-500">Loading properties...</div>
          )}

          {!isLoading && filteredProperties.length === 0 && (
            <div className="text-center text-gray-500">No properties found.</div>
          )}

          {!isLoading && filteredProperties.length > 0 && (
            <div className="grid grid-cols-4 gap-6">
              {filteredProperties.map((prop, i) => (
                <PropertyCard key={prop.id || i} {...prop} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
