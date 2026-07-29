import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, X, User as UserIcon, MessageCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { to: "/search", label: "Find a room" },
  { to: "/roommates", label: "Find a roommate" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/list-your-property", label: "List your property" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-paper/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="stamp h-8 w-8 text-[10px] font-bold leading-none">RN</span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            RoomNest
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-ink" : "text-slate-ink/70 hover:text-ink"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <Link to="/chat" className="p-2 rounded-full hover:bg-ink/5" aria-label="Messages">
                <MessageCircle size={19} />
              </Link>
              <Link to="/favorites" className="p-2 rounded-full hover:bg-ink/5" aria-label="Favorites">
                <Heart size={19} />
              </Link>
              <Link
                to={user.role === "owner" ? "/owner/dashboard" : user.role === "admin" ? "/admin/dashboard" : "/profile"}
                className="flex items-center gap-2 rounded-full border border-ink/12 pl-2 pr-4 py-1.5 text-sm font-medium hover:bg-ink/5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-paper text-xs font-semibold">
                  {user.name?.[0]?.toUpperCase() || <UserIcon size={14} />}
                </span>
                {user.name?.split(" ")[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm font-medium text-slate-ink/60 hover:text-ink"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink/80 hover:text-ink">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !py-2.5 !px-5">
                Get started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink/8 bg-paper px-5 py-4 space-y-3">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="block text-sm font-medium text-ink" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-ink/8 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/chat" onClick={() => setOpen(false)} className="text-sm font-medium">Messages</Link>
                <Link to="/favorites" onClick={() => setOpen(false)} className="text-sm font-medium">Favorites</Link>
                <Link
                  to={user.role === "owner" ? "/owner/dashboard" : user.role === "admin" ? "/admin/dashboard" : "/profile"}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="text-left text-sm font-medium text-slate-ink/60"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium">Log in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-fit !py-2.5 !px-5">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
