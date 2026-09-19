import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  GraduationCap,
  MapPin,
  ArrowRight,
  Utensils,
  Wifi,
  Sparkles,
  Users,
  Building,
  Navigation,
  X,
  Bed,
  CheckCircle2,
  Zap,
  Footprints,
  Star
} from "lucide-react";
import { roomApi } from "../api/endpoints";
import RoomCard from "../components/room/RoomCard";
import SEO from "../components/SEO";
import toast from "react-hot-toast";

const POPULAR_CAMPUSES = [
  {
    name: "Government Engineering College (GEC) West Champaran",
    short: "GEC West Champaran",
    city: "Kumarbagh / Bettiah",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    price: "From ₹3,200/mo",
    beds: "6+ Verified PGs"
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
    name: "Delhi University (DU) North Campus",
    short: "DU North Campus",
    city: "Kamla Nagar, Delhi",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
    price: "From ₹8,500/mo",
    beds: "18+ Student PGs"
  },
  {
    name: "Central University of Himachal Pradesh (CUHP)",
    short: "CUHP Dharamshala",
    city: "Dharamshala",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    price: "From ₹5,500/mo",
    beds: "16+ Hostels"
  },
];

const CATEGORIES = [
  {
    title: "PG with 3 Meals",
    desc: "Breakfast, lunch, and dinner included",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    filterKey: "foodIncluded",
    filterVal: "true",
    tag: "3 Meals Included"
  },
  {
    title: "Private Single Rooms",
    desc: "Personal space with dedicated study desk",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
    filterKey: "roomType",
    filterVal: "Single Room",
    tag: "100% Privacy"
  },
  {
    title: "Shared Hostel Beds",
    desc: "Budget-friendly 2 & 3 sharing rooms",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&auto=format&fit=crop&q=80",
    filterKey: "roomType",
    filterVal: "Hostel",
    tag: "Budget Friendly"
  },
  {
    title: "Student Flats",
    desc: "Independent 1BHK & 2BHK to share with friends",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    filterKey: "roomType",
    filterVal: "Flat",
    tag: "Zero Interference"
  },
];

const AUDIT_GALLERY = [
  {
    title: "Building Front Look",
    subtitle: "Gated entry, security & street lighting",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
    tag: "01. Front Look"
  },
  {
    title: "Clean Student Bedroom",
    subtitle: "Ventilated rooms, clean mattress & wardrobe",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    tag: "02. Bedroom"
  },
  {
    title: "Study Desk & Wi-Fi",
    subtitle: "Personal study table, chair & 50+ Mbps net",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80",
    tag: "03. Study Table"
  },
  {
    title: "Attached Clean Washroom",
    subtitle: "Tiled bathroom, 24/7 water & functional geyser",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
    tag: "04. Washroom"
  },
  {
    title: "Hygienic Mess Hall",
    subtitle: "Fresh ingredients, student dining & RO water",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    tag: "05. Mess Dining"
  },
];

