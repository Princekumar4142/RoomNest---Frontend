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
  Home,
  Search,
  Users,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  Bookmark,
  LayoutDashboard,
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bettiah / Kumarbagh");
  const [showCityPicker, setShowCityPicker] = useState(false);

  const cityDropdownRef = useRef(null);
  const navigate = useNavigate();

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

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

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  function handleSelectLocation(city) {
    setSelectedCity(city.query);
    setShowCityPicker(false);
    setDrawerOpen(false);
    navigate(`/search?campus=${encodeURIComponent(city.query)}`);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  const NAV_ITEMS = [
    { to: "/", label: t("explore_pgs", "Home"), icon: Home },
    { to: "/search", label: t("explore_pgs", "Explore PGs"), icon: Search },
    { to: "/roommates", label: t("find_roommates", "Find Roommates"), icon: Users },
    { to: "/how-it-works", label: t("how_it_works", "How It Works"), icon: HelpCircle },
  ];

  return (
    <>
      {/* ─── Slim Top Bar ─── */}
      <header
        className={`sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors duration-200 ${
          scrolled
            ? "border-b border-slate-200 dark:border-slate-800 shadow-sm"
            : "border-b border-slate-100 dark:border-slate-800/60"
        }`}
      >
        <div className="container-page flex h-14 items-center justify-between gap-3">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/logo.png"
              alt="RoomNest Logo"
              className="h-8 w-8 object-contain rounded-lg border border-slate-100 dark:border-slate-700 shadow-xs transition-transform group-hover:scale-105"
            />
            <div>
              <div className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-0.5">
                <span>Room</span>
                <span className="text-[#FD701E]">Nest</span>
              </div>
              <div className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase mt-0.5">
                {t("brand_sub", "Verified PGs & Co-Living")}
              </div>
            </div>
          </Link>

          {/* Center: Location Selector (Desktop) */}
          <div className="relative hidden sm:block" ref={cityDropdownRef}>
            <button
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
            >
              <MapPin size={13} className="text-[#FD701E]" />
              <span className="max-w-[140px] truncate">{selectedCity}</span>
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

          {/* Right: Hamburger Menu Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ─── Right-Side Drawer Overlay ─── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer Panel */}
          <div
            className="relative w-[75%] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-y-auto animate-slide-in-right"
            style={{
              animation: "slideInRight 0.25s ease-out",
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                Navigation
              </span>
              <button
                onClick={closeDrawer}
                className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                close <X size={16} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="px-5 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors ${
                      isActive
                        ? "text-[#FD701E] bg-orange-50 dark:bg-orange-950/40"
                        : "text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <item.icon size={18} className="shrink-0" />
                  {item.label}
                </NavLink>
              ))}

              {/* List Your PG */}
              <Link
                to="/list-your-property"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <PlusCircle size={18} className="shrink-0 text-[#FD701E]" />
                {t("list_your_pg", "List Your PG")}
                <span className="ml-auto text-[9px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full uppercase">Free</span>
              </Link>

              {/* Admin Panel */}
              {user?.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-colors"
                >
                  <ShieldCheck size={18} className="shrink-0" />
                  {t("admin_panel", "Admin Panel")}
                  <span className="ml-auto text-[9px] font-bold text-white bg-purple-600 px-2 py-0.5 rounded-full uppercase">Admin</span>
                </Link>
              )}
            </nav>

            <div className="border-t border-slate-100 dark:border-slate-800 mx-5" />

            {/* Toggle Theme */}
            <div className="px-5 py-4">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Toggle Theme
                </span>
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-full">
                      <Sun size={14} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Light</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                      <Moon size={14} className="text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-700">Dark</span>
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* User Profile Section */}
            {user ? (
              <div className="px-5 pb-3">
                <Link
                  to={
                    user.role === "owner"
                      ? "/owner/dashboard"
                      : user.role === "admin"
                      ? "/admin/dashboard"
                      : "/profile"
                  }
                  onClick={closeDrawer}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-600 text-white text-sm font-bold shrink-0">
                    {user.name?.[0]?.toUpperCase() || <UserIcon size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email || user.phone || t("my_dashboard", "My Dashboard")}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 shrink-0" />
                </Link>

                {/* Quick actions row */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Link
                    to="/favorites"
                    onClick={closeDrawer}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                  >
                    <Heart size={16} />
                    <span className="text-[10px] font-bold">Saved</span>
                  </Link>
                  <Link
                    to="/chat"
                    onClick={closeDrawer}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span className="text-[10px] font-bold">Chats</span>
                  </Link>
                  <Link
                    to={user.role === "owner" ? "/owner/dashboard" : "/profile"}
                    onClick={closeDrawer}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    <span className="text-[10px] font-bold">Dashboard</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    closeDrawer();
                    navigate("/");
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
                >
                  <LogOut size={14} />
                  {t("logout", "Logout")}
                </button>
              </div>
            ) : (
              <div className="px-5 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={closeDrawer}
                    className="py-2.5 rounded-xl border-2 border-[#FD701E] text-[#FD701E] text-xs font-bold text-center hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                  >
                    {t("sign_in", "Sign In")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeDrawer}
                    className="py-2.5 rounded-xl bg-[#FD701E] text-white text-xs font-bold text-center hover:bg-[#E55A0A] transition-colors shadow-sm"
                  >
                    {t("student_signup", "Sign Up")}
                  </Link>
                </div>
              </div>
            )}

            {/* Language Selector */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  Language
                </span>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:border-[#FD701E]"
                  >
                    {languages.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Campus Quick Select (in drawer for mobile) */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 sm:hidden">
              <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-2">
                {t("select_campus", "Select Campus / Area")}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.slice(0, 4).map((c) => (
                  <button
                    key={c.query}
                    onClick={() => handleSelectLocation(c)}
                    className="p-2 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 truncate border border-slate-200 dark:border-slate-700"
                  >
                    📍 {c.query}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
