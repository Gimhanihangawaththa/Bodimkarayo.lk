import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../config/api.config'
import { propertyService } from '../services'
import { UpgradeAdvertisement } from '../components/UpgradeAdvertisement'
import AIRecommendations from '../components/AIRecommendations'

const PropertyCard = ({ id, image, title, location, price, available, offers, rating, onCardClick }) => (
  <div
    onClick={() => onCardClick(id)}
    className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_12px_40px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_50px_rgba(37,99,235,0.14)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
  >
    <div className="overflow-hidden">
      <img src={image} alt={title} className="w-full h-48 object-cover transition duration-500 group-hover:scale-105" />
    </div>
    <div className="p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 leading-tight">{title}</h3>
        {rating > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-600">
            <span>⭐</span>
            <span className="text-sm font-medium">{rating}</span>
          </div>
        )}
      </div>
      <p className="text-sm text-slate-600 mb-3">{location}</p>

      {/* Offers */}
      {offers && offers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {offers.slice(0, 2).map((offer, i) => (
            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
              {offer}
            </span>
          ))}
          {offers.length > 2 && (
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              +{offers.length - 2} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="font-bold text-gray-900 text-lg">Rs {price.toLocaleString()}<span className="text-xs font-normal text-gray-500">/month</span></p>
      </div>
      {available && <p className="text-xs text-gray-500 mt-1">Available: {available}</p>}
    </div>
  </div>
)

const RoommateCard = ({ id, image, name, age, location, bio, interests, verified, matchPercentage, occupation, budget, onCardClick }) => (
  <div
    onClick={() => onCardClick(id)}
    className="group bg-white rounded-3xl p-4 border border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.16)] hover:border-blue-500/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer"
  >
    <div>
      {/* Hero Photo with Gradient Fade & Badges */}
      <div className="relative h-52 rounded-2xl overflow-hidden mb-3">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-md text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          {matchPercentage || 95}% Match
        </div>
        {verified && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white font-black text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-md">
            ✓
          </div>
        )}

        {/* Bottom Overlay Details on Photo */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold border border-white/20">
            💰 {budget ? `Max ${budget}` : 'Flex Rent'}
          </span>
          <span className="bg-blue-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold truncate max-w-[110px]">
            📍 {location}
          </span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-extrabold text-slate-900">{name}{age ? `, ${age}` : ''}</h3>
        <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md truncate max-w-[120px]">
          {occupation || 'Verified Tenant'}
        </span>
      </div>
      <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed min-h-[32px]">
        {bio || 'Looking for compatible flatmates.'}
      </p>

      {/* Interest Pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {interests && interests.length > 0 ? (
          interests.slice(0, 3).map((interest, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200/80">
              {interest.startsWith('🍳') || interest.startsWith('✈️') || interest.startsWith('⚽') || interest.startsWith('📚') || interest.startsWith('💻') || interest.startsWith('🎵') || interest.startsWith('🧘') || interest.startsWith('🎨') || interest.startsWith('☕') || interest.startsWith('🎮') || interest.startsWith('🎬') || interest.startsWith('🏋️') ? interest : `✨ ${interest}`}
            </span>
          ))
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200/80">
            ✨ Friendly & Clean
          </span>
        )}
      </div>
    </div>

    {/* Action CTA Button */}
    <button
      onClick={(e) => {
        e.stopPropagation()
        onCardClick(id)
      }}
      className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
    >
      <span>💬 Connect & Message</span>
    </button>
  </div>
)

const fallbackRoommates = [
  {
    id: 'demo-rm-1',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    name: 'Gimhani',
    age: 25,
    location: 'Seeduwa',
    occupation: 'Software Eng.',
    budget: '25k/mo',
    bio: 'Software engineer looking for a quiet, clean room near Colombo or Negombo line.',
    interests: ['🍳 Cooking', '✈️ Travel', '⚽ Sports'],
    verified: true,
    matchPercentage: 98,
  },
  {
    id: 'demo-rm-2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    name: 'Kavindu',
    age: 23,
    location: 'Katubedda',
    occupation: 'Moratuwa Uni',
    budget: '20k/mo',
    bio: 'Moratuwa Uni undergrad searching for a shared annex with fast fiber Wi-Fi.',
    interests: ['📚 Reading', '💻 Coding', '🎵 Music'],
    verified: true,
    matchPercentage: 95,
  },
  {
    id: 'demo-rm-3',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
    name: 'Dilani',
    age: 24,
    location: 'Nugegoda',
    occupation: 'Accountant',
    budget: '30k/mo',
    bio: 'Corporate accountant looking for a friendly female flatmate near Highlevel Road.',
    interests: ['🧘 Yoga', '🎨 Painting', '☕ Coffee'],
    verified: true,
    matchPercentage: 92,
  },
  {
    id: 'demo-rm-4',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
    name: 'Thanura',
    age: 26,
    location: 'Malabe',
    occupation: 'UX Designer',
    budget: '28k/mo',
    bio: 'UX designer working remotely. Quiet, non-smoker, looking for an AC room.',
    interests: ['🎮 Gaming', '🎬 Movies', '🏋️ Fitness'],
    verified: true,
    matchPercentage: 89,
  },
]

const fallbackProperties = [
  {
    id: 'demo-1',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    title: "Queen Anne's Luxury Studio",
    location: 'Cinnamon Gardens, Colombo 07',
    rating: 4.9,
    reviews: 28,
    price: 45000,
    available: 'Nov 1',
    badge: '🔥 Most Popular',
    amenities: ['AC', 'Attach Bath', 'Wi-Fi', 'Hot Water'],
    description: 'Fully furnished single occupancy studio with private balcony, study desk, and high-speed fiber internet.',
  },
  {
    id: 'demo-2',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    title: 'Moratuwa Student Annex',
    location: 'Katubedda (Near Moratuwa Uni)',
    rating: 4.8,
    reviews: 16,
    price: 22000,
    available: 'Immediate',
    badge: '🎓 Near Campus',
    amenities: ['Wi-Fi', 'Study Room'],
    description: '2-Bed sharing room for undergraduates with shared kitchen & quiet study environment.',
  },
  {
    id: 'demo-3',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    title: 'Green View Boarding',
    location: 'Dalugama (Near Kelaniya Uni)',
    rating: 4.7,
    reviews: 21,
    price: 28000,
    available: 'Nov 15',
    badge: '🌿 Quiet Area',
    amenities: ['Wi-Fi', 'Attach Bath'],
    description: 'Quiet neighborhood, walking distance to Kelaniya station & university main gate.',
  },
  {
    id: 'demo-4',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
    title: 'Nugegoda Executive Suite',
    location: 'Highlevel Road, Nugegoda',
    rating: 4.8,
    reviews: 35,
    price: 35000,
    available: 'Immediate',
    badge: '💼 Professional',
    amenities: ['AC', 'Parking', 'Security'],
    description: 'Single room for working professionals with parking space, hot water, and 24/7 security.',
  },
  {
    id: 'demo-5',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
    title: 'Kollupitiya Sea Breeze Room',
    location: 'Marine Drive, Colombo 03',
    rating: 4.9,
    reviews: 42,
    price: 48000,
    available: 'Immediate',
    badge: '🌊 Ocean View',
    amenities: ['AC', 'Wi-Fi', 'Balcony'],
    description: 'Sea view single room with attached bath, refrigerator access, and lift facility.',
  },
  {
    id: 'demo-6',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
    title: 'Rajagiriya Modern Flat',
    location: 'Nawala Road, Rajagiriya',
    rating: 4.8,
    reviews: 19,
    price: 38000,
    available: 'Dec 1',
    badge: 'Modern Studio',
    amenities: ['Wi-Fi', 'Kitchen', 'AC'],
    description: 'Spacious flat room near supermarkets, bus stands, and fitness centers.',
  },
  {
    id: 'demo-7',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    title: 'Dehiwala Shared Apartment',
    location: 'Galle Road, Dehiwala',
    rating: 4.6,
    reviews: 14,
    price: 24000,
    available: 'Immediate',
    badge: '👥 Shared Room',
    amenities: ['Wi-Fi', 'Washing Machine'],
    description: 'Budget-friendly 2-person sharing room for students and young working adults.',
  },
  {
    id: 'demo-8',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    title: 'Malabe IT Campus Residence',
    location: 'Near SLIIT Campus, Malabe',
    rating: 4.9,
    reviews: 50,
    price: 29000,
    available: 'Immediate',
    badge: '🎓 SLIIT / Horizon',
    amenities: ['Wi-Fi', 'Study Desk', 'AC'],
    description: 'Ideal for tech students, walking distance to SLIIT and Horizon Campus.',
  },
  {
    id: 'demo-9',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    title: 'Maharagama Girls Boarding',
    location: 'Station Road, Maharagama',
    rating: 4.7,
    reviews: 23,
    price: 20000,
    available: 'Nov 10',
    badge: '🔒 Safe & Secure',
    amenities: ['CCTV', 'Wi-Fi', 'Meals Included'],
    description: 'Secure boarding place for female students with home-cooked meals option.',
  },
  {
    id: 'demo-10',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
    title: 'Kandy Lake View Studio',
    location: 'Peradeniya Road, Kandy',
    rating: 4.8,
    reviews: 31,
    price: 30000,
    available: 'Dec 1',
    badge: '🏞️ Scenic View',
    amenities: ['Wi-Fi', 'Attach Bath', 'Hot Water'],
    description: 'Peaceful studio with lake view, close to Kandy city center and Peradeniya Uni.',
  },
]


const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1920&q=80',
    title: 'Modern Apartments & Rooms',
  },
  {
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=80',
    title: 'Cozy Shared Spaces & Rooms',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
    title: 'Verified Roommates across Sri Lanka',
  },
  {
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80',
    title: 'Comfortable & Affordable Stays',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [properties, setProperties] = useState([])
  const [roommates, setRoommates] = useState([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [isLoadingRoommates, setIsLoadingRoommates] = useState(false)
  const [propertiesError, setPropertiesError] = useState('')
  const [roommatesError, setRoommatesError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isHoveredProperties, setIsHoveredProperties] = useState(false)
  const propertiesScrollRef = useRef(null)
  const scrollPosRef = useRef(0)

  const scrollProperties = (direction) => {
    if (propertiesScrollRef.current) {
      const scrollAmount = 340
      propertiesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(() => {
        if (propertiesScrollRef.current) {
          scrollPosRef.current = propertiesScrollRef.current.scrollLeft
        }
      }, 350)
    }
  }

  const handleScrollSync = () => {
    if (propertiesScrollRef.current && isHoveredProperties) {
      scrollPosRef.current = propertiesScrollRef.current.scrollLeft
    }
  }

  // Continuous fluid slow-motion auto-scroll for Featured Boardings carousel (pauses on hover)
  useEffect(() => {
    let animId
    let lastTime = performance.now()

    const step = (now) => {
      if (!isHoveredProperties && propertiesScrollRef.current) {
        const container = propertiesScrollRef.current
        const delta = now - lastTime
        if (delta > 0) {
          const maxScroll = container.scrollWidth - container.clientWidth
          if (maxScroll > 0) {
            // Delta-scaled slow motion speed (~28px/sec) for silky smooth glide
            scrollPosRef.current += (delta / 16.6) * 0.45
            if (scrollPosRef.current >= maxScroll - 2) {
              scrollPosRef.current = 0
            }
            container.scrollLeft = scrollPosRef.current
          }
          lastTime = now
        }
      } else if (propertiesScrollRef.current) {
        // Sync scrollPosRef while paused or hovered
        scrollPosRef.current = propertiesScrollRef.current.scrollLeft
      }
      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [isHoveredProperties])

  // Auto-play background image carousel
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(slideTimer)
  }, [])

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
        ? propertiesData.slice(0, 10).map(prop => ({
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
              occupation: post.occupation || post.poster?.occupation || 'Verified Tenant',
              budget: post.budget ? `${post.budget}/mo` : '25k/mo',
              bio: post.bio || 'No bio provided',
              interests,
              verified: Boolean(post.poster?.verified),
              matchPercentage: post.matchPercentage || Math.floor(Math.random() * 10 + 89),
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
    const keyword = searchKeyword.trim()
    if (keyword) {
      // Navigate to Properties page with search keyword
      navigate(`/properties?keyword=${encodeURIComponent(keyword)}`)
    }
  }

  const isSearching = !!searchKeyword.trim()
  const showFallbackProperties = !isSearching && (propertiesError || (!isLoadingProperties && properties.length === 0))
  const displayedProperties = showFallbackProperties ? fallbackProperties : properties
  const showFallbackRoommates = !isSearching && (roommatesError || (!isLoadingRoommates && roommates.length === 0))
  const displayedRoommates = showFallbackRoommates ? fallbackRoommates : roommates

  const filteredProperties = displayedProperties.filter((prop) => {
    if (selectedCategory === 'All') return true
    const loc = (prop.location || '').toLowerCase()
    if (selectedCategory === 'Colombo 07') return loc.includes('colombo') || loc.includes('cinnamon')
    if (selectedCategory === 'Near Moratuwa Uni') return loc.includes('moratuwa') || loc.includes('katubedda')
    if (selectedCategory === 'Near Kelaniya Uni') return loc.includes('kelaniya') || loc.includes('dalugama')
    if (selectedCategory === 'Budget Friendly') return prop.price <= 30000
    return true
  })

  return (
    <>
      {/* Hero Section with Auto-Scrolling Background Images */}
      <section className="relative overflow-hidden -mt-[100px] pt-36 md:pt-44 pb-20 md:pb-28 min-h-[580px] flex items-center">
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
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/70 to-slate-900/60" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="max-w-6xl mx-auto px-4 relative z-10 w-full">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs md:text-sm font-semibold text-white border border-white/30 shadow-md mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Boarding search made simple
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight drop-shadow-md">
              Find your perfect boarding in Sri Lanka
            </h1>
            <p className="max-w-2xl text-base md:text-xl text-slate-200 mb-10 font-normal leading-relaxed drop-shadow-xs">
              Discover comfortable rooms and great roommates across the island
            </p>

            {/* Search Box */}
            <form
              onSubmit={handleSearch}
              className="bg-white/95 backdrop-blur-md rounded-full p-2 flex items-center max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-4 ring-white/20 hover:ring-white/40 transition-all"
            >
              <span className="pl-4 text-blue-600 text-lg">📍</span>
              <input
                type="text"
                placeholder="where do you want to stay ?"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1 px-3 py-3 text-slate-900 text-sm md:text-base outline-none bg-transparent placeholder:text-slate-400 font-medium"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-full font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer shrink-0"
              >
                <span>🔍</span>
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Carousel Dots Indicators */}
          <div className="flex items-center gap-2.5 mt-10">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide
                    ? 'w-8 bg-blue-500 shadow-sm shadow-blue-500/50'
                    : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Floating Trust & Stats Bar - Transition Element */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 -mt-16 sm:-mt-20 md:-mt-24 mb-4">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 md:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-2 border-r border-slate-100/80 last:border-0">
            <div className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">150+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Verified Properties</div>
          </div>
          <div className="p-2 border-r border-slate-100/80 last:border-0">
            <div className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tight">2,500+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Happy Tenants</div>
          </div>
          <div className="p-2 border-r border-slate-100/80 last:border-0">
            <div className="text-2xl md:text-3xl font-black text-emerald-600 tracking-tight flex items-center justify-center gap-1">
              <span>4.9</span>
              <span className="text-amber-400 text-xl">★</span>
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Average Rating</div>
          </div>
          <div className="p-2">
            <div className="text-2xl md:text-3xl font-black text-amber-500 tracking-tight">100%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Direct Landlords</div>
          </div>
        </div>
      </div>

      {/* Featured Boardings Showcase - 100% Edge-to-Edge Full Width */}
      <section className="pt-4 pb-16 md:pt-6 md:pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 border-y border-slate-200/60 overflow-hidden w-full">
        
        {/* Section Header (Centered) */}
        <div className="max-w-4xl mx-auto px-4 text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-700 font-semibold text-xs tracking-wider uppercase mb-3">
            ✨ Handpicked Selection
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Featured Boardings for You
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Explore top-rated boarding places with verified landlords, air conditioning, and high-speed Wi-Fi.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: 'All', label: 'All Locations' },
              { id: 'Colombo 07', label: 'Colombo 07' },
              { id: 'Near Moratuwa Uni', label: 'Near Moratuwa Uni' },
              { id: 'Near Kelaniya Uni', label: 'Near Kelaniya Uni' },
              { id: 'Budget Friendly', label: 'Budget Friendly' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-semibold text-xs transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/20 scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {!showFallbackProperties && propertiesError && (
          <p className="text-sm text-red-600 mb-6 text-center" role="alert">
            {propertiesError}
          </p>
        )}

        {!showFallbackProperties && !propertiesError && !isLoadingProperties && properties.length === 0 && (
          <p className="text-sm text-slate-600 mb-6 text-center">
            No properties found for this location.
          </p>
        )}

        {showFallbackProperties && (
          <p className="text-xs text-slate-400 mb-6 text-center font-medium">
            Showing demo properties until the backend is ready.
          </p>
        )}

        {/* 100% Full-Width Hardware-Accelerated Infinite Marquee Track */}
        {filteredProperties.length > 0 ? (
          <div className="relative w-full overflow-hidden group/carousel mb-10 py-3">
            
            {/* Subtle Edge Fade Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-20 pointer-events-none" />

            {/* GPU Marquee Track */}
            <div className="animate-marquee-glide gap-6 px-4">
              {[...filteredProperties, ...filteredProperties].map((prop, index) => (
                <div
                  key={`${prop.id}-${index}`}
                  onClick={() => handlePropertyCardClick(prop.id)}
                  className="w-[280px] sm:w-[310px] md:w-[330px] shrink-0 group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-md hover:shadow-2xl hover:border-blue-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer mx-3"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {prop.badge && (
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white font-semibold text-[11px] px-2.5 py-1 rounded-full border border-slate-700/60 shadow-xs">
                        {prop.badge}
                      </div>
                    )}
                    {prop.rating > 0 && (
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full border border-slate-700/60 shadow-xs flex items-center gap-1">
                        ★ {prop.rating}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 tracking-wide uppercase">{prop.location}</span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {prop.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                        {prop.description || 'Comfortable room in a convenient location near public transport.'}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-lg font-black text-slate-900">
                        Rs {prop.price.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/mo</span>
                      </span>
                      <span className="text-xs text-blue-600 font-bold group-hover:translate-x-1 transition-transform inline-block">
                        Inspect →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 mb-8 max-w-4xl mx-auto">
            <p className="text-slate-500 text-sm">No properties found matching the selected category filter.</p>
          </div>
        )}

        {/* Bottom Action Button */}
        <div className="text-center">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-600/25 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Explore All Properties</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Find Roommates Section - Option 1: Match % & Social Reel */}
      <section className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 border-t border-slate-200/60 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-700 font-semibold text-xs tracking-wider uppercase mb-3">
              🤝 Compatibility Matching
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Connect with Verified Roommates
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-2 leading-relaxed">
              Find compatible flatmates based on lifestyle, budget, campus proximity, and shared interests.
            </p>
          </div>

          {!showFallbackRoommates && roommatesError && (
            <p className="text-sm text-red-600 mb-6 text-center" role="alert">
              {roommatesError}
            </p>
          )}

          {!showFallbackRoommates && !roommatesError && !isLoadingRoommates && roommates.length === 0 && (
            <p className="text-sm text-slate-600 mb-6 text-center">
              No roommates found for this location.
            </p>
          )}

          {showFallbackRoommates && (
            <p className="text-xs text-slate-400 mb-6 text-center font-medium">
              Showing verified profile matches near popular campuses.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {displayedRoommates.map((roommate) => (
              <RoommateCard key={roommate.id} {...roommate} onCardClick={handleRoommateCardClick} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/roommates"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore All Verified Roommates</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      {/* AI Recommendations Section */}
      <AIRecommendations />
    </>
  )
}
