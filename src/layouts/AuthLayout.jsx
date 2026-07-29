import { ShieldCheck, Star } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      {/* Branded panel - hidden on small screens to keep the form front and center on mobile */}
      <div className="hidden lg:flex relative flex-col justify-between bg-ink text-paper p-12 overflow-hidden">
        <div className="absolute inset-0 bg-grain [background-size:16px_16px] opacity-[0.08] pointer-events-none" />

        <div className="relative">
          <span className="stamp h-10 w-10 text-xs font-bold border-seal-light text-seal-light">RN</span>
          <h2 className="font-display text-3xl font-semibold mt-8 leading-tight max-w-sm">
            Find verified rooms, <span className="italic text-seal-light">not just listings.</span>
          </h2>
          <p className="mt-4 text-sm text-paper/60 max-w-xs">
            Every property on RoomNest is checked before it goes live — no fake listings, no broker games.
          </p>
        </div>

        <div className="relative space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-paper/5 border border-paper/10 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal/20 text-teal">
              <ShieldCheck size={16} />
            </span>
            <p className="text-xs text-paper/70">Every listing manually verified before it's visible to you.</p>
          </div>
          <div className="rounded-xl bg-paper/5 border border-paper/10 p-4">
            <div className="flex gap-0.5 text-seal-light mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className="fill-seal-light" />
              ))}
            </div>
            <p className="text-xs text-paper/70">
              "Found a verified PG near North Campus in one evening. No brokers, no drama."
            </p>
            <p className="mt-2 text-[11px] text-paper/45">— Ananya S., DU Student</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
