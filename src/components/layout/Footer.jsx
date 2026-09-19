import { Link } from "react-router-dom";

const columns = [
  {
    title: "Popular Campuses",
    links: [
      { label: "DU North Campus", to: "/search?campus=Delhi+University+North+Campus" },
      { label: "CUHP Himachal", to: "/search?campus=Central+University+of+Himachal+Pradesh" },
      { label: "IIT Delhi", to: "/search?campus=IIT+Delhi" },
      { label: "Christ University Bangalore", to: "/search?campus=Christ+University+Bangalore" },
      { label: "VIT Vellore", to: "/search?campus=VIT+Vellore" },
    ],
  },
  {
    title: "Student Living",
    links: [
      { label: "Find Campus Rooms", to: "/search" },
      { label: "Find a Roommate", to: "/roommates" },
      { label: "Rent Agreement Guide", to: "/how-it-works" },
      { label: "Zero Brokerage Policy", to: "/how-it-works" },
    ],
  },
  {
    title: "Property Owners & Staff",
    links: [
      { label: "List Student PG / Room", to: "/list-your-property" },
      { label: "Owner Verification Process", to: "/how-it-works" },
      { label: "Owner Dashboard", to: "/owner/dashboard" },
      { label: "🛡️ Admin Approval Portal", to: "/admin/dashboard" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600">
      <div className="container-page py-12 sm:py-16 grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="RoomNest Logo"
              className="h-10 w-10 object-contain rounded-xl border border-slate-100 shadow-sm"
            />
            <div>
              <span className="font-display text-lg font-bold text-slate-900 leading-none block">
                RoomNest
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 tracking-wide uppercase">
                Verified Student Accommodations
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Helping college students find verified PGs, hostels, and rental rooms near their campuses with zero brokerage, transparent mess & utility costs, and student peer reviews.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              ✓ 100% In-Person Audited
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              ✓ Zero Brokerage
            </span>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-xs text-slate-500 hover:text-teal hover:underline transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60">
        <div className="container-page py-4 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© {new Date().getFullYear()} RoomNest India. Built for college students nationwide.</span>
          <span className="flex items-center gap-4 text-slate-500">
            <Link to="/how-it-works" className="hover:underline">Safety Standards</Link>
            <Link to="/how-it-works" className="hover:underline">Rent Agreement Support</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
