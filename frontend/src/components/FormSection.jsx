export function FormSection({ title, children, isMainTitle = false }) {
  if (isMainTitle) {
    return (
      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] mb-8 space-y-4">
      {title && (
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>🔹</span> {title}
          </h3>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
