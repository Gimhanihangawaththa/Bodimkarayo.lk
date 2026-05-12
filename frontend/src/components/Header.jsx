import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/logo.jpg'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const isLoggedIn = Boolean(token)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchQuery(params.get('keyword') || '')
  }, [location.search])

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
    navigate('/signin')
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const keyword = searchQuery.trim()
    navigate(keyword ? `/search?keyword=${encodeURIComponent(keyword)}` : '/search')
  }

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

          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-2 shadow-sm w-full max-w-md ml-auto focus-within:ring-2 focus-within:ring-blue-200"
          >
            <span className="text-blue-500">🔍</span>
            <input
              type="text"
              placeholder="Search anything"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm shadow-blue-200/60">
              Search
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 md:gap-4">
              <Link to="/profile" className="hidden md:inline-flex text-slate-600 hover:text-blue-600 font-semibold transition">
                My Profile
              </Link>
              <Link to="/profile" className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold cursor-pointer hover:bg-slate-300 transition overflow-hidden shadow-sm ring-1 ring-white">
                {user && user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span>{user && user.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}</span>
                )}
              </Link>
              <Link to="/settings" className="text-slate-600 hover:text-blue-600 transition p-2 rounded-full hover:bg-blue-50" title="Settings">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </Link>
              <button onClick={handleLogout} className="inline-flex text-slate-600 hover:text-red-600 font-semibold transition">
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-semibold transition shadow-sm shadow-blue-200/60"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
