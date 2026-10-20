import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { 
  AlertTriangle, CheckCircle, XCircle, Search, Clock, 
  ExternalLink, Check, X, ShieldAlert, RefreshCw,
  Home, User as UserIcon, Users as UsersIcon, Trash2, Filter
} from 'lucide-react';

const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');
  const [resolvingId, setResolvingId] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [activeModalAction, setActiveModalAction] = useState(null); // 'resolve' or 'dismiss'
  const [targetReport, setTargetReport] = useState(null);

  // Sync tab from URL query param
  const currentStatus = (searchParams.get('status') || 'ALL').toUpperCase();

  const handleStatusChange = (status) => {
    if (status === 'ALL') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams), status });
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      // Always fetch all reports to allow client-side dynamic tab count calculation
      const response = await apiClient.get('/admin/reports');
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Ensure you are signed in as an administrator.');
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (report, action) => {
    setTargetReport(report);
    setActiveModalAction(action);
    setActionNotes(
      action === 'resolve' 
        ? 'Listing reviewed and appropriate corrective moderation action was taken.' 
        : 'Report reviewed and determined to be invalid, duplicate, or resolved without action.'
    );
  };

  const handleConfirmAction = async () => {
    if (!targetReport || !activeModalAction) return;

    try {
      setResolvingId(targetReport.id);
      const endpoint = activeModalAction === 'resolve' 
        ? `/admin/reports/${targetReport.id}/resolve` 
        : `/admin/reports/${targetReport.id}/dismiss`;
      
      const res = await apiClient.put(endpoint, { notes: actionNotes });
      setReports(prev => prev.map(r => r.id === targetReport.id ? res.data : r));
      setTargetReport(null);
      setActiveModalAction(null);
      setActionNotes('');
    } catch (err) {
      console.error(`Failed to ${activeModalAction} report:`, err);
      alert(`Failed to ${activeModalAction} report. Please try again.`);
    } finally {
      setResolvingId(null);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this report record?')) return;
    try {
      setResolvingId(id);
      await apiClient.delete(`/admin/reports/${id}`);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert('Failed to delete report record.');
    } finally {
      setResolvingId(null);
    }
  };

  // Dynamic status counts
  const counts = {
    ALL: reports.length,
    PENDING: reports.filter(r => r.status === 'PENDING').length,
    RESOLVED: reports.filter(r => r.status === 'RESOLVED').length,
    DISMISSED: reports.filter(r => r.status === 'DISMISSED').length,
  };

  const filteredReports = reports.filter(r => {
    const matchesStatus = currentStatus === 'ALL' || r.status === currentStatus;

    const matchesTargetType = 
      targetTypeFilter === 'ALL' || 
      r.targetType?.toUpperCase() === targetTypeFilter;

    const matchesSearch = 
      r.targetTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporter?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.details?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesTargetType && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Pending Moderation
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle size={13} /> Resolved
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <XCircle size={13} /> Dismissed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const getTargetIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'PROPERTY':
        return <Home size={13} className="text-blue-600" />;
      case 'USER':
        return <UserIcon size={13} className="text-purple-600" />;
      case 'ROOMMATE':
        return <UsersIcon size={13} className="text-teal-600" />;
      default:
        return <AlertTriangle size={13} className="text-gray-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ShieldAlert className="text-rose-600" size={26} />
            Disputes & Safety Resolution Engine
          </h1>
          <p className="text-gray-600 text-sm mt-1">Review flagged listings, safety concerns, and resolve tenant dispute tickets.</p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 shadow-xs transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-gray-500'} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200 pb-3">
        {[
          { key: 'ALL', label: 'All Tickets', count: counts.ALL },
          { key: 'PENDING', label: 'Pending Review', count: counts.PENDING, highlight: counts.PENDING > 0 },
          { key: 'RESOLVED', label: 'Resolved', count: counts.RESOLVED },
          { key: 'DISMISSED', label: 'Dismissed', count: counts.DISMISSED },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleStatusChange(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
              currentStatus === tab.key
                ? tab.key === 'PENDING' && tab.highlight
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              currentStatus === tab.key 
                ? 'bg-black/20 text-white' 
                : tab.key === 'PENDING' && tab.count > 0 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-gray-100 text-gray-700'
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
            placeholder="Search by target title, reason, details, or reporter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Filter size={14} className="text-gray-400" />
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">All Target Types</option>
              <option value="PROPERTY">Properties</option>
              <option value="USER">Users</option>
              <option value="ROOMMATE">Roommate Ads</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 shadow-xs border border-gray-200">
            <div className="flex justify-center items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Loading dispute records from database...
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 shadow-xs border border-gray-200">
            <ShieldAlert size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-gray-700">No report tickets found</p>
            <p className="text-xs text-gray-400 mt-1">There are no reports matching the selected filters.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isResolving = resolvingId === report.id;

            return (
              <div 
                key={report.id} 
                className={`bg-white rounded-2xl p-6 shadow-xs border transition ${
                  report.status === 'PENDING' 
                    ? 'border-amber-200 hover:border-amber-300' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Report Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(report.status)}
                      
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-slate-100 text-slate-700">
                        {getTargetIcon(report.targetType)}
                        {report.targetType} #{report.targetId}
                      </span>

                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Recently'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        {report.targetTitle ? `"${report.targetTitle}"` : `${report.targetType} #${report.targetId}`}
                        
                        {/* Direct Inspect Links */}
                        {report.targetType === 'PROPERTY' && (
                          <Link
                            to={`/properties?search=${encodeURIComponent(report.targetTitle || '')}`}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                            title="Inspect in Property Moderation"
                          >
                            <ExternalLink size={12} />
                            Inspect Property
                          </Link>
                        )}
                        {report.targetType === 'USER' && (
                          <Link
                            to={`/users`}
                            className="text-xs text-purple-600 hover:text-purple-800 font-semibold inline-flex items-center gap-1"
                            title="Inspect in User Governance"
                          >
                            <ExternalLink size={12} />
                            Inspect User
                          </Link>
                        )}
                      </h3>
                    </div>

                    {/* Complaint Reason and Description Box */}
                    <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-950">
                      <div className="font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                        <AlertTriangle size={14} className="text-rose-600" />
                        Report Reason: {report.reason}
                      </div>
                      <p className="text-gray-800 font-normal leading-relaxed">
                        {report.details || 'No additional descriptive details provided by user.'}
                      </p>
                    </div>

                    {/* Reporter Info Strip */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 w-fit">
                      <span className="text-gray-400">Filed by:</span>
                      <strong className="text-gray-800">{report.reporter?.fullName || 'Anonymous User'}</strong>
                      {report.reporter?.email && (
                        <span className="text-gray-400">({report.reporter.email})</span>
                      )}
                    </div>

                    {/* Admin Resolution Section */}
                    {report.resolutionNotes && (
                      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-950">
                        <div className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                          <CheckCircle size={13} className="text-emerald-600" />
                          Admin Resolution Note:
                        </div>
                        <p className="text-gray-700">{report.resolutionNotes}</p>
                        {report.resolvedAt && (
                          <p className="text-[11px] text-gray-400 mt-1">
                            Resolved on: {new Date(report.resolvedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Moderation Actions */}
                  <div className="flex lg:flex-col items-center gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    {report.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => openActionModal(report, 'resolve')}
                          disabled={isResolving}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check size={14} /> Resolve Ticket
                        </button>
                        <button
                          onClick={() => openActionModal(report, 'dismiss')}
                          disabled={isResolving}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <X size={14} /> Dismiss
                        </button>
                      </>
                    )}

                    {/* Delete Ticket Option */}
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={isResolving}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Permanently Delete Ticket"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action / Resolution Modal */}
      {targetReport && activeModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                {activeModalAction === 'resolve' ? (
                  <>
                    <CheckCircle className="text-emerald-600" size={18} />
                    Resolve Dispute Ticket #{targetReport.id}
                  </>
                ) : (
                  <>
                    <XCircle className="text-slate-600" size={18} />
                    Dismiss Report #{targetReport.id}
                  </>
                )}
              </h3>
              <button 
                onClick={() => { setTargetReport(null); setActiveModalAction(null); }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mb-3">
              Add internal moderation notes explaining the outcome of this investigation:
            </p>

            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 bg-gray-50"
              rows={4}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g., Landlord notified of policy violation, listing deactivated..."
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setTargetReport(null); setActiveModalAction(null); }}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resolvingId === targetReport.id}
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 ${
                  activeModalAction === 'resolve' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-slate-700 hover:bg-slate-800'
                }`}
              >
                {resolvingId === targetReport.id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Action</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
