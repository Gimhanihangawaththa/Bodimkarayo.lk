import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../config/api.config'

const API_URL = 'http://localhost:4000/api'
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'

const RoommateCard = ({ post, onCardClick, matchIndex, matchExplanation }) => {
  const name = post.poster?.fullName || post.poster?.email || 'Anonymous'
  const avatar = post.poster?.profilePictureUrl || DEFAULT_AVATAR
  const interests = post.interests ? post.interests.split(',').map(i => i.trim()).filter(Boolean) : []
  const verified = post.poster?.verified || false
  const gender = post.gender || post.poster?.gender

  return (
    <div
      onClick={() => onCardClick(post.id)}
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transition w-full cursor-pointer flex flex-col h-full transform hover:-translate-y-1 relative"
    >
      {matchIndex !== undefined && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
          AI Match #{matchIndex + 1}
        </div>
      )}
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
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {name}{post.age ? `, ${post.age}` : ''}
            </h3>
            {post.occupation && (
              <p className="text-xs text-gray-500 truncate">{post.occupation}</p>
            )}
            {gender && (
              <p className="text-xs text-gray-500">{gender}</p>
            )}
          </div>
          {verified && <span className="text-blue-600 font-bold text-lg ml-2 flex-shrink-0">✓</span>}
        </div>
        {post.location && (
          <p className="text-sm text-gray-600 mb-2 truncate">📍 {post.location}</p>
        )}
        {post.budget && (
          <p className="text-sm text-gray-600 mb-2">💰 LKR {post.budget.toLocaleString()}/month</p>
        )}
        
        {matchExplanation && (
          <div className="bg-indigo-50 text-indigo-900 p-3 rounded-lg text-sm mb-3 border border-indigo-100 italic shadow-inner">
            "{matchExplanation}"
          </div>
        )}
        
        {!matchExplanation && post.bio && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{post.bio}</p>
        )}
        
        <div className="mt-auto">
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {interests.slice(0, 3).map((interest, i) => (
                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Roommates() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [roommates, setRoommates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState('')
  const [filteredRoommates, setFilteredRoommates] = useState([])
  
  // AI Match State
  const [aiMatches, setAiMatches] = useState([])
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [matchError, setMatchError] = useState('')

  const handleRoommateClick = (roommateId) => {
    navigate(`/roommate/${roommateId}`)
  }

  useEffect(() => {
    fetchRoommates()
  }, [])

  useEffect(() => {
    if (searchLocation.trim()) {
      const filtered = roommates.filter(r => 
        r.location?.toLowerCase().includes(searchLocation.toLowerCase())
      )
      setFilteredRoommates(filtered)
    } else {
      setFilteredRoommates(roommates)
    }
  }, [searchLocation, roommates])

  const fetchRoommates = async () => {
    try {
      const headers = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const res = await fetch(`${API_URL}/roommates`, { headers })
      if (res.ok) {
        const data = await res.json()
        setRoommates(data)
        setFilteredRoommates(data)
      }
    } catch (error) {
      console.error('Error fetching roommates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoMatch = async () => {
    if (!user) {
      setMatchError('Please login to use the AI Matchmaker.');
      return;
    }
    
    // Find the user's roommate post
    const myPost = roommates.find(r => r.poster?.id === user.id);
    
    if (!myPost) {
      setMatchError('We need your details to find matches! Please create a Roommate Profile first.');
      return;
    }

    setMatchingLoading(true);
    setMatchError('');
    setAiMatches([]);

    try {
      // Build preferences string from their post
      const prefText = `I am a ${myPost.gender || ''} ${myPost.age ? myPost.age + ' year old' : ''} ${myPost.occupation || ''}. ${myPost.bio || ''}. I'm interested in: ${myPost.interests || ''}. My preferences are: ${myPost.preferences || 'Not specified'}`;

      const response = await apiClient.post('/recommendations', {
        preferences: prefText,
        maxBudget: myPost.budget,
        preferredLocation: myPost.preferredLocation || myPost.location,
        propertyType: 'Roommate' // Focus on roommate matches if possible, though backend returns both
      });

      if (response.data && response.data.length > 0) {
        // Filter only roommate matches for this page, or just display whatever comes back
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
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #93a5cf 0%, #a8b8d8 50%, #c5d4e8 100%)' }} className="py-12 text-gray-900 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Find your perfect roommate
          </h1>
          <p className="text-base text-gray-700 mb-6">
            Connect with verified roommates across Sri Lanka
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Box */}
            <div className="bg-white rounded-full p-1 flex items-center flex-1 shadow-lg overflow-hidden">
              <span className="pl-4 text-gray-400">📍</span>
              <input
                type="text"
                placeholder="Search by location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1 px-3 py-3 text-gray-900 outline-none bg-white"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2">
                <span>🔍</span>
                Search
              </button>
            </div>
            
            {/* Match Me Button */}
            <button 
              onClick={handleAutoMatch}
              disabled={matchingLoading}
              className="bg-indigo-900 hover:bg-indigo-800 text-white px-8 py-4 rounded-full font-bold shadow-lg transition flex items-center justify-center gap-2 flex-shrink-0"
            >
              {matchingLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Matching...
                </>
              ) : (
                <>
                  <span className="text-xl">✨</span>
                  Auto-Match Me
                </>
              )}
            </button>
          </div>
          
          {matchError && (
            <div className="bg-white/90 backdrop-blur-sm text-red-600 px-4 py-2 rounded-lg font-medium inline-block shadow mt-2">
              {matchError}
            </div>
          )}
        </div>
      </section>

      {/* AI Matches Section */}
      {aiMatches.length > 0 && (
        <section className="py-12 bg-indigo-50 border-b border-indigo-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">✨</span>
              <h2 className="text-2xl font-bold text-gray-900">Your Top AI Matches</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <div className="mt-6 text-right">
              <button onClick={() => setAiMatches([])} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Clear Matches ✕
              </button>
            </div>
          </div>
        </section>
      )}

      {/* All Roommates */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Available Roommates</h2>
            <p className="text-gray-600 mt-1">
              {loading ? 'Loading...' : `Showing ${filteredRoommates.length} roommate${filteredRoommates.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading roommates...</p>
            </div>
          ) : filteredRoommates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No roommates found. Be the first to apply!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {filteredRoommates.map((roommate) => (
                <RoommateCard key={roommate.id} post={roommate} onCardClick={handleRoommateClick} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
