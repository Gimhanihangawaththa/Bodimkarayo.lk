import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_URL = 'http://localhost:4000/api'
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'

const RoommateCard = ({ post, onCardClick }) => {
  const name = post.poster?.fullName || post.poster?.email || 'Anonymous'
  const avatar = post.poster?.profilePictureUrl || DEFAULT_AVATAR
  const interests = post.interests ? post.interests.split(',').map(i => i.trim()).filter(Boolean) : []
  const verified = post.poster?.verified || false
  const gender = post.gender || post.poster?.gender

  return (
    <div
      onClick={() => onCardClick(post.id)}
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition w-full cursor-pointer"
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
        {post.bio && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{post.bio}</p>
        )}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interests.slice(0, 3).map((interest, i) => (
              <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Roommates() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [roommates, setRoommates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState('')
  const [filteredRoommates, setFilteredRoommates] = useState([])

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
          
          {/* Search Box */}
          <div className="bg-white rounded-full p-1 flex items-center max-w-2xl shadow-lg overflow-hidden">
            <span className="pl-4 text-gray-400">�</span>
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
        </div>
      </section>

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
            <div className="grid grid-cols-4 gap-6">
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
