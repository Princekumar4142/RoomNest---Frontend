import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  Star,
  Wifi,
  ShieldCheck,
  Utensils,
  BookOpen,
  Footprints,
  Phone,
  MessageCircle,
  Scale,
  CheckCircle2,
  ExternalLink,
  Zap,
  Droplet
} from "lucide-react";
import { useCompare } from "../../context/CompareContext";
import { useLanguage } from "../../context/LanguageContext";

export default function RoomCard({ room, isFavorite, onToggleFavorite }) {
  const { items, toggleCompare } = useCompare();
  const { t } = useLanguage();
  const isComparing = items.some((r) => r._id === room._id);

  const collegeDisplay = room.campus || room.nearbyCollege;
  const distanceKm = room.distanceToCampusKm != null ? room.distanceToCampusKm : null;
  const walkMins = room.walkingTimeMinutes || (distanceKm ? Math.round(distanceKm * 12) : null);

  const ownerPhone = room.whatsappNumber || room.contactPhone || room.owner?.phone || "9431201122";
  const ownerName = room.contactPerson || room.owner?.name || "Verified Landlord";
  const whatsappUrl = `https://wa.me/91${ownerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hello ${ownerName}, I found your PG "${room.title}" on RoomNest. I am interested in checking bed vacancy and scheduling an in-person visit. Is it available?`
  )}`;

  return (
    <div className="group flex flex-col overflow-hidden bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* 1. Photo Container with Verification Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link to={`/rooms/${room._id}`} className="block h-full w-full">
          <img
            src={room.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"}
            alt={room.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
            loading="lazy"
          />
        </Link>

        {/* Top Badges (PGdekho Style) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600/95 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            <ShieldCheck size={13} className="stroke-[2.5]" />
            {t("verified_owner_badge")}
          </span>
          {room.foodIncluded && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#FD701E]/95 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              <Utensils size={11} />
              {t("meals_included_badge")}
            </span>
          )}
        </div>

        {/* Top Right Save & Compare Actions */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(room);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm shadow-sm transition-all ${
              isComparing
                ? "bg-blue-600 text-white"
                : "bg-white/90 text-slate-700 hover:bg-white hover:text-blue-600"
            }`}
            aria-label="Add to compare"
            title="Compare PG"
          >
            <Scale size={13} />
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
          <span className="rounded-md bg-slate-900/85 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white flex items-center gap-1">
            <span>🏢</span> Front Exterior
          </span>
          <span className="rounded-md bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-slate-800">
            {room.sharingType || room.roomType}
          </span>
        </div>
      </div>

      {/* 2. Details Container */}
      <div className="flex flex-col flex-1 p-4">
        {/* Live GPS Distance or College Proximity */}
        {room.distanceFromUserKm != null ? (
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="truncate">
                📍 <strong>{room.distanceFromUserKm} km</strong> from your live area
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
              Near You
            </span>
          </div>
        ) : collegeDisplay ? (
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 rounded-lg px-2.5 py-1">
            <Footprints size={13} className="shrink-0 text-blue-600" />
            <span className="truncate">
              {distanceKm != null ? `${distanceKm} km to ` : "Near "}
              <span className="text-slate-900 font-bold">{collegeDisplay}</span>
            </span>
            {walkMins && (
              <span className="shrink-0 text-[11px] text-slate-500 font-normal">
                ({walkMins}m walk)
              </span>
            )}
          </div>
        ) : null}

        {/* Title */}
        <Link to={`/rooms/${room._id}`} className="block group/link">
          <h3 className="font-display text-[15px] font-bold text-slate-900 line-clamp-1 group-hover/link:text-[#FD701E] transition-colors">
            {room.title}
          </h3>
        </Link>

        {/* Location */}
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 truncate">
          <MapPin size={12} className="shrink-0 text-slate-400" />
          <span className="truncate">
            {room.area}, {room.city} {room.landmark ? `• ${room.landmark}` : ""}
          </span>
        </p>

        {/* Amenities chips */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
          {room.amenities?.wifi && (
            <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              {t("wifi_label")} 50Mbps
            </span>
          )}
          {room.amenities?.attachedBathroom && (
            <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              Attached Bath
            </span>
          )}
          {room.amenities?.roWater && (
            <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              RO Water
            </span>
          )}
          {room.amenities?.studyTable && (
            <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              {t("study_desk")}
            </span>
          )}
        </div>

        {/* Verified Owner Card Row */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 truncate">
            <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
            <span className="truncate">Host: <strong className="text-slate-800">{ownerName.split(" ")[0]}</strong> (KYC ✓)</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
            {t("zero_brokerage_badge")}
          </span>
        </div>

        {/* Pricing & Direct WhatsApp Actions */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-lg font-extrabold text-slate-900">
                ₹{room.rent?.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-500">{t("per_mo")}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 block">
              {room.occupancy} Accommodation
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Direct WhatsApp Owner Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              title="Chat with Landlord on WhatsApp"
            >
              <MessageCircle size={15} />
            </a>

            {/* Direct Call Button */}
            <a
              href={`tel:${ownerPhone}`}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
              title="Call Owner"
            >
              <Phone size={14} />
            </a>

            {/* View Details */}
            <Link
              to={`/rooms/${room._id}`}
              className="btn-brand !py-1.5 !px-3 text-xs font-bold whitespace-nowrap"
            >
              {t("view_details")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
