export function LocationMap({ title, address, mapEmbedUrl }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{address}</p>
      </div>
      {typeof mapEmbedUrl === 'string' && mapEmbedUrl.startsWith('http') ? (
        <div className="h-64 w-full">
          <iframe
            title="Property location"
            src={mapEmbedUrl}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="h-64 w-full bg-slate-100 flex items-center justify-center text-slate-500">
          <p>Map not available</p>
        </div>
      )}
    </div>
  );
}
