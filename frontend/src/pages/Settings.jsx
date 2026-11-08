import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api.config';

export default function Settings() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dangerError, setDangerError] = useState('');

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  // Account & Profile state
  const [accountForm, setAccountForm] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || user?.phone || '',
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profilePictureUrl || user?.avatarUrl || null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    if (user) {
      setAccountForm((prev) => ({
        fullName: prev.fullName || user.fullName || user.name || '',
        email: prev.email || user.email || '',
        phoneNumber: prev.phoneNumber || user.phoneNumber || user.phone || '',
      }));
      if (!previewImage && (user.profilePictureUrl || user.avatarUrl)) {
        setPreviewImage(user.profilePictureUrl || user.avatarUrl);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!user?.id) return;
      try {
        const response = await apiClient.get(`/users/${user.id}/profile`);
        if (response.data) {
          const profile = response.data;
          setAccountForm((prev) => ({
            ...prev,
            fullName: profile.fullName || prev.fullName,
            email: profile.email || prev.email,
          }));
          if (profile.profilePictureUrl) {
            setPreviewImage(profile.profilePictureUrl);
          }
        }
      } catch (err) {
        // Fallback silently to current user context
      }
    };
    fetchLatestProfile();
  }, [user?.id]);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAccountError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAccountError('Image size should be less than 5MB');
      return;
    }

    setProfileImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setAccountError('');
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');

    if (!accountForm.fullName.trim()) {
      setAccountError('Full name is required');
      return;
    }

    if (!accountForm.email.trim()) {
      setAccountError('Email is required');
      return;
    }

    setAccountLoading(true);

    try {
      let profilePictureUrl = previewImage;

      // 1. Upload new image if chosen
      if (profileImageFile && user?.id) {
        try {
          const imageFormData = new FormData();
          imageFormData.append('image', profileImageFile);
          const uploadRes = await apiClient.post(`/users/${user.id}/profile-image`, imageFormData);
          if (uploadRes.data?.profilePictureUrl) {
            profilePictureUrl = uploadRes.data.profilePictureUrl;
          }
        } catch (imgErr) {
          console.error('Failed to upload profile picture:', imgErr);
        }
      }

      // 2. Update user profile
      const payload = {
        fullName: accountForm.fullName.trim(),
        email: accountForm.email.trim(),
        profilePictureUrl,
      };

      const response = await apiClient.put(`/users/${user.id}/profile`, payload);
      const updatedProfile = response.data;

      const updatedUserData = {
        ...user,
        fullName: updatedProfile.fullName ?? payload.fullName,
        name: updatedProfile.fullName ?? payload.fullName,
        email: updatedProfile.email ?? payload.email,
        profilePictureUrl: updatedProfile.profilePictureUrl ?? profilePictureUrl,
        avatarUrl: updatedProfile.profilePictureUrl ?? profilePictureUrl,
        ...(accountForm.phoneNumber ? { phoneNumber: accountForm.phoneNumber } : {}),
      };

      if (updateUser) {
        updateUser(updatedUserData);
      }

      setAccountSuccess('Account information updated successfully!');
      setProfileImageFile(null);
    } catch (error) {
      console.error('Error updating account:', error);
      setAccountError(
        error.response?.data?.message || 'Failed to update account information. Please try again.'
      );
    } finally {
      setAccountLoading(false);
    }
  };


  // If user is not logged in, redirect to sign in
  if (!token) {
    navigate('/signin');
    return null;
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(passwordForm.newPassword) ||
        !/[a-z]/.test(passwordForm.newPassword) ||
        !/[0-9]/.test(passwordForm.newPassword) ||
        !/[^a-zA-Z0-9]/.test(passwordForm.newPassword)) {
      setPasswordError('New password must contain uppercase, lowercase, a number, and a special character');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);

    try {
      await apiClient.put(`/users/${user.id}/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  const handleDeleteClick = () => {
    setDangerError('');
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    if (!user?.id) return;
    setIsDeleting(true);
    setDangerError('');

    try {
      await apiClient.delete(`/users/${user.id}`);
      setIsDeleteModalOpen(false);
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      const msg = error.response?.data?.message || 'Failed to delete account. Please try again later.';
      setDangerError(msg);
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account & Profile', icon: '👤' },
    { id: 'security', label: 'Password & Security', icon: '🔒' },
    { id: 'billing', label: 'Billing & Payments', icon: '💳' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col overflow-x-auto gap-2 pb-2 md:pb-0 shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 md:gap-3 px-3.5 md:px-4 py-2.5 md:py-3 rounded-xl text-left font-semibold text-xs md:text-sm whitespace-nowrap shrink-0 transition cursor-pointer ${
                  activeTab === tab.id
                    ? tab.id === 'danger'
                      ? 'bg-red-50 text-red-700 font-bold'
                      : 'bg-[#3488c3]/10 text-[#3488c3] font-bold border border-[#3488c3]/20 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-xs border border-slate-200 min-h-[500px]">

          {/* Account & Profile Tab (Functional) */}
          {activeTab === 'account' && (
            <div className="p-4 sm:p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Information</h2>
              <p className="text-slate-500 mb-6">Update your personal details and public profile.</p>

              <div className="max-w-lg">
                {accountSuccess && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-medium text-sm">
                    {accountSuccess}
                  </div>
                )}

                {accountError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl font-medium text-sm">
                    {accountError}
                  </div>
                )}

                <form onSubmit={handleAccountSubmit} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 shadow-xs">
                      {previewImage ? (
                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#3488c3]/10 text-[#3488c3] text-2xl font-bold">
                          {(accountForm.fullName || user?.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition">
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={accountLoading}
                        />
                      </label>
                      <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Recommended: Square JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={accountForm.fullName}
                      onChange={handleAccountChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3]"
                      disabled={accountLoading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={accountForm.email}
                      onChange={handleAccountChange}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3]"
                      disabled={accountLoading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={accountForm.phoneNumber}
                      onChange={handleAccountChange}
                      placeholder="+94 7X XXX XXXX"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3]"
                      disabled={accountLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={accountLoading}
                    className={`w-full py-3 px-6 rounded-xl font-bold text-white transition shadow-md shadow-[#3488c3]/20 cursor-pointer ${
                      accountLoading
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-[#3488c3] hover:bg-[#2978b3] active:bg-[#246393]'
                    }`}
                  >
                    {accountLoading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab (Functional) */}
          {activeTab === 'security' && (
            <div className="p-4 sm:p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Password & Security</h2>
              <p className="text-slate-500 mb-8">Manage your password and security preferences.</p>

              <div className="max-w-lg">
                {passwordSuccess && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-medium text-sm">
                    {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl font-medium text-sm">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        className="w-full pl-4 pr-11 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3]"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 focus:outline-none cursor-pointer"
                        aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                      >
                        {showCurrentPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password (min. 8 chars, uppercase, number & symbol)"
                        className="w-full pl-4 pr-11 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3]"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 focus:outline-none cursor-pointer"
                        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                      >
                        {showNewPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        className="w-full pl-4 pr-11 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3]"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 focus:outline-none cursor-pointer"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className={`w-full py-3 px-6 rounded-xl font-bold text-white transition shadow-md shadow-[#3488c3]/20 cursor-pointer ${
                      passwordLoading
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-[#3488c3] hover:bg-[#2978b3] active:bg-[#246393]'
                    }`}
                  >
                    {passwordLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}


          {/* Billing Tab (Dummy) */}
          {activeTab === 'billing' && (
            <div className="p-4 sm:p-6 md:p-8">
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

          {/* Danger Zone (Functional) */}
          {activeTab === 'danger' && (
            <div className="p-4 sm:p-6 md:p-8 border-l-4 border-red-500">
              <h2 className="text-2xl font-bold text-red-700 mb-2">Danger Zone</h2>
              <p className="text-gray-600 mb-8">Irreversible and destructive actions.</p>

              {dangerError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-xl font-medium text-sm">
                  {dangerError}
                </div>
              )}

              <div className="bg-red-50/80 border border-red-200 rounded-2xl p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl shrink-0">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900 mb-1">Delete Account</h3>
                    <p className="text-red-700 text-sm leading-relaxed">
                      Once you delete your account, there is no going back. All your listings, roommate posts,
                      saved favorites, chat history, reviews, and profile details will be permanently removed from our servers.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md shadow-red-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    Permanently Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-red-100 overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold mb-4">
                ⚠️
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Are you absolutely sure?</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                This action <strong className="text-red-600 font-semibold">cannot be undone</strong>. This will permanently delete your account, remove all your listings, roommate posts, messages, and profile data from our servers.
              </p>

              {dangerError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {dangerError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDangerError('');
                  }}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAccount}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <span>Permanently Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
