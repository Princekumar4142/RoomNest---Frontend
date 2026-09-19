import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ShieldCheck,
  Clock,
  XCircle,
  Trash2,
  Pencil,
  BedDouble,
  ExternalLink,
  MessageCircle,
  Phone,
  CheckCircle2,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Minus,
  AlertCircle
} from "lucide-react";
import { roomApi, bookingApi } from "../api/endpoints";
import { Spinner } from "../components/ui/Primitives";
import ListingFormModal from "../components/owner/ListingFormModal";
import KycPanel from "../components/owner/KycPanel";
import toast from "react-hot-toast";

const STATUS_META = {
  approved: { label: "Verified Physical Inspection", icon: ShieldCheck, className: "text-emerald-700 bg-emerald-50 border border-emerald-200" },
  pending: { label: "Physical Audit In Progress", icon: Clock, className: "text-amber-700 bg-amber-50 border border-amber-200" },
  rejected: { label: "Inspection Not Passed", icon: XCircle, className: "text-rose-700 bg-rose-50 border border-rose-200" },
};

export default function OwnerDashboardPage() {
  const [tab, setTab] = useState("listings"); // listings | bookings | verification
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [updatingBedId, setUpdatingBedId] = useState(null);

  function loadListings() {
    setLoading(true);
    roomApi.mine()
      .then((res) => setRooms(res.data.rooms || []))
      .catch(() => toast.error("Could not load your properties."))
      .finally(() => setLoading(false));
  }

  function loadBookings() {
    setLoading(true);
    bookingApi.owner()
      .then((res) => setBookings(res.data.bookings || []))
      .catch(() => toast.error("Could not load visit requests."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (tab === "listings") loadListings();
    else if (tab === "bookings") loadBookings();
  }, [tab]);

  async function deleteRoom(id) {
    if (!confirm("Permanently delete this property listing? This cannot be undone.")) return;
    try {
      await roomApi.remove(id);
      setRooms((prev) => prev.filter((r) => r._id !== id));
      toast.success("Listing deleted successfully.");
    } catch {
      toast.error("Couldn't delete listing.");
    }
  }

  async function updateBooking(id, status) {
    try {
      await bookingApi.updateStatus(id, status);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
      toast.success(
        status === "accepted"
          ? "Visit request confirmed! The student will be notified."
          : status === "rejected"
          ? "Visit request declined."
          : "Status updated."
      );
    } catch {
      toast.error("Couldn't update visit request.");
    }
  }

  async function handleBedChange(room, delta) {
    const currentBeds = room.availableBeds ?? 1;
    const newBeds = Math.max(0, currentBeds + delta);
    setUpdatingBedId(room._id);

    try {
      await roomApi.updateAvailability(room._id, { availableBeds: newBeds });
      setRooms((prev) =>
        prev.map((r) => (r._id === room._id ? { ...r, availableBeds: newBeds } : r))
      );
      toast.success(`Available beds updated: ${newBeds} beds.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update bed count.");
    } finally {
      setUpdatingBedId(null);
    }
  }

  async function handleToggleActive(room) {
    const nextActive = !room.isActive;
    try {
      await roomApi.updateAvailability(room._id, { isActive: nextActive });
      setRooms((prev) =>
        prev.map((r) => (r._id === room._id ? { ...r, isActive: nextActive } : r))
      );
      toast.success(nextActive ? "Listing is now active & accepting students." : "Listing paused.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update listing status.");
    }
  }

  // Analytics
  const totalListings = rooms.length;
  const totalBeds = rooms.reduce((acc, r) => acc + (r.totalBeds || 1), 0);
  const availableBeds = rooms.reduce((acc, r) => acc + (r.availableBeds ?? 1), 0);
  const pendingVisits = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="container-page py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Property Owner & Warden Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your verified student accommodations, live bed vacancies, and student visit requests.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRoom(null);
            setShowModal(true);
          }}
          className="btn-primary shrink-0 flex items-center gap-2 !py-2.5 !px-4"
        >
          <Plus size={18} />
          Add New PG / Hostel Listing
        </button>
      </div>

      {/* Analytics Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 bg-white border border-slate-200/80 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Properties</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-2">{totalListings}</p>
          <p className="text-xs text-slate-400 mt-1">Active listings</p>
        </div>
        <div className="card p-4 bg-white border border-slate-200/80 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Available Beds</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="font-display text-2xl font-bold text-blue-600">{availableBeds}</span>
            <span className="text-xs text-slate-400">/ {totalBeds} total</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time vacancies</p>
        </div>
        <div className="card p-4 bg-white border border-slate-200/80 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Visits</p>
          <p className="font-display text-2xl font-bold text-amber-600 mt-2">{pendingVisits}</p>
          <p className="text-xs text-slate-400 mt-1">Students awaiting confirmation</p>
        </div>
        <div className="card p-4 bg-white border border-slate-200/80 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Brokerage Fee</p>
          <p className="font-display text-2xl font-bold text-emerald-600 mt-2">₹0</p>
          <p className="text-xs text-slate-400 mt-1">Direct student connections</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setTab("listings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === "listings"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BedDouble size={16} />
          My Accommodations & Beds ({rooms.length})
        </button>

        <button
          onClick={() => setTab("bookings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === "bookings"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Calendar size={16} />
          Student Visit Requests ({bookings.length})
          {pendingVisits > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          )}
        </button>

        <button
          onClick={() => setTab("verification")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === "verification"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck size={16} />
          Owner Trust KYC & Property Documents
        </button>
      </div>

      {/* Content */}
      {tab === "verification" ? (
        <KycPanel />
      ) : loading ? (
        <div className="flex justify-center py-24"><Spinner className="h-8 w-8 text-blue-600" /></div>
      ) : tab === "listings" ? (
        rooms.length === 0 ? (
          <div className="card p-10 text-center bg-white border border-slate-200 rounded-2xl">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BedDouble size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800">You haven't listed any student accommodations yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              List your PG, hostel, or student rental flat near campus to connect directly with college students with ₹0 brokerage.
            </p>
            <button
              onClick={() => {
                setEditingRoom(null);
                setShowModal(true);
              }}
              className="btn-primary !px-5 inline-flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Add Your First Listing
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => {
              const meta = STATUS_META[room.verificationStatus] || STATUS_META.pending;
              const hasVacancy = (room.availableBeds ?? 1) > 0;

              return (
                <div
                  key={room._id}
                  className="card p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-slate-300 transition-all flex flex-col md:flex-row gap-5"
                >
                  <div className="relative md:w-48 h-36 shrink-0 rounded-xl overflow-hidden border border-slate-100">
                    <img
                      src={room.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80"}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-xs font-semibold">
                      {room.roomType}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-bold text-slate-900 text-lg">{room.title}</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}>
                              <meta.icon size={12} /> {meta.label}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            {room.area}, {room.city} {room.campus && ` · Near ${room.campus}`}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="font-display text-lg font-bold text-slate-900">
                            ₹{room.rent?.toLocaleString("en-IN")}/mo
                          </p>
                          <p className="text-xs text-slate-500">
                            {room.sharingType || "Bed in student PG"}
                          </p>
                        </div>
                      </div>

                      {/* Bed availability controls */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-700">Real-Time Vacancy:</span>
                          <div className="inline-flex items-center border border-slate-300 rounded-xl p-1 bg-slate-50">
                            <button
                              onClick={() => handleBedChange(room, -1)}
                              disabled={updatingBedId === room._id || (room.availableBeds ?? 1) <= 0}
                              className="p-1 hover:bg-white rounded-lg text-slate-700 disabled:opacity-40 transition-colors"
                              title="Decrease available beds"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-900 min-w-[50px] text-center">
                              {room.availableBeds ?? 1} Beds
                            </span>
                            <button
                              onClick={() => handleBedChange(room, 1)}
                              disabled={updatingBedId === room._id}
                              className="p-1 hover:bg-white rounded-lg text-slate-700 transition-colors"
                              title="Increase available beds"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {hasVacancy ? (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Vacant ({room.availableBeds} Available)
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              Fully Occupied (0 Beds)
                            </span>
                          )}
                        </div>

                        {/* Active toggle */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(room)}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900"
                          >
                            {room.isActive !== false ? (
                              <>
                                <ToggleRight size={22} className="text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Listing Live</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={22} className="text-slate-400" />
                                <span className="text-slate-500 font-semibold">Listing Paused</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/rooms/${room._id}`}
                          className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1"
                        >
                          <ExternalLink size={13} /> View as Student
                        </Link>
                        <button
                          onClick={() => {
                            setEditingRoom(room);
                            setShowModal(true);
                          }}
                          className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1"
                        >
                          <Pencil size={13} /> Edit Property Details
                        </button>
                      </div>

                      <button
                        onClick={() => deleteRoom(room._id)}
                        className="btn-secondary !py-1.5 !px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1"
                      >
                        <Trash2 size={13} /> Delete Listing
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : bookings.length === 0 ? (
        <div className="card p-10 text-center bg-white border border-slate-200 rounded-2xl">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar size={22} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No student visit requests yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            When students schedule an in-person room inspection or booking token, their requests and direct phone numbers will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const student = b.user;
            const studentPhone = student?.phone || "919876543210";
            const isPending = b.status === "pending";
            const isAccepted = b.status === "accepted";

            return (
              <div
                key={b._id}
                className="card p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-slate-900 text-base">
                      {student?.name || "Student"}
                    </span>
                    <span className="text-xs text-slate-500">
                      requested visit for <strong className="text-slate-800">{b.room?.title}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" />
                      {studentPhone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      {b.visitScheduledFor ? new Date(b.visitScheduledFor).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Immediate Visit"}
                    </span>
                    {b.notes && (
                      <span className="text-slate-600 italic">
                        Note: "{b.notes}"
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`text-xs font-semibold capitalize rounded-full px-2.5 py-0.5 ${
                        isAccepted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isPending
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {b.status === "accepted" ? "Visit Confirmed" : b.status}
                    </span>

                    {b.advanceAmount > 0 && (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        Token: ₹{b.advanceAmount.toLocaleString("en-IN")} ({b.paymentStatus || "unpaid"})
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Landlord Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  {/* WhatsApp student */}
                  <a
                    href={`https://wa.me/91${studentPhone}?text=${encodeURIComponent(
                      `Hi ${student?.name}, this is the owner of "${b.room?.title}". I received your visit request on RoomNest.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>

                  {/* Call student */}
                  <a
                    href={`tel:${studentPhone}`}
                    className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1 text-slate-700"
                  >
                    <Phone size={13} /> Call
                  </a>

                  {/* Accept / Decline actions */}
                  {isPending && (
                    <>
                      <button
                        onClick={() => updateBooking(b._id, "accepted")}
                        className="btn-primary !py-2 !px-3 text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} /> Accept Visit
                      </button>
                      <button
                        onClick={() => updateBooking(b._id, "rejected")}
                        className="btn-secondary !py-2 !px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() => updateBooking(b._id, "completed")}
                      className="btn-secondary !py-2 !px-3 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for adding/editing property */}
      {(showModal || editingRoom) && (
        <ListingFormModal
          editingRoom={editingRoom}
          onClose={() => {
            setShowModal(false);
            setEditingRoom(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingRoom(null);
            loadListings();
          }}
        />
      )}
    </div>
  );
}
