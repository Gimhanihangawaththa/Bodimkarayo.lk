export function SectionCard({ title, icon, subtitle, actions, children }) {
  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)] transition-all">
      {(title || actions) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              {icon && (
                <span className="w-10 h-10 rounded-2xl bg-[#3488c3]/10 text-[#3488c3] flex items-center justify-center text-lg border border-[#3488c3]/20 shrink-0">
                  {icon}
                </span>
              )}
              {title && <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>}
            </div>
            {subtitle && <p className="mt-1 text-xs md:text-sm font-medium text-slate-500 pl-13">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
