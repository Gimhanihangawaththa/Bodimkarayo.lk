import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const isLoggedIn = Boolean(token)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchQuery(params.get('keyword') || '')
  }, [location.search])

  // Global ⌘K / Ctrl+K keyboard shortcut to focus search bar
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close user menu on route change
  useEffect(() => {
    setUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/signin')
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const keyword = searchQuery.trim()
    navigate(keyword ? `/search?keyword=${encodeURIComponent(keyword)}` : '/search')
  }

  const userInitial = user && user.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'
  const userName = user && user.fullName ? user.fullName : 'User'

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
          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:block w-72 lg:w-[380px] xl:w-[440px]">
            <div className="relative flex items-center bg-white border border-slate-200 hover:border-slate-300 focus-within:border-[#3488c3] focus-within:ring-4 focus-within:ring-[#3488c3]/15 rounded-full p-1.5 transition-all shadow-xs">
              <div className="pl-3 pr-1.5 text-[#3488c3] pointer-events-none shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search rooms, locations, roommates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 px-2 py-1 outline-none font-medium"
              />
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
