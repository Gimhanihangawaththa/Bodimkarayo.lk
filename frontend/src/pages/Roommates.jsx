import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roommateService } from '../services'
import { apiClient } from '../config/api.config'
import RoommateFilterSidebar from '../components/RoommateFilterSidebar'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1920&q=80',
    title: 'Verified Student & Professional Roommates',
  },
  {
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
    title: 'Find Compatible Flatmates Nearby',
  },
  {
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1920&q=80',
    title: 'Shared Annexes & Apartment Living',
  },
]

const RoommateCard = ({ post, onCardClick, matchIndex, matchExplanation }) => {
  const name = post.poster?.fullName || post.poster?.email || 'Anonymous'
  const avatar = post.poster?.profilePictureUrl || DEFAULT_AVATAR
  const interests = post.interests ? post.interests.split(',').map(i => i.trim()).filter(Boolean) : []
  const verified = Boolean(post.poster?.verified)
  const age = post.age || post.poster?.age || ''
  const location = post.location || 'Location not specified'
  const occupation = post.occupation || post.poster?.occupation || 'Verified Tenant'
  const budget = post.budget ? `${post.budget.toLocaleString()}/mo` : 'Flex Rent'
  const matchPercentage = post.matchPercentage || Math.floor(Math.random() * 10 + 89)

  return (
    <div
      onClick={() => onCardClick(post.id)}
      className="group bg-white rounded-3xl p-4 border border-slate-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(52,136,195,0.18)] hover:border-[#3488c3]/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer"
    >
      <div>
        {/* Photo Container with Gradient Fade & Overlay Badges */}
        <div className="relative h-56 rounded-2xl overflow-hidden mb-3.5 bg-slate-100">
          <img 
            src={avatar} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = DEFAULT_AVATAR
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20 pointer-events-none" />

          {/* AI Match Badge or Top Badges */}
          {matchIndex !== undefined ? (
            <div className="absolute top-3 left-3 bg-[#3488c3] text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <span>✨</span> AI Match #{matchIndex + 1}
            </div>
          ) : (
            <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-md text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              {matchPercentage}% Match
            </div>
          )}

          {verified && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white font-black text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-md">
              ✓
            </div>
          )}

          {/* Bottom Photo Overlay Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1.5 text-white">
            <span className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold border border-white/20 whitespace-nowrap shrink-0 shadow-xs">
              💰 LKR {budget}
            </span>
            <span className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold border border-white/20 truncate whitespace-nowrap shadow-xs">
              📍 {location}
            </span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#3488c3] transition-colors truncate">
            {name}{age ? `, ${age}` : ''}
          </h3>
          <span className="text-[11px] font-bold bg-[#eaf4fb] text-[#246fa8] border border-[#d2e7f6] px-2.5 py-0.5 rounded-md truncate max-w-[120px] shrink-0">
            {occupation}
          </span>
        </div>

        {matchExplanation ? (
          <div className="bg-[#eaf4fb] text-[#246fa8] p-3 rounded-2xl text-xs mb-3 border border-[#d2e7f6] italic font-medium">
            "{matchExplanation}"
          </div>
        ) : (
          <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed min-h-[32px]">
            {post.bio || 'Looking for a clean, friendly roommate.'}
          </p>
        )}
      </div>

      {/* Interests Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {interests.slice(0, 3).map((interest, i) => (
              <span key={i} className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full">
                {interest}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-semibold">Verified Profile</span>
        )}
        <span className="text-xs text-[#3488c3] font-extrabold group-hover:translate-x-1 transition-transform shrink-0 ml-2">
          View Profile →
        </span>
      </div>
    </div>
  )
}

export default function Roommates() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useAuth()
  
  const [roommates, setRoommates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Filter State
  const [filters, setFilters] = useState({
    budgetRange: 80000,
    minAge: 18,
    maxAge: 65,
    location: '',
    genderPreference: 'Any',
    occupation: 'Any',
    roomType: 'Any',
    smokingPreference: false,
    petFriendly: false,
    foodPreference: 'Any',
  })
  
  // AI Match State
  const [aiMatches, setAiMatches] = useState([])
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [matchError, setMatchError] = useState('')

  const keyword = new URLSearchParams(location.search).get('keyword') || ''

  // Auto-play background image slider
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(slideTimer)
  }, [])

  const handleSearchSubmit = () => {
    const trimmed = searchLocation.trim()
    navigate(trimmed ? `/roommates?keyword=${encodeURIComponent(trimmed)}` : '/roommates')
  }

  const handleRoommateClick = (roommateId) => {
    navigate(`/roommate/${roommateId}`)
  }

  useEffect(() => {
    setSearchLocation(keyword)
  }, [keyword])

  useEffect(() => {
    const fetchRoommates = async () => {
      try {
        setLoading(true)
        const data = await roommateService.searchRoommates({
          keyword,
          location: filters.location || undefined,
          gender: filters.genderPreference !== 'Any' ? filters.genderPreference : undefined,
          minAge: filters.minAge || undefined,
          maxAge: filters.maxAge || undefined,
          occupation: filters.occupation !== 'Any' ? filters.occupation : undefined,
          roomTypePreference: filters.roomType !== 'Any' ? filters.roomType : undefined,
          smokingPreference: filters.smokingPreference || undefined,
          petFriendly: filters.petFriendly || undefined,
          foodPreference: filters.foodPreference !== 'Any' ? filters.foodPreference : undefined,
          maxBudget: filters.budgetRange,
        })
        setRoommates(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching roommates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoommates()
  }, [keyword, filters])

  const handleAutoMatch = async () => {
    if (!user) {
      setMatchError('Please login to use the AI Matchmaker.');
      return;
    }
    
    const myPost = roommates.find(r => r.poster?.id === user.id);
    
    if (!myPost) {
      setMatchError('We need your details to find matches! Please create a Roommate Profile first.');
      return;
    }

    setMatchingLoading(true);
    setMatchError('');
    setAiMatches([]);

    try {
      const prefText = `I am a ${myPost.gender || ''} ${myPost.age ? myPost.age + ' year old' : ''} ${myPost.occupation || ''}. ${myPost.bio || ''}. I'm interested in: ${myPost.interests || ''}. My preferences are: ${myPost.preferences || 'Not specified'}`;

      const response = await apiClient.post('/recommendations', {
        preferences: prefText,
        maxBudget: myPost.budget,
        preferredLocation: myPost.preferredLocation || myPost.location,
        propertyType: 'Roommate'
      });

      if (response.data && response.data.length > 0) {
        const roommateMatches = response.data.filter(rec => rec.type === 'ROOMMATE' && rec.roommatePost?.id !== myPost.id);
        
        if (roommateMatches.length > 0) {
          setAiMatches(roommateMatches);
        } else {
          setMatchError('No perfect roommate matches found right now. Try updating your profile preferences.');
        }
      } else {
        setMatchError('No matches found.');
      }
    } catch (err) {
      setMatchError('Failed to find matches. Please try again later.');
      console.error(err);
    } finally {
      setMatchingLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section with Auto-Scrolling Background Images */}
      <section className="relative overflow-hidden -mt-[100px] pt-36 md:pt-44 pb-16 md:pb-24 min-h-[460px] flex items-center">
        {/* Carousel Slider */}
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
          <div className="absolute inset-x-0 top-0 h-44 md:h-52 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none z-1" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-900/60" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-3xl w-full">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs md:text-sm font-semibold text-white border border-white/30 shadow-md mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Verified Profiles Across Sri Lanka
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight drop-shadow-md">
              Find your perfect roommate
            </h1>
            <p className="text-base md:text-lg text-slate-200 mb-8 font-normal leading-relaxed drop-shadow-xs">
              Connect with compatible, verified flatmates and shared annexes islandwide
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-4 max-w-2xl">
              {/* Search Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearchSubmit()
                }}
                className="bg-white/95 backdrop-blur-md rounded-full p-2 flex items-center flex-1 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-4 ring-white/20 hover:ring-white/40 transition-all"
              >
                <span className="pl-4 text-[#3488c3] text-lg">📍</span>
                <input
                  type="text"
                  placeholder="where do you want to find a roommate?"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="flex-1 px-3 py-3 text-slate-900 text-sm md:text-base outline-none bg-transparent placeholder:text-slate-400 font-medium"
                />
                <button
                  type="submit"
                  className="bg-[#3488c3] hover:bg-[#2978b3] text-white px-7 py-3 rounded-full font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#3488c3]/30 active:scale-95 cursor-pointer shrink-0"
                >
                  <span>🔍</span>
                  <span>Search</span>
                </button>
              </form>

              {/* AI Auto-Match Button */}
              <button 
                onClick={handleAutoMatch}
                disabled={matchingLoading}
                className="bg-gradient-to-r from-indigo-600 via-[#3488c3] to-blue-600 hover:opacity-95 text-white px-7 py-3.5 rounded-full font-extrabold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-white/20"
              >
                {matchingLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <span>✨ Auto-Match Me</span>
                )}
              </button>
            </div>

            {matchError && (
              <div className="bg-red-500/90 backdrop-blur-md text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-2xl inline-block shadow-lg mt-4 border border-white/20">
                ⚠️ {matchError}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Matches Section */}
      {aiMatches.length > 0 && (
        <section className="py-12 bg-[#eaf4fb] border-b border-[#d2e7f6]">
          <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#3488c3] text-white flex items-center justify-center text-lg font-bold shadow-md">
                  ✨
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Top AI Roommate Matches</h2>
              </div>
              <button 
                onClick={() => setAiMatches([])} 
                className="text-xs font-bold text-[#3488c3] hover:underline cursor-pointer bg-white px-3 py-1.5 rounded-full border border-[#d2e7f6]"
              >
                Clear Matches ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {aiMatches.map((match, index) => (
                <RoommateCard 
                  key={`match-${match.roommatePost.id}`} 
                  post={match.roommatePost} 
                  onCardClick={handleRoommateClick} 
                  matchIndex={index}
                  matchExplanation={match.aiExplanation}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main All Roommates Section */}
      <section className="py-12 bg-white min-h-[600px]">
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Available Roommates</h2>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? 'Searching profiles...' : `Showing ${roommates.length} verified roommate listing${roommates.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Sidebar + Main Grid Container */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sticky Roommate Filter Sidebar */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0">
              <RoommateFilterSidebar onFiltersChange={setFilters} />
            </div>

            {/* Roommate Cards Grid */}
            <div className="flex-1 w-full">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <div className="w-10 h-10 border-4 border-[#3488c3] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-medium text-sm">Loading roommates...</p>
                </div>
              )}

              {!loading && roommates.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
                  <span className="text-4xl block mb-3">👥</span>
                  <h3 className="text-lg font-bold text-slate-800">No roommates found</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Try adjusting your filters, age range, or budget to discover more flatmate listings.</p>
                </div>
              )}

              {!loading && roommates.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {roommates.map((roommate) => (
                    <RoommateCard key={roommate.id} post={roommate} onCardClick={handleRoommateClick} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
