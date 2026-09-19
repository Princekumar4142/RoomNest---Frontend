import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, X, User as UserIcon, MessageCircle, GraduationCap, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { to: "/search", label: "Find Campus Rooms" },
  { to: "/roommates", label: "Find Roommate" },
  { to: "/list-your-property", label: "List Property" },
  { to: "/how-it-works", label: "How It Works" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-200 ${
        scrolled ? "border-b border-slate-200 shadow-subtle" : "border-b border-slate-100"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        {/* Brand Logo with Image */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/logo.png"
            alt="RoomNest Logo"
            className="h-9 w-9 object-contain rounded-xl border border-slate-100 shadow-sm transition-transform group-hover:scale-105"
          />
          <div>
            <div className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
              RoomNest
            </div>
            <div className="text-[10px] font-semibold text-emerald-700 tracking-wide uppercase mt-0.5">
              Verified Campus Living
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "text-teal bg-blue-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right CTA / User controls */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <Link
                to="/chat"
                className="p-2 rounded-lg text-slate-600 hover:text-teal hover:bg-slate-50 transition-colors"
                aria-label="Messages"
              >
                <MessageCircle size={18} />
              </Link>
              <Link
                to="/favorites"
                className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                aria-label="Favorites"
              >
                <Heart size={18} />
              </Link>
              <Link
                to={
                  user.role === "owner"
                    ? "/owner/dashboard"
                    : user.role === "admin"
                    ? "/admin/dashboard"
                    : "/profile"
                }
                className="flex items-center gap-2 rounded-lg border border-slate-200 pl-2 pr-3 py-1 text-xs font-semibold text-slate-800 hover:border-slate-300 transition-colors ml-1"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[11px] font-bold">
                  {user.name?.[0]?.toUpperCase() || <UserIcon size={12} />}
                </div>
                <span>{user.name?.split(" ")[0]}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2"
              >
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-xs !py-2 !px-4">
                Join as Student / Owner
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 space-y-3">
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-semibold text-slate-700 hover:text-teal"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={
                    user.role === "owner"
                      ? "/owner/dashboard"
                      : user.role === "admin"
                      ? "/admin/dashboard"
                      : "/profile"
                  }
                  onClick={() => setOpen(false)}
                  className="btn-secondary text-xs"
                >
                  My Dashboard ({user.name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="text-xs text-rose-600 font-medium py-1"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary text-xs w-full text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary text-xs w-full text-center"
                >
                  Create Free Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
