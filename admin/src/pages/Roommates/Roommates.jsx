import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { 
  Users, Search, Trash2, MapPin, DollarSign, 
  Calendar, Briefcase, Eye, X, AlertCircle, RefreshCw, ExternalLink
} from 'lucide-react';

const Roommates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailModalPost, setDetailModalPost] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Sync gender filter from URL query param
  const currentGender = (searchParams.get('gender') || 'ALL').toUpperCase();

  const handleGenderChange = (gender) => {
    if (gender === 'ALL') {
      searchParams.delete('gender');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams), gender });
    }
  };

  useEffect(() => {
    fetchRoommates();
  }, []);

  const fetchRoommates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/admin/roommates');
      setPosts(response.data || []);
    } catch (err) {
      console.error('Error fetching roommate posts:', err);
      setError('Failed to load roommate advertisements from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to remove this roommate advertisement? This action cannot be undone.')) return;
    try {
      setDeletingId(id);
      await apiClient.delete(`/admin/roommates/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
      if (detailModalPost?.id === id) setDetailModalPost(null);
    } catch (err) {
      console.error('Failed to delete roommate post:', err);
      alert('Failed to delete roommate post. Ensure administrator permissions.');
    } finally {
      setDeletingId(null);
    }
  };

  // Dynamic tab counts
  const counts = {
    ALL: posts.length,
    MALE: posts.filter(p => p.gender?.toUpperCase() === 'MALE').length,
    FEMALE: posts.filter(p => p.gender?.toUpperCase() === 'FEMALE').length,
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.poster?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.poster?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.preferredLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.occupation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = 
      currentGender === 'ALL' || 
      post.gender?.toUpperCase() === currentGender;

    return matchesSearch && matchesGender;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Users className="text-blue-600" size={26} />
            Roommate Requests Moderation
          </h1>
          <p className="text-gray-600 text-sm mt-1">Review student & professional roommate advertisements, verify listing content, and moderate posts.</p>
        </div>
        <button
          onClick={fetchRoommates}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 shadow-xs transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-gray-500'} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs with Counts */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200 pb-3">
        {[
          { key: 'ALL', label: 'All Requests', count: counts.ALL },
          { key: 'MALE', label: 'Male Seekers', count: counts.MALE },
          { key: 'FEMALE', label: 'Female Seekers', count: counts.FEMALE },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleGenderChange(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
              currentGender === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              currentGender === tab.key ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 py-2 outline-none transition"
            placeholder="Search by seeker name, email, location, or occupation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Table */}
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
                <th scope="col" className="px-6 py-4">Seeker / Poster</th>
                <th scope="col" className="px-6 py-4">Gender & Age</th>
                <th scope="col" className="px-6 py-4">Preferred Location</th>
                <th scope="col" className="px-6 py-4">Monthly Budget</th>
                <th scope="col" className="px-6 py-4">Occupation</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading roommate listings from database...
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No roommate advertisements found.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const isDeleting = deletingId === post.id;

                  return (
                    <tr key={post.id} className="bg-white border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => setDetailModalPost(post)}
                        >
                          {post.poster?.profilePictureUrl ? (
                            <img className="w-10 h-10 rounded-full object-cover border border-gray-200" src={post.poster.profilePictureUrl} alt="avatar" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                              {post.poster?.fullName ? post.poster.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                              {post.poster?.fullName || 'Anonymous'}
                              <Eye size={13} className="opacity-0 group-hover:opacity-100 text-blue-500 transition" />
                            </div>
                            <div className="font-normal text-gray-400 text-xs">{post.poster?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          post.gender?.toLowerCase() === 'female' 
                            ? 'bg-pink-100 text-pink-700' 
                            : post.gender?.toLowerCase() === 'male'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {post.gender || 'Any'} {post.age ? `• ${post.age} yrs` : ''}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-700 text-xs font-medium">
                          <MapPin size={13} className="text-gray-400" />
                          <span>{post.preferredLocation || post.location || 'Flexible'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900 text-xs whitespace-nowrap">
                        {post.budget ? `Rs ${post.budget.toLocaleString()}/mo` : 'Negotiable'}
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Briefcase size={13} className="text-gray-400" />
                          <span>{post.occupation || 'Student / Professional'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setDetailModalPost(post)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Inspect Post"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            disabled={isDeleting}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Post"
                          >
                            {isDeleting ? (
                              <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
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

      {/* Roommate Details Modal */}
      {detailModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-blue-600" size={18} />
                Roommate Post #{detailModalPost.id}
              </h3>
              <button 
                onClick={() => setDetailModalPost(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700 max-h-[70vh] overflow-y-auto">
              {/* Poster info */}
              <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  {detailModalPost.poster?.profilePictureUrl ? (
                    <img className="w-10 h-10 rounded-full object-cover border border-gray-200" src={detailModalPost.poster.profilePictureUrl} alt="avatar" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {detailModalPost.poster?.fullName ? detailModalPost.poster.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-xs">{detailModalPost.poster?.fullName || 'Seeker'}</p>
                    <p className="text-[11px] text-gray-500">{detailModalPost.poster?.email || 'N/A'}</p>
                  </div>
                </div>
                <Link
                  to="/users"
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Inspect User
                </Link>
              </div>

              {/* Key criteria grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Gender & Age</span>
                  <span className="font-semibold text-gray-800">
                    {detailModalPost.gender || 'Any'} {detailModalPost.age ? `(${detailModalPost.age} yrs)` : ''}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Occupation</span>
                  <span className="font-semibold text-gray-800">{detailModalPost.occupation || 'Not specified'}</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Target Location</span>
                  <span className="font-semibold text-gray-800">
                    {detailModalPost.preferredLocation || detailModalPost.location || 'Flexible'}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Budget</span>
                  <span className="font-semibold text-emerald-700">
                    {detailModalPost.budget ? `Rs ${detailModalPost.budget.toLocaleString()}/mo` : 'Negotiable'}
                  </span>
                </div>
              </div>

              {/* About / Bio */}
              <div>
                <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">About / Bio</span>
                <p className="text-gray-800 bg-gray-50 p-3.5 rounded-xl text-xs leading-relaxed border border-gray-100">
                  {detailModalPost.about || detailModalPost.bio || 'No descriptive statement provided.'}
                </p>
              </div>

              {/* Interests & Preferences */}
              {detailModalPost.interests && (
                <div>
                  <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Interests</span>
                  <div className="flex flex-wrap gap-1.5">
                    {detailModalPost.interests.split(',').map((item, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-blue-100">
                        {item.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detailModalPost.preferences && (
                <div>
                  <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Preferences</span>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-xl text-xs border border-gray-100">
                    {detailModalPost.preferences}
                  </p>
                </div>
              )}

              {detailModalPost.moveInDate && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Calendar size={14} className="text-gray-400" />
                  <span>Target Move-in Date: <strong>{detailModalPost.moveInDate}</strong></span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => handleDeletePost(detailModalPost.id)}
                disabled={deletingId === detailModalPost.id}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                Delete Post
              </button>
              <button
                onClick={() => setDetailModalPost(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition cursor-pointer"
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

export default Roommates;
