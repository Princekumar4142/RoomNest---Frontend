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
    price: "From ₹8,500/mo",
    beds: "18+ Verified PGs"
  },
  {
    name: "CUHP Dharamshala (Central University)",
    short: "CUHP Dharamshala",
    city: "Dharamshala, HP",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    price: "From ₹5,500/mo",
    beds: "16+ Hostels"
  },
];

const CATEGORIES = [
  {
    title: "Boys PG & Hostels",
    desc: "3 meals, Wi-Fi & study environment",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    filterKey: "occupancy",
    filterVal: "Boys",
    tag: "Boys Only"
  },
  {
    title: "Girls PG & Hostels",
    desc: "Safe, gated with 24x7 warden & CCTV",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
    filterKey: "occupancy",
    filterVal: "Girls",
    tag: "100% Safe & Gated"
  },
  {
    title: "PG with 3 Meals",
    desc: "Breakfast, lunch, and dinner included",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    filterKey: "foodIncluded",
    filterVal: "true",
    tag: "Homely Food"
  },
  {
    title: "Private Single Rooms",
    desc: "Personal space with attached washroom",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    filterKey: "roomType",
    filterVal: "Single Room",
    tag: "Full Privacy"
  },
];

const AUDIT_GALLERY = [
  {
    title: "1. Building Front Look",
    subtitle: "Gated entry, street lighting & curfew gate",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "2. Clean Student Bedroom",
    subtitle: "Comfortable mattress, ventilation & wardrobe",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "3. Study Table & Wi-Fi",
    subtitle: "Dedicated desk, task light & 50+ Mbps net",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "4. Attached Washroom",
    subtitle: "Clean tiles, running water & hot geyser",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "5. Hygienic Mess Hall",
    subtitle: "Fresh meals, dining tables & UV/RO water",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
  },
];

