export function Progress({ value = 0, className = "" }) {
  return (
    <div
      className={`w-full h-3 rounded-full bg-gray-200 overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-emerald-600 transition-all duration-300 pointer-events-none"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}
