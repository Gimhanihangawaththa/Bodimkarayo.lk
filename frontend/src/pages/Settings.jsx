import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api.config';

export default function Settings() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [isDeleting, setIsDeleting] = useState(false);

  // If user is not logged in, redirect to sign in
  if (!token) {
    navigate('/signin');
    return null;
  }

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "WARNING: Are you absolutely sure you want to delete your account?\n\nThis action cannot be undone. All your properties, roommate posts, and reviews will be permanently deleted."
    );

    if (isConfirmed && user?.id) {
      setIsDeleting(true);
      try {
        await apiClient.delete(`/users/${user.id}`);
        alert('Your account has been successfully deleted.');
        logout();
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again later.');
        setIsDeleting(false);
      }
    }
  };

  const tabs = [
    { id: 'account', label: 'Account & Profile', icon: '👤' },
    { id: 'security', label: 'Password & Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy & Visibility', icon: '👁️' },
    { id: 'billing', label: 'Billing & Payments', icon: '💳' },
    { id: 'preferences', label: 'App Preferences', icon: '⚙️' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition ${
                  activeTab === tab.id
                    ? tab.id === 'danger'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
          
          {/* Account & Profile Tab (Dummy) */}
          {activeTab === 'account' && (
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
              <p className="text-gray-500 mb-8">Update your personal details here. (Coming soon)</p>
              
              <div className="space-y-6 max-w-lg opacity-60 pointer-events-none">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={user?.fullName || 'John Doe'} className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={user?.email || 'john@example.com'} className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" placeholder="+94 7X XXX XXXX" className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium">Save Changes</button>
              </div>
            </div>
          )}

          {/* Security Tab (Dummy) */}
          {activeTab === 'security' && (
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Password & Security</h2>
              <p className="text-gray-500 mb-8">Manage your password and security preferences. (Coming soon)</p>
              
              <div className="space-y-6 max-w-lg opacity-60 pointer-events-none">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" value="********" className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" placeholder="Enter new password" className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium">Update Password</button>
              </div>
            </div>
          )}

          {/* Notifications Tab (Dummy) */}
          {activeTab === 'notifications' && (
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
              <p className="text-gray-500 mb-8">Choose what we email you about. (Coming soon)</p>
              
              <div className="space-y-4 opacity-60 pointer-events-none">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">New Messages</h4>
                    <p className="text-sm text-gray-500">Get notified when someone messages you.</p>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center p-1 justify-end">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-gray-900">Promotions & Offers</h4>
                    <p className="text-sm text-gray-500">Receive emails about new features and discounts.</p>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full flex items-center p-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab (Dummy) */}
          {activeTab === 'privacy' && (
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Visibility</h2>
              <p className="text-gray-500 mb-8">Control who sees your information. (Coming soon)</p>
              
              <div className="space-y-6 max-w-lg opacity-60 pointer-events-none">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility in Roommate Search</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <option>Visible to everyone</option>
                    <option>Hidden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Details Privacy</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <option>Show phone number to registered users only</option>
                    <option>Hide phone number completely</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab (Dummy) */}
          {activeTab === 'billing' && (
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing & Payments</h2>
              <p className="text-gray-500 mb-8">Manage your subscriptions and cards. (Coming soon)</p>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 opacity-60 pointer-events-none mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-blue-900 text-lg">Current Plan</h3>
                  <span className="bg-blue-200 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {user?.role === 'OWNER' ? 'Property Owner' : 'Standard User'}
                  </span>
                </div>
                <p className="text-blue-800 mb-4">Your account is active and in good standing.</p>
              </div>

              <div className="opacity-60 pointer-events-none">
                <h3 className="font-bold text-gray-900 mb-4">Saved Payment Methods</h3>
                <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                  <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">VISA</div>
                  <div>
                    <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                    <p className="text-xs text-gray-500">Expires 12/26</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab (Dummy) */}
          {activeTab === 'preferences' && (
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">App Preferences</h2>
              <p className="text-gray-500 mb-8">Customize your Bodimkarayo experience. (Coming soon)</p>
              
              <div className="space-y-6 max-w-lg opacity-60 pointer-events-none">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Language</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <option>English</option>
                    <option>Sinhala</option>
                    <option>Tamil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <option>LKR (Rs)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone (Functional) */}
          {activeTab === 'danger' && (
            <div className="p-6 md:p-8 border-l-4 border-red-500">
              <h2 className="text-2xl font-bold text-red-700 mb-2">Danger Zone</h2>
              <p className="text-gray-600 mb-8">Irreversible and destructive actions.</p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-red-900 mb-2">Delete Account</h3>
                <p className="text-red-700 mb-6 text-sm">
                  Once you delete your account, there is no going back. Please be certain. 
                  All your personal data, properties, reviews, and roommate posts will be permanently deleted from our servers.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md shadow transition disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Permanently Delete My Account'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
