export function ImageUploadBox({ onClick, previewSrc }) {
  return (
    <div
      onClick={onClick}
      className="w-full h-full min-h-[140px] bg-slate-50/80 hover:bg-[#3488c3]/5 border-2 border-dashed border-slate-300 hover:border-[#3488c3] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden relative group shadow-xs"
    >
      {previewSrc ? (
        <img
          src={previewSrc}
          alt="Selected property"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-200/80 group-hover:bg-[#3488c3] text-slate-500 group-hover:text-white flex items-center justify-center transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-500 group-hover:text-[#3488c3] transition-colors">Add Photo</span>
        </div>
      )}
    </div>
  );
}
