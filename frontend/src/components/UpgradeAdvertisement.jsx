import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api.config';

export function UpgradeAdvertisement() {
  const { user, token, login } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

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
      
      const updatedUser = {
        ...user,
        role: 'OWNER'
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
      {/* Premium Upgrade Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eaf4fb] via-white to-[#f0f7fc] border border-[#d2e7f6] p-8 md:p-12 shadow-[0_15px_45px_rgba(52,136,195,0.08)] my-10">
        {/* Subtle Decorative Background Glows */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-[#3488c3]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3488c3]/15 text-[#3488c3] text-xs font-bold uppercase tracking-wider mb-4 border border-[#3488c3]/20">
              <span>🏠</span> Property Owners Hub
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Have a property to rent?
            </h2>
            <p className="text-slate-600 text-base md:text-lg mt-3 leading-relaxed">
              Join thousands of property owners on <strong className="text-slate-900">Bodimkarayo.lk</strong>. List your properties, connect with verified tenants, and manage everything in one place.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#3488c3] hover:bg-[#2978b3] text-white font-bold text-base py-4 px-9 rounded-full shadow-lg shadow-[#3488c3]/30 hover:shadow-xl hover:shadow-[#3488c3]/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>✨</span>
              <span>Join us as Property Owner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Upgrade Modal Overlay */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          {/* Modal Container Card (stops backdrop click propagation) */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 transform transition-all cursor-default"
          >
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">💎</span>
                <h3 className="text-lg font-extrabold text-slate-900">Upgrade to Property Owner</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="mb-6 text-center">
                <div className="w-14 h-14 bg-[#3488c3]/10 text-[#3488c3] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 border border-[#3488c3]/20">
                  ⚡
                </div>
                <h4 className="text-lg font-bold text-slate-900">Unlock Owner Dashboard</h4>
                <p className="text-xs text-slate-500 mt-1">Post unlimited listings, receive direct inquiries, and access verified tenant applications.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Expiry</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">CVC</label>
                    <input 
                      type="text" 
                      placeholder="123" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Name on Card</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full bg-[#3488c3] hover:bg-[#2978b3] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#3488c3]/30 flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition cursor-pointer"
                >
                  {isUpgrading ? (
                    'Processing Upgrade...'
                  ) : (
                    <span>Pay Rs. 5,000 & Upgrade</span>
                  )}
                </button>
                <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
                  <span>🔒</span> Encrypted sandbox payment step.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
