import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const TopNavbar = () => {
  return (
    <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
        <Search size={18} className="text-gray-500 mr-2" />
        <input 
          type="text" 
          placeholder="Search users, properties..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
          <User size={18} />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
