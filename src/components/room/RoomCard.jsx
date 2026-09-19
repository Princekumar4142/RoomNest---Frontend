import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  Star,
  Wifi,
  Snowflake,
  Scale,
  ShieldCheck,
  Utensils,
  BookOpen,
  Footprints,
  Clock,
} from "lucide-react";
import { useCompare } from "../../context/CompareContext";

export default function RoomCard({ room, isFavorite, onToggleFavorite }) {
  const { items, toggleCompare } = useCompare();
  const isComparing = items.some((r) => r._id === room._id);

  const collegeDisplay = room.campus || room.nearbyCollege;
  const distanceKm = room.distanceToCampusKm != null ? room.distanceToCampusKm : null;
  const walkMins = room.walkingTimeMinutes || (distanceKm ? Math.round(distanceKm * 12) : null);

  return (
    <div className="card card-hover group flex flex-col overflow-hidden bg-white border border-slate-200">
      {/* Photo Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link to={`/rooms/${room._id}`} className="block h-full w-full">
          <img
            src={room.images?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
            alt={room.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {room.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600/95 backdrop-blur-sm px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              <ShieldCheck size={13} className="stroke-[2.5]" />
              Verified Campus PG
            </span>
          )}
          {room.foodIncluded && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/95 backdrop-blur-sm px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              <Utensils size={11} />
              3 Meals Included
            </span>
          )}
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(room);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm shadow-sm transition-all ${
              isComparing
                ? "bg-teal text-white"
                : "bg-white/90 text-slate-700 hover:bg-white hover:text-teal"
            }`}
            aria-label="Add to compare"
            title="Add to compare"
          >
            <Scale size={14} />
          </button>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(room._id);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:bg-white hover:scale-105"
              aria-label="Save to favorites"
            >
              <Heart
                size={14}
                className={isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-600"}
              />
            </button>
          )}
        </div>

        {/* Bottom Tag */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          <span className="rounded-md bg-slate-900/85 backdrop-blur-sm px-2 py-0.5 text-[11px] font-medium text-white flex items-center gap-1">
            <span>🏢</span> Front Exterior
          </span>
          <span className="rounded-md bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[11px] font-semibold text-slate-800">
            {room.sharingType || room.roomType}
          </span>
        </div>
      </div>

      {/* Details Container */}
      <Link to={`/rooms/${room._id}`} className="flex flex-col flex-1 p-4">
        {/* Live Distance or Campus Proximity Banner */}
        {room.distanceFromUserKm != null ? (
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
              <span className="truncate">
                📍 <strong>{room.distanceFromUserKm} km</strong> from your live location
              </span>
            </div>
            <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider bg-indigo-200/70 text-indigo-800 px-1.5 py-0.5 rounded">
              AI 10km Radius
            </span>
          </div>
        ) : collegeDisplay ? (
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-teal bg-blue-50/80 rounded-md px-2 py-1">
            <Footprints size={13} className="shrink-0 text-teal" />
            <span className="truncate">
              {distanceKm != null ? `${distanceKm} km from ` : "Near "}
              <span className="text-slate-800 font-medium">{collegeDisplay}</span>
            </span>
            {walkMins && (
              <span className="shrink-0 text-[11px] text-slate-500 font-normal">
                ({walkMins}m walk)
              </span>
            )}
          </div>
        ) : null}

        {/* Title */}
        <h3 className="font-display text-[15px] font-bold text-slate-900 line-clamp-1 group-hover:text-teal transition-colors">
          {room.title}
        </h3>

        {/* Location & Landmark */}
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 truncate">
          <MapPin size={12} className="shrink-0 text-slate-400" />
          <span className="truncate">
            {room.area}, {room.city} {room.landmark ? `• ${room.landmark}` : ""}
          </span>
        </p>

        {/* Essential Student Amenities Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {room.amenities?.wifi && (
            <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              <Wifi size={11} className="text-slate-500" /> Wi-Fi
            </span>
          )}
          {room.amenities?.ac && (
            <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              <Snowflake size={11} className="text-slate-500" /> AC
            </span>
          )}
          {room.amenities?.studyTable && (
            <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              <BookOpen size={11} className="text-slate-500" /> Study Desk
            </span>
          )}
          {room.curfewTime && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 ml-auto">
              <Clock size={11} /> {room.curfewTime}
            </span>
          )}
        </div>

        {/* Price & Rating Bottom Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-lg font-bold text-slate-900">
                ₹{room.rent?.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-400 font-normal">/month</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                {room.isZeroBrokerage !== false ? "✓ Zero Brokerage" : "No Broker"}
              </span>
              {room.rentAgreementAvailable && (
                <span className="text-[10px] text-slate-500 font-medium">
                  • Agreement Avail.
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            {room.ratingCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {room.ratingAverage?.toFixed(1)}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({room.ratingCount})
                </span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">New listing</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
