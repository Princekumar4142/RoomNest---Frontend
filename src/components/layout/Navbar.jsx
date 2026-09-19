import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  X,
  User as UserIcon,
  MessageCircle,
  MapPin,
  ChevronDown,
  ShieldCheck,
  PlusCircle,
  Building
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

const CITIES = [
  { name: "Kumarbagh (GEC West Champaran)", query: "Kumarbagh", count: "GEC Campus Gate" },
  { name: "Bettiah Town (Supriya Road / Lal Bazar)", query: "Bettiah", count: "Town Residencies" },
  { name: "Chanpatia (Startup Zone & Station)", query: "Chanpatia", count: "Budget Rooms" },
  { name: "Narkatiaganj (Junction & College Rd)", query: "Narkatiaganj", count: "Student Lodges" },
  { name: "Delhi University (DU North Campus)", query: "Delhi", count: "Kamla Nagar PGs" },
  { name: "CUHP Dharamshala (Himachal)", query: "Dharamshala", count: "Hostels & PGs" },
];

const navLinks = [
  { to: "/search", label: "Explore PGs" },
  { to: "/roommates", label: "Find Roommates" },
  { to: "/how-it-works", label: "How It Works" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bettiah / Kumarbagh");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const cityDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setShowCityPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectLocation(city) {
    setSelectedCity(city.query);
    setShowCityPicker(false);
    navigate(`/search?campus=${encodeURIComponent(city.query)}`);
  }

  return (
    <header
      className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-200 ${
        scrolled ? "border-b border-slate-200 shadow-sm" : "border-b border-slate-100"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Brand Logo with Image */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="RoomNest Logo"
              className="h-9 w-9 object-contain rounded-xl border border-slate-100 shadow-xs transition-transform group-hover:scale-105"
            />
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-slate-900 leading-none flex items-center gap-1">
                <span>Room</span>
                <span className="text-[#FD701E]">Nest</span>
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 tracking-wide uppercase mt-0.5">
                Verified PGs & Co-Living
              </div>
            </div>
          </Link>

          {/* PGdekho Style City / Location Selector */}
          <div className="relative hidden sm:block ml-2" ref={cityDropdownRef}>
            <button
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <MapPin size={13} className="text-[#FD701E]" />
              <span className="max-w-[130px] truncate">{selectedCity}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {showCityPicker && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 divide-y divide-slate-100">
                <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Campus / Area
                </div>
                {CITIES.map((c) => (
                  <div
                    key={c.query}
                    onClick={() => handleSelectLocation(c)}
                    className="p-2.5 hover:bg-orange-50/60 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "text-[#FD701E] bg-orange-50 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right CTA / User controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* List Your PG CTA Button (PGdekho Orange Style) */}
          <Link
            to="/list-your-property"
            className="btn-brand !py-2 !px-3.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle size={14} />
            <span>List Your PG</span>
            <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">Free</span>
          </Link>

          {user ? (
            <>
              <NotificationBell />
              <Link
                to="/chat"
                className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                aria-label="Messages"
                title="Messages"
              >
                <MessageCircle size={18} />
              </Link>
              <Link
                to="/favorites"
                className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                aria-label="Favorites"
                title="Saved PGs"
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
                className="flex items-center gap-2 rounded-xl border border-slate-200 pl-2 pr-3 py-1.5 text-xs font-semibold text-slate-800 hover:border-slate-300 transition-colors ml-1"
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
                Logout
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
              <Link to="/register" className="btn-secondary !py-2 !px-3.5 text-xs font-bold">
                Student Sign Up
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

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 space-y-3 shadow-xl">
          <div className="pb-3 border-b border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Select Campus / Area</span>
            <div className="grid grid-cols-2 gap-2">
              {CITIES.slice(0, 4).map((c) => (
                <button
                  key={c.query}
                  onClick={() => {
                    handleSelectLocation(c);
                    setOpen(false);
                  }}
                  className="p-2 text-left bg-slate-50 rounded-xl text-xs font-medium text-slate-700 hover:bg-orange-50 truncate"
                >
                  📍 {c.query}
                </button>
              ))}
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-semibold text-slate-700 hover:text-[#FD701E]"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/list-your-property"
            onClick={() => setOpen(false)}
            className="btn-brand w-full !py-2.5 text-xs font-bold text-center"
          >
            + List Your PG (Free)
          </Link>

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
                  className="py-2 text-sm font-bold text-slate-900 flex items-center gap-2"
                >
                  <UserIcon size={16} /> My Dashboard ({user.name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="text-left py-1 text-xs font-medium text-rose-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary !py-2 text-xs font-bold text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary !py-2 text-xs font-bold text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
