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
} from "lucide-react";
import { roomApi } from "../api/endpoints";
import RoomCard from "../components/room/RoomCard";
import SEO from "../components/SEO";
import toast from "react-hot-toast";

const POPULAR_COLLEGES = [
  { name: "Government Engineering College (GEC) West Champaran", short: "GEC West Champaran", city: "Kumarbagh / Bettiah" },
  { name: "Delhi University (DU) North Campus", short: "DU North Campus", city: "Delhi" },
  { name: "Central University of Himachal Pradesh (CUHP)", short: "CUHP Dharamshala", city: "Dharamshala" },
  { name: "IIT Delhi (Indian Institute of Technology)", short: "IIT Delhi", city: "Delhi" },
  { name: "Christ University Bangalore", short: "Christ Univ", city: "Bangalore" },
  { name: "VIT Vellore (Vellore Institute of Technology)", short: "VIT Vellore", city: "Vellore" },
  { name: "Delhi Technological University (DTU)", short: "DTU Rohini", city: "Delhi" },
  { name: "Symbiosis International University Pune", short: "Symbiosis Pune", city: "Pune" },
  { name: "Kumarbagh Station & College Road", short: "Kumarbagh", city: "West Champaran" },
  { name: "Bettiah Town (Supriya Road / Lal Bazar)", short: "Bettiah", city: "West Champaran" },
  { name: "Chanpatia (Startup Zone & Station)", short: "Chanpatia", city: "West Champaran" },
  { name: "Narkatiaganj (Junction & College Rd)", short: "Narkatiaganj", city: "West Champaran" },
];

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% In-Person Inspected",
    desc: "Every PG and room is physically visited. We verify the building exterior front look, bedroom, study desk, washroom, and mess.",
  },
  {
    icon: Footprints,
    title: "Accurate Campus Commute",
    desc: "Exact distance in meters to university gates. Real walking and cycling commute times, not marketing guesses.",
  },
  {
    icon: Scale,
    title: "Absolute Zero Brokerage",
    desc: "Connect directly with verified owners on WhatsApp or phone. Never pay 15-day or 1-month brokerage fees.",
  },
  {
    icon: Star,
    title: "Real Student Peer Reviews",
    desc: "Read honest feedback from fellow batchmates regarding food quality, warden behavior, and gate curfews.",
  },
];

