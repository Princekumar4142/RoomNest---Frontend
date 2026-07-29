import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { roomApi, favoriteApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import RoomCard from "../components/room/RoomCard";
import { SectionLabel, Chip, Spinner } from "../components/ui/Primitives";
import SEO from "../components/SEO";
import toast from "react-hot-toast";

const ROOM_TYPES = ["Single Room", "Shared Room", "PG", "Hostel", "Flat"];
const OCCUPANCY = ["Boys", "Girls", "Family", "Co-ed"];
const AMENITY_OPTIONS = [
  { key: "wifi", label: "WiFi" },
  { key: "ac", label: "AC" },
  { key: "attachedBathroom", label: "Attached Bathroom" },
  { key: "kitchen", label: "Kitchen" },
  { key: "parking", label: "Parking" },
  { key: "petFriendly", label: "Pet Friendly" },
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

  const [filters, setFilters] = useState({
    q: params.get("q") || "",
    city: params.get("city") || "",
    minRent: params.get("minRent") || "",
    maxRent: params.get("maxRent") || "",
    roomType: params.get("roomType") || "",
    occupancy: params.get("occupancy") || "",
    verifiedOnly: params.get("verifiedOnly") === "true",
    amenities: params.get("amenities") ? params.get("amenities").split(",") : [],
    sort: params.get("sort") || "newest",
  });

  const fetchRooms = useCallback(async (f, page = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const query = {
        q: f.q || undefined,
        city: f.city || undefined,
        minRent: f.minRent || undefined,
        maxRent: f.maxRent || undefined,
        roomType: f.roomType || undefined,
        occupancy: f.occupancy || undefined,
        verifiedOnly: f.verifiedOnly ? "true" : undefined,
        amenities: f.amenities.length ? f.amenities.join(",") : undefined,
        sort: f.sort,
        page,
      };
      const res = await roomApi.list(query);
      setRooms((prev) => (append ? [...prev, ...res.data.rooms] : res.data.rooms));
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Couldn't load rooms right now.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms(filters, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll: when the sentinel div scrolls into view, load the next page.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, loading, loadingMore, filters]);

  useEffect(() => {
    if (user) {
      favoriteApi
        .list()
        .then((res) => setFavIds(new Set(res.data.favorites.map((r) => r._id))))
        .catch(() => {});
    }
  }, [user]);

  function applyFilters() {
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (!v || (Array.isArray(v) && !v.length)) return;
      next.set(k, Array.isArray(v) ? v.join(",") : v);
    });
    setParams(next);
    fetchRooms(filters, 1);
    setShowFilters(false);
  }

  function toggleAmenity(key) {
    setFilters((f) => ({
      ...f,
      amenities: f.amenities.includes(key)
        ? f.amenities.filter((a) => a !== key)
        : [...f.amenities, key],
    }));
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

  const FilterPanel = (
    <div className="space-y-7">
      <div>
        <SectionLabel>City</SectionLabel>
        <input
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          placeholder="e.g. Delhi, Bangalore"
          className="input-field"
        />
      </div>

      <div>
        <SectionLabel>Budget (₹/month)</SectionLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minRent}
            onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
            placeholder="Min"
            className="input-field"
          />
          <span className="text-slate-ink/40">–</span>
          <input
            type="number"
            value={filters.maxRent}
            onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
            placeholder="Max"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <SectionLabel>Room type</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((t) => (
            <Chip
              key={t}
              active={filters.roomType === t}
              onClick={() => setFilters({ ...filters, roomType: filters.roomType === t ? "" : t })}
            >
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Occupancy</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {OCCUPANCY.map((t) => (
            <Chip
              key={t}
              active={filters.occupancy === t}
              onClick={() => setFilters({ ...filters, occupancy: filters.occupancy === t ? "" : t })}
            >
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Amenities</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <Chip key={a.key} active={filters.amenities.includes(a.key)} onClick={() => toggleAmenity(a.key)}>
              {a.label}
            </Chip>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm font-medium text-ink cursor-pointer">
        <input
          type="checkbox"
          checked={filters.verifiedOnly}
          onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
          className="h-4 w-4 rounded border-ink/30 text-teal focus:ring-teal"
        />
        Verified owners only
      </label>

      <button onClick={applyFilters} className="btn-primary w-full">
        Apply filters
      </button>
    </div>
  );

  return (
    <div className="container-page py-10">
      <SEO
        title={filters.city ? `Rooms in ${filters.city}` : "Search Verified Rooms"}
        description="Browse verified rooms, PGs, hostels and flats with real-time filters for budget, location and amenities."
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
            {filters.city ? `Rooms in ${filters.city}` : "Search verified rooms"}
          </h1>
          <p className="text-sm text-slate-ink/60 mt-1">
            {pagination ? `${pagination.total} listings found` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filters.sort}
            onChange={(e) => {
              const next = { ...filters, sort: e.target.value };
              setFilters(next);
              fetchRooms(next, 1);
            }}
            className="input-field !py-2 !w-auto flex-1 sm:flex-none"
          >
            <option value="newest">Newest</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden btn-secondary !py-2 !px-4"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block">{FilterPanel}</aside>

        <div>
          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner className="h-8 w-8" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-lg text-ink">No rooms match those filters yet.</p>
              <p className="text-sm text-slate-ink/60 mt-1">Try widening your budget or clearing a filter.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
            <div ref={sentinelRef} className="mt-10 flex justify-center py-6">
              {loadingMore && <Spinner className="h-6 w-6" />}
            </div>
          )}

          {pagination && pagination.page >= pagination.totalPages && rooms.length > 0 && (
            <p className="mt-10 text-center text-xs text-slate-ink/40">
              You've reached the end — {pagination.total} listings total.
            </p>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-paper p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={20} />
              </button>
            </div>
            {FilterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
