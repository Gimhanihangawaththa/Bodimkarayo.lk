import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { Search, MoreVertical, Trash2, Home, MapPin, DollarSign } from 'lucide-react';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/properties');
      setProperties(response.data);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;
    try {
      await apiClient.delete(`/properties/${id}`);
      setProperties(properties.filter(p => p.id !== id));
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to delete property:', err);
      alert('Failed to delete property.');
    }
  };

  const filteredProperties = properties.filter(property => 
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    property.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Property Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage all property listings on the platform.</p>
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
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Properties Table */}
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
                <th scope="col" className="px-6 py-4">Property</th>
                <th scope="col" className="px-6 py-4">Location</th>
                <th scope="col" className="px-6 py-4">Rent (Rs)</th>
                <th scope="col" className="px-6 py-4">Type</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading properties...
                    </div>
                  </td>
                </tr>
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No properties found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => (
                  <tr key={property.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3 whitespace-nowrap">
                      {property.imageUrls && property.imageUrls.length > 0 ? (
                        <img className="w-12 h-12 rounded-lg object-cover" src={property.imageUrls[0]} alt="property" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Home size={20} />
                        </div>
                      )}
                      <div className="max-w-xs truncate">
                        <div className="text-base font-semibold text-gray-800 truncate" title={property.title}>{property.title}</div>
                        <div className="font-normal text-gray-500 text-xs">ID: {property.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        {property.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-gray-400" />
                        {property.rent ? property.rent.toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {property.propertyType || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === property.id ? null : property.id)}
                        className="p-2 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {openDropdownId === property.id && (
                        <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 text-left overflow-hidden">
                          <div className="py-1">
                            <button 
                              onClick={() => handleDeleteProperty(property.id)}
                              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Delete Property
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

export default Properties;
