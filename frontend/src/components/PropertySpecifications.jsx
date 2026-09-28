export function PropertySpecifications({ bedrooms, kitchens, bathrooms }) {
  const specs = [
    { label: "Bedrooms", count: bedrooms, icon: "🛏️" },
    { label: "Bathrooms", count: bathrooms, icon: "🚿" },
    { label: "Kitchens", count: kitchens, icon: "🍳" },
  ].filter(s => s.count != null && s.count !== '');

  if (specs.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {specs.map((spec) => (
        <div 
          key={spec.label} 
          className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-[#eaf4fb]/40 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-xl shrink-0">
            {spec.icon}
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              {spec.label}
            </span>
            <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
              {spec.count} {spec.count === 1 ? 'Room' : 'Rooms'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
