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
  CheckCircle2,
  Users,
  Building,
  PhoneCall,
  Scale,
  Footprints,
  Clock,
  Star,
  Navigation,
  Compass,
  X,
  Bed,
  Check,
  Award,
  Zap,
} from "lucide-react";
import { roomApi } from "../api/endpoints";
import RoomCard from "../components/room/RoomCard";
import SEO from "../components/SEO";
import toast from "react-hot-toast";

const POPULAR_COLLEGES = [
  { name: "Government Engineering College (GEC) West Champaran", short: "GEC West Champaran", city: "Kumarbagh / Bettiah", count: "6+ Verified PGs" },
  { name: "Delhi University (DU) North Campus", short: "DU North Campus", city: "Kamla Nagar, Delhi", count: "18+ PGs" },
  { name: "Central University of Himachal Pradesh (CUHP)", short: "CUHP Dharamshala", city: "Dharamshala", count: "16+ PGs" },
  { name: "IIT Delhi (Indian Institute of Technology)", short: "IIT Delhi", city: "Hauz Khas, Delhi", count: "12+ Studios" },
  { name: "Christ University Bangalore", short: "Christ Univ", city: "Koramangala, Bangalore", count: "24+ PGs" },
  { name: "VIT Vellore (Vellore Institute of Technology)", short: "VIT Vellore", city: "Vellore, TN", count: "15+ Hostels" },
  { name: "Kumarbagh Station & College Road", short: "Kumarbagh", city: "West Champaran", count: "Immediate Hostels" },
  { name: "Bettiah Town (Supriya Road / Lal Bazar)", short: "Bettiah Town", city: "West Champaran", count: "Residencies & Rooms" },
  { name: "Chanpatia (Startup Zone & Station)", short: "Chanpatia", city: "West Champaran", count: "Budget Lodges" },
  { name: "Narkatiaganj (Junction & College Rd)", short: "Narkatiaganj", city: "West Champaran", count: "Student Lodges" },
];

const SEARCH_TABS = [
  { id: "all", label: "All Accommodations", icon: Building },
  { id: "food", label: "PG with 3 Meals", icon: Utensils },
  { id: "single", label: "Private Single Room", icon: Bed },
  { id: "shared", label: "Shared Hostel Bed", icon: Users },
];

