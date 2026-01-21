import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.jpg'

export default function Header() {
  const location = useLocation()
  // TODO: Replace with actual authentication state management (e.g., from Context API or Redux)
  const isLoggedIn = false // Set to true when user is authenticated
  
  return (
    <header className="bg-white text-gray-900 border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 md:px-8 py-3 flex items-center gap-4 justify-between">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Bodimkarayo" className="h-12 w-auto rounded-md object-contain" />
        </Link>

        <div className="flex-1 flex items-center gap-4 min-w-0">
          <nav className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/properties"
              className={`px-4 py-2 rounded-full text-base font-semibold transition border border-transparent hover:border-blue-200 hover:text-blue-700 ${
                location.pathname === '/properties' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-800'
              }`}
            >
              Properties
            </Link>
            <Link
              to="/roommates"
              className={`px-4 py-2 rounded-full text-base font-semibold transition border border-transparent hover:border-blue-200 hover:text-blue-700 ${
                location.pathname === '/roommates' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-800'
              }`}
            >
              Roommates
            </Link>
          </nav>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm w-full max-w-md ml-auto">
            <span className="text-gray-400">📍</span>
            <input
              type="text"
              placeholder="Search locations"
              className="flex-1 px-3 py-2 text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition">
              Search
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-blue-600 font-semibold transition">
                My Profile
              </button>
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold cursor-pointer hover:bg-gray-400 transition">
                👤
              </div>
              <button className="text-gray-600 hover:text-red-600 font-semibold transition">
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-semibold transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