export default function HomePage() {
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
    // Load top verified accommodations
    roomApi
      .list({ limit: 6, sort: "distanceLowToHigh" })
      .then((res) => setFeaturedRooms(res.data.rooms || []))
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
  }, []);

  // Close suggestions on outside click
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
    if (collegeQuery.trim()) {
      params.set("campus", collegeQuery.trim());
    }
    if (maxDistance) params.set("maxDistance", maxDistance);
    if (roomType) params.set("roomType", roomType);
    navigate(`/search?${params.toString()}`);
  }

  function handleSelectCollege(collegeName) {
    setCollegeQuery(collegeName);
    setShowSuggestions(false);
    const params = new URLSearchParams();
    params.set("campus", collegeName);
    if (maxDistance) params.set("maxDistance", maxDistance);
    if (roomType) params.set("roomType", roomType);
    navigate(`/search?${params.toString()}`);
  }

  // Live Location 10 km Radius AI Search Trigger
  function handleLiveLocationSearch() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    toast.loading("Detecting your live location for AI 10 km radius suggestions...", { id: "geo" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        toast.success("Live location detected! Finding accommodations within 10 km...", { id: "geo" });
        setUserLocation({ lat: latitude, lng: longitude });
        setDetectingLocation(false);

        // Fetch AI recommendations within 10 km
        roomApi
          .list({ lat: latitude, lng: longitude, radiusKm: 10, limit: 6 })
          .then((res) => {
            if (res.data.rooms?.length) {
              setAiRooms(res.data.rooms);
              toast.success(`Found ${res.data.rooms.length} accommodations within 10 km of you!`);
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
          toast.error("Location permission denied. Please allow location access or type your college name.");
        } else {
          toast.error("Unable to retrieve location. Please type your college or university name.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title="RoomNest — Verified Student PGs & Hostels near your College / University"
        description="Type your college or university name to find verified student PGs, hostels, and rooms near your campus. AI 10 km live location suggestions, building front exterior view, zero brokerage."
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-10 pb-14 sm:py-16">
        <div className="container-page">
          <div className="max-w-4xl mx-auto text-center">
            {/* Campus Trust Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-5">
              <ShieldCheck size={14} className="text-emerald-600 stroke-[2.5]" />
              Physically Inspected Student Accommodations • Zero Brokerage
            </div>

            {/* Main Universal Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Find Verified Student PGs & Hostels{" "}
              <span className="text-teal underline decoration-teal/30 decoration-wavy underline-offset-8">
                near your College / University
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Enter your college, university, or institute name to discover verified student PGs, hostels, and rental rooms within walking distance of your campus. 100% zero brokerage with real exterior and interior photos.
            </p>

            {/* LIVE LOCATION & AI 10 KM SUGGESTIONS ACTION BAR */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLiveLocationSearch}
                disabled={detectingLocation}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:from-teal/90 hover:to-blue-700 transition-all hover:scale-[1.02]"
              >
                <Navigation size={16} className={`shrink-0 ${detectingLocation ? "animate-spin" : ""}`} />
                <span>📍 Find Near My Live Location (Within 10 km Radius)</span>
                <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                  AI Match
                </span>
              </button>
            </div>

            {/* Comprehensive Student Search Box with College Name Input */}
            <form
              onSubmit={handleSearch}
              className="mt-8 bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-elevated max-w-3xl mx-auto text-left relative z-20"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* College / University Name Input with Autocomplete */}
                <div className="sm:col-span-1 relative" ref={dropdownRef}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-teal" />
                    College / University Name
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
                      placeholder="Type college / university..."
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

                  {/* Autocomplete Dropdown List */}
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
                            <div>
                              <div className="text-xs font-bold text-slate-800 group-hover:text-teal transition-colors">
                                {col.short}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {col.name} • <span className="text-slate-400">{col.city}</span>
                              </div>
                            </div>
                            <ArrowRight size={13} className="text-slate-300 group-hover:text-teal group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-xs text-slate-500 text-center">
                          Press <strong className="text-slate-800">Search</strong> to find PGs near "{collegeQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Distance Radius */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    Max Distance Radius
                  </label>
                  <select
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="input-field !py-2.5 text-xs font-medium bg-slate-50/60 focus:bg-white"
                  >
                    <option value="1">&lt; 1 km (Walking to Gate)</option>
                    <option value="2">&lt; 2 km (Short Walk)</option>
                    <option value="3">&lt; 3 km (Cycle / Auto)</option>
                    <option value="5">&lt; 5 km (Quick transit)</option>
                    <option value="10">&lt; 10 km (AI 10km Radius)</option>
                    <option value="">Any distance</option>
                  </select>
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Accommodation Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="input-field !py-2.5 text-xs font-medium bg-slate-50/60 focus:bg-white"
                  >
                    <option value="">All Types (PG/Hostel/Rooms)</option>
                    <option value="PG">Student PG (with Mess)</option>
                    <option value="Hostel">Hostel Bed</option>
                    <option value="Single Room">Single Private Room</option>
                    <option value="Shared Room">Shared Room</option>
                    <option value="Flat">Flat / Apartment</option>
                  </select>
                </div>
              </div>

              {/* Submit Row */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Real building exterior front photo • 4-5 interior photos • Direct owner WhatsApp</span>
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

            {/* Quick College Suggestion Chips */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500 mr-1">Popular Campuses:</span>
              {POPULAR_COLLEGES.slice(0, 6).map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleSelectCollege(c.name)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-teal/10 hover:text-teal hover:border-teal/30 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors"
                >
                  <GraduationCap size={12} className="text-teal" />
                  <span>{c.short}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC AI SUGGESTIONS SECTION (Triggered via Live Location) */}
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

      {/* FEATURED VERIFIED CAMPUS LISTINGS */}
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
              Inspected building exterior front looks, student bedrooms, study desks, and clean mess with zero brokerage.
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

      {/* EXPLORE BY COLLEGE / UNIVERSITY DIRECTORY */}
      <section className="bg-white border-y border-slate-200/80 py-12 sm:py-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal">
              University Clusters
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Explore Accommodations by Campus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find PGs grouped specifically by their walking distance to your college gates.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_COLLEGES.map((camp) => (
              <div
                key={camp.name}
                onClick={() => navigate(`/search?campus=${encodeURIComponent(camp.name)}`)}
                className="card card-hover p-4 cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-teal group-hover:bg-teal group-hover:text-white transition-colors shrink-0">
                    <GraduationCap size={20} />
                  </div>
                  <div className="truncate">
                    <h3 className="font-display text-sm font-bold text-slate-900 group-hover:text-teal transition-colors truncate">
                      {camp.short}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {camp.city} • <span className="text-emerald-700 font-medium">Verified PGs</span>
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-teal group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST PILLARS */}
      <section className="container-page py-14 sm:py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            The RoomNest Verification Standard
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Why students trust RoomNest over local brokers
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_PILLARS.map((p) => (
            <div key={p.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800 mb-4">
                <p.icon size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900 mb-1.5">
                {p.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="container-page pb-16">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
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
            className="btn-seal text-xs font-bold whitespace-nowrap !py-3 !px-6"
          >
            List Your Student PG Free
          </Link>
        </div>
      </section>
    </div>
  );
}
