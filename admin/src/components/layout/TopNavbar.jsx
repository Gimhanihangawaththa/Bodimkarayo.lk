import React from 'react';
import { Bell, Search, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const TopNavbar = () => {
  const { admin } = useAdminAuth();

  return (
    <header className="bg-white/95 backdrop-blur-md h-16 border-b border-slate-200/90 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Search Bar */}
      <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 w-80 md:w-96 focus-within:ring-2 focus-within:ring-[#3488c3] focus-within:border-[#3488c3] focus-within:bg-white transition-all shadow-2xs">
        <Search size={16} className="text-slate-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="Search users, properties, roommates..." 
          className="bg-transparent border-none outline-none text-xs font-medium w-full text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Right side info */}
      <div className="flex items-center gap-4">
        <button 
          className="text-slate-400 hover:text-slate-600 relative p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#3488c3] rounded-full ring-2 ring-white"></span>
        </button>
        
        {/* Administrator Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/80">
          <div className="h-9 w-9 bg-blue-50 text-[#3488c3] rounded-xl flex items-center justify-center font-black text-sm border border-blue-200/80 shadow-2xs">
            {admin?.fullName ? admin.fullName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
              {admin?.fullName || 'Administrator'}
              <ShieldCheck size={13} className="text-[#3488c3]" />
            </div>
            <div className="text-[10px] font-medium text-slate-400 leading-tight">
              {admin?.email || 'admin@bodimkarayo.lk'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
