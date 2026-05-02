import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Home, Settings, LogOut } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const Sidebar = () => {
  const { logout } = useAdminAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Properties', path: '/properties', icon: <Home size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-400">Admin Panel</h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
