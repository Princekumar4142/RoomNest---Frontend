import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  const columns = [
    {
      title: t("footer_popular_campuses"),
      links: [
        { label: "DU North Campus", to: "/search?campus=Delhi+University+North+Campus" },
        { label: "CUHP Himachal", to: "/search?campus=Central+University+of+Himachal+Pradesh" },
        { label: "GEC West Champaran", to: "/search?campus=GEC+West+Champaran" },
        { label: "Kumarbagh", to: "/search?campus=Kumarbagh" },
        { label: "Bettiah", to: "/search?campus=Bettiah" },
      ],
    },
    {
      title: t("footer_student_living"),
      links: [
        { label: t("footer_find_rooms"), to: "/search" },
        { label: t("footer_find_roommate"), to: "/roommates" },
        { label: t("footer_rent_guide"), to: "/how-it-works" },
        { label: t("footer_zero_brokerage"), to: "/how-it-works" },
      ],
    },
    {
      title: t("footer_owners"),
      links: [
        { label: t("footer_list_pg"), to: "/list-your-property" },
        { label: t("footer_owner_verify"), to: "/how-it-works" },
        { label: t("footer_owner_dashboard"), to: "/owner/dashboard" },
        { label: t("footer_admin_portal"), to: "/admin/dashboard" },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">
      <div className="container-page py-12 sm:py-16 grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="RoomNest Logo"
              className="h-10 w-10 object-contain rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm"
            />
            <div>
              <span className="font-display text-lg font-bold text-slate-900 dark:text-white leading-none block">
                RoomNest
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
                {t("footer_tagline")}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            {t("footer_desc")}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              ✓ {t("footer_audited")}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
              ✓ {t("footer_zero_brokerage_badge")}
            </span>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.to + l.label}>
                  <Link
                    to={l.to}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal hover:underline transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
        <div className="container-page py-4 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© {new Date().getFullYear()} {t("footer_copyright")}</span>
          <span className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <Link to="/how-it-works" className="hover:underline">{t("footer_safety")}</Link>
            <Link to="/how-it-works" className="hover:underline">{t("footer_rent_support")}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
