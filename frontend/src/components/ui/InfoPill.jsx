export function InfoPill({ label, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border border-slate-200/60",
    blue: "bg-[#eaf4fb] text-[#246fa8] border border-[#d2e7f6]",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    amber: "bg-amber-50 text-amber-700 border border-amber-200/60",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone] || tones.slate}`}>
      {label}
    </span>
  );
}
