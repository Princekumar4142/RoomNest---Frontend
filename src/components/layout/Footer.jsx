import { Link } from "react-router-dom";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Find a room", to: "/search" },
      { label: "List your property", to: "/list-your-property" },
      { label: "How it works", to: "/how-it-works" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About RoomNest", to: "/about" },
      { label: "Help Center", to: "/help" },
      { label: "Contact us", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-paper/80">
      <div className="container-page py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="stamp h-8 w-8 text-[10px] font-bold leading-none border-seal-light text-seal-light">RN</span>
            <span className="font-display text-lg font-semibold text-paper">RoomNest</span>
          </div>
          <p className="mt-4 text-sm text-paper/60 max-w-xs">
            Verified rooms, PGs and hostels for students, professionals and families moving cities — without brokers or fake listings.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-paper mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-paper/60 hover:text-paper transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-paper/10">
        <div className="container-page py-5 text-xs text-paper/50 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} RoomNest. All rights reserved.</span>
          <span>Made for people moving to a new city, everywhere in India.</span>
        </div>
      </div>
    </footer>
  );
}
