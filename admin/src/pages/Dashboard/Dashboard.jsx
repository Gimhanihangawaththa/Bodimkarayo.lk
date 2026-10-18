import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, ShieldCheck, Activity, ArrowRight } from 'lucide-react';
import apiClient from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalOwners: 0,
    activeProperties: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch both users and properties concurrently
      const [usersRes, propertiesRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/properties')
      ]);

      const users = usersRes.data;
      const properties = propertiesRes.data;

      // Calculate Stats
      setStats({
        totalUsers: users.length,
        totalOwners: users.filter(u => u.role === 'OWNER').length,
        totalProperties: properties.length,
        activeProperties: properties.length // Assuming all returned are active for now
      });

      // Get Recent Data (assuming the backend returns them roughly in order, or we just take the last 5)
      // If there's a createdAt date, we could sort by it. For now, just taking the last 5 elements as a mockup
      setRecentUsers(users.slice(-5).reverse());
      setRecentProperties(properties.slice(-5).reverse());

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${bgColorClass} ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Overview Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">Welcome back! Here is what's happening on Bodimkarayo.lk today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          colorClass="text-blue-600" 
          bgColorClass="bg-blue-50" 
        />
        <StatCard 
          title="Total Properties" 
          value={stats.totalProperties} 
          icon={Home} 
          colorClass="text-purple-600" 
          bgColorClass="bg-purple-50" 
        />
        <StatCard 
          title="Registered Owners" 
          value={stats.totalOwners} 
          icon={ShieldCheck} 
          colorClass="text-green-600" 
          bgColorClass="bg-green-50" 
        />
        <StatCard 
          title="Active Listings" 
          value={stats.activeProperties} 
          icon={Activity} 
          colorClass="text-orange-600" 
          bgColorClass="bg-orange-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Recent Signups</h2>
            <Link to="/users" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map(user => (
              <div key={user.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'OWNER' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">No recent users.</div>}
          </div>
        </div>

        {/* Recent Properties List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">New Properties</h2>
            <Link to="/properties" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProperties.map(property => (
              <div key={property.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <Home size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm truncate max-w-[200px]">{property.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      Rs {property.rent?.toLocaleString()} • {property.location}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500 capitalize bg-gray-100 px-2.5 py-1 rounded-full">
                  {property.propertyType}
                </span>
              </div>
            ))}
            {recentProperties.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">No recent properties.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
