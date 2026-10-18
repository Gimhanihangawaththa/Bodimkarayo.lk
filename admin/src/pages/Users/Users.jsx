import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { Search, MoreVertical, Shield, User as UserIcon, CheckCircle, XCircle, Trash2, ArrowUpCircle } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all their properties, posts, and reviews.')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user.');
    }
  };

  const handleUpgradeRole = async (id) => {
    if (!window.confirm('Are you sure you want to upgrade this user to an OWNER?')) return;
    try {
      await apiClient.put(`/users/${id}/upgrade-role`);
      setUsers(users.map(u => u.id === id ? { ...u, role: 'OWNER' } : u));
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to upgrade user role:', err);
      alert('Failed to upgrade user role.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage all registered users on the platform.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 outline-none"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100">
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4">User</th>
                <th scope="col" className="px-6 py-4">Role</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Joined</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3 whitespace-nowrap">
                      {user.profilePictureUrl ? (
                        <img className="w-10 h-10 rounded-full object-cover" src={user.profilePictureUrl} alt="avatar" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <UserIcon size={20} />
                        </div>
                      )}
                      <div>
                        <div className="text-base font-semibold text-gray-800">{user.fullName}</div>
                        <div className="font-normal text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-max ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'OWNER' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'ADMIN' && <Shield size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-medium flex items-center gap-1 ${user.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                          {user.verified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {user.verified ? 'Verified' : 'Unverified'}
                        </span>
                        <span className={`text-xs font-medium flex items-center gap-1 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          {user.isActive ? 'Active' : 'Banned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                        className="p-2 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {openDropdownId === user.id && (
                        <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 text-left overflow-hidden">
                          <div className="py-1">
                            {user.role !== 'OWNER' && user.role !== 'ADMIN' && (
                              <button 
                                onClick={() => handleUpgradeRole(user.id)}
                                className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                              >
                                <ArrowUpCircle size={16} />
                                Upgrade to Owner
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Delete User
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
