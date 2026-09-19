export function SectionLabel({ children }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
      {children}
    </h4>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-teal bg-teal text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-teal ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
