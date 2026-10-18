import { Link, useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  const stats = [
    { label: 'University & Tech Hubs', value: '25+', icon: '📍' },
    { label: 'Verified Listings', value: '1,200+', icon: '🏠' },
    { label: 'Successful Matches', value: '3,500+', icon: '🤝' },
    { label: 'Student Satisfaction', value: '99%', icon: '⭐' }
  ]

  const pillars = [
    {
      icon: '🛡️',
      title: 'Verified Boarding Places',
      description: 'Transparent room descriptions, key money terms, utility breakdown, distance to main roads, and real room photos.'
    },
    {
      icon: '🧠',
      title: 'Smart Roommate Matching',
      description: 'Connect with flatmates based on university, faculty, study hours, lifestyle habits, and budget preferences.'
    },
    {
      icon: '💬',
      title: 'Direct Secure Chat',
      description: 'Communicate with landlords and potential flatmates directly through our built-in real-time messaging system.'
    },
    {
      icon: '⚡',
      title: 'Effortless Property Hosting',
      description: 'Property owners and landlords can list available rooms, annexes, or full houses in under 3 minutes.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* 1. Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-[#1b4b6d] text-white py-16 md:py-24 px-4 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,136,195,0.25),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs md:text-sm font-semibold text-blue-200">
            <span>✨</span>
            <span>Sri Lanka's #1 Student & Youth Housing Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Simplifying <span className="text-[#4da3e0]">Boarding Life</span> Across Sri Lanka
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Bodimkarayo.lk connects university students and young professionals with verified boarding places, annexes, and compatible flatmates—making relocation transparent, safe, and effortless.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/properties"
              className="bg-[#3488c3] hover:bg-[#2978b3] text-white font-bold text-sm md:text-base px-8 py-3.5 rounded-full shadow-lg shadow-[#3488c3]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              Explore Boarding Places
            </Link>
            <Link
              to="/roommates"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm md:text-base px-8 py-3.5 rounded-full backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              Find a Roommate
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-16 -mt-8 relative z-20">
        {/* 2. Impact Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-center space-y-1"
            >
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-xs md:text-sm font-semibold text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 3. Our Mission & Story */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xs space-y-6">
          <div className="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-[#3488c3] font-bold text-xs uppercase tracking-wider">
            Our Story & Mission
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Why We Built Bodimkarayo.lk
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-4 leading-relaxed font-normal text-base md:text-lg">
            <p>
              Moving to a new city for higher education or a job offer is an exciting milestone. However, in Sri Lanka, finding a safe boarding room ("bodima") or compatible roommates has historically been frustrating—relying on word-of-mouth, misleading newspaper ads, or broker commissions.
            </p>
            <p>
              <strong>Bodimkarayo.lk</strong> was created to digitize and elevate Sri Lanka's boarding culture. We empower students from top Sri Lankan universities and tech professionals to search listings with complete clarity on key money, utility arrangements, location distances, and real photo verification.
            </p>
          </div>
        </div>

        {/* 4. Core Value Pillars */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-[#3488c3] font-bold text-xs uppercase tracking-wider">
              Core Features
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
              Designed for Students & Flatmates
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base max-w-2xl mx-auto">
              Everything you need for a smooth boarding experience in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex gap-5 items-start"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl shrink-0 border border-blue-100">
                  {pillar.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Call To Action Banner */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-lg text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
            Ready to Find Your Next Home or Flatmate?
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Join thousands of Sri Lankan university students and professionals finding verified boarding places and compatible roommates today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/properties')}
              className="bg-[#3488c3] hover:bg-[#2978b3] text-white font-bold text-sm md:text-base px-8 py-3.5 rounded-full shadow-lg shadow-[#3488c3]/30 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Browse Properties
            </button>
            <button
              onClick={() => navigate('/add-property')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm md:text-base px-8 py-3.5 rounded-full shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Post a Property
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
