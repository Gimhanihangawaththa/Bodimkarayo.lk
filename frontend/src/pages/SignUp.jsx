import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80"
];

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.')
      return
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.')
      return
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.')
      return
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError('Password must contain at least one special character (e.g. !@#$%^&*).')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
      const response = await axios.post(`${baseUrl}/auth/register`, { 
        fullName, 
        email, 
        password 
      }, { withCredentials: true })
      
      const authData = response.data
      login({ user: authData.user, token: authData.token, refreshToken: authData.refreshToken })
      navigate('/')
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white antialiased">
      
      {/* Left Column - Crisp Light Form Section (5 Cols on LG) */}
      <div className="lg:col-span-5 bg-white border-r border-slate-200/80 p-6 md:p-10 flex flex-col justify-between relative z-20 min-h-screen">
        
        {/* Top Section: Header & Fixed Brand Logo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-1">
              Bodimkarayo<span className="text-[#3488c3]">.lk</span>
            </Link>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#3488c3] text-xs font-bold transition border border-slate-200/80 cursor-pointer"
            >
              <span>←</span> Back to Home
            </Link>
          </div>

          {/* Centered Brand Logo with Fixed Position */}
          <div className="flex justify-center pt-1">
            <img 
              src={logo} 
              alt="Bodimkarayo.lk Logo" 
              className="h-28 md:h-36 w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-md" 
            />
          </div>
        </div>

        {/* Center Form Container */}
        <div className="mt-4 mb-auto max-w-md w-full mx-auto space-y-3">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-0.5">Create your account</h2>
            <p className="text-xs font-semibold text-slate-500">Glad you're here! Join 50,000+ members today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] focus:bg-white outline-none transition text-slate-900 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] focus:bg-white outline-none transition text-slate-900 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] focus:bg-white outline-none transition text-slate-900 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">Min. 8 characters with uppercase, lowercase, number & symbol</p>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] focus:bg-white outline-none transition text-slate-900 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 flex items-center gap-2" role="alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#3488c3] hover:bg-[#2978b3] text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-[#3488c3]/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </Button>
          </form>

          {/* Social Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs font-bold text-slate-400"><span className="bg-white px-3">Or continue with</span></div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2.5 transition cursor-pointer hover:shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google</span>
            </button>
            <button 
              type="button"
              className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2.5 transition cursor-pointer hover:shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          <p className="text-center text-xs font-semibold text-slate-600 pt-1">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#3488c3] font-black hover:underline hover:text-[#2978b3]">
              Log in
            </Link>
          </p>
        </div>

        {/* Bottom Trusted Note */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 text-center">
            TRUSTED BY STUDENTS & PROFESSIONALS ACROSS SRI LANKA
          </p>
        </div>

      </div>

      {/* Right Column - Hero & Floating Cards Showcase (7 Cols on LG) */}
      <div className="lg:col-span-7 bg-slate-950 relative overflow-hidden flex flex-col justify-between p-8 md:p-12 min-h-screen text-white">
        
        {/* Carousel Background Images (Vivid Clarity) */}
        {HERO_IMAGES.map((imgUrl, index) => (
          <img 
            key={imgUrl}
            src={imgUrl} 
            alt="Bodimkarayo Living" 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-70 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          />
        ))}

        {/* Brand Blue Translucent Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3488c3]/65 via-[#2978b3]/70 to-[#1d5b88]/75 pointer-events-none" />

        {/* Subtle Dark Vignette for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 pointer-events-none" />

        {/* Radial Ambient Glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Hero Headline */}
        <div className="relative z-10 max-w-xl space-y-3 pt-6">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-white/20 text-white border border-white/30 shadow-xs">
            PROPERTIES & ROOMMATES
          </span>
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
            List Places or Find Compatible Roommates.
          </h1>
          <p className="text-sm md:text-base text-white/85 font-medium leading-relaxed max-w-lg">
            Join Sri Lanka's leading community to publish property listings, discover boardings, and connect with verified flatmates.
          </p>
        </div>

        {/* Floating Overlapping Showcase Photo Cards */}
        <div className="relative z-10 my-auto py-8 flex items-center justify-center">
          <div className="relative w-full max-w-xl h-[330px] flex items-center justify-center">
            
            {/* Card 1 (Back/Left): Property Photo Card */}
            <div className="absolute -left-2 md:left-4 top-0 w-72 md:w-80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-2 border-white/30 group transition-all duration-500 hover:scale-105 hover:z-40 cursor-pointer">
              <div className="relative h-64 md:h-72 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" 
                  alt="Boarding & Property" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                
                {/* Top Property Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md flex items-center gap-1.5">
                    <span>🏢</span> Find Properties
                  </span>
                </div>

                {/* Bottom Property Label */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Boardings & Annexes</p>
                  <h4 className="text-lg font-black text-white drop-shadow-md">Verified Places in Sri Lanka</h4>
                </div>
              </div>
            </div>

            {/* Card 2 (Front/Right): Roommate Photo Card */}
            <div className="absolute right-0 md:right-4 top-12 w-72 md:w-80 rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-2 border-white/40 z-30 group transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="relative h-64 md:h-72 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80" 
                  alt="Compatible Roommate" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                
                {/* Top Roommate Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#3488c3]/85 backdrop-blur-md text-white border border-white/30 shadow-md flex items-center gap-1.5">
                    <span>👥</span> Find Roommates
                  </span>
                </div>

                {/* Bottom Roommate Label */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">⚡ AI Compatible Match</p>
                  <h4 className="text-lg font-black text-white drop-shadow-md">Connect with Flatmates</h4>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Subtext with Interactive Dots */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400 font-medium">
          <span>© {new Date().getFullYear()} Bodimkarayo.lk</span>
          <div className="flex gap-1.5">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentImageIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentImageIndex ? 'w-6 bg-[#3488c3]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
