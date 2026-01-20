import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import logo from '../assets/logo.jpg'

export default function SignUp() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ username, email, password })
  }

  return (
    <div className="min-h-screen grid grid-cols-2 bg-white">
      {/* Left panel */}
      <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)' }} className="flex relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.07),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(0,0,0,0.15),transparent_40%)]" />
        <div className="absolute -left-16 -top-10 w-96 h-96 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute right-[-80px] top-24 w-80 h-80 rounded-full bg-black/15 blur-2xl" />

        <div className="relative z-10 flex items-center justify-center w-full p-14">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 max-w-lg w-full shadow-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-6">Welcome!</p>
            <h1 className="text-5xl font-bold leading-tight mb-4">Join Us!</h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Let's find your perfect place together
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Bodimkarayo" className="h-16 w-auto rounded-md object-contain" />
          </div>
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-2">Sign Up</h2>
            <p className="text-sm text-gray-600">Glad you're here!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white">Sign Up</Button>
          </form>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex-1 h-px bg-gray-200" />
            <span>Or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex justify-center gap-4 text-2xl text-gray-500">
            <span className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center">G</span>
            <span className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center">f</span>
            <span className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center">GH</span>
          </div>

          <div className="text-center text-sm text-gray-700">
            Already have an account?{' '}
            <Link to="/signin" className="text-blue-700 font-semibold hover:underline">
              Login
            </Link>
          </div>

          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <button type="button" className="hover:text-gray-700">Terms & Conditions</button>
            <button type="button" className="hover:text-gray-700">Support</button>
            <button type="button" className="hover:text-gray-700">Customer Care</button>
          </div>
        </div>
      </div>
    </div>
  )
}