export default function HomePage() {
  const [collegeQuery, setCollegeQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [roomType, setRoomType] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    roomApi
      .list({ limit: 6, sort: "distanceLowToHigh" })
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
    if (roomType) params.set("roomType", roomType);
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
    toast.loading("Locating nearby PGs within 10 km...", { id: "geo" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        toast.success("Location found! Showing accommodations within 10 km", { id: "geo" });
        setDetectingLocation(false);
        navigate(`/search?lat=${latitude}&lng=${longitude}&radiusKm=10&live=1`);
      },
      (err) => {
        setDetectingLocation(false);
        toast.dismiss("geo");
        toast.error("Please allow location access to find PGs near you.");
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

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="RoomNest — Student PGs, Hostels & Rooms Near College"
        description="Find verified student accommodations near your college campus with real photos, mess food, Wi-Fi, and 0 brokerage. WhatsApp landlords directly."
      />

      {/* 1. HERO SECTION: Clean, Visual, Airbnb-Style Floating Search */}
      <section className="relative pt-12 pb-16 sm:py-20 bg-gradient-to-b from-white via-blue-50/20 to-slate-50 border-b border-slate-200/80">
        <div className="container-page max-w-6xl text-center">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 mb-5 shadow-xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            100% In-Person Audited Student Accommodations • Zero Brokerage Always
          </div>

          {/* Punchy Headline */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Find verified student PGs & rooms{" "}
            <span className="text-blue-600">near your campus</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Real building photos, hygienic mess, study desks & direct WhatsApp connect to landlords.
          </p>

          {/* Airbnb-style Floating Search Bar */}
          <div className="mt-8 sm:mt-10 max-w-4xl mx-auto relative z-30">
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl sm:rounded-full p-2.5 sm:p-3 shadow-xl border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 text-left"
            >
              {/* College / Campus Autocomplete Input */}
              <div className="flex-1 w-full flex items-center gap-2.5 px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 relative" ref={dropdownRef}>
                <Search size={18} className="text-blue-600 shrink-0" />
                <div className="w-full">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Target College / Area</span>
                  <input
                    type="text"
                    value={collegeQuery}
                    onChange={(e) => {
                      setCollegeQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="e.g. GEC West Champaran, Bettiah..."
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* GPS 10km Live Location Radar Button */}
                <button
                  type="button"
                  onClick={handleLiveLocationSearch}
                  disabled={detectingLocation}
                  className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-full transition-colors shrink-0"
                  title="Detect GPS live location (10 km radius)"
                >
                  <Navigation size={17} className={detectingLocation ? "animate-spin text-blue-600" : ""} />
                </button>

                {/* Autocomplete Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50 divide-y divide-slate-100">
                    <div className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                      Popular Campuses & Cities
                    </div>
                    {filteredSuggestions.map((col) => (
                      <div
                        key={col.name}
                        onMouseDown={() => handleSelectCollege(col.name)}
                        className="p-3 hover:bg-blue-50/70 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {col.short}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {col.city} • <span className="text-emerald-700 font-semibold">{col.beds}</span>
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-600 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Room Type Dropdown */}
              <div className="w-full sm:w-44 flex items-center gap-2 px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-100">
                <Building size={16} className="text-slate-400 shrink-0" />
                <div className="w-full">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Room Type</span>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="">Any Accommodation</option>
                    <option value="PG">Student PG</option>
                    <option value="Single Room">Single Room</option>
                    <option value="Hostel">Hostel Bed</option>
                    <option value="Flat">Independent Flat</option>
                  </select>
                </div>
              </div>

              {/* Max Budget Dropdown */}
              <div className="w-full sm:w-36 flex items-center gap-2 px-4 py-2">
                <span className="text-sm font-bold text-slate-400 shrink-0">₹</span>
                <div className="w-full">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Budget</span>
                  <select
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="">Any Rent</option>
                    <option value="3500">Under ₹3,500</option>
                    <option value="5000">Under ₹5,000</option>
                    <option value="7500">Under ₹7,500</option>
                    <option value="10000">Under ₹10,000</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] shrink-0"
              >
                <Search size={16} />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Quick campus chip shortcuts */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Quick find:</span>
            {POPULAR_CAMPUSES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSelectCollege(c.name)}
                className="text-xs font-semibold text-slate-700 hover:text-blue-600 bg-white hover:bg-blue-50 px-3 py-1 rounded-full border border-slate-200/80 shadow-xs transition-colors"
              >
                📍 {c.short}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. VISUAL CATEGORY CARDS (Photo-Rich & Aesthetic) */}
      <section className="container-page py-12 max-w-6xl">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Browse by Accommodation Style
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select verified options curated for students and young professionals.
            </p>
          </div>
          <Link to="/search" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            See All <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              onClick={() => navigate(`/search?${cat.filterKey}=${cat.filterVal}`)}
              className="group relative h-48 sm:h-60 rounded-2xl overflow-hidden cursor-pointer border border-slate-200/80 shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
              
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                {cat.tag}
              </span>

              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                <h3 className="font-display font-bold text-sm sm:text-base group-hover:text-blue-300 transition-colors">
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

      {/* 3. FEATURED VERIFIED LISTINGS FEED */}
      <section className="container-page py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                Verified Student Rooms & Hostels
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              In-person checked • Attached washroom & mess • Direct landlord WhatsApp
            </p>
          </div>

          {/* Feed Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "all", label: "All Properties" },
              { id: "food", label: "Meals Included" },
              { id: "single", label: "Single Room" },
              { id: "boys", label: "Boys" },
              { id: "girls", label: "Girls" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === f.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loadingRooms ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : displayRooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Building size={32} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No rooms match this filter</p>
            <button
              onClick={() => setActiveFilter("all")}
              className="btn-primary !py-1.5 !px-4 text-xs mt-3"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayRooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* 4. THE ROOMNEST 5-POINT VISUAL AUDIT GALLERY (Photo-First, No Text Walls!) */}
      <section className="bg-white border-y border-slate-200/80 py-12 sm:py-16 my-8">
        <div className="container-page max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                <CheckCircle2 size={13} /> The 5-Point Physical Audit
              </span>
              <h2 className="font-display text-xl sm:text-3xl font-bold text-slate-900 mt-2">
                What Our Physical Inspection Checks
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                We physically visit each building to photograph the front look, bedroom, study desk, washroom, and mess.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                100% Real Photography
              </span>
            </div>
          </div>

          {/* 5-Photo Visual Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {AUDIT_GALLERY.map((item) => (
              <div
                key={item.tag}
                className="group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {item.tag}
                  </span>
                </div>
                <div className="p-3 bg-white flex-1 flex flex-col justify-between border-t border-slate-100">
                  <div>
                    <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    ✓ Verified In Person
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CAMPUS CLUSTERS (Visual City & Campus Cards) */}
      <section className="container-page py-10 max-w-6xl">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Explore Accommodations by Campus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Verified hostels and PGs grouped by walking distance to college gates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_CAMPUSES.map((camp) => (
            <div
              key={camp.name}
              onClick={() => handleSelectCollege(camp.name)}
              className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="relative h-36 overflow-hidden bg-slate-100">
                <img
                  src={camp.image}
                  alt={camp.short}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                  {camp.price}
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {camp.short}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {camp.city} • <span className="text-emerald-700 font-semibold">{camp.beds}</span>
                  </p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. AMENITIES BAR (Clean, Modern, Real) */}
      <section className="container-page py-6 max-w-6xl">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-2">
            <span className="font-display text-xl font-bold text-slate-900">₹0</span>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Zero Brokerage Always</p>
          </div>
          <div className="p-2 pt-4 md:pt-2">
            <span className="font-display text-xl font-bold text-blue-600">100%</span>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Physical In-Person Audited</p>
          </div>
          <div className="p-2 pt-4 md:pt-2">
            <span className="font-display text-xl font-bold text-emerald-600">Direct</span>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">WhatsApp Landlord Connect</p>
          </div>
          <div className="p-2 pt-4 md:pt-2">
            <span className="font-display text-xl font-bold text-slate-900">10 km</span>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Live Campus Radar</p>
          </div>
        </div>
      </section>

      {/* 7. PROPERTY OWNER CTA BANNER (Minimal & High Impact) */}
      <section className="container-page py-10 pb-16 max-w-6xl">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
              For PG Owners & Wardens
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2.5">
              Own a student PG, hostel, or rental room?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
              List for free, get verified by our physical audit team, and receive direct WhatsApp inquiries from students.
            </p>
          </div>
          <Link
            to="/list-your-property"
            className="btn-primary !bg-white !text-slate-900 hover:!bg-slate-100 font-bold text-xs whitespace-nowrap !py-3 !px-6 shadow-md shrink-0 relative z-10"
          >
            List Your Property Free
          </Link>
        </div>
      </section>

    </div>
  );
}
