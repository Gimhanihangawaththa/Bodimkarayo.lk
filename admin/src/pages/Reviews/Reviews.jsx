import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { 
  Star, Search, Trash2, Home, User, 
  MessageSquare, AlertCircle, RefreshCw, Eye, X, ExternalLink
} from 'lucide-react';

const Reviews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  // Sync rating filter from URL query param
  const currentRating = searchParams.get('rating') || 'ALL';

  const handleRatingChange = (rating) => {
    if (rating === 'ALL') {
      searchParams.delete('rating');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams), rating });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/admin/reviews');
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load user reviews from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone and will affect property rating averages.')) return;
    try {
      setDeletingId(id);
      await apiClient.delete(`/admin/reviews/${id}`);
      setReviews(prev => prev.filter(r => r.id !== id));
      if (selectedReview?.id === id) {
        setSelectedReview(null);
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Failed to delete review. Ensure administrator permissions.');
    } finally {
      setDeletingId(null);
    }
  };

  // Dynamic tab counts
  const counts = {
    ALL: reviews.length,
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = 
      rev.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.reviewer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.reviewer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.property?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = 
      currentRating === 'ALL' || 
      rev.rating === Number(currentRating);

    return matchesSearch && matchesRating;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <MessageSquare className="text-amber-500" size={26} />
            Property Reviews & Ratings Moderation
          </h1>
          <p className="text-gray-600 text-sm mt-1">Audit tenant feedback, investigate fraudulent ratings, and ensure review authenticity.</p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 shadow-xs transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-gray-500'} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs with Counts */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200 pb-3">
        {['ALL', '5', '4', '3', '2', '1'].map(tab => (
          <button
            key={tab}
            onClick={() => handleRatingChange(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              currentRating === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab === 'ALL' ? (
              <span>All Ratings</span>
            ) : (
              <>
                <span>{tab}</span>
                <Star size={12} className={currentRating === tab ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'} />
              </>
            )}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              currentRating === tab ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {counts[tab]}
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
            placeholder="Search by review comment, reviewer, or property name..."
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
                <th scope="col" className="px-6 py-4">Reviewer</th>
                <th scope="col" className="px-6 py-4">Target Property</th>
                <th scope="col" className="px-6 py-4">Rating</th>
                <th scope="col" className="px-6 py-4">Feedback Comment</th>
                <th scope="col" className="px-6 py-4">Date</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading property reviews from database...
                    </div>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No reviews found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => {
                  const isDeleting = deletingId === rev.id;

                  return (
                    <tr key={rev.id} className="bg-white border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => setSelectedReview(rev)}
                        >
                          {rev.reviewer?.profilePictureUrl ? (
                            <img className="w-9 h-9 rounded-full object-cover border border-gray-200" src={rev.reviewer.profilePictureUrl} alt="avatar" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                              {rev.reviewer?.fullName ? rev.reviewer.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                              {rev.reviewer?.fullName || 'Anonymous'}
                              <Eye size={13} className="opacity-0 group-hover:opacity-100 text-blue-500 transition" />
                            </div>
                            <div className="font-normal text-gray-400 text-xs">{rev.reviewer?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-gray-900 truncate max-w-[220px]" title={rev.property?.title}>
                          {rev.property?.title || `Property #${rev.property?.id || 'N/A'}`}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[220px]">
                          {rev.property?.location || ''}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full w-fit border border-amber-100">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                              />
                            ))}
                          </div>
                          <span>{rev.rating}.0</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p 
                          onClick={() => setSelectedReview(rev)}
                          className="text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-lg border border-gray-100 line-clamp-2 max-w-sm cursor-pointer transition" 
                          title={rev.comment}
                        >
                          "{rev.comment}"
                        </p>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedReview(rev)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Inspect Review"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            disabled={isDeleting}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Review"
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

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="text-amber-500" size={18} />
                Review Inspection #{selectedReview.id}
              </h3>
              <button 
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              {/* Rating header */}
              <div className="flex items-center justify-between bg-amber-50/70 p-3.5 rounded-xl border border-amber-100">
                <span className="text-xs font-bold text-amber-900 uppercase">Assigned Rating</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-amber-800 text-sm ml-1">{selectedReview.rating} / 5</span>
                </div>
              </div>

              {/* Full Comment */}
              <div>
                <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Feedback Comment</span>
                <p className="text-gray-800 bg-gray-50 p-4 rounded-xl text-xs leading-relaxed border border-gray-100 font-normal">
                  "{selectedReview.comment}"
                </p>
              </div>

              {/* Reviewer & Property Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Author (Tenant)</span>
                  <p className="font-bold text-gray-900 text-xs">{selectedReview.reviewer?.fullName || 'Anonymous'}</p>
                  <p className="text-[11px] text-gray-500 truncate">{selectedReview.reviewer?.email || 'N/A'}</p>
                  <Link
                    to="/users"
                    className="text-[11px] font-bold text-blue-600 hover:underline mt-1.5 inline-flex items-center gap-1"
                  >
                    <ExternalLink size={11} /> Inspect User
                  </Link>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Boarding Place</span>
                  <p className="font-bold text-gray-900 text-xs truncate">{selectedReview.property?.title || 'Unknown Property'}</p>
                  <p className="text-[11px] text-gray-500 truncate">{selectedReview.property?.location || 'N/A'}</p>
                  {selectedReview.property?.title && (
                    <Link
                      to={`/properties?search=${encodeURIComponent(selectedReview.property.title)}`}
                      className="text-[11px] font-bold text-blue-600 hover:underline mt-1.5 inline-flex items-center gap-1"
                    >
                      <ExternalLink size={11} /> View Property
                    </Link>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-gray-400 text-right">
                Posted on: {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleString() : 'N/A'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => handleDeleteReview(selectedReview.id)}
                disabled={deletingId === selectedReview.id}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                Delete Review
              </button>
              <button
                onClick={() => setSelectedReview(null)}
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

export default Reviews;
