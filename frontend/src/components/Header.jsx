import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { searchService } from '../services'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const isLoggedIn = Boolean(token)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [suggestions, setSuggestions] = useState({ properties: [], roommates: [] })
  const [isSearchingLive, setIsSearchingLive] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const userMenuRef = useRef(null)
  const searchInputRef = useRef(null)
  const searchContainerRef = useRef(null)

  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search)
      setSearchQuery(params.get('keyword') || '')
    } else {
      setSearchQuery('')
    }
    setShowDropdown(false)
  }, [location.pathname, location.search])

  // Instant Live Typeahead suggestions as you type (250ms debounce)
  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      setSuggestions({ properties: [], roommates: [] })
      setIsSearchingLive(false)
      setShowDropdown(false)
      return
    }

    setIsSearchingLive(true)
    const timer = setTimeout(async () => {
      try {
        const results = await searchService.globalSearch(trimmed)
        const props = Array.isArray(results?.properties) ? results.properties.slice(0, 3) : []
        const rooms = Array.isArray(results?.roommates) ? results.roommates.slice(0, 2) : []
        setSuggestions({ properties: props, roommates: rooms })
        setShowDropdown(true)
      } catch (err) {
        console.error('Typeahead search error:', err)
      } finally {
        setIsSearchingLive(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Global ⌘K / Ctrl+K keyboard shortcut to focus search bar
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (searchInputRef.current) {
          searchInputRef.current.focus()
          setShowDropdown(true)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdown and user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close user menu on route change
  useEffect(() => {
    setUserMenuOpen(false)
  }, [location.pathname])

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user && token) {
      const fetchUnread = async () => {
        try {
          const res = await fetch(`http://localhost:4000/api/chat/unread-count/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const count = await res.json();
            setUnreadCount(count);
          }
        } catch (err) {
          console.error("Error fetching unread count", err);
        }
      };

      fetchUnread();
      const interval = setInterval(fetchUnread, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/signin')
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const keyword = searchQuery.trim()
    if (!keyword) {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
      return
    }
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`)
  }

  const userInitial = user && user.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'
  const userName = user && user.fullName ? user.fullName : 'User'
  return (
    <header className="sticky top-0 z-50 border-b border-blue-100/70 bg-white text-gray-900 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="w-full px-4 md:px-8 py-3 flex items-center gap-4 justify-between">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Bodimkarayo" className="h-12 w-auto rounded-xl object-contain shadow-sm" />
        </Link>

        <div className="flex-1 flex items-center gap-4 min-w-0">
          <nav className="flex items-center gap-2 flex-shrink-0 rounded-full bg-slate-50/90 p-1 ring-1 ring-slate-200 overflow-x-auto">
            <Link
              to="/properties"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border border-transparent hover:border-blue-200 hover:text-blue-700 ${
                location.pathname === '/properties' ? 'bg-blue-600 text-white shadow-md shadow-blue-200/60' : 'text-slate-700'
              }`}
            >
              Properties
            </Link>
            <Link
              to="/roommates"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border border-transparent hover:border-blue-200 hover:text-blue-700 ${
                location.pathname === '/roommates' ? 'bg-blue-600 text-white shadow-md shadow-blue-200/60' : 'text-slate-700'
              }`}
            >
              Roommates
            </Link>
            <Link
              to="/chat"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border border-transparent hover:border-blue-200 hover:text-blue-700 relative ${
                location.pathname === '/chat' ? 'bg-blue-600 text-white shadow-md shadow-blue-200/60' : 'text-slate-700'
              }`}
            >
              Chat
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </nav>

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="w-full px-4 md:px-8 py-3 min-h-[76px] flex items-center justify-between gap-4">
        
        {/* 1. Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center group -my-2">
            <img 
              src={logo} 
              alt="Bodimkarayo.lk" 
              className="h-14 md:h-20 w-auto object-contain mix-blend-multiply scale-135 md:scale-150 group-hover:scale-155 transition-transform duration-300" 
            />
          </Link>
        </div>

        {/* 2. Middle: Spacious Navigation Buttons */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60">
          <Link
            to="/properties"
            className={`px-5 py-2 rounded-full text-sm transition-all duration-200 ${
              location.pathname === '/properties'
                ? 'bg-[#3488c3] text-white font-extrabold shadow-sm shadow-[#3488c3]/30'
                : 'text-slate-700 font-bold hover:text-[#3488c3] hover:bg-white bg-transparent'
            }`}
          >
            Properties
          </Link>
          <Link
            to="/roommates"
            className={`px-5 py-2 rounded-full text-sm transition-all duration-200 ${
              location.pathname === '/roommates'
                ? 'bg-[#3488c3] text-white font-extrabold shadow-sm shadow-[#3488c3]/30'
                : 'text-slate-700 font-bold hover:text-[#3488c3] hover:bg-white bg-transparent'
            }`}
          >
            Roommates
          </Link>
          <Link
            to="/chat"
            className={`px-5 py-2 rounded-full text-sm transition-all duration-200 flex items-center gap-1.5 ${
              location.pathname === '/chat'
                ? 'bg-[#3488c3] text-white font-extrabold shadow-sm shadow-[#3488c3]/30'
                : 'text-slate-700 font-bold hover:text-[#3488c3] hover:bg-white bg-transparent'
            }`}
          >
            Chat
          </Link>
          <Link
            to="/about"
            className={`px-5 py-2 rounded-full text-sm transition-all duration-200 ${
              location.pathname === '/about'
                ? 'bg-[#3488c3] text-white font-extrabold shadow-sm shadow-[#3488c3]/30'
                : 'text-slate-700 font-bold hover:text-[#3488c3] hover:bg-white bg-transparent'
            }`}
          >
            About Us
          </Link>
        </nav>

        {/* 3. Right: Spotlight Search Bar & User Account Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Global Search Bar with Live Typeahead Dropdown */}
          <div ref={searchContainerRef} className="relative hidden lg:block w-72 lg:w-[380px] xl:w-[440px]">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center bg-white border border-slate-200 hover:border-slate-300 focus-within:border-[#3488c3] focus-within:ring-4 focus-within:ring-[#3488c3]/15 rounded-full p-1.5 transition-all shadow-xs">
                <div className="pl-3 pr-1.5 text-[#3488c3] pointer-events-none shrink-0">
                  {isSearchingLive ? (
                    <div className="w-4 h-4 border-2 border-[#3488c3] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search rooms, locations, roommates..."
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) setShowDropdown(true)
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 px-2 py-1 outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setShowDropdown(false)
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors mr-1 cursor-pointer text-xs"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#3488c3] hover:bg-[#2978b3] text-white font-bold text-xs px-4 py-2 rounded-full transition-all flex items-center gap-1 shrink-0 shadow-sm shadow-[#3488c3]/30 active:scale-95 cursor-pointer"
                >
                  <span>Search</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Instant Floating Suggestions Dropdown */}
            {showDropdown && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {isSearchingLive && (
                  <div className="p-4 text-center text-xs text-slate-500 font-medium">
                    Searching live in Elasticsearch...
                  </div>
                )}

                {/* No Matches preview */}
                {!isSearchingLive && suggestions.properties.length === 0 && suggestions.roommates.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No instant matches for <span className="font-bold text-slate-700">"{searchQuery}"</span>. Press Enter to view full results.
                  </div>
                )}

                {/* Property Suggestions */}
                {suggestions.properties.length > 0 && (
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1">
                      🏠 Boarding & Properties
                    </p>
                    <div className="space-y-1">
                      {suggestions.properties.map((prop) => (
                        <div
                          key={prop.id}
                          onClick={() => {
                            setShowDropdown(false)
                            navigate(`/property/${prop.id}`)
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <img
                            src={prop.images && prop.images.length > 0 ? prop.images[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'}
                            alt={prop.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#3488c3]">
                              {prop.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              📍 {prop.location || prop.address || 'Sri Lanka'} • <span className="font-semibold text-emerald-600">Rs {prop.rent?.toLocaleString()}/mo</span>
                            </p>
                          </div>
                          {prop.genderPreference && prop.genderPreference !== 'Both' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 shrink-0">
                              {prop.genderPreference}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Roommate Suggestions */}
                {suggestions.roommates.length > 0 && (
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1">
                      👥 Roommate Profiles
                    </p>
                    <div className="space-y-1">
                      {suggestions.roommates.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => {
                            setShowDropdown(false)
                            navigate(`/roommate/${room.id}`)
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <img
                            src={room.poster?.profilePictureUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                            alt="Roommate"
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#3488c3]">
                              {room.poster?.fullName || room.poster?.email || 'Roommate'}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              📍 {room.preferredLocation || room.location || 'Any location'} • {room.occupation || room.gender || 'Student'}
                            </p>
                          </div>
                          {room.gender && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 shrink-0">
                              {room.gender}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Full Search Link */}
                <button
                  type="button"
                  onClick={(e) => handleSearchSubmit(e)}
                  className="w-full p-2.5 bg-slate-50 hover:bg-[#3488c3] hover:text-white text-[#3488c3] font-bold text-xs text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View all results for "{searchQuery}"</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>

          {/* User Account Menu Dropdown */}
          {isLoggedIn ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-white hover:bg-slate-50 rounded-full transition-all text-left border border-slate-200/80 shadow-xs cursor-pointer"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold flex items-center justify-center text-xs shadow-xs overflow-hidden ring-2 ring-white">
                  {user && user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <div className="hidden sm:block text-xs">
                  <p className="font-bold text-slate-900 leading-tight max-w-[110px] truncate">{userName}</p>
                  <p className="text-slate-500 text-[10px] font-medium leading-tight">Account</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'Logged in'}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#3488c3] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#3488c3] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="bg-[#3488c3] hover:bg-[#2978b3] text-white px-5 py-2.5 rounded-full text-xs font-bold transition shadow-md shadow-[#3488c3]/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
