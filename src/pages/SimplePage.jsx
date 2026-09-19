export default function SimplePage({ title, children }) {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">{title}</h1>
      <div className="prose prose-sm text-slate-ink/70 space-y-4">{children}</div>
    </div>
  );
}
