import { useState } from 'react'

const FeaturedCard = ({ title, location, rating, reviews, price, amenities }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
    <div className="bg-gradient-to-br from-orange-300 to-pink-300 h-48" />
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">{location}</p>
      <div className="flex items-center gap-1 mb-3">
        <span className="text-yellow-400">★</span>
        <span className="text-sm font-medium">{rating}</span>
        <span className="text-sm text-gray-500">({reviews})</span>
      </div>
      <div className="flex gap-2 mb-3 text-sm text-gray-600">
        {amenities.map((a, i) => <span key={i}>{a}</span>)}
      </div>
      <p className="font-bold text-gray-900">Rs {price.toLocaleString()}</p>
    </div>
  </div>
)

const StepCard = ({ icon, number, title, desc }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-3xl">{icon}</span>
    </div>
    <h3 className="font-semibold text-gray-900 mb-2">{number}. {title}</h3>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
)

const TestimonialCard = ({ rating, text, name, role }) => (
  <div className="bg-white rounded-lg p-6 shadow">
    <div className="flex gap-1 mb-3">
      {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
    </div>
    <p className="text-gray-700 text-sm mb-4">{text}</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full" />
      <div>
        <p className="font-medium text-gray-900 text-sm">{name}</p>
        <p className="text-xs text-gray-600">{role}</p>
      </div>
    </div>
  </div>
)

export default function WithoutLogin() {
  const [searchLocation, setSearchLocation] = useState('')

  const properties = [
    {
      title: 'Cinnamon Gardens, Colombo',
      location: 'Colombo, Sri Lanka',
      rating: 4.8,
      reviews: 124,
      price: 45000,
      amenities: ['WiFi', 'AC', 'Parking'],
    },
    {
      title: 'Cinnamon Gardens, Colombo',
      location: 'Colombo, Sri Lanka',
      rating: 4.8,
      reviews: 124,
      price: 45000,
      amenities: ['WiFi', 'AC', 'Parking'],
    },
    {
      title: 'Cinnamon Gardens, Colombo',
      location: 'Colombo, Sri Lanka',
      rating: 4.8,
      reviews: 124,
      price: 50000,
      amenities: ['WiFi', 'AC', 'Parking'],
    },
    {
      title: 'Cinnamon Gardens, Colombo',
      location: 'Colombo, Sri Lanka',
      rating: 4.8,
      reviews: 124,
      price: 48000,
      amenities: ['WiFi', 'AC', 'Parking'],
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)' }} className="py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-black rounded-full mix-blend-multiply filter blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
            Find Your Perfect Boarding in<br />Sri Lanka
          </h1>
          <p className="text-lg text-white mb-8 max-w-2xl mx-auto drop-shadow-md font-medium">
            Discover comfortable rooms and verified roommates across the island. Your next home is just a search away.
          </p>
          
          {/* Search Box */}
          <div className="bg-white rounded-full p-1 flex items-center max-w-md mx-auto shadow-lg overflow-hidden">
            <input
              type="text"
              placeholder="Where do you want to stay?"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-900 outline-none bg-white"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2">
              <span>🔍</span>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured Boardings */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2">Featured Boardings</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Handpicked properties for you</h2>
          </div>
          
          <div className="grid grid-cols-4 gap-6 mb-8">
            {properties.map((prop, i) => (
              <FeaturedCard key={i} {...prop} />
            ))}
          </div>
          
          <div className="text-center">
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              View all properties →
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">How it Works</h2>
            <p className="text-gray-600">Find your perfect boarding in 3 simple steps</p>
          </div>
          
          <div className="grid grid-cols-3 gap-12">
            <StepCard
              icon="🔍"
              number="1"
              title="Search"
              desc="Browse through verified listings across Sri Lanka. Filter by location, budget, and amenities."
            />
            <StepCard
              icon="👥"
              number="2"
              title="Connect"
              desc="Connect with verified property owners and potential roommates. Chat and arrange viewings."
            />
            <StepCard
              icon="🏠"
              number="3"
              title="Move In"
              desc="Finalize your agreement and move into your new home. Start your journey with confidence."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">What Our Users Say</h2>
            <p className="text-gray-600">Trusted by thousands across Sri Lanka</p>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <TestimonialCard
              rating={5}
              text="Found my perfect boarding in Colombo within a week! The platform is so easy to use and all properties are verified. Highly recommend!"
              name="Kasun Perera"
              role="Student"
            />
            <TestimonialCard
              rating={5}
              text="Found my perfect boarding in Colombo within a week! The platform is so easy to use and all properties are verified. Highly recommend!"
              name="Kasun Perera"
              role="Student"
            />
            <TestimonialCard
              rating={5}
              text="Found my perfect boarding in Colombo within a week! The platform is so easy to use and all properties are verified. Highly recommend!"
              name="Kasun Perera"
              role="Student"
            />
          </div>
        </div>
      </section>
    </>
  )
}
