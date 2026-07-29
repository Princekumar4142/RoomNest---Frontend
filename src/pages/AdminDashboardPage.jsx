import { useEffect, useState } from "react";
import { Users, Home, Clock, Calendar, Check, X, IdCard } from "lucide-react";
import { adminApi } from "../api/endpoints";
import { Spinner } from "../components/ui/Primitives";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([adminApi.stats(), adminApi.pendingRooms(), adminApi.pendingOwners()])
      .then(([s, p, o]) => {
        setStats(s.data);
        setPending(p.data.rooms);
        setPendingOwners(o.data.owners);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function decide(id, approve) {
    try {
      if (approve) await adminApi.approveRoom(id);
      else await adminApi.rejectRoom(id);
      setPending((prev) => prev.filter((r) => r._id !== id));
      toast.success(approve ? "Listing approved." : "Listing rejected.");
    } catch {
      toast.error("Couldn't update listing.");
    }
  }

  async function decideOwner(id, approve) {
    try {
      await adminApi.verifyOwner(id, approve);
      setPendingOwners((prev) => prev.filter((o) => o._id !== id));
      toast.success(approve ? "Owner verified." : "Owner KYC rejected.");
    } catch {
      toast.error("Couldn't update owner verification.");
    }
  }

  const statCards = stats
    ? [
        { label: "Users", value: stats.totalUsers, icon: Users },
        { label: "Owners", value: stats.totalOwners, icon: Users },
        { label: "Total listings", value: stats.totalRooms, icon: Home },
        { label: "Pending review", value: stats.pendingRooms, icon: Clock },
        { label: "Bookings", value: stats.totalBookings, icon: Calendar },
      ]
    : [];

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Admin dashboard</h1>
      <p className="text-sm text-slate-ink/60 mt-1">Platform health and verification queue.</p>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className="card p-4">
                <s.icon size={16} className="text-teal" />
                <p className="mt-3 font-display text-2xl font-semibold text-ink">{s.value}</p>
                <p className="text-xs text-slate-ink/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <h2 className="font-display text-lg font-semibold text-ink mt-10 mb-4">Pending listings</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-ink/60">Nothing waiting for review right now.</p>
          ) : (
            <div className="space-y-4">
              {pending.map((room) => (
                <div key={room._id} className="card flex flex-col sm:flex-row gap-4 p-4">
                  <img src={room.images?.[0]} alt="" className="h-28 sm:w-36 w-full rounded-xl object-cover shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-ink">{room.title}</h3>
                    <p className="text-sm text-slate-ink/60 mt-1">{room.area}, {room.city}</p>
                    <p className="text-xs text-slate-ink/50 mt-1">Owner: {room.owner?.name} · {room.owner?.email}</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => decide(room._id, true)} className="btn-primary !py-1.5 !px-3 text-xs">
                        <Check size={13} /> Approve
                      </button>
                      <button onClick={() => decide(room._id, false)} className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 border-red-200 hover:bg-red-50">
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="font-display text-lg font-semibold text-ink mt-10 mb-4">Pending owner KYC</h2>
          {pendingOwners.length === 0 ? (
            <p className="text-sm text-slate-ink/60">No owner verification requests waiting.</p>
          ) : (
            <div className="space-y-4">
              {pendingOwners.map((owner) => (
                <div key={owner._id} className="card flex flex-col sm:flex-row gap-4 p-4">
                  {owner.ownerVerification?.documentUrl ? (
                    <img
                      src={owner.ownerVerification.documentUrl}
                      alt="ID document"
                      className="h-28 sm:w-36 w-full rounded-xl object-cover shrink-0 border border-ink/10"
                    />
                  ) : (
                    <div className="h-28 sm:w-36 w-full rounded-xl bg-ink/5 flex items-center justify-center shrink-0">
                      <IdCard size={24} className="text-ink/30" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-ink">{owner.name}</h3>
                    <p className="text-sm text-slate-ink/60 mt-1">{owner.email} · {owner.phone}</p>
                    <p className="text-xs text-slate-ink/50 mt-1 font-mono">
                      ID: {owner.ownerVerification?.aadhaarOrPan}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => decideOwner(owner._id, true)} className="btn-primary !py-1.5 !px-3 text-xs">
                        <Check size={13} /> Verify
                      </button>
                      <button onClick={() => decideOwner(owner._id, false)} className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 border-red-200 hover:bg-red-50">
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
