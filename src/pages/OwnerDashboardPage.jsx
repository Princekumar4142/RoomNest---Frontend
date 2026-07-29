import { useEffect, useState } from "react";
import { Plus, ShieldCheck, Clock, XCircle, Trash2, Pencil } from "lucide-react";
import { roomApi, bookingApi } from "../api/endpoints";
import { Spinner } from "../components/ui/Primitives";
import ListingFormModal from "../components/owner/ListingFormModal";
import KycPanel from "../components/owner/KycPanel";
import toast from "react-hot-toast";

const STATUS_META = {
  approved: { label: "Verified", icon: ShieldCheck, className: "text-teal bg-teal/10" },
  pending: { label: "Pending review", icon: Clock, className: "text-seal-dark bg-seal-light/30" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-red-600 bg-red-50" },
};

export default function OwnerDashboardPage() {
  const [tab, setTab] = useState("listings");
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  function loadListings() {
    setLoading(true);
    roomApi.mine().then((res) => setRooms(res.data.rooms)).finally(() => setLoading(false));
  }

  useEffect(() => {
    if (tab === "listings") loadListings();
    else if (tab === "bookings") {
      setLoading(true);
      bookingApi.owner().then((res) => setBookings(res.data.bookings)).finally(() => setLoading(false));
    }
  }, [tab]);

  async function deleteRoom(id) {
    if (!confirm("Delete this listing? This can't be undone.")) return;
    try {
      await roomApi.remove(id);
      setRooms((prev) => prev.filter((r) => r._id !== id));
      toast.success("Listing deleted.");
    } catch {
      toast.error("Couldn't delete listing.");
    }
  }

  async function updateBooking(id, status) {
    try {
      await bookingApi.updateStatus(id, status);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
    } catch {
      toast.error("Couldn't update booking.");
    }
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Owner dashboard</h1>
          <p className="text-sm text-slate-ink/60 mt-1">Manage your listings and booking requests.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary shrink-0">
          <Plus size={16} />
          Add listing
        </button>
      </div>

      <div className="flex rounded-full border border-ink/12 p-1 w-fit mb-8">
        {["listings", "bookings", "verification"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-ink text-paper" : "text-slate-ink/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "verification" ? (
        <KycPanel />
      ) : loading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : tab === "listings" ? (
        rooms.length === 0 ? (
          <p className="text-sm text-slate-ink/60">You haven't listed any properties yet.</p>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => {
              const meta = STATUS_META[room.verificationStatus];
              return (
                <div key={room._id} className="card flex flex-col sm:flex-row gap-4 p-4">
                  <img src={room.images[0]} alt="" className="h-32 sm:w-40 w-full rounded-xl object-cover shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-ink">{room.title}</h3>
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${meta.className}`}>
                        <meta.icon size={12} /> {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-ink/60 mt-1">{room.area}, {room.city}</p>
                    <p className="font-mono text-sm font-semibold text-ink mt-2">₹{room.rent.toLocaleString("en-IN")}/mo</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setEditingRoom(room)} className="btn-secondary !py-1.5 !px-3 text-xs"><Pencil size={13} /> Edit</button>
                      <button onClick={() => deleteRoom(room._id)} className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-ink/60">No booking or visit requests yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-ink">{b.room?.title}</p>
                <p className="text-sm text-slate-ink/60">
                  {b.user?.name} · {b.type === "visit" ? "Visit request" : "Booking"}
                  {b.visitScheduledFor && ` · ${new Date(b.visitScheduledFor).toLocaleString("en-IN")}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold capitalize rounded-full bg-ink/8 px-3 py-1">{b.status}</span>
                {b.status === "pending" && (
                  <>
                    <button onClick={() => updateBooking(b._id, "accepted")} className="btn-secondary !py-1.5 !px-3 text-xs">Accept</button>
                    <button onClick={() => updateBooking(b._id, "rejected")} className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 border-red-200 hover:bg-red-50">Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
