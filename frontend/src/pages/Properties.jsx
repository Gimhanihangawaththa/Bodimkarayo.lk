import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { propertyService } from '../services'
import { UpgradeAdvertisement } from '../components/UpgradeAdvertisement'
import FilterSidebar from '../components/FilterSidebar'

const PropertyCard = ({ id, image, title, location, price, available, offers, rating, numberOfPeople, genderPreference, suitableFor, onCardClick }) => {
  const getGenderBadge = (gender) => {
    if (!gender || gender.toLowerCase() === 'both' || gender.toLowerCase() === 'any') return { text: '🚻 Open to All', cls: 'bg-blue-50 text-blue-700 border-blue-100' }
    if (gender.toLowerCase().includes('male') && !gender.toLowerCase().includes('female')) return { text: '👨 Male Only', cls: 'bg-cyan-50 text-cyan-700 border-cyan-100' }
    if (gender.toLowerCase().includes('female')) return { text: '👩 Female Only', cls: 'bg-rose-50 text-rose-700 border-rose-100' }
    return { text: `🚻 ${gender}`, cls: 'bg-slate-50 text-slate-700 border-slate-200' }
  }

  const getSuitableBadge = (suitable) => {
    if (!suitable || suitable.toLowerCase() === 'any') return null
    const parts = suitable.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length === 1) {
      const single = parts[0]
      if (single.toLowerCase().includes('student')) return { text: '🎓 Students', cls: 'bg-purple-50 text-purple-700 border-purple-100' }
      if (single.toLowerCase().includes('professional')) return { text: '💼 Professionals', cls: 'bg-indigo-50 text-indigo-700 border-indigo-100' }
      if (single.toLowerCase().includes('couple')) return { text: '💑 Couples', cls: 'bg-pink-50 text-pink-700 border-pink-100' }
      if (single.toLowerCase().includes('family')) return { text: '👨‍👩‍👧 Family', cls: 'bg-amber-50 text-amber-700 border-amber-100' }
      return { text: `🎯 ${single}`, cls: 'bg-slate-50 text-slate-700 border-slate-200' }
    }
    return { text: `🎯 ${parts.join(', ')}`, cls: 'bg-purple-50 text-purple-700 border-purple-100' }
  }

  const genderBadge = getGenderBadge(genderPreference)
  const suitableBadge = getSuitableBadge(suitableFor)

  return (
    <div 
      onClick={() => onCardClick(id)}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-[#3488c3]/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {rating > 0 && (
          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full border border-slate-700/60 shadow-xs flex items-center gap-1">
            ⭐ {rating}
          </div>
        )}
        {numberOfPeople && (
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-white font-bold text-[11px] px-2.5 py-1 rounded-full border border-white/20 shadow-xs flex items-center gap-1">
            👥 {numberOfPeople}
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold text-[#3488c3] tracking-wide uppercase truncate">{location}</span>
            {genderBadge && (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${genderBadge.cls}`}>
                {genderBadge.text}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5 group-hover:text-[#3488c3] transition-colors line-clamp-1">{title}</h3>
          
          {/* Target audience & Offers */}
          <div className="flex flex-wrap gap-1.5 my-3">
            {suitableBadge && (
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${suitableBadge.cls}`}>
                {suitableBadge.text}
              </span>
            )}
            {offers && offers.slice(0, suitableBadge ? 1 : 2).map((offer, i) => (
              <span key={i} className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
                {offer}
              </span>
            ))}
            {offers && offers.length > (suitableBadge ? 1 : 2) && (
              <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">
                +{offers.length - (suitableBadge ? 1 : 2)} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <p className="font-extrabold text-slate-900 text-lg">Rs {price.toLocaleString()}<span className="text-xs font-normal text-slate-500"> /mo</span></p>
          <span className="text-xs text-[#3488c3] font-bold group-hover:translate-x-1 transition-transform inline-block">Inspect →</span>
        </div>
        {available && <p className="text-[11px] text-slate-400 mt-1">Available: {available}</p>}
      </div>
    </div>
  )
}

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1920&q=80',
    title: 'Modern Luxury Studios',
  },
  {
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=80',
    title: 'Cozy Student Annexes',
  },
  {
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1920&q=80',
    title: 'University Boardings',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
    title: 'Executive Apartments',
  },
]

