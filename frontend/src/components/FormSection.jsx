export function FormSection({ title, children, isMainTitle = false }) {
  return (
    <div className="mb-8">
      {title && <h3 className={isMainTitle ? "text-3xl font-bold text-gray-800 mb-4" : "text-lg font-semibold text-gray-800 mb-4"}>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}
