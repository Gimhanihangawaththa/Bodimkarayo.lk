import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_URL = 'http://localhost:4000/api'
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'

const emptyForm = {
  age: '',
  occupation: '',
  location: '',
  bio: '',
  interests: '',
  preferences: '',
  budget: '',
}

export default function ApplyRoommate() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingPostId, setExistingPostId] = useState(null)

  useEffect(() => {
    if (!user || !token) return
    // Check if user already has a roommate post
    fetchUserRoommatePost()
  }, [user, token])

  const fetchUserRoommatePost = async () => {
    try {
      const res = await fetch(`${API_URL}/roommates`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const posts = await res.json()
        // Find post created by current user
        const userPost = posts.find(p => p.poster?.id === user?.id)
        if (userPost) {
          setExistingPostId(userPost.id)
          setForm({
            age: userPost.age || '',
            occupation: userPost.occupation || '',
            location: userPost.location || '',
            bio: userPost.bio || '',
            interests: userPost.interests || '',
            preferences: userPost.preferences || '',
            budget: userPost.budget || '',
          })
        }
      }
    } catch (e) {
      console.error('Error fetching roommate post:', e)
    }
  }

  const isLoggedIn = Boolean(user)
  const userName = user?.fullName || user?.email || ''
  const userAvatar = user?.profilePictureUrl || DEFAULT_AVATAR
  const userGender = user?.gender || 'Not specified'

  const formValid = useMemo(() => {
    return form.age && form.occupation && form.location && form.bio
  }, [form])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!formValid || loading) return

    setLoading(true)
    setMessage('')

    const payload = {
      gender: user?.gender || null,
      age: parseInt(form.age),
      occupation: form.occupation,
      location: form.location,
      bio: form.bio,
      interests: form.interests,
      preferences: form.preferences,
      budget: form.budget ? parseFloat(form.budget) : null,
      poster: { id: user.id }
    }

    try {
      const url = existingPostId 
        ? `${API_URL}/roommates/${existingPostId}`
        : `${API_URL}/roommates`
      const method = existingPostId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setExistingPostId(data.id)
        setMessage('You are now listed in the roommates section.')
        setTimeout(() => navigate('/roommates'), 1500)
      } else {
        setMessage('Failed to save roommate profile. Please try again.')
      }
    } catch (error) {
      console.error('Error saving roommate post:', error)
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!existingPostId) {
      setMessage('No active roommate post to remove.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const res = await fetch(`${API_URL}/roommates/${existingPostId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setMessage('You have been removed from the roommates section.')
        setExistingPostId(null)
        setForm(emptyForm)
      } else {
        setMessage('Failed to remove roommate post.')
      }
    } catch (error) {
      console.error('Error removing roommate post:', error)
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="mx-auto max-w-xl px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h1>
            <p className="text-gray-600 mb-6">You must be logged in to apply as a roommate.</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
              onClick={() => navigate('/signin')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Apply as a Roommate</h1>
          <p className="text-gray-600 mt-2">
            Your name and profile picture are taken from your account. Fill in the details below.
          </p>
          
          {/* User Info Display */}
          <div className="mt-4 flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img 
              src={userAvatar} 
              alt={userName}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">{userName}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-xs text-gray-500">Gender: {userGender}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleApply} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Age *</label>
              <input 
                name="age" 
                type="number" 
                value={form.age} 
                onChange={handleChange} 
                className="mt-1 w-full border rounded-md px-3 py-2"
                required 
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Occupation *</label>
              <input 
                name="occupation" 
                value={form.occupation} 
                onChange={handleChange} 
                className="mt-1 w-full border rounded-md px-3 py-2"
                required 
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Location *</label>
              <input 
                name="location" 
                value={form.location} 
                onChange={handleChange} 
                className="mt-1 w-full border rounded-md px-3 py-2"
                required 
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Budget (optional)</label>
              <input 
                name="budget" 
                type="number" 
                step="0.01"
                value={form.budget} 
                onChange={handleChange} 
                className="mt-1 w-full border rounded-md px-3 py-2"
                placeholder="Monthly budget"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Bio *</label>
            <textarea 
              name="bio" 
              rows="3" 
              value={form.bio} 
              onChange={handleChange} 
              className="mt-1 w-full border rounded-md px-3 py-2"
              placeholder="Tell us about yourself..."
              required 
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Interests (comma separated)</label>
            <input 
              name="interests" 
              value={form.interests} 
              onChange={handleChange} 
              className="mt-1 w-full border rounded-md px-3 py-2"
              placeholder="e.g., Reading, Cooking, Sports"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Preferences (optional)</label>
            <textarea 
              name="preferences" 
              rows="2" 
              value={form.preferences} 
              onChange={handleChange} 
              className="mt-1 w-full border rounded-md px-3 py-2"
              placeholder="Any specific preferences for a roommate?"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!formValid || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition"
            >
              {loading ? 'Saving...' : existingPostId ? 'Update Profile' : 'Apply'}
            </button>
            {existingPostId && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-800 px-6 py-2 rounded-md font-medium transition"
              >
                Remove from Roommates
              </button>
            )}
          </div>

          {message && (
            <p className={`text-sm ${message.includes('error') || message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