export default function Properties() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchLocation, setSearchLocation] = useState('')
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [filters, setFilters] = useState({
    propertyType: 'Any',
    genderPreference: 'Any',
    suitableFor: 'Any',
    maxPrice: 300000,
    bedrooms: 'Any',
    bathrooms: 'Any',
    furnished: false,
    parking: false,
    petAllowed: false,
  })

  // Auto-play background image slider
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(slideTimer)
  }, [])

  const keyword = new URLSearchParams(location.search).get('keyword') || ''

  const handleSearchSubmit = (forceValue) => {
    const term = (forceValue !== undefined ? forceValue : searchLocation).trim()
    navigate(term ? `/properties?keyword=${encodeURIComponent(term)}` : '/properties', { replace: true })
  }

  const handlePropertyCardClick = (propertyId) => {
    navigate(`/property/${propertyId}`)
  }

  useEffect(() => {
    setSearchLocation(keyword)
  }, [keyword])

  // Instant Search as you type with 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParam = new URLSearchParams(location.search).get('keyword') || ''
      if (searchLocation.trim() !== currentParam.trim()) {
        handleSearchSubmit(searchLocation)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchLocation])

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await propertyService.searchProperties({
          keyword,
          propertyType: filters.propertyType !== 'Any' ? filters.propertyType : undefined,
          genderPreference: filters.genderPreference !== 'Any' ? filters.genderPreference : undefined,
          suitableFor: filters.suitableFor !== 'Any' ? filters.suitableFor : undefined,
          maxPrice: filters.maxPrice,
          bedrooms: filters.bedrooms !== 'Any' ? Number(filters.bedrooms.replace('+', '')) : undefined,
          bathrooms: filters.bathrooms !== 'Any' ? Number(filters.bathrooms.replace('+', '')) : undefined,
          furnished: filters.furnished || undefined,
          parking: filters.parking || undefined,
          petsAllowed: filters.petAllowed || undefined,
        })
        const transformed = Array.isArray(data) 
          ? data.map(prop => ({
              id: prop.id,
              image: prop.images && prop.images.length > 0 ? prop.images[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
              title: prop.title || 'Property',
              location: prop.location || 'Location not specified',
              price: prop.rent || 0,
              available: prop.availableFrom || 'TBD',
              offers: prop.offers || [],
              numberOfPeople: prop.numberOfPeople || '',
              genderPreference: prop.genderPreference || 'Both',
              suitableFor: prop.suitableFor || 'Any',
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
  }, [keyword, filters])

  return (
    <>
      {/* Hero Section with Auto-Scrolling Background Images */}
      <section className="relative overflow-hidden -mt-[100px] pt-36 md:pt-44 pb-16 md:pb-24 min-h-[460px] flex items-center">
        {/* Background Image Carousel Slider */}
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover transition-transform duration-[7000ms] ease-linear"
              />
            </div>
          ))}
          {/* Top Dark Shade Overlay for Header Visibility */}
          <div className="absolute inset-x-0 top-0 h-44 md:h-52 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none z-1" />
          {/* Dark Gradient Overlay for optimal content contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-900/60" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl w-full">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs md:text-sm font-semibold text-white border border-white/30 shadow-md mb-4">
              <span className="w-2 h-2 rounded-full bg-[#3488c3] animate-pulse"></span>
              Verified Property Listings
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight drop-shadow-md">
              Find your perfect boarding
            </h1>
            <p className="text-base md:text-lg text-slate-200 mb-8 font-normal leading-relaxed drop-shadow-xs">
              Browse through all verified rooms, annexes, and apartments across Sri Lanka
            </p>

            {/* Search Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSearchSubmit()
              }}
              className="bg-white/95 backdrop-blur-md rounded-full p-2 flex items-center max-w-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-4 ring-white/20 hover:ring-white/40 transition-all"
            >
              <span className="pl-4 text-[#3488c3] text-lg">📍</span>
              <input
                type="text"
                placeholder="where do you want to stay ?"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1 px-3 py-3 text-slate-900 text-sm md:text-base outline-none bg-transparent placeholder:text-slate-400 font-medium"
              />
              {searchLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchLocation('')
                    handleSearchSubmit('')
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 transition-colors mr-1 cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="bg-[#3488c3] hover:bg-[#2978b3] text-white px-7 py-3 rounded-full font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#3488c3]/30 active:scale-95 cursor-pointer shrink-0"
              >
                <span>🔍</span>
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Floating Right Glass Card Badge (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl text-white w-64 hover:scale-105 transition-transform duration-300">
              <div className="relative h-36 rounded-2xl overflow-hidden mb-3">
                <img
                  src={HERO_SLIDES[currentSlide].image}
                  alt="Property preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 bg-emerald-500/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                  ⭐ 4.9 Verified
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#3488c3] tracking-wide uppercase">Featured Collection</span>
              <h4 className="text-sm font-bold text-white mt-0.5">{HERO_SLIDES[currentSlide].title}</h4>
              <p className="text-[11px] text-slate-300 mt-1">Air conditioning, Wi-Fi & attached baths</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Properties */}
      <section className="py-12 bg-white min-h-[600px]">
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">All Properties</h2>
              <p className="text-slate-500 text-sm mt-1">
                {isLoading ? 'Searching listings...' : `Showing ${properties.length} verified listings`}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-8 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Sidebar + Main Cards Grid */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sticky Filter Sidebar */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0">
              <FilterSidebar onFiltersChange={setFilters} />
            </div>

            {/* Property Grid */}
            <div className="flex-1 w-full">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <div className="w-10 h-10 border-4 border-[#3488c3] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-medium text-sm">Loading properties...</p>
                </div>
              )}

              {!isLoading && properties.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
                  <span className="text-4xl block mb-3">🏡</span>
                  <h3 className="text-lg font-bold text-slate-800">No properties found</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Try adjusting your filters or price range to discover more locations.</p>
                </div>
              )}

              {!isLoading && properties.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {properties.map((prop) => (
                    <PropertyCard key={prop.id} {...prop} onCardClick={handlePropertyCardClick} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Advertisement */}
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 mb-8">
        <UpgradeAdvertisement />
      </div>
    </>
  )
}
