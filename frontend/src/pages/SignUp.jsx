import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SignUp = () => {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || "Registration failed")
      }

      const data = await response.json()
      console.log("Registration successful:", data)

      // Navigate to sign in page after successful registration
      navigate("/signin")
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.")
      console.error("Registration error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 items-center justify-center p-12 relative">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-purple-400 opacity-30 blur-3xl"></div>
        <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-indigo-400 opacity-20 blur-2xl"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-400 opacity-25 blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[5%] w-80 h-80 rounded-full bg-indigo-400 opacity-15 blur-2xl"></div>

        <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-3xl p-16 max-w-md border border-white/10">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to Boadimkarayo.lk!
          </h1>
          <p className="text-xl text-white/90">
            Let's find your perfect place together
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-5xl font-bold text-gray-900 mb-2">Sign up</h2>
            <p className="text-sm text-gray-500">Glad you're back!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <Input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>

          {/* Link to Sign In */}
          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/signin")}
              className="text-blue-700 font-medium cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
