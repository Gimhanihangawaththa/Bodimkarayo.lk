import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { 
  Search, MoreVertical, Trash2, Home, MapPin, DollarSign, 
  CheckCircle, XCircle, AlertCircle, Clock, Eye, X
} from 'lucide-react';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab')?.toUpperCase();
  const validTabs = ['ALL', 'PENDING', 'ACTIVE', 'REJECTED', 'RENTED'];
  const initialFilter = validTabs.includes(urlTab) ? urlTab : 'ALL';

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Rejection modal state
  const [rejectModalProperty, setRejectModalProperty] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Property detail modal state
  const [detailModalProperty, setDetailModalProperty] = useState(null);

  // Sync state if URL changes externally
  useEffect(() => {
    if (urlTab && validTabs.includes(urlTab) && urlTab !== statusFilter) {
      setStatusFilter(urlTab);
    }
  }, [urlTab]);

  useEffect(() => {
    fetchProperties();
  }, [statusFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const response = await apiClient.get(`/admin/properties${query}`);
      setProperties(response.data);
    } catch (err) {
      console.error('Error fetching admin properties:', err);
      setError('Failed to load properties. Ensure you are signed in as an administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setStatusFilter(tab);
    setSearchParams(tab === 'ALL' ? {} : { tab });
  };

  const handleApprove = async (id) => {
    try {
      setSubmittingAction(true);
      const res = await apiClient.put(`/admin/properties/${id}/approve`);
      setProperties(prev => prev.map(p => (p.id === id ? res.data : p)));
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to approve property:', err);
      alert(err.response?.data?.message || 'Failed to approve listing.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenRejectModal = (property) => {
    setRejectModalProperty(property);
    setRejectionReason('Does not meet listing standards or missing required details.');
    setOpenDropdownId(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalProperty) return;
    try {
      setSubmittingAction(true);
      const res = await apiClient.put(`/admin/properties/${rejectModalProperty.id}/reject`, {
        reason: rejectionReason
      });
      setProperties(prev => prev.map(p => (p.id === rejectModalProperty.id ? res.data : p)));
      setRejectModalProperty(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Failed to reject property:', err);
      alert(err.response?.data?.message || 'Failed to reject listing.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this property?')) return;
    try {
      await apiClient.delete(`/admin/properties/${id}`);
      setProperties(prev => prev.filter(p => p.id !== id));
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to delete property:', err);
      alert('Failed to delete property.');
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchSearch = 
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle size={13} /> Active</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse"><Clock size={13} /> Pending Review</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800"><XCircle size={13} /> Rejected</span>;
      case 'RENTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">Rented</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status || 'Unknown'}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Moderation & Management</h1>
          <p className="text-gray-600 text-sm mt-1">Review, approve, reject, and govern property listings on Bodimkarayo.lk</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200 pb-3">
        {['ALL', 'PENDING', 'ACTIVE', 'REJECTED', 'RENTED'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab === 'ALL' ? 'All Listings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 outline-none"
            placeholder="Search by title, location, or owner name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                <th scope="col" className="px-6 py-4">Property</th>
                <th scope="col" className="px-6 py-4">Owner</th>
                <th scope="col" className="px-6 py-4">Location</th>
                <th scope="col" className="px-6 py-4">Rent</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Quick Moderation</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading listings...
                    </div>
                  </td>
                </tr>
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No properties found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => {
                  const firstImg = (property.images && property.images.length > 0) 
                    ? property.images[0] 
                    : (property.imageUrls && property.imageUrls.length > 0 ? property.imageUrls[0] : null);

                  return (
                    <tr key={property.id} className="bg-white border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {firstImg ? (
                          <img className="w-12 h-12 rounded-lg object-cover flex-shrink-0" src={firstImg} alt="property" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                            <Home size={20} />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <div className="text-sm font-bold text-gray-900 truncate" title={property.title}>
                            {property.title}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>ID #{property.id}</span>
                            <span>•</span>
                            <span className="capitalize">{property.propertyType || 'Room'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-gray-900">
                          {property.owner?.fullName || 'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {property.owner?.email || 'No email'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <MapPin size={13} className="text-gray-400" />
                          <span className="truncate max-w-[120px]">{property.location || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900 text-xs">
                        Rs {property.rent?.toLocaleString?.() || property.rent || 'N/A'}/mo
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(property.status)}
                        {property.status === 'REJECTED' && property.rejectionReason && (
                          <div className="text-[11px] text-rose-600 mt-1 truncate max-w-[150px]" title={property.rejectionReason}>
                            Reason: {property.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {property.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(property.id)}
                                disabled={submittingAction}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                                title="Approve Listing"
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(property)}
                                disabled={submittingAction}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                                title="Reject Listing"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          )}

                          {property.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleOpenRejectModal(property)}
                              disabled={submittingAction}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                              title="Unpublish / Reject"
                            >
                              Reject
                            </button>
                          )}

                          <button 
                            onClick={() => setDetailModalProperty(property)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye size={16} />
                          </button>

                          <div className="relative inline-block">
                            <button 
                              onClick={() => setOpenDropdownId(openDropdownId === property.id ? null : property.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <MoreVertical size={16} />
                            </button>
                            
                            {openDropdownId === property.id && (
                              <div className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-50 text-left overflow-hidden">
                                <div className="py-1">
                                  {property.status !== 'ACTIVE' && (
                                    <button 
                                      onClick={() => handleApprove(property.id)}
                                      className="w-full px-4 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                                    >
                                      <CheckCircle size={14} /> Set as Active
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteProperty(property.id)}
                                    className="w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 size={14} /> Delete Listing
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

      {/* Reject Modal */}
      {rejectModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="text-rose-600" size={20} />
                Reject Listing
              </h3>
              <button 
                onClick={() => setRejectModalProperty(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mb-3">
              Provide feedback for the listing owner on why <span className="font-semibold text-gray-800">"{rejectModalProperty.title}"</span> was rejected:
            </p>

            <textarea
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none mb-4"
              rows={4}
              placeholder="e.g., Photos are blurry, price is unrealistic, incomplete contact information..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalProperty(null)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm cursor-pointer"
              >
                {submittingAction ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {detailModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase text-blue-600">{detailModalProperty.propertyType}</span>
                <h2 className="text-xl font-bold text-gray-900">{detailModalProperty.title}</h2>
              </div>
              <button 
                onClick={() => setDetailModalProperty(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(detailModalProperty.status)}
                <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">Rs {detailModalProperty.rent?.toLocaleString()}/mo</span>
                <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">{detailModalProperty.location}</span>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-gray-500">Description</h4>
                <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">{detailModalProperty.description || 'No description provided.'}</p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-gray-500">Owner Information</h4>
                <div className="mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="font-semibold">{detailModalProperty.owner?.fullName || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{detailModalProperty.owner?.email}</p>
                </div>
              </div>

              {detailModalProperty.images && detailModalProperty.images.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">Photos ({detailModalProperty.images.length})</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {detailModalProperty.images.map((img, i) => (
                      <img key={i} src={img} alt="listing" className="h-24 w-full object-cover rounded-lg border" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailModalProperty(null)}
                className="px-5 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 cursor-pointer"
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

export default Properties;
