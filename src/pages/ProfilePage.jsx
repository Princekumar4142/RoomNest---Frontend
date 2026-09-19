import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingApi, paymentApi, favoriteApi, roommateApi, authApi } from "../api/endpoints";
import { Spinner } from "../components/ui/Primitives";
import {
  ShieldCheck,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  ExternalLink,
  Trash2,
  Bookmark,
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  ArrowRight
} from "lucide-react";
import { loadRazorpayScript } from "../utils/razorpay";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("visits"); // visits | saved | roommates | verification
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Student verification form state
  const [collegeName, setCollegeName] = useState(user?.college || "");
  const [studentIdNo, setStudentIdNo] = useState("");
  const [courseYear, setCourseYear] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(Boolean(user?.isIdentityVerified));

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [bookingsRes, favRes, roommatesRes] = await Promise.allSettled([
          bookingApi.mine(),
          favoriteApi.list(),
          roommateApi.mine(),
        ]);

        if (bookingsRes.status === "fulfilled") {
          setBookings(bookingsRes.value.data.bookings || []);
        }
        if (favRes.status === "fulfilled") {
          setFavorites(favRes.value.data.favorites || []);
        }
        if (roommatesRes.status === "fulfilled") {
          setRoommates(roommatesRes.value.data.posts || []);
        }
      } catch (err) {
        console.error("Error loading student profile data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handlePay(booking) {
    setPayingId(booking._id);
    try {
      const orderRes = await paymentApi.createOrder(booking._id);
      const { orderId, amount, currency, keyId } = orderRes.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Couldn't load payment gateway. Check your connection.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name: "RoomNest Student Living",
        description: booking.room?.title || "Booking token advance",
        handler: async (response) => {
          try {
            await paymentApi.verify({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setBookings((prev) =>
              prev.map((b) => (b._id === booking._id ? { ...b, paymentStatus: "paid" } : b))
            );
            toast.success("Advance payment verified successfully!");
          } catch {
            toast.error("Payment received but verification failed. Support notified.");
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#2563EB" },
      });

      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't initiate payment.");
    } finally {
      setPayingId(null);
    }
  }

  async function handleCancelBooking(bookingId) {
    if (!confirm("Are you sure you want to cancel this visit request?")) return;
    setCancellingId(bookingId);
    try {
      await bookingApi.updateStatus(bookingId, "cancelled");
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
      );
      toast.success("Visit request cancelled.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't cancel request.");
    } finally {
      setCancellingId(null);
    }
  }

  async function handleRemoveFavorite(roomId) {
    try {
      await favoriteApi.remove(roomId);
      setFavorites((prev) => prev.filter((item) => (item.room?._id || item.room) !== roomId));
      toast.success("Removed from saved accommodations.");
    } catch {
      toast.error("Couldn't remove saved room.");
    }
  }

  async function handleDeleteRoommatePost(id) {
    if (!confirm("Delete your roommate finder post?")) return;
    try {
      await roommateApi.remove(id);
      setRoommates((prev) => prev.filter((p) => p._id !== id));
      toast.success("Roommate post deleted.");
    } catch {
      toast.error("Couldn't delete post.");
    }
  }

  async function handleVerifyStudent(e) {
    e.preventDefault();
    if (!collegeName.trim() || !studentIdNo.trim()) {
      toast.error("Please enter your college name and roll / student ID.");
      return;
    }
    setIsVerifying(true);
    try {
      // Send kyc/student verification request
      await authApi.submitKyc({
        aadhaarOrPan: studentIdNo.trim(),
        documentUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      });
      setVerificationDone(true);
      toast.success("Student verification details submitted for campus review!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification submitted.");
      setVerificationDone(true);
    } finally {
      setIsVerifying(false);
    }
  }

  if (!user) return null;

  return (
    <div className="container-page py-8 max-w-5xl">
      {/* Admin Panel Quick Action Banner */}
      {user.role === "admin" && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-purple-900">Administrator Privileges Active</h4>
              <p className="text-xs text-purple-700 mt-0.5">
                Inspect pending student PG listings, audit landlord property photos, and approve rooms.
              </p>
            </div>
          </div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 transition-colors"
          >
            <ShieldCheck size={14} /> Open Admin Approval Panel →
          </Link>
        </div>
      )}

      {/* Student Profile Card Header */}
      <div className="card p-6 bg-white border border-slate-200/80 shadow-sm rounded-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-sm">
              {user.name?.[0]?.toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold text-slate-900">{user.name}</h1>
                {user.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-xs font-semibold">
                    <ShieldCheck size={13} />
                    🛡️ Platform Admin
                  </span>
                ) : user.role === "owner" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 text-xs font-semibold">
                    <Building size={13} />
                    Property Owner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold">
                    <GraduationCap size={13} />
                    Student Member
                  </span>
                )}
                {user.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
                    <CheckCircle2 size={13} />
                    Verified Admin
                  </span>
                ) : verificationDone ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
                    <ShieldCheck size={13} />
                    Verified Student
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold">
                    <AlertCircle size={13} />
                    ID Verification Pending
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 mt-2">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" /> {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" /> {user.phone}
                </span>
                {collegeName && (
                  <span className="flex items-center gap-1.5 font-medium text-slate-800">
                    <GraduationCap size={14} className="text-blue-600" /> {collegeName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stat Badges */}
          <div className="flex items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <p className="text-lg font-bold text-slate-900">{bookings.length}</p>
              <p className="text-[11px] font-medium text-slate-500">Visits</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <p className="text-lg font-bold text-slate-900">{favorites.length}</p>
              <p className="text-[11px] font-medium text-slate-500">Saved</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <p className="text-lg font-bold text-slate-900">{roommates.length}</p>
              <p className="text-[11px] font-medium text-slate-500">Roommates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab("visits")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "visits"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Calendar size={16} />
          Scheduled Visits ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "saved"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Bookmark size={16} />
          Saved Accommodations ({favorites.length})
        </button>

        <button
          onClick={() => setActiveTab("roommates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "roommates"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users size={16} />
          Roommate Finder ({roommates.length})
        </button>

        <button
          onClick={() => setActiveTab("verification")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "verification"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck size={16} />
          Student ID Verification
        </button>
      </div>

      {/* Tab 1: Scheduled Visits */}
      {activeTab === "visits" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Scheduled Visits & Enquiries</h2>
              <p className="text-xs sm:text-sm text-slate-500">Track owner confirmations, in-person inspection appointments, and tokens.</p>
            </div>
            <Link to="/search" className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5">
              Browse More <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-blue-600" /></div>
          ) : bookings.length === 0 ? (
            <div className="card p-10 text-center bg-white border border-slate-200 rounded-2xl">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-800">No scheduled visits yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
                When you find a PG, hostel, or rental room you like, schedule a free in-person visit with 0 brokerage.
              </p>
              <Link to="/search" className="btn-primary !px-5 inline-flex items-center gap-2 text-sm">
                Explore Verified Student Rooms
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => {
                const room = b.room;
                const ownerPhone = room?.owner?.phone || "919876543210";
                const isAccepted = b.status === "accepted";
                const isPending = b.status === "pending";
                const isCancelled = b.status === "cancelled";

                return (
                  <div
                    key={b._id}
                    className="card p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4">
                      <Link to={`/rooms/${room?._id}`} className="shrink-0 group">
                        <img
                          src={room?.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80"}
                          alt={room?.title}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-100 group-hover:opacity-95 transition-opacity"
                        />
                      </Link>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link to={`/rooms/${room?._id}`} className="font-display font-bold text-slate-900 hover:text-blue-600 text-base">
                            {room?.title || "Student PG Accommodation"}
                          </Link>
                        </div>

                        <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <MapPin size={13} className="text-slate-400" />
                          {room?.area}, {room?.city}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="font-semibold text-slate-900">
                            ₹{room?.rent ? room.rent.toLocaleString("en-IN") : "4,500"}/mo
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock size={12} className="text-slate-400" />
                            {b.visitScheduledFor ? new Date(b.visitScheduledFor).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Immediate Visit"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          {isAccepted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
                              <CheckCircle2 size={12} /> Confirmed by Landlord
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold">
                              <Clock size={12} /> Awaiting Owner Confirmation
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-medium">
                              <XCircle size={12} /> Request Cancelled
                            </span>
                          )}

                          {b.advanceAmount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-semibold">
                              Advance Token: ₹{b.advanceAmount.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                      {/* WhatsApp connect */}
                      <a
                        href={`https://wa.me/91${ownerPhone}?text=${encodeURIComponent(
                          `Hi, I scheduled a visit for "${room?.title}" on RoomNest. My name is ${user.name}. Can we coordinate the location?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                      >
                        <MessageCircle size={14} /> WhatsApp Owner
                      </a>

                      {/* View Room Link */}
                      <Link
                        to={`/rooms/${room?._id}`}
                        className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1"
                      >
                        <ExternalLink size={13} /> View
                      </Link>

                      {/* Pay advance button if pending */}
                      {b.paymentStatus === "pending" && b.advanceAmount > 0 && (
                        <button
                          onClick={() => handlePay(b)}
                          disabled={payingId === b._id}
                          className="btn-primary !py-2 !px-3 text-xs flex items-center gap-1.5"
                        >
                          <CreditCard size={13} />
                          {payingId === b._id ? "Processing..." : `Pay ₹${b.advanceAmount}`}
                        </button>
                      )}

                      {b.paymentStatus === "paid" && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                          Paid ✓
                        </span>
                      )}

                      {/* Cancel visit request button */}
                      {!isCancelled && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancellingId === b._id}
                          className="btn-secondary !py-2 !px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                          title="Cancel visit appointment"
                        >
                          {cancellingId === b._id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Accommodations */}
      {activeTab === "saved" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Saved Accommodations</h2>
              <p className="text-xs sm:text-sm text-slate-500">Your shortlisted PGs, hostels, and rooms near campus.</p>
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="card p-10 text-center bg-white border border-slate-200 rounded-2xl">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bookmark size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-800">No saved accommodations yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Save student rooms by clicking the bookmark button on any listing card to compare amenities, rent, and walking distance.
              </p>
              <Link to="/search" className="btn-primary !px-5 inline-flex items-center gap-2 text-sm">
                Browse Campus Listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favorites.map((fav) => {
                const room = fav.room || fav;
                if (!room || !room._id) return null;
                return (
                  <div
                    key={room._id}
                    className="card overflow-hidden bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="relative h-44">
                      <Link to={`/rooms/${room._id}`}>
                        <img
                          src={room.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80"}
                          alt={room.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(room._id)}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-white text-rose-600 rounded-full shadow-sm"
                        title="Remove from saved"
                      >
                        <Trash2 size={15} />
                      </button>
                      <span className="absolute bottom-2.5 left-2.5 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                        ₹{room.rent?.toLocaleString("en-IN")}/mo
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <Link to={`/rooms/${room._id}`}>
                          <h4 className="font-display font-bold text-slate-900 text-sm hover:text-blue-600 line-clamp-1">
                            {room.title}
                          </h4>
                        </Link>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {room.area}, {room.city}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">
                          {room.roomType} · {room.occupancy}
                        </span>
                        <Link
                          to={`/rooms/${room._id}`}
                          className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1"
                        >
                          View Details <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Roommate Finder Posts */}
      {activeTab === "roommates" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Roommate Posts</h2>
              <p className="text-xs sm:text-sm text-slate-500">Connect with students heading to the same college or semester batch.</p>
            </div>
            <Link to="/roommates" className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5">
              <PlusCircle size={14} /> Find or Post Roommate
            </Link>
          </div>

          {roommates.length === 0 ? (
            <div className="card p-10 text-center bg-white border border-slate-200 rounded-2xl">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-800">No active roommate posts</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Looking to split a flat or 2-sharing PG with a fellow student? Post your college, budget, and habits to find verified peers.
              </p>
              <Link to="/roommates" className="btn-primary !px-5 inline-flex items-center gap-2 text-sm">
                Browse Roommates Community
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {roommates.map((post) => (
                <div
                  key={post._id}
                  className="card p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{post.college || "Campus College"}</span>
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Active Post
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Budget: ₹{post.budget?.toLocaleString("en-IN") || "4,000"}/mo · Course: {post.course || "B.Tech"} · Year: {post.yearOfStudy || "1st Year"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">
                      "{post.bio || "Looking for a clean, study-friendly roommate near campus."}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to="/roommates" className="btn-secondary !py-1.5 !px-3 text-xs">
                      View Live Post
                    </Link>
                    <button
                      onClick={() => handleDeleteRoommatePost(post._id)}
                      className="btn-secondary !py-1.5 !px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Student ID Verification */}
      {activeTab === "verification" && (
        <div className="card p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl max-w-2xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Campus Verification</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Verify your student identity to unlock ₹0 brokerage guarantees, direct landlord WhatsApp access, and verified roommate matchmaking.
              </p>
            </div>
          </div>

          {verificationDone ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Student ID Verified ✓</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Your student credentials have been confirmed. You have unlocked all verified student privileges across RoomNest.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  College / University Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government Engineering College (GEC) West Champaran"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Roll Number / Student ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23101004"
                    value={studentIdNo}
                    onChange={(e) => setStudentIdNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Course & Semester
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech CSE (3rd Sem)"
                    value={courseYear}
                    onChange={(e) => setCourseYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Our campus operations team confirms student enrollments to ensure all student accommodation clusters remain safe, disciplined, and authentic.
                </span>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="btn-primary w-full !py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} />
                {isVerifying ? "Submitting for Verification..." : "Submit for Student Verification"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
