export function PropertyOffers({ offers }) {
  if (!offers || offers.length === 0) {
    return <p className="text-xs text-slate-400 italic">No amenities specified.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {offers.map((offer, index) => (
        <div 
          key={index} 
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-800 text-xs font-bold transition hover:bg-emerald-100/60"
        >
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">
            ✓
          </span>
          <span className="truncate">{offer}</span>
        </div>
      ))}
    </div>
  );
}