const INSPECTION_POINTS = [
  {
    step: "01",
    title: "Building Front & Gate Inspection",
    desc: "We verify the building exterior facade, street lighting, neighborhood safety, and security gate curfews before listing.",
    icon: Building,
  },
  {
    step: "02",
    title: "Bedroom & Bedding Audit",
    desc: "Every room must have clean mattresses, functional ventilation windows, personal wardrobes with locks, and power backup.",
    icon: Bed,
  },
  {
    step: "03",
    title: "Study Desk & Wi-Fi Speed Test",
    desc: "We physically test Wi-Fi speeds (minimum 50+ Mbps) and verify dedicated study tables with task lighting for exam prep.",
    icon: BookOpen,
  },
  {
    step: "04",
    title: "Washroom & Geyser Verification",
    desc: "Hygienic tiled attached or shared bathrooms checked for 24/7 running water pressure, clean drainage, and functional geysers.",
    icon: ShieldCheck,
  },
  {
    step: "05",
    title: "Mess Hygiene & Food Audit",
    desc: "Our campus representatives audit student mess kitchens, ingredient freshness, drinking RO water, and weekly student menus.",
    icon: Utensils,
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [collegeQuery, setCollegeQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [maxDistance, setMaxDistance] = useState("3");
  const [roomType, setRoomType] = useState("");
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [aiRooms, setAiRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
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

  const filteredSuggestions = POPULAR_COLLEGES.filter((c) =>
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
    if (maxDistance) params.set("maxDistance", maxDistance);

    if (activeTab === "food") {
      params.set("foodIncluded", "true");
    } else if (activeTab === "single") {
      params.set("roomType", "Single Room");
    } else if (activeTab === "shared") {
      params.set("sharingType", "2-Sharing");
    } else if (roomType) {
      params.set("roomType", roomType);
    }
    navigate(`/search?${params.toString()}`);
  }

  function handleSelectCollege(collegeName) {
    setCollegeQuery(collegeName);
    setShowSuggestions(false);
    const params = new URLSearchParams();
    params.set("campus", collegeName);
    if (maxDistance) params.set("maxDistance", maxDistance);
    if (activeTab === "food") params.set("foodIncluded", "true");
    navigate(`/search?${params.toString()}`);
  }

  function handleLiveLocationSearch() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    toast.loading("Detecting your live GPS location for 10 km radius matches...", { id: "geo" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        toast.success("Live location detected! Finding accommodations within 10 km...", { id: "geo" });
        setUserLocation({ lat: latitude, lng: longitude });
        setDetectingLocation(false);

        roomApi
          .list({ lat: latitude, lng: longitude, radiusKm: 10, limit: 6 })
          .then((res) => {
            if (res.data.rooms?.length) {
              setAiRooms(res.data.rooms);
              toast.success(`Found ${res.data.rooms.length} verified accommodations near you!`);
            } else {
              navigate(`/search?lat=${latitude}&lng=${longitude}&radiusKm=10&live=1`);
            }
          })
          .catch(() => {
            navigate(`/search?lat=${latitude}&lng=${longitude}&radiusKm=10&live=1`);
          });
      },
      (err) => {
        setDetectingLocation(false);
        toast.dismiss("geo");
        if (err.code === 1) {
          toast.error("Location permission denied. Please allow GPS access or search your college above.");
        } else {
          toast.error("Unable to retrieve location. Please type your college or university name.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SEO
        title="RoomNest — Verified Student PGs & Hostels Near Campus"
        description="Search verified student accommodations with building front exterior photos, 4-5 real room photos, 3 meals mess, Wi-Fi, and direct WhatsApp connect to landlords. Zero brokerage."
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/80 to-slate-100/60 border-b border-slate-200/80 pt-10 pb-16 lg:py-20">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        <div className="container-page relative z-10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-center">
            {/* Left: Headline & Search Engine */}
            <div>
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-5 shadow-xs">
                <ShieldCheck size={14} className="text-emerald-600 stroke-[2.5]" />
                100% In-Person Inspected Student Housing • Zero Brokerage
              </div>

              {/* Commanding Headline */}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Find verified student PGs & rooms{" "}
                <span className="text-teal underline decoration-teal/25 decoration-wavy underline-offset-8">
                  near your college
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Skip unverified brokers. Explore audited student PGs, hostels, and flats within walking distance of your campus with real building exterior photos, verified mess meals, study desks, and direct WhatsApp connect.
              </p>

              {/* Category Quick Filter Tabs */}
              <div className="mt-7 flex flex-wrap gap-1.5 p-1 bg-slate-200/70 rounded-xl max-w-fit">
                {SEARCH_TABS.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      <Icon size={13} className={isActive ? "text-teal" : "text-slate-400"} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Comprehensive Search Box */}
              <form
                onSubmit={handleSearch}
                className="mt-3 bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-elevated text-left relative z-20"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* College / University Name Input */}
                  <div className="sm:col-span-1 relative" ref={dropdownRef}>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-teal" />
                      Target College / Campus
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={collegeQuery}
                        onChange={(e) => {
                          setCollegeQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Type college or city..."
                        className="input-field !py-2.5 text-xs font-medium pl-8 pr-7 bg-slate-50/60 focus:bg-white"
                      />
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      {collegeQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setCollegeQuery("");
                            setShowSuggestions(true);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50 divide-y divide-slate-100">
                        <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                          Suggested Campuses & Institutes
                        </div>
                        {filteredSuggestions.length > 0 ? (
                          filteredSuggestions.map((col) => (
                            <div
                              key={col.name}
                              onMouseDown={() => handleSelectCollege(col.name)}
                              className="p-2.5 hover:bg-teal/5 cursor-pointer transition-colors flex items-center justify-between group"
                            >
                              <div className="truncate">
                                <div className="text-xs font-bold text-slate-800 group-hover:text-teal transition-colors truncate">
                                  {col.short}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {col.city} • <span className="text-emerald-700 font-medium">{col.count}</span>
                                </div>
                              </div>
                              <ArrowRight size={13} className="text-slate-300 group-hover:text-teal group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-slate-500 text-center">
                            Press <strong>Search</strong> to browse accommodations near "{collegeQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Distance Radius */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400" />
                      Distance to Gate
                    </label>
                    <select
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(e.target.value)}
                      className="input-field !py-2.5 text-xs font-medium bg-slate-50/60 focus:bg-white"
                    >
                      <option value="1">&lt; 1 km (Walking distance)</option>
                      <option value="2">&lt; 2 km (Short walk)</option>
                      <option value="3">&lt; 3 km (Cycle / Auto)</option>
                      <option value="5">&lt; 5 km (Quick transit)</option>
                      <option value="10">&lt; 10 km (10 km Radius)</option>
                      <option value="">Any distance</option>
                    </select>
                  </div>

                  {/* Room Type */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Room Type
                    </label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="input-field !py-2.5 text-xs font-medium bg-slate-50/60 focus:bg-white"
                    >
                      <option value="">All Types (PG/Hostel)</option>
                      <option value="PG">Student PG (with Mess)</option>
                      <option value="Hostel">Hostel Bed</option>
                      <option value="Single Room">Private Single Room</option>
                      <option value="Shared Room">Shared Room</option>
                      <option value="Flat">Flat / Apartment</option>
                    </select>
                  </div>
                </div>

                {/* Submit Row */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>Real exterior & interior photos • WhatsApp landlords directly</span>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto text-xs !py-2.5 !px-6 shadow-sm"
                  >
                    <Search size={14} />
                    Search Accommodations
                  </button>
                </div>
              </form>

              {/* Live Location Action Bar */}
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleLiveLocationSearch}
                  disabled={detectingLocation}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:scale-[1.01]"
                >
                  <Navigation size={14} className={`shrink-0 ${detectingLocation ? "animate-spin" : "text-teal"}`} />
                  <span>📍 Find Near My Live Location (Within 10 km)</span>
                  <span className="rounded bg-teal/20 text-teal text-[10px] px-1.5 py-0.2 font-mono">
                    GPS
                  </span>
                </button>
                <span className="text-xs text-slate-400">or browse popular:</span>
                {POPULAR_COLLEGES.slice(0, 3).map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectCollege(c.name)}
                    className="text-xs font-semibold text-slate-600 hover:text-teal bg-slate-100 hover:bg-teal/5 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                  >
                    {c.short}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Visual Showcase & Student Proof Card */}
            <div className="relative">
              {/* Highlighted Verified Campus Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-elevated relative z-10 max-w-md mx-auto">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
                    alt="Verified Student PG Building Front"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600/95 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                      <ShieldCheck size={13} className="stroke-[2.5]" />
                      Audited Campus PG
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/95 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                      <Utensils size={11} />
                      3 Hot Meals Included
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <span className="rounded-md bg-slate-900/85 backdrop-blur-sm px-2 py-0.5 text-[11px] font-medium text-white">
                      🏢 Front Exterior Look
                    </span>
                    <span className="rounded-md bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-slate-900">
                      2-Sharing
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-teal bg-blue-50/80 rounded-md px-2 py-1 w-fit">
                    <Footprints size={13} className="text-teal" />
                    <span>300m to College Gate (4m walk)</span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900">
                    Aryabhatta Engineers Residency & Mess
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    Kumarbagh, West Champaran • Near GEC Campus
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-slate-900">₹4,500</span>
                        <span className="text-xs text-slate-400">/month</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                        ✓ Absolute Zero Brokerage
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      4.8 (32 Reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Social Proof Metrics */}
              <div className="hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200 shadow-md absolute -bottom-6 -left-6 z-20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">4,200+ Verified Beds</div>
                  <div className="text-[11px] text-slate-500">Physically audited rooms</div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200 shadow-md absolute -top-4 -right-4 z-20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-teal font-bold">
                  <Zap size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Direct Landlord Contact</div>
                  <div className="text-[11px] text-slate-500">Direct WhatsApp • ₹0 Brokerage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC AI SUGGESTIONS SECTION (Triggered via Live Location) */}
      {aiRooms.length > 0 && (
        <section className="bg-indigo-50/50 border-b border-indigo-100 py-10">
          <div className="container-page">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow">
                  <Sparkles size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    AI Smart Suggestion
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                    Accommodations within 10 km of your live location
                  </h2>
                </div>
              </div>
              <Link
                to={`/search?lat=${userLocation?.lat}&lng=${userLocation?.lng}&radiusKm=10`}
                className="text-xs font-semibold text-indigo-700 hover:underline inline-flex items-center gap-1"
              >
                View all nearby ({aiRooms.length}) <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiRooms.map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED VERIFIED CAMPUS LISTINGS */}
      <section className="container-page py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal">
              Handpicked & Verified for Students
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Popular Verified Student PGs & Hostels
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Genuine building front looks, spacious student bedrooms, study desks, and clean mess halls with zero brokerage.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
          >
            Browse all accommodations
            <ArrowRight size={14} />
          </Link>
        </div>

        {loadingRooms ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* 4. THE 5-POINT PHYSICAL INSPECTION STANDARD */}
      <section className="bg-white border-y border-slate-200/80 py-14 sm:py-20">
        <div className="container-page">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              The RoomNest Trust Protocol
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              How we physically inspect every property
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              We never approve photos submitted blindly. Our student audit team physically visits every location before awarding the verification badge.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {INSPECTION_POINTS.map((pt) => {
              const Icon = pt.icon;
              return (
                <div
                  key={pt.step}
                  className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-slate-400">{pt.step}</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 text-teal">
                        <Icon size={16} />
                      </div>
                    </div>
                    <h3 className="font-display text-sm font-bold text-slate-900 mb-1.5">
                      {pt.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <Check size={13} className="stroke-[3]" /> Audit Passed
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. EXPLORE BY COLLEGE / UNIVERSITY DIRECTORY */}
      <section className="container-page py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal">
            University Hubs
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Explore Accommodations by Campus
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Find student PGs grouped specifically by their walking distance to university gates.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_COLLEGES.map((camp) => (
            <div
              key={camp.name}
              onClick={() => navigate(`/search?campus=${encodeURIComponent(camp.name)}`)}
              className="card card-hover p-4 cursor-pointer flex items-center justify-between group bg-white border border-slate-200"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-teal group-hover:bg-teal group-hover:text-white transition-colors shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div className="truncate">
                  <h3 className="font-display text-sm font-bold text-slate-900 group-hover:text-teal transition-colors truncate">
                    {camp.short}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {camp.city} • <span className="text-emerald-700 font-medium">{camp.count}</span>
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-teal group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </section>

      {/* 6. OWNER CTA */}
      <section className="container-page pb-16">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
              For Property Owners
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-3">
              Own a PG, hostel, or rental room near a college campus?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              List your property with zero listing fees. Get verified by our campus audit team, receive direct WhatsApp inquiries from serious students, and fill vacancies fast.
            </p>
          </div>
          <Link
            to="/list-your-property"
            className="btn-seal text-xs font-bold whitespace-nowrap !py-3 !px-6 shadow-md hover:scale-105 transition-transform"
          >
            List Your Student PG Free
          </Link>
        </div>
      </section>
    </div>
  );
}
