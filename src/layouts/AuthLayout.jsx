import { ShieldCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2 bg-slate-50">
      {/* Branded panel for larger screens */}
      <div className="hidden lg:flex relative flex-col justify-between bg-white border-r border-slate-200 p-12 overflow-hidden">
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src="/logo.png"
              alt="RoomNest Logo"
              className="h-12 w-12 object-contain rounded-xl border border-slate-100 shadow-sm"
            />
            <div>
              <span className="font-display text-xl font-bold text-slate-900 block leading-tight">
                RoomNest
              </span>
              <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
                Verified Student Living
              </span>
            </div>
          </Link>

          <h2 className="font-display text-3xl font-extrabold mt-10 leading-tight max-w-sm text-slate-900">
            Find verified student rooms,{" "}
            <span className="text-teal underline decoration-teal/30">not fake listings.</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
            Every PG and hostel on RoomNest is checked before going live — walking distance to campus, transparent mess details, and zero broker charges.
          </p>
        </div>

        <div className="relative space-y-3 max-w-sm">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck size={16} />
            </span>
            <p className="text-xs font-medium text-slate-700">
              In-person audit of geysers, Wi-Fi, food hygiene & gate security.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
            <div className="flex gap-0.5 text-amber-500 mb-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className="fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Found a verified PG near North Campus in one evening. Directly talked to the owner on WhatsApp, no brokers."
            </p>
            <p className="mt-2 text-[11px] font-semibold text-slate-800">— Ananya S., DU Student</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
