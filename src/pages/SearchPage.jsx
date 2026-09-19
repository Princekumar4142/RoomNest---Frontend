import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  SlidersHorizontal,
  Search,
  X,
  GraduationCap,
  MapPin,
  Utensils,
  Wifi,
  Snowflake,
  ShieldCheck,
  BookOpen,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { roomApi, favoriteApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import RoomCard from "../components/room/RoomCard";
import { Spinner } from "../components/ui/Primitives";
import SEO from "../components/SEO";
import toast from "react-hot-toast";

const POPULAR_CAMPUSES = [
  "GEC West Champaran (Kumarbagh)",
  "Kumarbagh",
  "Bettiah",
  "Chanpatia",
  "Narkatiaganj",
  "Central University of Himachal Pradesh (CUHP)",
  "Delhi University North Campus",
  "IIT Delhi",
];

const ROOM_TYPES = ["PG", "Hostel", "Single Room", "Shared Room", "Flat"];
const OCCUPANCIES = ["Boys", "Girls", "Co-ed"];

const DISTANCE_OPTIONS = [
  { label: "Within 1 km (Walking)", value: "1" },
  { label: "Within 2 km (Short walk)", value: "2" },
  { label: "Within 5 km (Cycle/Auto)", value: "5" },
  { label: "Within 10 km (AI Live Radius)", value: "10" },
  { label: "Within 25 km (West Champaran Hub)", value: "25" },
  { label: "Any distance", value: "" },
];

const AMENITY_OPTIONS = [
  { key: "wifi", label: "Wi-Fi", icon: Wifi },
  { key: "ac", label: "AC", icon: Snowflake },
  { key: "attachedBathroom", label: "Attached Bath" },
  { key: "studyTable", label: "Study Desk", icon: BookOpen },
  { key: "powerBackup", label: "Power Backup" },
  { key: "laundry", label: "Laundry" },
  { key: "roWater", label: "RO Drinking Water" },
  { key: "cctv", label: "CCTV / Security" },
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const [favIds, setFavIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const [filters, setFilters] = useState({
    campus: params.get("campus") || "",
    maxDistance: params.get("maxDistance") || "",
    city: params.get("city") || "",
    area: params.get("area") || "",
    minRent: params.get("minRent") || "",
    maxRent: params.get("maxRent") || "",
    roomType: params.get("roomType") || "",
    occupancy: params.get("occupancy") || "",
    foodIncluded: params.get("foodIncluded") === "true",
    rentAgreement: params.get("rentAgreement") === "true",
    curfew: params.get("curfew") || "",
    verifiedOnly: params.get("verifiedOnly") === "true",
    amenities: params.get("amenities") ? params.get("amenities").split(",") : [],
    sort: params.get("sort") || "distanceLowToHigh",
    q: params.get("q") || "",
    lat: params.get("lat") || "",
    lng: params.get("lng") || "",
    radiusKm: params.get("radiusKm") || (params.get("lat") ? "10" : ""),
  });

  const fetchRooms = useCallback(async (f, page = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const query = {
        campus: f.campus || undefined,
        maxDistance: f.maxDistance || undefined,
        city: f.city || undefined,
        area: f.area || undefined,
        minRent: f.minRent || undefined,
        maxRent: f.maxRent || undefined,
        roomType: f.roomType || undefined,
        occupancy: f.occupancy || undefined,
        foodIncluded: f.foodIncluded ? "true" : undefined,
        rentAgreement: f.rentAgreement ? "true" : undefined,
        curfew: f.curfew || undefined,
        verifiedOnly: f.verifiedOnly ? "true" : undefined,
        amenities: f.amenities.length ? f.amenities.join(",") : undefined,
        sort: f.sort,
        q: f.q || undefined,
        lat: f.lat || undefined,
        lng: f.lng || undefined,
        radiusKm: f.radiusKm || undefined,
        page,
      };
      const res = await roomApi.list(query);
      setRooms((prev) => (append ? [...prev, ...res.data.rooms] : res.data.rooms));
      setPagination(res.data.pagination);
    } catch {
      toast.error("Couldn't load accommodations.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms(filters, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          !loadingMore &&
          pagination &&
          pagination.page < pagination.totalPages
        ) {
          fetchRooms(filters, pagination.page + 1, true);
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [pagination, loading, loadingMore, filters, fetchRooms]);

  useEffect(() => {
    if (user) {
      favoriteApi
        .list()
        .then((res) => setFavIds(new Set(res.data.favorites.map((r) => r._id))))
        .catch(() => {});
    }
  }, [user]);

  function applyFilters(newFilters = filters) {
    const next = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (!v || (Array.isArray(v) && !v.length)) return;
      next.set(k, Array.isArray(v) ? v.join(",") : v);
    });
    setParams(next);
    fetchRooms(newFilters, 1);
    setShowFilters(false);
  }

  function handleFilterChange(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    applyFilters(next);
  }

  function toggleAmenity(key) {
    const nextAmenities = filters.amenities.includes(key)
      ? filters.amenities.filter((a) => a !== key)
      : [...filters.amenities, key];
    handleFilterChange("amenities", nextAmenities);
  }

  function resetFilters() {
    const cleared = {
      campus: "",
      maxDistance: "",
      city: "",
      area: "",
      minRent: "",
      maxRent: "",
      roomType: "",
      occupancy: "",
      foodIncluded: false,
      curfew: "",
      verifiedOnly: false,
      amenities: [],
      sort: "distanceLowToHigh",
      q: "",
      lat: "",
      lng: "",
      radiusKm: "",
    };
    setFilters(cleared);
    setParams(new URLSearchParams());
    fetchRooms(cleared, 1);
  }

  function detectLiveLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingGps(true);
    toast.loading("Detecting your live GPS coordinates for 10 km AI suggestions...", { id: "gps" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        toast.success("Live location found! Showing accommodations within 10 km.", { id: "gps" });
        const next = {
          ...filters,
          lat: latitude.toString(),
          lng: longitude.toString(),
          radiusKm: "10",
        };
        setFilters(next);
        applyFilters(next);
      },
      (err) => {
        setIsDetectingGps(false);
        toast.dismiss("gps");
        if (err.code === 1) {
          toast.error("Location permission denied. Please select Kumarbagh or Bettiah manually.");
        } else {
          toast.error("Could not fetch location. Please choose a nearby area.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function clearLiveLocation() {
    const next = { ...filters, lat: "", lng: "", radiusKm: "" };
    setFilters(next);
    applyFilters(next);
  }

  async function toggleFavorite(roomId) {
    if (!user) return toast.error("Log in to save favorites.");
    const isFav = favIds.has(roomId);
    try {
      if (isFav) {
        await favoriteApi.remove(roomId);
        setFavIds((prev) => {
          const next = new Set(prev);
          next.delete(roomId);
          return next;
        });
      } else {
        await favoriteApi.add(roomId);
        setFavIds((prev) => new Set(prev).add(roomId));
        toast.success("Saved to favorites");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  }

  const activeFiltersCount = [
    filters.campus,
    filters.maxDistance,
    filters.city,
    filters.minRent || filters.maxRent,
    filters.roomType,
    filters.occupancy,
    filters.foodIncluded,
    filters.curfew,
    filters.verifiedOnly,
    filters.amenities.length > 0,
  ].filter(Boolean).length;

  const FilterPanelContent = (
    <div className="space-y-6">
      {/* College / University Name Input & Suggestions */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <GraduationCap size={15} className="text-teal" />
          College / University Name
        </label>
        
        {/* Direct Text Search Input */}
        <div className="relative mb-2">
          <input
            type="text"
            value={filters.campus}
            onChange={(e) => handleFilterChange("campus", e.target.value)}
            placeholder="Type college / university name..."
            className="input-field text-xs font-medium !py-2 pl-8 pr-7 bg-white"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          {filters.campus && (
            <button
              type="button"
              onClick={() => handleFilterChange("campus", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Popular College Quick Chips */}
        <div className="flex flex-wrap gap-1.5">
          {[
            "GEC West Champaran",
            "DU North",
            "CUHP",
            "IIT Delhi",
            "Christ Univ",
            "Bettiah",
            "Kumarbagh",
          ].map((short) => {
            const isSelected = filters.campus.toLowerCase().includes(short.toLowerCase());
            return (
              <button
                key={short}
                type="button"
                onClick={() => handleFilterChange("campus", isSelected ? "" : short)}
                className={`text-[11px] px-2 py-1 rounded-md transition-all ${
                  isSelected
                    ? "bg-teal text-white font-semibold shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Distance to Campus Radius */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <MapPin size={14} className="text-slate-500" />
          Distance from Campus
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {DISTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleFilterChange("maxDistance", opt.value)}
              className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                filters.maxDistance === opt.value
                  ? "bg-teal/10 border-teal text-teal font-semibold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Monthly Rent (₹)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minRent}
            onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
            onBlur={() => applyFilters()}
            placeholder="Min ₹"
            className="input-field text-xs !py-1.5"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            value={filters.maxRent}
            onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
            onBlur={() => applyFilters()}
            placeholder="Max ₹"
            className="input-field text-xs !py-1.5"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {[
            { label: "< ₹6k", max: "6000" },
            { label: "₹6k-₹10k", min: "6000", max: "10000" },
            { label: "₹10k-₹15k", min: "10000", max: "15000" },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => {
                const next = { ...filters, minRent: b.min || "", maxRent: b.max || "" };
                setFilters(next);
                applyFilters(next);
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Room Type */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Room Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ROOM_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleFilterChange("roomType", filters.roomType === t ? "" : t)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                filters.roomType === t
                  ? "bg-slate-900 border-slate-900 text-white font-medium"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Occupancy / Gender */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Occupancy
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {OCCUPANCIES.map((occ) => (
            <button
              key={occ}
              type="button"
              onClick={() => handleFilterChange("occupancy", filters.occupancy === occ ? "" : occ)}
              className={`text-center py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filters.occupancy === occ
                  ? "bg-teal border-teal text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      {/* Student Essentials Toggles */}
      <div className="space-y-2.5 pt-2 border-t border-slate-200">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.foodIncluded}
            onChange={(e) => handleFilterChange("foodIncluded", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal"
          />
          <Utensils size={14} className="text-amber-500" />
          3 Meals / Mess Included
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.curfew === "noCurfew"}
            onChange={(e) => handleFilterChange("curfew", e.target.checked ? "noCurfew" : "")}
            className="h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal"
          />
          <Clock size={14} className="text-blue-500" />
          No Curfew / Flexible Entry
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => handleFilterChange("verifiedOnly", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <ShieldCheck size={14} className="text-emerald-600" />
          Campus Verified Owners Only
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.rentAgreement}
            onChange={(e) => handleFilterChange("rentAgreement", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal"
          />
          <ShieldCheck size={14} className="text-teal" />
          Formal Rent Agreement Provided
        </label>
      </div>

      {/* Essential Amenities */}
      <div className="pt-2 border-t border-slate-200">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Facilities & Amenities
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {AMENITY_OPTIONS.map((a) => {
            const isChecked = filters.amenities.includes(a.key);
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => toggleAmenity(a.key)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-left border transition-all ${
                  isChecked
                    ? "bg-teal/10 border-teal text-teal font-medium"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {a.icon && <a.icon size={12} className="shrink-0" />}
                <span className="truncate">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors font-medium"
        >
          <RotateCcw size={13} />
          Reset all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <SEO
        title={
          filters.campus
            ? `Verified Student PGs near ${filters.campus}`
            : "Search Verified Student PGs & Hostels"
        }
        description="Search verified student rooms, hostels, and PGs near top Indian colleges with zero brokerage, distance filters, and authentic peer reviews."
      />

      <div className="container-page py-6 sm:py-8">
        {/* Top Header Bar */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal bg-blue-50 px-2 py-0.5 rounded">
                Verified Student Platform
              </span>
              {filters.campus && (
                <span className="text-xs font-medium text-slate-500">
                  near {filters.campus}
                </span>
              )}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {filters.campus
                ? `Student Accommodations near ${filters.campus}`
                : "Find Verified PGs & Hostels near Campus"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {pagination ? `${pagination.total} verified student properties available` : "Finding rooms..."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Direct College / University Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={filters.campus}
                onChange={(e) => handleFilterChange("campus", e.target.value)}
                placeholder="Search college / university..."
                className="input-field !py-1.5 pl-8 pr-7 text-xs font-medium bg-slate-50 focus:bg-white"
              />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              {filters.campus && (
                <button
                  type="button"
                  onClick={() => handleFilterChange("campus", "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear college search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto sm:ml-0">
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="input-field !py-1.5 !w-auto text-xs font-medium bg-white"
              >
                <option value="distanceLowToHigh">Nearest to Campus</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
            >
              <SlidersHorizontal size={14} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>
        </div>

        {/* Live GPS 10 km AI Suggestion Bar & Quick Champaran Locality Selector */}
        <div className="mb-6 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">West Champaran Hubs:</span>
            {[
              { label: "All Hubs", area: "", campus: "" },
              { label: "Kumarbagh (GEC)", area: "Kumarbagh", campus: "GEC West Champaran (Kumarbagh)" },
              { label: "Bettiah Town", area: "Supriya Road", campus: "" },
              { label: "Chanpatia", area: "Chanpatia", campus: "" },
              { label: "Narkatiaganj", area: "Narkatiaganj", campus: "" },
            ].map((loc) => {
              const isActive = (loc.area && filters.area === loc.area) || (loc.campus && filters.campus === loc.campus);
              return (
                <button
                  key={loc.label}
                  type="button"
                  onClick={() => {
                    const next = {
                      ...filters,
                      area: loc.area,
                      campus: loc.campus,
                      lat: "",
                      lng: "",
                    };
                    setFilters(next);
                    applyFilters(next);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-teal text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {loc.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {filters.lat && filters.lng ? (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 w-full sm:w-auto justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                  Within 10 km of your live GPS
                </span>
                <button
                  type="button"
                  onClick={clearLiveLocation}
                  className="text-[11px] underline hover:text-indigo-900 ml-2"
                >
                  Clear GPS
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={detectLiveLocation}
                disabled={isDetectingGps}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal to-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-teal/90 hover:to-blue-700 transition-all"
              >
                <span>📍 Live Location (10 km AI Radius)</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Sticky Filter Sidebar + Results */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block sticky top-24 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-slate-700" />
                <h3 className="font-display text-sm font-bold text-slate-900">Student Filters</h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-teal hover:underline font-medium"
                >
                  Clear ({activeFiltersCount})
                </button>
              )}
            </div>
            {FilterPanelContent}
          </aside>

          {/* Listings Container */}
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-28 bg-white rounded-2xl border border-slate-200">
                <Spinner className="h-8 w-8 text-teal" />
                <p className="mt-3 text-xs font-medium text-slate-500">
                  Checking verified campus listings...
                </p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-3">
                  <GraduationCap size={24} />
                </div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  No rooms matched all selected filters
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try widening your distance radius from campus or relaxing the budget constraints to see more verified options.
                </p>
                <button onClick={resetFilters} className="btn-secondary text-xs mt-4">
                  Reset filters & show all
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {rooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    isFavorite={favIds.has(room._id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}

            {pagination && pagination.page < pagination.totalPages && (
              <div ref={sentinelRef} className="mt-8 flex justify-center py-6">
                {loadingMore && <Spinner className="h-6 w-6 text-teal" />}
              </div>
            )}

            {pagination && pagination.page >= pagination.totalPages && rooms.length > 0 && (
              <div className="mt-10 text-center py-4 border-t border-slate-200/60">
                <p className="text-xs text-slate-400">
                  Showing all {pagination.total} verified student properties.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative z-10 h-full w-full max-w-xs bg-white p-5 overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-display text-base font-bold text-slate-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{FilterPanelContent}</div>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setShowFilters(false)}
                className="btn-primary w-full text-xs"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
