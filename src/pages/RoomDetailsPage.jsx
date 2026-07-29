import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin, Star, ShieldCheck, Wifi, Snowflake, Bath, UtensilsCrossed,
  Car, PawPrint, Heart, MessageCircle, Phone, CalendarClock,
} from "lucide-react";
import { roomApi, favoriteApi, reviewApi, bookingApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ui/Primitives";
import RentInsight from "../components/room/RentInsight";
import { recordView } from "../utils/recentlyViewed";
import SEO from "../components/SEO";
import toast from "react-hot-toast";

const AMENITY_ICONS = {
  wifi: { icon: Wifi, label: "WiFi" },
  ac: { icon: Snowflake, label: "AC" },
  attachedBathroom: { icon: Bath, label: "Attached Bathroom" },
  kitchen: { icon: UtensilsCrossed, label: "Kitchen" },
  parking: { icon: Car, label: "Parking" },
  petFriendly: { icon: PawPrint, label: "Pet Friendly" },
};

export default function RoomDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visitDate, setVisitDate] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([roomApi.get(id), reviewApi.forRoom(id)])
      .then(([roomRes, reviewRes]) => {
        setRoom(roomRes.data.room);
        setReviews(reviewRes.data.reviews);
        recordView(roomRes.data.room);
      })
      .catch(() => toast.error("Couldn't load this listing."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      favoriteApi.list().then((res) => {
        setIsFavorite(res.data.favorites.some((r) => r._id === id));
      });
    }
  }, [user, id]);

  async function toggleFavorite() {
    if (!user) return toast.error("Log in to save favorites.");
    try {
      if (isFavorite) {
        await favoriteApi.remove(id);
        setIsFavorite(false);
      } else {
        await favoriteApi.add(id);
        setIsFavorite(true);
        toast.success("Saved to favorites");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  }

  async function scheduleVisit() {
    if (!user) return toast.error("Log in to schedule a visit.");
    if (!visitDate) return toast.error("Pick a date and time first.");
    try {
      await bookingApi.create({ roomId: id, type: "visit", visitScheduledFor: visitDate });
      toast.success("Visit requested — the owner will confirm shortly.");
    } catch {
      toast.error("Couldn't schedule the visit.");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container-page py-24 text-center">
        <p className="font-display text-xl text-ink">This listing isn't available anymore.</p>
        <Link to="/search" className="btn-primary mt-6 inline-flex">Back to search</Link>
      </div>
    );
  }

  const activeAmenities = Object.entries(room.amenities || {}).filter(([, v]) => v);

  return (
    <div className="container-page py-8">
      <SEO
        title={room.title}
        description={`${room.roomType} in ${room.area}, ${room.city} — ₹${room.rent.toLocaleString("en-IN")}/month. ${room.isVerified ? "Verified listing." : ""}`}
        image={room.images?.[0]}
      />
      {/* Breadcrumb */}
      <p className="text-xs text-slate-ink/50 mb-4">
        <Link to="/search" className="hover:text-ink">Search</Link> / {room.city} / {room.area}
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div>
          {/* Gallery */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-ink-700">
            <img src={room.images[activeImg]} alt={room.title} className="h-full w-full object-cover" />
            {room.isVerified && (
              <div className="stamp absolute top-4 left-4 h-16 w-16 -rotate-12 bg-paper/95 text-[10px] font-bold shadow-lg animate-stamp">
                <span className="leading-tight text-center">VERI<br />FIED</span>
              </div>
            )}
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 shadow-sm"
            >
              <Heart size={18} className={isFavorite ? "fill-seal text-seal-dark" : "text-ink/70"} />
            </button>
          </div>
          {room.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {room.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-20 shrink-0 rounded-lg overflow-hidden border-2 ${
                    activeImg === i ? "border-teal" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title & meta */}
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ink/8 px-3 py-1 text-xs font-semibold text-ink">{room.roomType}</span>
              <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">{room.occupancy}</span>
              <span className="rounded-full bg-ink/8 px-3 py-1 text-xs font-semibold text-ink">{room.furnishing}</span>
            </div>
            <h1 className="mt-4 font-display text-2xl sm:text-3xl font-semibold text-ink">{room.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-ink/60">
              <MapPin size={15} />
              {room.address}
            </p>
            {room.ratingCount > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                <Star size={15} className="fill-seal text-seal" />
                {room.ratingAverage} · {room.ratingCount} reviews
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mt-8 border-t border-ink/8 pt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-3">About this room</h2>
            <p className="text-sm text-slate-ink/70 leading-relaxed">{room.description}</p>
          </div>

          {/* Amenities */}
          <div className="mt-8 border-t border-ink/8 pt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {activeAmenities.map(([key]) => {
                const meta = AMENITY_ICONS[key];
                if (!meta) return null;
                return (
                  <div key={key} className="flex items-center gap-2.5 text-sm text-ink/80">
                    <meta.icon size={17} className="text-teal" />
                    {meta.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nearby */}
          <div className="mt-8 border-t border-ink/8 pt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Nearby</h2>
            <ul className="space-y-2 text-sm text-slate-ink/70">
              {room.nearbyCollege && <li>🎓 {room.nearbyCollege}</li>}
              {room.nearbyCompanyHub && <li>🏢 {room.nearbyCompanyHub}</li>}
              {room.nearbyMetroStation && <li>🚇 {room.nearbyMetroStation}</li>}
              {room.nearbyRailwayStation && <li>🚆 {room.nearbyRailwayStation}</li>}
              {room.landmark && <li>📍 {room.landmark}</li>}
            </ul>
          </div>

          {/* Rules */}
          {room.rules?.length > 0 && (
            <div className="mt-8 border-t border-ink/8 pt-8">
              <h2 className="font-display text-lg font-semibold text-ink mb-4">House rules</h2>
              <ul className="space-y-1.5 text-sm text-slate-ink/70 list-disc list-inside">
                {room.rules.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8 border-t border-ink/8 pt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-ink/60">No reviews yet — be the first to visit and share feedback.</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((r) => (
                  <div key={r._id} className="border-b border-ink/8 pb-5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper text-xs font-semibold">
                        {r.user?.name?.[0]?.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-ink">{r.user?.name}</span>
                      <span className="flex items-center gap-1 text-xs text-seal-dark ml-auto">
                        <Star size={12} className="fill-seal text-seal" /> {r.overallRating}
                      </span>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-slate-ink/70">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky booking sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-5">
          <div className="card p-5">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-semibold text-ink">₹{room.rent.toLocaleString("en-IN")}</span>
              <span className="text-sm text-slate-ink/50">/month</span>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-ink/60">Security deposit</dt>
                <dd className="font-medium text-ink">₹{room.deposit.toLocaleString("en-IN")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-ink/60">Maintenance</dt>
                <dd className="font-medium text-ink">₹{room.maintenanceCharge.toLocaleString("en-IN")}/mo</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-ink/60">Electricity</dt>
                <dd className="font-medium text-ink">{room.electricityCharge}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-ink/60">Water</dt>
                <dd className="font-medium text-ink">{room.waterCharge}</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-ink/8 pt-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-ink/50">
                Schedule a visit
              </label>
              <input
                type="datetime-local"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="input-field mt-2"
              />
              <button onClick={scheduleVisit} className="btn-primary w-full mt-3">
                <CalendarClock size={16} />
                Request visit
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (!user) return toast.error("Log in to chat with the owner.");
                  navigate("/chat", {
                    state: {
                      ownerId: room.owner?._id,
                      ownerName: room.owner?.name,
                      roomId: room._id,
                      roomTitle: room.title,
                    },
                  });
                }}
                className="btn-secondary !py-2.5"
              >
                <MessageCircle size={15} />
                Chat
              </button>
              {room.owner?.phone ? (
                <a href={`tel:${room.owner.phone}`} className="btn-secondary !py-2.5">
                  <Phone size={15} />
                  Call
                </a>
              ) : (
                <button className="btn-secondary !py-2.5" disabled>
                  <Phone size={15} />
                  Call
                </button>
              )}
            </div>
          </div>

          <RentInsight roomId={id} />

          <div className="card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-ink/50 mb-3">Listed by</h3>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper font-semibold">
                {room.owner?.name?.[0]?.toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{room.owner?.name}</p>
                {room.owner?.ownerVerification?.status === "verified" && (
                  <p className="flex items-center gap-1 text-xs text-teal font-medium mt-0.5">
                    <ShieldCheck size={13} /> Verified owner
                  </p>
                )}
                {room.owner?.phone && (
                  <a
                    href={`tel:${room.owner.phone}`}
                    className="flex items-center gap-1 text-xs text-slate-ink/60 hover:text-ink mt-1"
                  >
                    <Phone size={12} />
                    {room.owner.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
