import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  ShieldCheck,
  Wifi,
  Snowflake,
  Bath,
  UtensilsCrossed,
  Heart,
  MessageCircle,
  Phone,
  CalendarClock,
  GraduationCap,
  Footprints,
  Bike,
  Train,
  CheckCircle2,
  Clock,
  BookOpen,
  Zap,
  Droplet,
  Camera,
  Share2,
  Scale,
  Sparkles,
} from "lucide-react";
import { roomApi, favoriteApi, reviewApi, bookingApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useCompare } from "../context/CompareContext";
import { Spinner } from "../components/ui/Primitives";
import RentInsight from "../components/room/RentInsight";
import { recordView } from "../utils/recentlyViewed";
import SEO from "../components/SEO";
import toast from "react-hot-toast";

const AMENITY_META = {
  wifi: { label: "High-Speed Wi-Fi", icon: Wifi, desc: "100+ Mbps fiber connection for study & classes" },
  ac: { label: "Air Conditioning", icon: Snowflake, desc: "Fitted split/window AC in room" },
  attachedBathroom: { label: "Attached Washroom", icon: Bath, desc: "Private clean bathroom with western seat" },
  geyser: { label: "Hot Water Geyser", icon: Zap, desc: "24x7 hot water for winters" },
  studyTable: { label: "Study Desk & Chair", icon: BookOpen, desc: "Ergonomic study station with table lamp" },
  powerBackup: { label: "Power Backup", icon: Zap, desc: "Inverter / Generator for uninterrupted light & fans" },
  laundry: { label: "Washing Machine", icon: Sparkles, desc: "Automated laundry machine on premise" },
  roWater: { label: "RO Drinking Water", icon: Droplet, desc: "UV+RO purified drinking water dispenser on every floor" },
  cctv: { label: "24x7 CCTV & Security", icon: ShieldCheck, desc: "Security guard on duty & biometric logs" },
  kitchen: { label: "Student Kitchen Access", icon: UtensilsCrossed, desc: "Induction/gas stove available for snacks" },
  housekeeping: { label: "Daily Room Cleaning", icon: Sparkles, desc: "Daily floor mopping and dustbin clearing" },
};

