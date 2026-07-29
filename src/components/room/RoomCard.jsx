import { Link } from "react-router-dom";
import { Heart, MapPin, Star, Wifi, Snowflake, Scale } from "lucide-react";
import { useCompare } from "../../context/CompareContext";

export default function RoomCard({ room, isFavorite, onToggleFavorite, rotate = false }) {
  const { items, toggleCompare } = useCompare();
  const isComparing = items.some((r) => r._id === room._id);

  return (
    <div
      className={`card group overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg ${
        rotate ? "rotate-[-2deg] hover:rotate-0" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-700">
        <img
          src={room.images?.[0]}
          alt={room.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {room.isVerified && (
          <div className="stamp absolute top-3 left-3 h-14 w-14 -rotate-12 bg-paper/95 text-[10px] font-bold shadow-md animate-stamp">
            <span className="leading-tight text-center">
              VERI
              <br />
              FIED
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(room._id);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 shadow-sm transition-colors hover:bg-paper"
              aria-label="Toggle favorite"
            >
              <Heart size={16} className={isFavorite ? "fill-seal text-seal-dark" : "text-ink/60"} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(room);
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-colors ${
              isComparing ? "bg-teal text-paper" : "bg-paper/90 text-ink/60 hover:bg-paper"
            }`}
            aria-label="Toggle compare"
            title="Add to compare"
          >
            <Scale size={15} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-paper">
          {room.roomType}
        </div>
      </div>

      <Link to={`/rooms/${room._id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-ink leading-snug line-clamp-2">
            {room.title}
          </h3>
        </div>

        <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-ink/60">
          <MapPin size={12} />
          {room.area}, {room.city}
        </p>

        <div className="mt-3 flex items-center gap-3 text-slate-ink/50">
          {room.amenities?.wifi && <Wifi size={14} />}
          {room.amenities?.ac && <Snowflake size={14} />}
          {room.ratingCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-ink/70">
              <Star size={13} className="fill-seal text-seal" />
              {room.ratingAverage} ({room.ratingCount})
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between border-t border-ink/8 pt-3">
          <div>
            <span className="font-mono text-lg font-semibold text-ink">₹{room.rent?.toLocaleString("en-IN")}</span>
            <span className="text-xs text-slate-ink/50">/month</span>
          </div>
          <span className="text-xs font-medium text-teal">{room.occupancy}</span>
        </div>
      </Link>
    </div>
  );
}