const FAQS = [
  {
    q: "How does RoomNest verify PG owners and properties?",
    a: "Every room listed on RoomNest undergoes a physical 5-point in-person audit by our campus team. We verify the landlord's government ID (Aadhaar/PAN), inspect the exterior building gate, bedroom furniture, study table, geyser, and taste the student mess food before approving the listing."
  },
  {
    q: "Is there any brokerage fee to book or contact the owner?",
    a: "Zero! There is absolutely ₹0 brokerage. You connect directly with the verified property owner or warden on WhatsApp or via call with complete price transparency."
  },
  {
    q: "Can I find accommodations within 10 km of my live location?",
    a: "Yes! Click the '📍 Near My Live Location' button or the GPS icon inside the search bar. The platform will automatically calculate distances and show verified PGs and hostels within a 10 km radius."
  },
  {
    q: "Do PGs provide rent agreements for college address proof?",
    a: "Yes, our verified partner PGs provide formal rent agreements upon move-in, which students can submit for college registration, bank accounts, or scholarship applications."
  }
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

  return (
    <div className="bg-[#FBFBFC] min-h-screen text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      <SEO
        title="RoomNest — Verified PGs & Co-Living Spaces Across India"
        description="Find affordable, 100% verified PGs for students and working professionals. Homely food, safe gated security, verified owners, and zero brokerage."
      />

      {/* 1. HERO SECTION: PGdekho-Style Vibrant Multi-Filter Search Capsule */}
      <section className="relative pt-10 pb-14 sm:py-16 bg-gradient-to-b from-white via-orange-50/20 to-[#FBFBFC] border-b border-slate-200/70">
        <div className="container-page max-w-6xl text-center">
          
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 mb-5 shadow-2xs">
            <ShieldCheck size={14} className="text-emerald-600 stroke-[2.5]" />
            100% In-Person Audited Accommodations • Zero Brokerage Guaranteed
          </div>

          {/* Punchy PGdekho-Style Headline */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Find Your Ideal Verified PG &{" "}
            <span className="text-[#FD701E]">Co-Living Space</span>
          </h1>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
            Homely Food • 100% Verified Owners • Walking Distance to Campus • Direct WhatsApp Connect
          </p>

          {/* Minimal, Sleek Search Capsule */}
          <div className="mt-8 max-w-3xl mx-auto relative z-30">
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl sm:rounded-full p-2 shadow-lg border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 text-left"
            >
              {/* Primary Search Input: City, College, Area */}
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
                  placeholder="Enter city, area, or college..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                />

                {/* 10 km live location radar button */}
                <button
                  type="button"
                  onClick={handleLiveLocationSearch}
                  disabled={detectingLocation}
                  className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-[#FD701E] rounded-full transition-colors shrink-0"
                  title="Detect GPS location (Find PGs within 10 km)"
                >
                  <Navigation size={16} className={detectingLocation ? "animate-spin text-[#FD701E]" : ""} />
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

              {/* Minimal Divider */}
              <div className="hidden sm:block h-6 w-px bg-slate-200" />

              {/* Minimal Gender Select */}
              <div className="w-full sm:w-auto px-3 py-1 flex items-center gap-1.5">
                <Users size={15} className="text-slate-400 shrink-0" />
                <select
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="">All (Boys/Girls)</option>
                  <option value="Boys">Boys Only</option>
                  <option value="Girls">Girls Only</option>
                  <option value="Co-ed">Co-ed</option>
                </select>
              </div>

              {/* Minimal Budget Select */}
              <div className="hidden md:flex items-center gap-1 px-3 py-1 border-l border-slate-200">
                <span className="text-xs font-bold text-slate-400">₹</span>
                <select
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="">Any Budget</option>
                  <option value="3500">&lt; ₹3,500</option>
                  <option value="5000">&lt; ₹5,000</option>
                  <option value="8000">&lt; ₹8,000</option>
                  <option value="12000">&lt; ₹12,000</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#FD701E] hover:bg-[#E55A0A] text-white rounded-xl sm:rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] shrink-0"
              >
                <Search size={15} />
                <span>Search</span>
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
              <Navigation size={12} /> Near My Live Location (10 km)
            </button>
            <span className="text-xs text-slate-400 font-medium">Popular:</span>
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

      {/* 2. POPULAR ACCOMMODATIONS BY CATEGORY (PGdekho Style) */}
      <section className="container-page py-10 max-w-6xl">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Popular Accommodation Types
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore verified rooms curated for your lifestyle and budget.
            </p>
          </div>
          <Link to="/search" className="text-xs font-bold text-[#FD701E] hover:underline flex items-center gap-1">
            Browse All <ArrowRight size={13} />
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

      {/* 3. EXPLORE BY CITY / CAMPUS (PGdekho Style Visual Destination Grid) */}
      <section className="container-page py-6 max-w-6xl">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Explore PGs by City & Campus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Find verified student PGs and hostels within walking distance of key gates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {POPULAR_CAMPUSES.map((camp) => (
            <div
              key={camp.name}
              onClick={() => handleSelectCollege(camp.name)}
              className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
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
                  <h3 className="font-display font-bold text-xs text-slate-900 group-hover:text-[#FD701E] transition-colors truncate">
                    {camp.short}
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {camp.beds}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. VERIFIED PG LISTINGS FEED (With Feed Filters & Instant WhatsApp) */}
      <section className="container-page py-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                Verified PGs & Co-Living Spaces Near You
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              100% Verified owners • Physical inspection passed • Direct WhatsApp to landlords
            </p>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "all", label: "All PGs" },
              { id: "food", label: "Meals Included" },
              { id: "boys", label: "Boys PG" },
              { id: "girls", label: "Girls PG" },
              { id: "single", label: "Single Room" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === f.id
                    ? "bg-[#FD701E] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-orange-50"
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
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Building size={32} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No accommodations match this filter</p>
            <button
              onClick={() => setActiveFilter("all")}
              className="btn-brand !py-1.5 !px-4 text-xs mt-3"
            >
              Reset Filters
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

      {/* 5. THE 5-POINT PHYSICAL INSPECTION GALLERY (Photo-First Proof) */}
      <section className="bg-white border-y border-slate-200/80 py-12 sm:py-16 my-6">
        <div className="container-page max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                <CheckCircle2 size={13} /> The 5-Point RoomNest Audit Standard
              </span>
              <h2 className="font-display text-xl sm:text-3xl font-bold text-slate-900 mt-2">
                What We Physically Inspect Before Listing
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Every PG is physically audited to verify the building exterior, bedroom comfort, study desk, washroom, and mess meals.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
              100% Genuine Photos
            </span>
          </div>

          {/* 5-Photo Visual Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {AUDIT_GALLERY.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
                    ✓ Inspected by Campus Team
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE ROOMNEST (PGdekho Style Feature Grid) */}
      <section className="container-page py-12 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FD701E]">
            The RoomNest Advantage
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Why Students & Parents Trust RoomNest
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            We solve the biggest challenges in student housing with complete transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-sm">100% Verified Owners</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Every host is verified with government ID (Aadhaar/PAN) and in-person property audits.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FD701E] flex items-center justify-center mb-3">
              <Sparkles size={22} />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-sm">Zero Brokerage Always</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              No middleman commission. Connect directly with landlords on WhatsApp with complete rent transparency.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Utensils size={22} />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-sm">Homely 3 Meals & RO Water</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Weekly audited student mess halls, fresh vegetables, hygienic kitchens, and UV+RO drinking water.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Building size={22} />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-sm">Safe Gated Campuses</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Street lighting, night curfew locks, CCTV cameras, and 24/7 security guards for student safety.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (PGdekho Style) */}
      <section className="bg-white border-y border-slate-200/80 py-12 sm:py-16">
        <div className="container-page max-w-3xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FD701E]">
              Got Questions?
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-display font-bold text-sm text-slate-900 flex items-center justify-between gap-4"
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
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. LIST YOUR PROPERTY CTA BANNER (PGdekho Orange & Slate Style) */}
      <section className="container-page py-12 pb-16 max-w-6xl">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FD701E] bg-orange-950/80 px-3 py-1 rounded-full border border-orange-800">
              For PG Owners & Wardens
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-3">
              Own a student PG or hostel near campus?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              List for free, get verified by our physical audit team, and receive direct WhatsApp inquiries from 1,000+ college students. Zero listing fee.
            </p>
          </div>
          <Link
            to="/list-your-property"
            className="btn-brand font-bold text-xs whitespace-nowrap !py-3.5 !px-7 shadow-lg shrink-0 relative z-10 hover:scale-105 transition-transform"
          >
            List Your PG Free
          </Link>
        </div>
      </section>

    </div>
  );
}
