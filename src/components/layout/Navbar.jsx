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
  Sun,
  Moon,
  Globe,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import NotificationBell from "./NotificationBell";

const CITIES = [
  { name: "Kumarbagh (GEC West Champaran)", query: "Kumarbagh", count: "GEC Campus Gate" },
  { name: "Bettiah Town (Supriya Road / Lal Bazar)", query: "Bettiah", count: "Town Residencies" },
  { name: "Chanpatia (Startup Zone & Station)", query: "Chanpatia", count: "Budget Rooms" },
  { name: "Narkatiaganj (Junction & College Rd)", query: "Narkatiaganj", count: "Student Lodges" },
  { name: "Delhi University (DU North Campus)", query: "Delhi", count: "Kamla Nagar PGs" },
  { name: "CUHP Dharamshala (Himachal)", query: "Dharamshala", count: "Hostels & PGs" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t, languages } = useLanguage();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bettiah / Kumarbagh");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const cityDropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const navigate = useNavigate();

  const navLinks = [
    { to: "/search", label: t("explore_pgs", "Explore PGs") },
    { to: "/roommates", label: t("find_roommates", "Find Roommates") },
    { to: "/how-it-works", label: t("how_it_works", "How It Works") },
  ];

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
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setShowLangPicker(false);
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

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header
      className={`sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors duration-200 ${
        scrolled
          ? "border-b border-slate-200 dark:border-slate-800 shadow-sm"
          : "border-b border-slate-100 dark:border-slate-800/60"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3">
        {/* Brand Logo with Image */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="RoomNest Logo"
              className="h-9 w-9 object-contain rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs transition-transform group-hover:scale-105"
            />
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-1">
                <span>Room</span>
                <span className="text-[#FD701E]">Nest</span>
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase mt-0.5">
                {t("brand_sub", "Verified PGs & Co-Living")}
              </div>
            </div>
          </Link>

          {/* PGdekho Style City / Location Selector */}
          <div className="relative hidden lg:block ml-2" ref={cityDropdownRef}>
            <button
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
            >
              <MapPin size={13} className="text-[#FD701E]" />
              <span className="max-w-[130px] truncate">{selectedCity}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {showCityPicker && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-2 divide-y divide-slate-100 dark:divide-slate-700/60">
                <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("select_campus", "Select Campus / Area")}
                </div>
                {CITIES.map((c) => (
                  <div
                    key={c.query}
                    onClick={() => handleSelectLocation(c)}
                    className="p-2.5 hover:bg-orange-50/60 dark:hover:bg-orange-950/30 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.count}</div>
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
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "text-[#FD701E] bg-orange-50 dark:bg-orange-950/40 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right CTA / Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Multi-Language Switcher Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
              title="Change Language"
            >
              <Globe size={14} className="text-teal-600 dark:text-teal-400" />
              <span>{currentLangObj.flag}</span>
              <span className="text-[11px] font-bold">{currentLangObj.short}</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {showLangPicker && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-1.5">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Language
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setShowLangPicker(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      language === l.code
                        ? "bg-orange-50 dark:bg-orange-950/50 text-[#FD701E] font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    {language === l.code && <Check size={14} className="text-[#FD701E]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs"
            aria-label="Toggle dark mode"
            title={isDark ? t("light_mode", "Switch to Light Mode") : t("dark_mode", "Switch to Dark Mode")}
          >
            {isDark ? (
              <Sun size={16} className="text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={16} className="text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Admin Dashboard Quick Access Button */}
          {user?.role === "admin" && (
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all border border-purple-500 hover:scale-105"
              title="Review Pending Room Listings"
            >
              <ShieldCheck size={14} className="text-purple-200" />
              <span>🛡️ {t("admin_panel", "Admin Panel")}</span>
            </Link>
          )}

          {/* List Your PG CTA Button (PGdekho Orange Style) */}
          <Link
            to="/list-your-property"
            className="btn-brand !py-2 !px-3 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle size={14} />
            <span>{t("list_your_pg", "List Your PG")}</span>
            <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">Free</span>
          </Link>

          {user ? (
            <>
              <NotificationBell />
              <Link
                to="/chat"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Messages"
                title="Messages"
              >
                <MessageCircle size={18} />
              </Link>
              <Link
                to="/favorites"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
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
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 pl-2 pr-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-slate-300 transition-colors ml-1"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[11px] font-bold">
                  {user.name?.[0]?.toUpperCase() || <UserIcon size={12} />}
                </div>
                <span>{user.name?.split(" ")[0]}</span>
                {user.role === "admin" && (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 px-1.5 transition-colors"
              >
                {t("logout", "Logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1.5"
              >
                {t("sign_in", "Sign In")}
              </Link>
              <Link to="/register" className="btn-secondary !py-2 !px-3 text-xs font-bold">
                {t("student_signup", "Student Sign Up")}
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls & menu trigger */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Quick theme toggle on mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 space-y-4 shadow-xl">
          {/* Language Switcher on Mobile */}
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Language / भाषा
            </span>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`p-2 rounded-xl text-xs font-bold text-center border transition-colors ${
                    language === l.code
                      ? "bg-orange-50 dark:bg-orange-950/60 border-[#FD701E] text-[#FD701E]"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div>{l.flag}</div>
                  <div className="text-[11px] mt-0.5">{l.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t("select_campus", "Select Campus / Area")}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CITIES.slice(0, 4).map((c) => (
                <button
                  key={c.query}
                  onClick={() => {
                    handleSelectLocation(c);
                    setOpen(false);
                  }}
                  className="p-2 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 truncate"
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
                className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#FD701E]"
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
            + {t("list_your_pg", "List Your PG")} (Free)
          </Link>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setOpen(false)}
                    className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-purple-200" />
                      <span>🛡️ {t("admin_panel", "Open Admin Approval Panel")}</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono uppercase">Admin</span>
                  </Link>
                )}
                <Link
                  to={
                    user.role === "owner"
                      ? "/owner/dashboard"
                      : user.role === "admin"
                      ? "/admin/dashboard"
                      : "/profile"
                  }
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"
                >
                  <UserIcon size={16} /> {t("my_dashboard", "My Dashboard")} ({user.name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="text-left py-1 text-xs font-medium text-rose-600"
                >
                  {t("logout", "Log out")}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary !py-2 text-xs font-bold text-center"
                >
                  {t("sign_in", "Sign In")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary !py-2 text-xs font-bold text-center"
                >
                  {t("student_signup", "Sign Up")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
