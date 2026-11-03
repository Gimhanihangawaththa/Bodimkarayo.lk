import { useEffect } from 'react';

export default function Toast({
  isOpen,
  message,
  type = 'success', // 'success' | 'error' | 'info'
  onClose,
  duration = 3500,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen || !message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-white',
      border: 'border-emerald-200/80',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      text: 'text-slate-900',
    },
    error: {
      bg: 'bg-white',
      border: 'border-rose-200/80',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      text: 'text-slate-900',
    },
    info: {
      bg: 'bg-white',
      border: 'border-[#3488c3]/30',
      iconBg: 'bg-[#3488c3]/10 text-[#3488c3] border border-[#3488c3]/20',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'text-slate-900',
    },
  };

  const current = typeConfig[type] || typeConfig.success;

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.14)] border bg-white border-slate-200 animate-in slide-in-from-top-3 fade-in duration-200 max-w-sm">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${current.iconBg}`}>
        {current.icon}
      </div>
      <p className={`text-xs font-bold leading-snug flex-1 ${current.text}`}>
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 p-1 text-xs font-bold cursor-pointer transition rounded-lg hover:bg-slate-100"
      >
        ✕
      </button>
    </div>
  );
}
