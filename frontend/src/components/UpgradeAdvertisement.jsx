import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api.config';

export function UpgradeAdvertisement() {
  const { user, token, login } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Only show if user is logged in and role is exactly 'USER'
  if (!user || user.role !== 'USER') {
    return null;
  }

  const handleUpgrade = async () => {
    if (!user?.id) return;
    
    setIsUpgrading(true);
    try {
      const response = await apiClient.put(`/users/${user.id}/upgrade-role`);
      const updatedProfile = response.data;
      
      // Update the user object in context with the new role
      const updatedUser = {
        ...user,
        role: 'OWNER' // Update locally since the backend should have updated it
      };
      
      login({ user: updatedUser, token });
      
      alert('Congratulations! You are now a Property Owner.');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error upgrading role:', error);
      alert('Failed to upgrade. Please try again later.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <>
      {/* Advertisement Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm overflow-hidden my-8">
        <div className="px-6 py-8 md:p-10 text-center">
          <h2 className="text-3xl font-bold mb-4 text-blue-900">Have a property to rent?</h2>
          <p className="text-lg text-blue-800 mb-6 max-w-2xl mx-auto">
            Join thousands of property owners on Bodimkarayo.lk. List your properties, find great tenants, and manage everything in one place.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 px-8 rounded-full shadow-md transition transform hover:-translate-y-1"
          >
            Join us as Property Owner
          </button>
        </div>
      </div>

      {/* Dummy Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl transform transition-all">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Upgrade to Owner</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 text-center">
                <div className="text-4xl mb-2">💎</div>
                <h4 className="text-lg font-medium text-gray-900">Premium Owner Features</h4>
                <p className="text-sm text-gray-500 mt-1">Unlock the ability to add and manage your property listings.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input 
                      type="text" 
                      placeholder="123" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md shadow flex justify-center items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
                >
                  {isUpgrading ? (
                    'Processing...'
                  ) : (
                    <>
                      <span>Pay Rs. 5000</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-500 mt-4">
                  This is a secure, encrypted dummy payment gateway.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
