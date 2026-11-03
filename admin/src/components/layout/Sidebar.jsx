import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Home, Settings, LogOut, 
  ShieldAlert, UserCheck, MessageSquare, ExternalLink 
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import logo from '../../assets/logo.png';

const Sidebar = () => {
  const { logout } = useAdminAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={19} /> },
    { name: 'Users', path: '/users', icon: <Users size={19} /> },
    { name: 'Properties', path: '/properties', icon: <Home size={19} /> },
    { name: 'Roommates', path: '/roommates', icon: <UserCheck size={19} /> },
    { name: 'Reviews', path: '/reviews', icon: <MessageSquare size={19} /> },
    { name: 'Reports', path: '/reports', icon: <ShieldAlert size={19} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={19} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed top-0 left-0 border-r border-slate-800 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <img 
          src={logo} 
          alt="Bodimkarayo Logo" 
          className="h-10 w-10 object-contain bg-white rounded-xl p-1 shadow-sm shrink-0" 
        />
        <div>
          <div className="text-base font-black tracking-tight text-white flex items-center gap-0.5">
            Bodimkarayo<span className="text-[#3488c3]">.lk</span>
          </div>
          <span className="inline-block px-1.5 py-0.2 bg-blue-500/20 text-[#3488c3] text-[10px] font-black uppercase tracking-wider rounded-md border border-blue-500/30">
            Admin Console
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs ${
                isActive
                  ? 'bg-[#3488c3] text-white shadow-md shadow-[#3488c3]/30 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        <a 
          href="http://localhost:5173" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <ExternalLink size={16} />
            <span>View Public Site</span>
          </span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">:5173</span>
        </a>
        <button 
          onClick={logout}
          className="flex items-center gap-2.5 px-3.5 py-2 w-full text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition cursor-pointer text-xs font-semibold"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
