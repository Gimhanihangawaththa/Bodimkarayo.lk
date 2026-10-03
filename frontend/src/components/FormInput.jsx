export function FormInput({ label, placeholder, type = "text", name, value, onChange }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition shadow-xs"
      />
    </div>
  );
}
