import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'

export default function Footer() {
  const { user, token } = useAuth()
  const year = new Date().getFullYear()
  const isOwner = user?.role === 'OWNER'

  return (
    <footer className="bg-white text-slate-700 border-t border-slate-200/80 pt-12 pb-8">
      <div className="w-full px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block -ml-1">
              <img src={logo} alt="Bodimkarayo.lk" className="h-16 md:h-20 w-auto object-contain mix-blend-multiply scale-110 origin-left" />
            </Link>
            <p className="text-xs md:text-sm text-slate-500 leading-snug font-medium max-w-xs md:max-w-sm">
              Sri Lanka's trusted platform for finding verified boarding places and compatible flatmates.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-1">
              <span>📍</span>
              <span>Moratuwa • Colombo • Malabe • Kandy</span>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/properties" className="text-slate-700 hover:text-[#3488c3] transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/roommates" className="text-slate-700 hover:text-[#3488c3] transition-colors">
                  Find Roommates
                </Link>
              </li>
              {isOwner ? (
                <li>
                  <Link to="/add-property" className="text-[#3488c3] hover:text-[#2978b3] font-bold transition-colors">
                    Post a Property
                  </Link>
                </li>
              ) : (
                <li>
                  <Link to={token ? "/profile" : "/signin"} className="text-slate-700 hover:text-[#3488c3] transition-colors">
                    List Your Property
                  </Link>
                </li>
              )}
              <li>
                <Link to="/about" className="text-slate-700 hover:text-[#3488c3] transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Account & Support */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
              Account & Legal
            </h3>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link to={token ? "/profile" : "/signin"} className="text-slate-700 hover:text-[#3488c3] transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to={token ? "/settings" : "/signin"} className="text-slate-700 hover:text-[#3488c3] transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <span className="text-slate-500 hover:text-slate-800 cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-slate-800 cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Community */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
              Connect With Us
            </h3>
            <div className="space-y-3.5 text-sm">
              <a 
                href="https://wa.me/94770000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 font-bold text-xs transition-all shadow-xs"
              >
                <span>💬</span> WhatsApp Support
              </a>
              <div className="flex items-center gap-3 pt-1">
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#3488c3] text-slate-600 hover:text-white flex items-center justify-center transition-colors text-xs font-bold shadow-xs"
                  title="Facebook"
                >
                  FB
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#3488c3] text-slate-600 hover:text-white flex items-center justify-center transition-colors text-xs font-bold shadow-xs"
                  title="Instagram"
                >
                  IG
                </a>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1">
                Email: <a href="mailto:support@bodimkarayo.lk" className="text-[#3488c3] hover:underline font-semibold">support@bodimkarayo.lk</a>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {year} Bodimkarayo.lk. All rights reserved.</p>
          <p>
            Made with <span className="text-red-500">❤️</span> for Sri Lankan Students & Young Professionals
          </p>
        </div>
      </div>
    </footer>
  )
}
