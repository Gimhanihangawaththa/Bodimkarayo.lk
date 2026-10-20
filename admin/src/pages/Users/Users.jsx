import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { 
  Search, MoreVertical, Shield, User as UserIcon, CheckCircle, 
  XCircle, Trash2, ArrowUpCircle, Ban, Check, AlertCircle,
  RefreshCw, Eye, X, Filter, Calendar, Clock
} from 'lucide-react';

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Sync role from URL query param
  const currentRole = (searchParams.get('role') || 'ALL').toUpperCase();

  const handleRoleChange = (role) => {
    if (role === 'ALL') {
      searchParams.delete('role');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams), role });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Ensure you have administrator access.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerify = async (id, currentVerified) => {
    try {
      setActionLoadingId(id);
      await apiClient.put(`/admin/users/${id}/verify`, {
        verified: !currentVerified
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, verified: !currentVerified } : u));
      if (selectedUser?.id === id) {
        setSelectedUser(prev => ({ ...prev, verified: !currentVerified }));
      }
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to update verification status:', err);
      alert('Failed to update user verification.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleActiveStatus = async (id, currentIsActive) => {
    const action = currentIsActive ? 'suspend' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      setActionLoadingId(id);
      await apiClient.put(`/admin/users/${id}/status`, {
        isActive: !currentIsActive
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !currentIsActive } : u));
      if (selectedUser?.id === id) {
        setSelectedUser(prev => ({ ...prev, isActive: !currentIsActive }));
      }
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to update user status:', err);
      alert('Failed to update user active status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      setActionLoadingId(id);
      await apiClient.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      if (selectedUser?.id === id) {
        setSelectedUser(prev => ({ ...prev, role: newRole }));
      }
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to update user role:', err);
      alert('Failed to update user role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? All associated properties and reviews will be removed.')) return;
    try {
      setActionLoadingId(id);
      await apiClient.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Dynamic role counts
  const counts = {
    ALL: users.length,
    TENANT: users.filter(u => u.role === 'TENANT').length,
    OWNER: users.filter(u => u.role === 'OWNER').length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = currentRole === 'ALL' || user.role === currentRole;

    const matchesVerification = 
      verificationFilter === 'ALL' ||
      (verificationFilter === 'VERIFIED' && user.verified) ||
      (verificationFilter === 'UNVERIFIED' && !user.verified);

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && user.isActive) ||
      (statusFilter === 'SUSPENDED' && !user.isActive);

    return matchesSearch && matchesRole && matchesVerification && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Governance & Accounts</h1>
          <p className="text-gray-600 text-sm mt-1">Manage platform accounts, verify landlord credentials, and adjust governance roles.</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 shadow-xs transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-gray-500'} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Role Tabs with Dynamic Counts */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200 pb-3">
        {[
          { key: 'ALL', label: 'All Users', count: counts.ALL },
          { key: 'TENANT', label: 'Tenants', count: counts.TENANT },
          { key: 'OWNER', label: 'Landlords (Owners)', count: counts.OWNER },
          { key: 'ADMIN', label: 'Admins', count: counts.ADMIN },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleRoleChange(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
              currentRole === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              currentRole === tab.key ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 mb-6 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 py-2 outline-none transition"
            placeholder="Search by full name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Verification Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Filter size={14} className="text-gray-400" />
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">All Verification</option>
              <option value="VERIFIED">Verified ID Only</option>
              <option value="UNVERIFIED">Unverified Only</option>
            </select>
          </div>

          {/* Account Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4">User</th>
                <th scope="col" className="px-6 py-4">Role</th>
                <th scope="col" className="px-6 py-4">Verification</th>
                <th scope="col" className="px-6 py-4">Account Status</th>
                <th scope="col" className="px-6 py-4">Joined</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading users from database...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActionLoading = actionLoadingId === user.id;

                  return (
                    <tr key={user.id} className="bg-white border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => setSelectedUser(user)}
                        >
                          {user.profilePictureUrl ? (
                            <img className="w-10 h-10 rounded-full object-cover border border-gray-200" src={user.profilePictureUrl} alt="avatar" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                              {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon size={18} />}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                              {user.fullName || 'Anonymous User'}
                              <Eye size={13} className="opacity-0 group-hover:opacity-100 text-blue-500 transition" />
                            </div>
                            <div className="font-normal text-gray-400 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'OWNER' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role === 'ADMIN' && <Shield size={12} />}
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleVerify(user.id, user.verified)}
                          disabled={isActionLoading}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                            user.verified 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title="Click to toggle verified status"
                        >
                          {isActionLoading ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : user.verified ? (
                            <CheckCircle size={13} />
                          ) : (
                            <XCircle size={13} />
                          )}
                          <span>{user.verified ? 'Verified ID' : 'Unverified'}</span>
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.isActive 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-6 py-4 text-right relative whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick Inspect Button */}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Inspect User Details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Quick Suspend / Reactivate */}
                          {user.isActive ? (
                            <button
                              onClick={() => handleToggleActiveStatus(user.id, true)}
                              disabled={isActionLoading}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Suspend Account"
                            >
                              <Ban size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleActiveStatus(user.id, false)}
                              disabled={isActionLoading}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              title="Reactivate Account"
                            >
                              <Check size={16} />
                            </button>
                          )}

                          {/* Action Dropdown */}
                          <div className="relative inline-block">
                            <button 
                              onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <MoreVertical size={16} />
                            </button>
                            
                            {openDropdownId === user.id && (
                              <div className="absolute right-0 top-8 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 text-left overflow-hidden">
                                <div className="py-1">
                                  <button 
                                    onClick={() => setSelectedUser(user)}
                                    className="w-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Eye size={14} className="text-gray-500" />
                                    View Full Profile
                                  </button>

                                  <button 
                                    onClick={() => handleToggleVerify(user.id, user.verified)}
                                    className="w-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <CheckCircle size={14} className="text-emerald-600" />
                                    {user.verified ? 'Revoke Verification' : 'Verify Landlord ID'}
                                  </button>
                                  
                                  {user.role !== 'OWNER' && (
                                    <button 
                                      onClick={() => handleUpdateRole(user.id, 'OWNER')}
                                      className="w-full px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                                    >
                                      <ArrowUpCircle size={14} />
                                      Promote to Owner
                                    </button>
                                  )}

                                  {user.role === 'OWNER' && (
                                    <button 
                                      onClick={() => handleUpdateRole(user.id, 'TENANT')}
                                      className="w-full px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                    >
                                      Demote to Tenant
                                    </button>
                                  )}

                                  <div className="border-t border-gray-100 my-1"></div>

                                  <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                    Delete Account
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details & Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">User Profile & Governance</h3>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* User Identity Banner */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {selectedUser.profilePictureUrl ? (
                  <img 
                    src={selectedUser.profilePictureUrl} 
                    alt="avatar" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shadow-xs">
                    {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : <UserIcon size={24} />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 truncate">{selectedUser.fullName || 'Anonymous'}</h4>
                  <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Account ID: #{selectedUser.id}</p>
                </div>
              </div>

              {/* Status and Verification Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Verification Status</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`text-xs font-bold inline-flex items-center gap-1 ${
                      selectedUser.verified ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {selectedUser.verified ? <CheckCircle size={13} /> : <XCircle size={13} />}
                      {selectedUser.verified ? 'Verified ID' : 'Unverified'}
                    </span>
                    <button
                      onClick={() => handleToggleVerify(selectedUser.id, selectedUser.verified)}
                      disabled={actionLoadingId === selectedUser.id}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Toggle
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Account Access</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`text-xs font-bold inline-flex items-center gap-1 ${
                      selectedUser.isActive ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${selectedUser.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      {selectedUser.isActive ? 'Active' : 'Suspended'}
                    </span>
                    <button
                      onClick={() => handleToggleActiveStatus(selectedUser.id, selectedUser.isActive)}
                      disabled={actionLoadingId === selectedUser.id}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      {selectedUser.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">
                  Assign Platform Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['TENANT', 'OWNER', 'ADMIN'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleUpdateRole(selectedUser.id, role)}
                      disabled={selectedUser.role === role || actionLoadingId === selectedUser.id}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                        selectedUser.role === role
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Calendar size={13} /> Joined Date:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={13} /> Last Profile Update:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-rose-700">Permanent Removal</h5>
                  <p className="text-[11px] text-gray-500">Cascades properties, reviews, and roommate ads.</p>
                </div>
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  disabled={actionLoadingId === selectedUser.id}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} />
                  Delete User
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
