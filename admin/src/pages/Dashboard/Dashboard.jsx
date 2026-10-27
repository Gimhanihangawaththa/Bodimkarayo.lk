import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Home, ShieldCheck, Activity, ArrowRight, 
  Clock, ShieldAlert, AlertTriangle, CheckCircle,
  RefreshCw, MessageSquare, UserCheck, Layers
} from 'lucide-react';
import apiClient from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalOwners: 0,
    activeProperties: 0,
    pendingProperties: 0,
    rejectedProperties: 0,
    rentedProperties: 0,
    pendingReports: 0,
    totalRoommates: 0,
    totalReviews: 0,
    verifiedUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [statsRes, usersRes, propertiesRes] = await Promise.all([
        apiClient.get('/admin/stats').catch(() => ({ data: {} })),
        apiClient.get('/admin/users').catch(() => ({ data: [] })),
        apiClient.get('/admin/properties').catch(() => ({ data: [] }))
      ]);

      if (statsRes.data) {
        setStats(prev => ({
          ...prev,
          ...statsRes.data
        }));
      }

      const users = usersRes.data || [];
      const properties = propertiesRes.data || [];

      setRecentUsers(users.slice(-5).reverse());
      setRecentProperties(properties.slice(-5).reverse());
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass, note, to }) => {
    const CardContent = (
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md transition-shadow flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-gray-800">{value ?? 0}</h3>
          {note && <p className="text-[11px] text-gray-400 mt-1 font-medium">{note}</p>}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColorClass} ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
    );

    return to ? (
      <Link to={to} className="block transition-transform hover:-translate-y-0.5">
        {CardContent}
      </Link>
    ) : (
      CardContent
    );
  };

  if (loading) {
    return (
      <div className="p-12 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold">Loading platform analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Title and Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Command Center</h1>
          <p className="text-gray-600 text-sm mt-1">Real-time metrics, platform health, and moderation queues for Bodimkarayo.lk.</p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 shadow-xs transition cursor-pointer"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-600' : 'text-gray-500'} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* Action Banners for Pending Tasks */}
      <div className="space-y-3 mb-8">
        {stats.pendingProperties > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  {stats.pendingProperties} Listing{stats.pendingProperties > 1 ? 's' : ''} Pending Review
                </h4>
                <p className="text-xs text-amber-700">
                  Landlords have submitted boarding advertisements awaiting your approval before becoming visible to students.
                </p>
              </div>
            </div>
            <Link
              to="/properties?tab=PENDING"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 self-start sm:self-auto flex-shrink-0 shadow-xs"
            >
              Review Listings <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {stats.pendingReports > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  {stats.pendingReports} Dispute Ticket{stats.pendingReports > 1 ? 's' : ''} Require Moderation
                </h4>
                <p className="text-xs text-rose-700">
                  Users have flagged potential scams or misleading advertisements. Review these reports promptly.
                </p>
              </div>
            </div>
            <Link
              to="/reports?status=PENDING"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 self-start sm:self-auto flex-shrink-0 shadow-xs"
            >
              Resolve Reports <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Active Listings" 
          value={stats.activeProperties} 
          icon={Activity} 
          colorClass="text-emerald-600" 
          bgColorClass="bg-emerald-50" 
          note={`${stats.totalProperties} total registered`}
          to="/properties?tab=ACTIVE"
        />
        <StatCard 
          title="Pending Approval" 
          value={stats.pendingProperties} 
          icon={Clock} 
          colorClass="text-amber-600" 
          bgColorClass="bg-amber-50" 
          note="Awaiting moderation"
          to="/properties?tab=PENDING"
        />
        <StatCard 
          title="Pending Reports" 
          value={stats.pendingReports} 
          icon={ShieldAlert} 
          colorClass="text-rose-600" 
          bgColorClass="bg-rose-50" 
          note="Unresolved user tickets"
          to="/reports?status=PENDING"
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          colorClass="text-blue-600" 
          bgColorClass="bg-blue-50" 
          note={`${stats.totalOwners} registered landlords`}
          to="/users"
        />
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Rented Out</p>
            <p className="text-lg font-bold text-gray-800">{stats.rentedProperties}</p>
          </div>
        </div>

        <Link 
          to="/users?role=OWNER" 
          className="bg-white p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-xs transition flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Verified Owners</p>
            <p className="text-lg font-bold text-gray-800">{stats.verifiedUsers}</p>
          </div>
        </Link>

        <Link 
          to="/roommates"
          className="bg-white p-4 rounded-xl border border-gray-100 hover:border-cyan-200 hover:shadow-xs transition flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100 transition flex items-center justify-center">
            <UserCheck size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Roommate Ads</p>
            <p className="text-lg font-bold text-gray-800">{stats.totalRoommates}</p>
          </div>
        </Link>

        <Link 
          to="/reviews"
          className="bg-white p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-xs transition flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition flex items-center justify-center">
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Reviews Logged</p>
            <p className="text-lg font-bold text-gray-800">{stats.totalReviews}</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users List */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Signups</h2>
              <p className="text-xs text-gray-400">Newly registered students and landlords</p>
            </div>
            <Link to="/users" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map(user => (
              <div key={user.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{user.fullName}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'OWNER' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role}
                  </span>
                  {user.verified && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">No recent users.</div>}
          </div>
        </div>

        {/* Recent Properties List */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Listings</h2>
              <p className="text-xs text-gray-400">Newly submitted boarding advertisements</p>
            </div>
            <Link to="/properties" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProperties.map(property => (
              <div key={property.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <Home size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{property.title}</p>
                    <p className="text-xs text-gray-400">
                      Rs {property.rent?.toLocaleString?.() || property.rent} • {property.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    property.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : property.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800'
                      : property.status === 'RENTED'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {property.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
            {recentProperties.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">No recent properties.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
