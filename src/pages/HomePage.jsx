import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Utensils,
  Wifi,
  Building,
  Navigation,
  X,
  Bed,
  CheckCircle2,
  Users,
  ChevronDown,
  Sparkles,
  Award,
  PhoneCall,
  Clock,
  HeartHandshake,
  HelpCircle,
  Plus
} from "lucide-react";
import { roomApi } from "../api/endpoints";
import RoomCard from "../components/room/RoomCard";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";
import toast from "react-hot-toast";

const POPULAR_CAMPUSES = [
  {
    name: "Kumarbagh (GEC West Champaran)",
    short: "Kumarbagh (GEC Gate)",
    city: "West Champaran",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
    price: "From ₹3,200/mo",
    beds: "300m to GEC Gate"
  },
  {
    name: "Bettiah Town (Supriya Road / Lal Bazar)",
    short: "Bettiah City Hub",
    city: "West Champaran",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&auto=format&fit=crop&q=80",
    price: "From ₹4,800/mo",
    beds: "Town Residencies"
  },
  {
    name: "Chanpatia (Startup Zone & Station Road)",
    short: "Chanpatia Hub",
    city: "West Champaran",
    image: "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&auto=format&fit=crop&q=80",
    price: "From ₹3,400/mo",
    beds: "Near Startup Zone"
  },
  {
    name: "Narkatiaganj (Junction & College Rd)",
    short: "Narkatiaganj Hub",
    city: "West Champaran",
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80",
    price: "From ₹3,000/mo",
    beds: "Station Lodges"
  },
  {
    name: "Delhi University (DU North Campus)",
    short: "DU North Campus",
    city: "Kamla Nagar, Delhi",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
    price: "From ₹4,500/mo",
    beds: "18+ Verified PGs"
  },
  {
    name: "CUHP Dharamshala (Central University)",
    short: "CUHP Dharamshala",
    city: "Dharamshala, HP",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    price: "From ₹4,500/mo",
    beds: "16+ Hostels"
  },
];

