export function OwnerCard({ owner, price, priceRange, availableFrom, onMessage }) {
  const ownerName = owner?.name || 'Verified Owner';
  const ownerAvatar = owner?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunil';
  const ownerRating = owner?.rating || 4.9;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] space-y-6">
      {/* Price & Availability Section */}
      <div className="pb-5 border-b border-slate-100">
        <span className="text-[11px] font-extrabold text-[#3488c3] uppercase tracking-wider block mb-1">
          Monthly Rent
        </span>
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Rs {typeof price === 'number' ? price.toLocaleString() : price}
          <span className="text-xs font-semibold text-slate-500"> /{priceRange || 'month'}</span>
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Available from {availableFrom || 'Immediate'}
        </div>
      </div>

      {/* Hosted By Section */}
      <div className="pb-5 border-b border-slate-100">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
          Hosted by
        </span>
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              src={ownerAvatar}
              alt={ownerName}
              className="w-13 h-13 rounded-2xl object-cover bg-slate-100 border border-slate-200 p-0.5 shadow-xs"
              onError={(e) => {
                e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Landlord';
              }}
            />
            <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs">
              ✓
            </span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base leading-tight">{ownerName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200/50">
                ⭐ {ownerRating}
              </span>
              <span className="text-xs text-slate-500 font-semibold">Verified Owner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button with Brand Blue #3488c3 */}
      <button
        type="button"
        onClick={onMessage}
        className="w-full py-3.5 px-6 bg-[#3488c3] hover:bg-[#2978b3] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#3488c3]/25 hover:shadow-xl hover:shadow-[#3488c3]/35 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <span>💬</span>
        <span>Message</span>
      </button>
    </div>
  );
}
