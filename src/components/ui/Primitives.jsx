export function SectionLabel({ children }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-ink/50 mb-3">
      {children}
    </h4>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/15 bg-white text-slate-ink/70 hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-ink ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
