import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STORAGE_KEY = 'appliedRoommate'

const emptyForm = {
  name: '',
  age: '',
  occupation: '',
  location: '',
  bio: '',
  interests: '',
  avatarUrl: '',
}

export default function ApplyRoommate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        setForm({
          name: data.name || user.username || '',
          age: data.age || '',
          occupation: data.occupation || '',
          location: data.location || '',
          bio: data.bio || '',
          interests: Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || ''),
          avatarUrl: data.avatarUrl || '',
        })
        return
      }
    } catch (e) {
      // ignore
    }
    setForm((prev) => ({ ...prev, name: user.username || '' }))
  }, [user])

  const isLoggedIn = Boolean(user)

  const formValid = useMemo(() => {
    return form.name && form.age && form.occupation && form.location && form.bio
  }, [form])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleApply = (e) => {
    e.preventDefault()
    if (!formValid) return

    const payload = {
      id: Date.now(),
      name: form.name,
      age: Number(form.age),
      occupation: form.occupation,
      location: form.location,
      bio: form.bio,
      interests: form.interests
        ? form.interests.split(',').map((i) => i.trim()).filter(Boolean)
        : [],
      avatarUrl: form.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      verified: false,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    setMessage('You are now listed in the roommates section.')
    navigate('/roommates')
  }

  const handleRemove = () => {
    localStorage.removeItem(STORAGE_KEY)
    setMessage('You have been removed from the roommates section.')
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
          <p className="text-gray-600 mt-2">Your name is prefilled. Update any details and apply.</p>
        </div>

        <form onSubmit={handleApply} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Age</label>
              <input name="age" type="number" value={form.age} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Occupation</label>
              <input name="occupation" value={form.occupation} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Bio</label>
            <textarea name="bio" rows="3" value={form.bio} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Interests (comma separated)</label>
            <input name="interests" value={form.interests} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Avatar URL (optional)</label>
            <input name="avatarUrl" value={form.avatarUrl} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2" />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!formValid}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-md font-medium transition"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md font-medium transition"
            >
              Remove from Roommates
            </button>
          </div>

          {message && <p className="text-sm text-green-600">{message}</p>}
        </form>
      </div>
    </div>
  )
}