export default function RoomDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleCompare, items } = useCompare();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visitDate, setVisitDate] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    overallRating: 5,
    ratings: { cleanliness: 5, safety: 5, ownerBehaviour: 5, internet: 5, waterSupply: 5, electricity: 5 },
    comment: "",
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([roomApi.get(id), reviewApi.forRoom(id)])
      .then(([roomRes, reviewRes]) => {
        setRoom(roomRes.data.room);
        setReviews(reviewRes.data.reviews || []);
        recordView(roomRes.data.room);
      })
      .catch(() => toast.error("Couldn't load this property."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user && id) {
      favoriteApi
        .list()
        .then((res) => {
          setIsFavorite(res.data.favorites.some((r) => r._id === id));
        })
        .catch(() => {});
    }
  }, [user, id]);

  async function toggleFavorite() {
    if (!user) return toast.error("Please log in to save favorites.");
    try {
      if (isFavorite) {
        await favoriteApi.remove(id);
        setIsFavorite(false);
        toast.success("Removed from saved list");
      } else {
        await favoriteApi.add(id);
        setIsFavorite(true);
        toast.success("Saved to your favorites!");
      }
    } catch {
      toast.error("Could not update favorites.");
    }
  }

  async function scheduleVisit(e) {
    e.preventDefault();
    if (!user) return toast.error("Please log in to schedule a free visit.");
    if (!visitDate) return toast.error("Please select a date and time.");
    try {
      await bookingApi.create({ roomId: id, type: "visit", visitScheduledFor: visitDate });
      toast.success("Visit scheduled! The owner has been notified via WhatsApp.");
      setVisitDate("");
    } catch {
      toast.error("Could not schedule the visit.");
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!user) return toast.error("Log in to submit a review.");
    try {
      const res = await reviewApi.create({ roomId: id, ...newReview });
      toast.success("Thank you! Your peer review was published.");
      setReviews([res.data.review, ...reviews]);
      setShowReviewModal(false);
    } catch {
      toast.error("Failed to post review.");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-36 bg-slate-50 min-h-screen">
        <Spinner className="h-8 w-8 text-teal" />
        <p className="mt-3 text-xs font-medium text-slate-500">Loading campus accommodation...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container-page py-24 text-center">
        <h2 className="font-display text-xl font-bold text-slate-900">Accommodation not found</h2>
        <p className="text-xs text-slate-500 mt-1">This listing may have been rented or removed.</p>
        <Link to="/search" className="btn-primary mt-5 text-xs inline-flex">
          Back to Campus Search
        </Link>
      </div>
    );
  }

  const collegeDisplay = room.campus || room.nearbyCollege;
  const distanceKm = room.distanceToCampusKm ?? 0.5;
  const walkMins = room.walkingTimeMinutes || Math.round(distanceKm * 12);
  const cycleMins = room.cyclingTimeMinutes || Math.round(distanceKm * 4);
  const isComparing = items.some((r) => r._id === room._id);

  const whatsappPhone = room.whatsappNumber || room.contactPhone || room.owner?.phone;
  const whatsappMsg = encodeURIComponent(
    `Hi, I found "${room.title}" on RoomNest near ${collegeDisplay || "campus"}. I am a student interested in renting. Is a bed/room currently available for a visit?`
  );
  const whatsappUrl = whatsappPhone ? `https://wa.me/91${whatsappPhone.replace(/\D/g, "")}?text=${whatsappMsg}` : null;

  return (
    <div className="bg-slate-50/60 min-h-screen pb-16">
      <SEO
        title={`${room.title} | Verified Student Accommodation`}
        description={`${room.roomType} near ${collegeDisplay || room.city} • ₹${room.rent}/mo • Zero Brokerage • Verified by RoomNest`}
        image={room.images?.[0]}
      />

      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="container-page py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <Link to="/search" className="hover:text-teal">Campus Search</Link>
            <span>/</span>
            {collegeDisplay && (
              <>
                <Link to={`/search?campus=${encodeURIComponent(collegeDisplay)}`} className="hover:text-teal truncate">
                  {collegeDisplay}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-slate-800 font-medium truncate">{room.title}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleCompare(room)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                isComparing ? "bg-teal text-white border-teal" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Scale size={13} />
              {isComparing ? "Comparing" : "Compare"}
            </button>
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                isFavorite ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Heart size={13} className={isFavorite ? "fill-rose-500" : ""} />
              {isFavorite ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="container-page py-6 sm:py-8">
        {/* Gallery */}
        {/* Photo Gallery: Exterior + 4-5 Interior Real Views */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-8 shadow-sm">
          {(() => {
            const photoLabels = [
              "🏢 1. Front Exterior Look",
              "🛏️ 2. Student Bedroom",
              "📚 3. Study Desk & Workspace",
              "🚿 4. Attached Washroom",
              "🍽️ 5. Student Mess & Dining",
            ];
            return (
              <div>
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Real Verified Photo Tour
                    </span>
                    <span className="text-xs text-slate-500">
                      • {room.images?.length || 0} Inspected Photos (Building Exterior + Interior)
                    </span>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {photoLabels[activeImg] || `Photo ${activeImg + 1}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[2.8fr_1.2fr] gap-3">
                  {/* Primary Highlighted Image */}
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                    <img
                      src={room.images?.[activeImg] || room.images?.[0]}
                      alt={room.title}
                      className="h-full w-full object-cover transition-all duration-300"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow">
                        {photoLabels[activeImg] || `Photo ${activeImg + 1}`}
                      </span>
                      {room.isVerified && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/95 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow">
                          <ShieldCheck size={14} className="stroke-[2.5]" />
                          Campus Verified
                        </span>
                      )}
                      {room.foodIncluded && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/95 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white shadow">
                          <UtensilsCrossed size={13} />
                          3 Meals Mess Included
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 5-Photo Thumbnails with Exact Captions */}
                  <div className="grid grid-cols-5 lg:grid-cols-1 gap-2 h-full content-between">
                    {room.images?.slice(0, 5).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImg(idx)}
                        className={`group relative flex items-center gap-2.5 rounded-lg overflow-hidden border-2 transition-all p-1 text-left ${
                          activeImg === idx
                            ? "border-teal bg-teal/5 ring-1 ring-teal/30"
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        <div className="h-12 w-16 shrink-0 rounded overflow-hidden bg-slate-200">
                          <img src={img} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="hidden lg:block truncate">
                          <div className="text-[11px] font-bold text-slate-800 truncate">
                            {photoLabels[idx] || `Photo ${idx + 1}`}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {idx === 0 ? "Building Front View" : "Verified Interior"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Main 2-Column Content Layout */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Left Column: Details, Commute, Amenities, Rules, Reviews */}
          <div className="space-y-6">
            {/* Campus Commute & Location Banner */}
            {collegeDisplay && (
              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-teal">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Campus Proximity
                      </h3>
                      <p className="text-sm font-bold text-slate-900">{collegeDisplay}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-teal bg-blue-50 px-2.5 py-1 rounded-md">
                    {distanceKm} km to Gate
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Footprints size={18} className="mx-auto text-emerald-600 mb-1" />
                    <div className="text-xs font-bold text-slate-900">{walkMins} mins</div>
                    <div className="text-[10px] text-slate-500">Walking time</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Bike size={18} className="mx-auto text-teal mb-1" />
                    <div className="text-xs font-bold text-slate-900">{cycleMins} mins</div>
                    <div className="text-[10px] text-slate-500">Bicycle time</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Train size={18} className="mx-auto text-blue-600 mb-1" />
                    <div className="text-xs font-bold text-slate-900">
                      {room.nearbyMetroStation ? "Near Metro" : "Auto / Bus"}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {room.nearbyMetroStation || "Direct transit"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Room Header & Tags */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                  {room.sharingType || room.roomType}
                </span>
                <span className="rounded-md bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">
                  {room.occupancy} PG
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {room.furnishing}
                </span>
                {room.availableBeds > 0 && (
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {room.availableBeds} Vacant Beds Left
                  </span>
                )}
                {room.rentAgreementAvailable !== false && (
                  <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-teal">
                    ✓ Formal Rent Agreement Provided
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {room.title}
              </h1>

              <p className="flex items-center gap-1.5 text-xs text-slate-600">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span>{room.address}</span>
              </p>

              {room.description && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    About this accommodation
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {room.description}
                  </p>
                </div>
              )}
            </div>

            {/* Student Facilities & Amenities */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-display text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Facilities & Student Amenities</span>
                <span className="text-xs font-normal text-slate-400">All included in rent</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {Object.entries(room.amenities || {})
                  .filter(([, val]) => val)
                  .map(([key]) => {
                    const meta = AMENITY_META[key];
                    const Icon = meta?.icon || CheckCircle2;
                    return (
                      <div
                        key={key}
                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {meta?.label || key}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            {meta?.desc || "Available for student residents"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* House Rules & Curfew */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-display text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-slate-700" />
                Gate Timings & PG Rules
              </h3>

              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-500">Curfew / Gate Closing</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {room.curfewTime || "No Curfew"}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-500">Notice Period</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {room.noticePeriod || "1 Month"}
                  </p>
                </div>
              </div>

              {room.rules?.length > 0 && (
                <ul className="space-y-2 text-xs text-slate-600">
                  {room.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Student Peer Reviews */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Student Peer Reviews</span>
                    {room.ratingCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        {room.ratingAverage?.toFixed(1)} / 5.0
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified feedback from students who lived here
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn-secondary text-xs !py-1.5 !px-3"
                >
                  Write Review
                </button>
              </div>

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No student reviews yet. Be the first to visit and share feedback!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">
                            {rev.user?.name?.[0]?.toUpperCase() || "S"}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              {rev.user?.name || "Student"}
                            </span>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded ml-2 font-medium">
                              ✓ Verified Resident
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-800">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {rev.overallRating}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Pricing & Direct Connect Sidebar */}
          <div className="lg:sticky lg:top-20 space-y-5">
            {/* Transparent Rent Breakdown Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-slate-900">
                    ₹{room.rent?.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-500 font-normal"> / month</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Zero Brokerage
                </span>
              </div>

              {/* Real Cost Table */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Security Deposit</span>
                  <span className="font-semibold text-slate-900">
                    ₹{room.deposit?.toLocaleString("en-IN") || "0"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Mess / Food</span>
                  <span className="font-semibold text-slate-900">
                    {room.foodIncluded ? "Included (3 Meals)" : "Self / Optional"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Electricity</span>
                  <span className="font-semibold text-slate-900">
                    {room.electricityCharge || "Included"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Maintenance / Wi-Fi</span>
                  <span className="font-semibold text-emerald-700">₹0 (Free)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Rent Agreement</span>
                  <span className="font-semibold text-slate-900">
                    {room.rentAgreementAvailable !== false ? "✓ Provided by Owner" : "On Request"}
                  </span>
                </div>
              </div>

              {/* Schedule Visit Form */}
              <form onSubmit={scheduleVisit} className="mt-5 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Schedule Free Campus Visit
                </label>
                <input
                  type="datetime-local"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="input-field text-xs !py-2 mb-2.5"
                />
                <button type="submit" className="btn-primary w-full text-xs !py-2.5">
                  <CalendarClock size={15} />
                  Book Visit Slot
                </button>
              </form>

              {/* Direct Owner Connect Options */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 shadow-sm transition-all"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>
                ) : (
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
                    className="btn-secondary text-xs !py-2.5"
                  >
                    <MessageCircle size={15} />
                    In-app Chat
                  </button>
                )}

                {(room.contactPhone || room.owner?.phone) ? (
                  <a
                    href={`tel:${room.contactPhone || room.owner.phone}`}
                    className="btn-secondary text-xs !py-2.5"
                  >
                    <Phone size={15} />
                    Call Owner
                  </a>
                ) : (
                  <button disabled className="btn-secondary text-xs !py-2.5 opacity-50">
                    <Phone size={15} />
                    Call Owner
                  </button>
                )}
              </div>
            </div>

            {/* Owner Profile Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Property Verified Owner
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm">
                  {(room.contactPerson || room.owner?.name)?.[0]?.toUpperCase() || "O"}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {room.contactPerson || room.owner?.name || "Verified Landlord"}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                    <ShieldCheck size={13} />
                    Aadhaar & Campus Verified
                  </div>
                  {room.callingHours && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Calling hours: {room.callingHours}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Rent Comparison Widget */}
            <RentInsight roomId={id} />
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="font-display text-base font-bold text-slate-900 mb-3">
              Write a Student Peer Review
            </h3>
            <form onSubmit={submitReview} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Overall Rating</label>
                <select
                  value={newReview.overallRating}
                  onChange={(e) =>
                    setNewReview({ ...newReview, overallRating: Number(e.target.value) })
                  }
                  className="input-field text-xs"
                >
                  <option value="5">5 ★ — Excellent (Safe, clean & close to campus)</option>
                  <option value="4">4 ★ — Very Good</option>
                  <option value="3">3 ★ — Average</option>
                  <option value="2">2 ★ — Below Average</option>
                  <option value="1">1 ★ — Not Recommended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Feedback on food, warden, Wi-Fi & curfew
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details that will help fellow college students decide..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
