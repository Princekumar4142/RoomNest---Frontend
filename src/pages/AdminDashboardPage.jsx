import { useEffect, useState } from "react";
import { Users, Home, Clock, Calendar, Check, X, IdCard, ShieldCheck, ShieldOff, Ban, Trash2 } from "lucide-react";
import { adminApi } from "../api/endpoints";
import { Spinner } from "../components/ui/Primitives";
import toast from "react-hot-toast";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "owners", label: "Owners" },
  { key: "users", label: "Users" },
];

function StatusBadges({ account }) {
  if (!account.isSuspended && !account.isBanned) return null;
  return (
    <div className="flex gap-1.5 mt-1.5">
      {account.isSuspended && (
        <span className="rounded-full bg-seal-light/30 px-2 py-0.5 text-[10px] font-semibold text-seal-dark">Suspended</span>
      )}
      {account.isBanned && (
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">Banned</span>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState("overview");

  // Overview tab state
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [pendingOwners, setPendingOwners] = useState([]);

  // Owners / Users tab state
  const [owners, setOwners] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  function loadOverview() {
    setLoading(true);
    Promise.all([adminApi.stats(), adminApi.pendingRooms(), adminApi.pendingOwners()])
      .then(([s, p, o]) => {
        setStats(s.data);
        setPending(p.data.rooms);
        setPendingOwners(o.data.owners);
      })
      .finally(() => setLoading(false));
  }

  function loadOwners() {
    setLoading(true);
    adminApi.allOwners().then((res) => setOwners(res.data.owners)).finally(() => setLoading(false));
  }

  function loadUsers() {
    setLoading(true);
    adminApi.allUsers().then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  }

  useEffect(() => {
    if (tab === "overview") loadOverview();
    else if (tab === "owners") loadOwners();
    else if (tab === "users") loadUsers();
  }, [tab]);

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
      setOwners((prev) =>
        prev.map((o) => (o._id === id ? { ...o, ownerVerification: { ...o.ownerVerification, status: approve ? "verified" : "rejected" } } : o))
      );
      toast.success(approve ? "Owner verified." : "Owner KYC rejected.");
    } catch {
      toast.error("Couldn't update owner verification.");
    }
  }

  async function toggleSuspend(id, currentlySuspended, updater) {
    try {
      const res = await adminApi.suspendUser(id, !currentlySuspended);
      updater((prev) => prev.map((a) => (a._id === id ? res.data.user : a)));
      toast.success(currentlySuspended ? "Account unsuspended." : "Account suspended.");
    } catch {
      toast.error("Couldn't update account.");
    }
  }

  async function toggleBan(id, currentlyBanned, updater) {
    try {
      const res = await adminApi.banUser(id, !currentlyBanned);
      updater((prev) => prev.map((a) => (a._id === id ? res.data.user : a)));
      toast.success(currentlyBanned ? "Account unbanned." : "Account banned.");
    } catch {
      toast.error("Couldn't update account.");
    }
  }

  async function handleDelete(id, name, updater) {
    if (!confirm(`Permanently delete ${name}'s account? This can't be undone.`)) return;
    try {
      await adminApi.deleteAccount(id);
      updater((prev) => prev.filter((a) => a._id !== id));
      toast.success("Account deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete account.");
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
      <p className="text-sm text-slate-ink/60 mt-1">Platform health, listings, and account management.</p>

      <div className="flex rounded-full border border-ink/12 p-1 w-fit mt-6 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-ink text-paper" : "text-slate-ink/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : tab === "overview" ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
      ) : tab === "owners" ? (
        owners.length === 0 ? (
          <p className="text-sm text-slate-ink/60">No property owners registered yet.</p>
        ) : (
          <div className="space-y-4">
            {owners.map((owner) => (
              <div key={owner._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-ink">{owner.name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        owner.ownerVerification?.status === "verified"
                          ? "bg-teal/10 text-teal"
                          : owner.ownerVerification?.status === "pending"
                          ? "bg-seal-light/30 text-seal-dark"
                          : owner.ownerVerification?.status === "rejected"
                          ? "bg-red-50 text-red-600"
                          : "bg-ink/6 text-slate-ink/60"
                      }`}
                    >
                      {owner.ownerVerification?.status || "unverified"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-ink/60 mt-1">{owner.email} · {owner.phone}</p>
                  <StatusBadges account={owner} />
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {owner.ownerVerification?.status === "pending" && (
                    <>
                      <button onClick={() => decideOwner(owner._id, true)} className="btn-primary !py-1.5 !px-3 text-xs">
                        <Check size={13} /> Verify
                      </button>
                      <button onClick={() => decideOwner(owner._id, false)} className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 border-red-200 hover:bg-red-50">
                        <X size={13} /> Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => toggleSuspend(owner._id, owner.isSuspended, setOwners)}
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                  >
                    {owner.isSuspended ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                    {owner.isSuspended ? "Unsuspend" : "Suspend"}
                  </button>
                  <button
                    onClick={() => toggleBan(owner._id, owner.isBanned, setOwners)}
                    className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Ban size={13} />
                    {owner.isBanned ? "Unban" : "Ban"}
                  </button>
                  <button
                    onClick={() => handleDelete(owner._id, owner.name, setOwners)}
                    className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : users.length === 0 ? (
        <p className="text-sm text-slate-ink/60">No users registered yet.</p>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div key={u._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <h3 className="font-display font-semibold text-ink">{u.name}</h3>
                <p className="text-sm text-slate-ink/60 mt-1">{u.email} · {u.phone}</p>
                <StatusBadges account={u} />
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => toggleSuspend(u._id, u.isSuspended, setUsers)}
                  className="btn-secondary !py-1.5 !px-3 text-xs"
                >
                  {u.isSuspended ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                  {u.isSuspended ? "Unsuspend" : "Suspend"}
                </button>
                <button
                  onClick={() => toggleBan(u._id, u.isBanned, setUsers)}
                  className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Ban size={13} />
                  {u.isBanned ? "Unban" : "Ban"}
                </button>
                <button
                  onClick={() => handleDelete(u._id, u.name, setUsers)}
                  className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
