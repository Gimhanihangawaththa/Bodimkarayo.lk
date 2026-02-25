import logo from '../assets/logo.jpg'

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white text-gray-800">
      <div className="w-full px-8 py-12">
        <div className="grid grid-cols-4 gap-12 mb-8">
          <div>
            <img src={logo} alt="Bodimkarayo" className="h-16 w-auto rounded-md object-contain mb-4" />
            <p className="text-sm text-gray-600">Sri Lanka's trusted platform for finding boardings and roommates.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-blue-700 hover:text-blue-900 transition">About us</a></li>
              <li><a href="#" className="text-blue-700 hover:text-blue-900 transition">Blog</a></li>
              <li><a href="#" className="text-blue-700 hover:text-blue-900 transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-blue-700 hover:text-blue-900 transition">Help Center</a></li>
              <li><a href="#" className="text-blue-700 hover:text-blue-900 transition">Contact</a></li>
              <li><a href="#" className="text-blue-700 hover:text-blue-900 transition">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-blue-700 hover:text-blue-900 transition">Facebook</a></li>
              <li><a href="#" className="text-blue-700 hover:text-blue-900 transition">Twitter</a></li>
              <li><a href="#" className="text-blue-700 hover:text-blue-900 transition">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-200 pt-8 text-center text-sm text-gray-600">
          <p>© {year} bodimkarayo.lk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
