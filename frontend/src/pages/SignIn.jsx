import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80"
];

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', { email, password })
      const authData = response.data
      login({ user: authData.user, token: authData.token })
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
        
        {/* Fixed Top Header & Centered Logo Area */}
        <div className="space-y-6">
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

          {/* Fixed Position Large Brand Logo */}
          <div className="flex justify-center pt-2">
            <img 
              src={logo} 
              alt="Bodimkarayo.lk Logo" 
              className="h-32 md:h-44 w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-md" 
            />
          </div>
        </div>

        {/* Center Form Container */}
        <div className="my-auto py-2 max-w-md w-full mx-auto space-y-4">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">Log in to your account</h2>
            <p className="text-xs font-semibold text-slate-500">Glad you're back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">✉️</span>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] focus:bg-white outline-none transition text-slate-900 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Password</label>
                  <button type="button" className="text-xs font-bold text-[#3488c3] hover:text-[#2978b3] hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] focus:bg-white outline-none transition text-slate-900 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 flex items-center gap-2" role="alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-0.5">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-[#3488c3] focus:ring-[#3488c3] cursor-pointer"
                />
                Remember me
              </label>
            </div>

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
                  Signing in...
                </span>
              ) : 'Log in'}
            </Button>
          </form>

          {/* Social Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs font-bold text-slate-400"><span className="bg-white px-3">Or continue with</span></div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button 
              type="button"
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs font-extrabold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer hover:scale-102"
            >
              <span className="font-extrabold text-blue-600">G</span> Google
            </button>
            <button 
              type="button"
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs font-extrabold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer hover:scale-102"
            >
              <span className="font-extrabold text-blue-800">f</span> Facebook
            </button>
            <button 
              type="button"
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs font-extrabold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer hover:scale-102"
            >
              <span className="font-extrabold text-slate-900">GH</span> GitHub
            </button>
          </div>

          <p className="text-center text-xs font-semibold text-slate-600 pt-2">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-[#3488c3] font-black hover:underline hover:text-[#2978b3]">
              Sign up
            </Link>
          </p>
        </div>

        {/* Bottom Trusted Partner Badges Grid (Sanity Style) */}
        <div className="border-t border-slate-100 pt-5 space-y-2.5">
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 text-center">
            TRUSTED BY STUDENTS & PROFESSIONALS ACROSS SRI LANKA
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 opacity-75 text-slate-500 text-xs font-bold">
            <span>🎓 UOM</span>
            <span>🏫 UOC</span>
            <span>🏢 SLIIT</span>
            <span>💻 NSBM</span>
            <span>⚡ IIT</span>
          </div>
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
            Find Boardings or Find Flatmates in minutes.
          </h1>
          <p className="text-sm md:text-base text-white/85 font-medium leading-relaxed max-w-lg">
            Sri Lanka's leading living portal connecting verified property owners, university students, and young professionals under one roof.
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
