import logo from '../assets/logo.svg'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <img src={logo} alt="Bodimkarayo" width={36} height={36} />
          Bodimkarayo.lk
        </a>
        <nav className="hidden md:flex gap-8 items-center">
          <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Find Property</a>
          <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Find Roommate</a>
          <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Add Listing</a>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
            Sign Up
          </button>
        </nav>
      </div>
    </header>
  );
}
