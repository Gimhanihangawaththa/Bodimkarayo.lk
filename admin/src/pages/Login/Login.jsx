import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AlertCircle, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import logo from '../../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials or you do not have admin access.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 md:p-10 relative antialiased text-slate-900">
      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <a 
          href="http://localhost:5173" 
          className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-1 hover:opacity-90 transition"
        >
          Bodimkarayo<span className="text-[#3488c3]">.lk</span>
        </a>
        <a 
          href="http://localhost:5173" 
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-[#3488c3] text-xs font-bold transition border border-slate-200/80 shadow-xs cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Web App
        </a>
      </div>

      {/* Main Login Card */}
      <div className="my-auto py-6 w-full max-w-md mx-auto">
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-10 space-y-6">
          {/* Brand Logo & Heading */}
          <div className="text-center space-y-3">
            <div className="flex justify-center -mb-1">
              <img 
                src={logo} 
                alt="Bodimkarayo.lk Logo" 
                className="h-24 md:h-28 w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-sm" 
              />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-[#3488c3] text-xs font-black tracking-wider uppercase">
              <ShieldCheck size={14} className="shrink-0" /> Admin Portal
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Sign in to Dashboard</h1>
              <p className="text-xs font-semibold text-slate-500 mt-1">Authorized personnel only. Manage properties, users & platform.</p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 flex items-center gap-2" role="alert">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] focus:bg-white outline-none transition text-slate-900 shadow-xs placeholder-slate-400"
                placeholder="admin@bodimkarayo.lk"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] focus:bg-white outline-none transition text-slate-900 shadow-xs placeholder-slate-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#3488c3] hover:bg-[#2978b3] text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-[#3488c3]/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? 'Verifying Admin Access...' : 'Sign in to Admin Dashboard'}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Trusted Note */}
      <div className="border-t border-slate-200/80 pt-4 text-center">
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
          TRUSTED BY STUDENTS & PROFESSIONALS ACROSS SRI LANKA
        </p>
      </div>
    </div>
  );
};

export default Login;