export default function HomePage() {
  const [collegeQuery, setCollegeQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [occupancy, setOccupancy] = useState("");
  const [sharingType, setSharingType] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    roomApi
      .list({ limit: 8, sort: "distanceLowToHigh" })
      .then((res) => setFeaturedRooms(res.data.rooms || []))
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = POPULAR_CAMPUSES.filter((c) =>
    collegeQuery.trim() === ""
      ? true
      : c.name.toLowerCase().includes(collegeQuery.toLowerCase()) ||
        c.short.toLowerCase().includes(collegeQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(collegeQuery.toLowerCase())
  );

  function handleSearch(e) {
    e?.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (collegeQuery.trim()) params.set("campus", collegeQuery.trim());
    if (occupancy) params.set("occupancy", occupancy);
    if (sharingType) params.set("sharingType", sharingType);
    if (maxBudget) params.set("maxPrice", maxBudget);
    navigate(`/search?${params.toString()}`);
  }

  function handleSelectCollege(campusName) {
    setCollegeQuery(campusName);
    setShowSuggestions(false);
    navigate(`/search?campus=${encodeURIComponent(campusName)}`);
  }

  function handleLiveLocationSearch() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    toast.loading("Finding verified PGs within 10 km of your live location...", { id: "geo" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        toast.success("Live area located! Showing verified PGs near you.", { id: "geo" });
        setDetectingLocation(false);
        navigate(`/search?lat=${latitude}&lng=${longitude}&radiusKm=10&live=1`);
      },
      (err) => {
        setDetectingLocation(false);
        toast.dismiss("geo");
        toast.error("Location permission denied. Please search your area or college above.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Filtered rooms in the feed
  const displayRooms = featuredRooms.filter((room) => {
    if (activeFilter === "boys") return room.occupancy === "Boys";
    if (activeFilter === "girls") return room.occupancy === "Girls";
    if (activeFilter === "food") return Boolean(room.foodIncluded);
    if (activeFilter === "single") return room.roomType === "Single Room";
    return true;
  });

  const CATEGORIES = [
    {
      title: t("boys_pg_hostels"),
      desc: t("boys_pg_desc"),
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
      filterKey: "occupancy",
      filterVal: "Boys",
      tag: t("boys_only_tag")
    },
    {
      title: t("girls_pg_hostels"),
      desc: t("girls_pg_desc"),
      image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
      filterKey: "occupancy",
      filterVal: "Girls",
      tag: t("girls_safe_tag")
    },
    {
      title: t("pg_with_meals"),
      desc: t("pg_meals_desc"),
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
      filterKey: "foodIncluded",
      filterVal: "true",
      tag: t("homely_food_tag")
    },
    {
      title: t("private_rooms"),
      desc: t("private_rooms_desc"),
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
      filterKey: "roomType",
      filterVal: "Single Room",
      tag: t("full_privacy_tag")
    },
  ];

  const AUDIT_GALLERY = [
    { title: t("audit_1"), subtitle: t("audit_1_sub"), image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80" },
    { title: t("audit_2"), subtitle: t("audit_2_sub"), image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80" },
    { title: t("audit_3"), subtitle: t("audit_3_sub"), image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80" },
    { title: t("audit_4"), subtitle: t("audit_4_sub"), image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80" },
    { title: t("audit_5"), subtitle: t("audit_5_sub"), image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80" },
  ];

  const FAQS = [
    { q: t("faq_1_q"), a: t("faq_1_a") },
    { q: t("faq_2_q"), a: t("faq_2_a") },
    { q: t("faq_3_q"), a: t("faq_3_a") },
    { q: t("faq_4_q"), a: t("faq_4_a") },
  ];

  return (
    <div className="bg-[#FBFBFC] dark:bg-[#0B1120] min-h-screen text-slate-900 dark:text-slate-100 selection:bg-orange-100 selection:text-orange-900 transition-colors">
      <SEO
        title="RoomNest — Verified PGs & Co-Living Spaces Across India"
        description="Find affordable, 100% verified PGs for students and working professionals. Homely food, safe gated security, verified owners, and zero brokerage."
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-10 pb-14 sm:py-16 bg-gradient-to-b from-white via-orange-50/20 to-[#FBFBFC] dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0B1120] border-b border-slate-200/70 dark:border-slate-800 transition-colors">
        <div className="container-page max-w-6xl text-center">
          
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-5 shadow-2xs">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
            {t("trust_pill")}
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            {t("hero_title")}{" "}
            <span className="text-[#FD701E]">{t("co_living")}</span>
          </h1>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            {t("hero_subtitle")}
          </p>

          {/* Search Capsule */}
          <div className="mt-8 max-w-3xl mx-auto relative z-30">
            <form
              onSubmit={handleSearch}
              className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-full p-2 shadow-lg border border-slate-200/90 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-2 text-left"
            >
              <div className="flex-1 w-full flex items-center gap-3 px-4 py-2 relative" ref={dropdownRef}>
                <MapPin size={20} className="text-[#FD701E] shrink-0" />
                <input
                  type="text"
                  value={collegeQuery}
                  onChange={(e) => {
                    setCollegeQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={t("search_placeholder")}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal"
                />

                <button
                  type="button"
                  onClick={handleLiveLocationSearch}
                  disabled={detectingLocation}
                  className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-[#FD701E] rounded-full transition-colors shrink-0"
                  title={t("near_live_location")}
                >
                  <Navigation size={16} className={detectingLocation ? "animate-spin text-[#FD701E]" : ""} />
                </button>

                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50 divide-y divide-slate-100">
                    <div className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                      {t("popular_campuses_dropdown")}
                    </div>
                    {filteredSuggestions.map((col) => (
                      <div
                        key={col.name}
                        onMouseDown={() => handleSelectCollege(col.name)}
                        className="p-3 hover:bg-orange-50/70 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-[#FD701E] transition-colors truncate">
                            {col.short}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {col.city} • <span className="text-emerald-700 font-semibold">{col.beds}</span>
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-slate-300 group-hover:text-[#FD701E] shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden sm:block h-6 w-px bg-slate-200" />

              <div className="w-full sm:w-auto px-3 py-1 flex items-center gap-1.5">
                <Users size={15} className="text-slate-400 shrink-0" />
                <select
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="">{t("all_gender")}</option>
                  <option value="Boys">{t("boys_only")}</option>
                  <option value="Girls">{t("girls_only")}</option>
                  <option value="Co-ed">{t("co_ed")}</option>
                </select>
              </div>

              <div className="hidden md:flex items-center gap-1 px-3 py-1 border-l border-slate-200">
                <span className="text-xs font-bold text-slate-400">₹</span>
                <select
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="">{t("any_budget")}</option>
                  <option value="3500">&lt; ₹3,500</option>
                  <option value="5000">&lt; ₹5,000</option>
                  <option value="8000">&lt; ₹8,000</option>
                  <option value="12000">&lt; ₹12,000</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#FD701E] hover:bg-[#E55A0A] text-white rounded-xl sm:rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] shrink-0"
              >
                <Search size={15} />
                <span>{t("search_btn")}</span>
              </button>
            </form>
          </div>

          {/* Quick Location Shortcuts */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleLiveLocationSearch}
              className="text-xs font-bold text-[#FD701E] bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-full border border-orange-200 shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Navigation size={12} /> {t("near_live_location")}
            </button>
            <span className="text-xs text-slate-400 font-medium">{t("popular_label")}</span>
            {POPULAR_CAMPUSES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSelectCollege(c.name)}
                className="text-xs font-semibold text-slate-700 hover:text-[#FD701E] bg-white hover:bg-orange-50 px-3 py-1 rounded-full border border-slate-200 shadow-2xs transition-colors"
              >
                📍 {c.short}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. POPULAR ACCOMMODATIONS BY CATEGORY */}
      <section className="container-page py-10 max-w-6xl">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t("popular_accommodation_types")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t("explore_verified_rooms")}
            </p>
          </div>
          <Link to="/search" className="text-xs font-bold text-[#FD701E] hover:underline flex items-center gap-1">
            {t("browse_all")} <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              onClick={() => navigate(`/search?${cat.filterKey}=${cat.filterVal}`)}
              className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden cursor-pointer border border-slate-200 shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
              
              <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                {cat.tag}
              </span>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-display font-bold text-sm sm:text-base group-hover:text-orange-300 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {cat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. EXPLORE BY CITY / CAMPUS */}
      <section className="container-page py-6 max-w-6xl">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t("explore_by_city")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t("explore_by_city_sub")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {POPULAR_CAMPUSES.map((camp) => (
            <div
              key={camp.name}
              onClick={() => handleSelectCollege(camp.name)}
              className="group rounded-2xl overflow-hidden border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="relative h-28 overflow-hidden bg-slate-100">
                <img
                  src={camp.image}
                  alt={camp.short}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-slate-900/85 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                  {camp.price}
                </span>
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#FD701E] transition-colors truncate">
                    {camp.short}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {camp.beds}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. VERIFIED PG LISTINGS FEED */}
      <section className="container-page py-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {t("verified_pgs_near")}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t("verified_pgs_sub")}
            </p>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "all", label: t("all_pgs") },
              { id: "food", label: t("meals_included") },
              { id: "boys", label: t("boys_pg") },
              { id: "girls", label: t("girls_pg") },
              { id: "single", label: t("single_room") },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === f.id
                    ? "bg-[#FD701E] text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-orange-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loadingRooms ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : displayRooms.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <Building size={32} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t("no_match_filter")}</p>
            <button
              onClick={() => setActiveFilter("all")}
              className="btn-brand !py-1.5 !px-4 text-xs mt-3"
            >
              {t("reset_filters")}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayRooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* 5. THE 5-POINT PHYSICAL INSPECTION GALLERY */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 py-12 sm:py-16 my-6">
        <div className="container-page max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-0.5 rounded-full">
                <CheckCircle2 size={13} /> {t("audit_badge")}
              </span>
              <h2 className="font-display text-xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {t("audit_title")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t("audit_sub")}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              {t("genuine_photos")}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {AUDIT_GALLERY.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 flex-1 flex flex-col justify-between border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    ✓ {t("inspected_by")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE ROOMNEST */}
      <section className="container-page py-12 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FD701E]">
            {t("advantage_label")}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {t("advantage_title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("advantage_sub")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700 shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">{t("verified_owners")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t("verified_owners_desc")}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700 shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#FD701E] flex items-center justify-center mb-3">
              <Sparkles size={22} />
            </div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">{t("zero_brokerage_title")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t("zero_brokerage_desc")}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700 shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Utensils size={22} />
            </div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">{t("homely_meals")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t("homely_meals_desc")}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700 shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Building size={22} />
            </div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">{t("safe_campus")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t("safe_campus_desc")}
            </p>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 py-12 sm:py-16">
        <div className="container-page max-w-3xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FD701E]">
              {t("faq_label")}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {t("faq_title")}
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-display font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180 text-[#FD701E]" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. LIST YOUR PROPERTY CTA BANNER */}
      <section className="container-page py-12 pb-16 max-w-6xl">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FD701E] bg-orange-950/80 px-3 py-1 rounded-full border border-orange-800">
              {t("cta_label")}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-3">
              {t("cta_title")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {t("cta_desc")}
            </p>
          </div>
          <Link
            to="/list-your-property"
            className="btn-brand font-bold text-xs whitespace-nowrap !py-3.5 !px-7 shadow-lg shrink-0 relative z-10 hover:scale-105 transition-transform"
          >
            {t("cta_btn")}
          </Link>
        </div>
      </section>

    </div>
  );
}
