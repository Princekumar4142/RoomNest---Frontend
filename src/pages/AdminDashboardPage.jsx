import { useEffect, useState } from "react";
import {
  Users,
  Home,
  Clock,
  Calendar,
  Check,
  X,
  IdCard,
  ShieldCheck,
  ShieldOff,
  Ban,
  Trash2,
  Eye,
  Building,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  MapPin,
  FileText
} from "lucide-react";
import { adminApi } from "../api/endpoints";
import { Spinner } from "../components/ui/Primitives";
import toast from "react-hot-toast";

const TABS = [
  { key: "overview", label: "Physical Audit Queue" },
  { key: "kyc", label: "Owner KYC Queue" },
  { key: "owners", label: "Landlord Registry" },
  { key: "users", label: "Student Registry" },
];

function StatusBadges({ account }) {
  if (!account.isSuspended && !account.isBanned) return null;
  return (
    <div className="flex gap-1.5 mt-1.5">
      {account.isSuspended && (
        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          Suspended
        </span>
      )}
      {account.isBanned && (
        <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
          Banned
        </span>
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
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);

  // Photo Audit Inspection Modal
  const [inspectingRoom, setInspectingRoom] = useState(null);
  // Document Viewer Modal
  const [viewingDoc, setViewingDoc] = useState(null);

  function loadOverview() {
    setLoading(true);
    Promise.all([adminApi.stats(), adminApi.pendingRooms(), adminApi.pendingOwners()])
      .then(([s, p, o]) => {
        setStats(s.data);
        setPending(p.data.rooms || []);
        setPendingOwners(o.data.owners || []);
      })
      .catch(() => toast.error("Could not load admin stats."))
      .finally(() => setLoading(false));
  }

  function loadOwners() {
    setLoading(true);
    adminApi.allOwners()
      .then((res) => setOwners(res.data.owners || []))
      .catch(() => toast.error("Could not load landlords."))
      .finally(() => setLoading(false));
  }

  function loadUsers() {
    setLoading(true);
    adminApi.allUsers()
      .then((res) => setUsers(res.data.users || []))
      .catch(() => toast.error("Could not load student users."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (tab === "overview") loadOverview();
    else if (tab === "kyc") loadOverview();
    else if (tab === "owners") loadOwners();
    else if (tab === "users") loadUsers();
  }, [tab]);

  async function decide(id, approve) {
    try {
      if (approve) await adminApi.approveRoom(id);
      else await adminApi.rejectRoom(id);
      setPending((prev) => prev.filter((r) => r._id !== id));
      if (inspectingRoom?._id === id) setInspectingRoom(null);
      toast.success(approve ? "Listing approved with verified physical inspection badge!" : "Listing rejected.");
    } catch {
      toast.error("Couldn't update listing status.");
    }
  }

  async function decideOwner(id, approve) {
    try {
      await adminApi.verifyOwner(id, approve);
      setPendingOwners((prev) => prev.filter((o) => o._id !== id));
      setOwners((prev) =>
        prev.map((o) =>
          o._id === id
            ? { ...o, ownerVerification: { ...o.ownerVerification, status: approve ? "verified" : "rejected" } }
            : o
        )
      );
      if (viewingDoc?._id === id) setViewingDoc(null);
      toast.success(approve ? "Owner identity verified." : "Owner KYC rejected.");
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
    if (!confirm(`Permanently delete ${name}'s account? This action cannot be reversed.`)) return;
    try {
      await adminApi.deleteAccount(id);
      updater((prev) => prev.filter((a) => a._id !== id));
      toast.success("Account deleted successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete account.");
    }
  }

  const statCards = stats
    ? [
        { label: "Students", value: stats.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
        { label: "Verified Owners", value: stats.totalOwners, icon: Building, color: "text-emerald-600 bg-emerald-50" },
        { label: "Total Listings", value: stats.totalRooms, icon: Home, color: "text-indigo-600 bg-indigo-50" },
        { label: "Pending Audit", value: stats.pendingRooms, icon: Clock, color: "text-amber-600 bg-amber-50" },
        { label: "Visits Scheduled", value: stats.totalBookings, icon: Calendar, color: "text-purple-600 bg-purple-50" },
      ]
    : [];

  const filteredOwners = owners.filter(
    (o) =>
      o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone?.includes(searchQuery)
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery)
  );

  return (
    <div className="container-page py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Campus Housing Administration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Perform 5-point physical inspections, verify landlord identities, and monitor platform compliance.
        </p>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="card p-4 bg-white border border-slate-200/80 rounded-2xl">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={16} />
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-200 pb-3 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {t.label}
            {t.key === "overview" && pending.length > 0 && (
              <span className="bg-amber-500 text-white text-[11px] px-2 py-0.2 rounded-full">
                {pending.length}
              </span>
            )}
            {t.key === "kyc" && pendingOwners.length > 0 && (
              <span className="bg-blue-600 text-white text-[11px] px-2 py-0.2 rounded-full">
                {pendingOwners.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner className="h-8 w-8 text-blue-600" /></div>
      ) : tab === "overview" ? (
        /* Physical Audit Queue */
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Listings Awaiting 5-Point Physical Audit</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Inspect authentic front exterior photos, bedroom setup, washrooms, and food standards before approving.
              </p>
            </div>
          </div>

          {pending.length === 0 ? (
            <div className="card p-10 text-center bg-white border border-slate-200 rounded-2xl">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">Inspection Queue Clear</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                All submitted student accommodations have been physically inspected and verified.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((room) => (
                <div
                  key={room._id}
                  className="card p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-slate-300 transition-all flex flex-col md:flex-row gap-5"
                >
                  <div className="relative md:w-52 h-36 shrink-0 rounded-xl overflow-hidden border border-slate-100">
                    <img
                      src={room.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80"}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-xs font-semibold">
                      {room.images?.length || 0} Photos Attached
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display font-bold text-slate-900 text-lg">{room.title}</h3>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                            <MapPin size={13} className="text-slate-400" />
                            {room.area}, {room.city} {room.campus && ` · Near ${room.campus}`}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-display text-lg font-bold text-slate-900">
                            ₹{room.rent?.toLocaleString("en-IN")}/mo
                          </span>
                          <p className="text-xs text-slate-500">{room.roomType} · {room.occupancy}</p>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                        <span><strong>Owner:</strong> {room.owner?.name || "Landlord"} ({room.owner?.phone || "No phone"})</span>
                        <span><strong>Total Beds:</strong> {room.totalBeds || 1} ({room.availableBeds || 1} available)</span>
                        <span><strong>Zero Brokerage:</strong> Yes</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => setInspectingRoom(room)}
                        className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1.5 text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"
                      >
                        <Eye size={14} /> Inspect 5 Audit Photos & Details
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decide(room._id, true)}
                          className="btn-primary !py-2 !px-3.5 text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Check size={14} /> Approve & Grant Verified Badge
                        </button>
                        <button
                          onClick={() => decide(room._id, false)}
                          className="btn-secondary !py-2 !px-3.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5"
                        >
                          <X size={14} /> Reject with Audit Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === "kyc" ? (
        /* Owner KYC Queue */
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pending Owner KYC & Identity Verifications</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Confirm landlord Aadhaar, PAN, and address proofs before awarding the Verified Host Shield.
              </p>
            </div>
          </div>

          {pendingOwners.length === 0 ? (
            <div className="card p-10 text-center bg-white border border-slate-200 rounded-2xl">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No Pending KYC Submissions</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                All property host verification requests have been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOwners.map((owner) => (
                <div
                  key={owner._id}
                  className="card p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-5"
                >
                  {owner.ownerVerification?.documentUrl ? (
                    <div
                      onClick={() => setViewingDoc(owner)}
                      className="cursor-pointer group relative h-32 sm:w-44 w-full rounded-xl overflow-hidden border border-slate-200 shrink-0"
                    >
                      <img
                        src={owner.ownerVerification.documentUrl}
                        alt="KYC Proof"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                        <Eye size={16} className="mr-1" /> View Full Doc
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 sm:w-44 w-full rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      <IdCard size={28} className="text-slate-400" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-base">{owner.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{owner.email} · {owner.phone}</p>
                      <div className="mt-2 text-xs font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-700">
                        Aadhaar / PAN Document Number: <strong>{owner.ownerVerification?.aadhaarOrPan || "Not specified"}</strong>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => decideOwner(owner._id, true)}
                        className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check size={14} /> Verify Owner Identity
                      </button>
                      <button
                        onClick={() => decideOwner(owner._id, false)}
                        className="btn-secondary !py-2 !px-4 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5"
                      >
                        <X size={14} /> Reject Document
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === "owners" ? (
        /* Landlord Registry */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registered Property Landlords & Wardens</h2>
              <p className="text-xs sm:text-sm text-slate-500">Manage owner accounts, compliance standing, and active listings.</p>
            </div>
            <div className="relative sm:w-72">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search owner by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {filteredOwners.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No property owners found matching your search.</p>
          ) : (
            <div className="space-y-3">
              {filteredOwners.map((owner) => (
                <div
                  key={owner._id}
                  className="card p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-slate-900 text-sm">{owner.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          owner.ownerVerification?.status === "verified"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : owner.ownerVerification?.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        KYC: {owner.ownerVerification?.status || "unverified"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{owner.email} · {owner.phone}</p>
                    <StatusBadges account={owner} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleSuspend(owner._id, owner.isSuspended, setOwners)}
                      className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1"
                    >
                      {owner.isSuspended ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                      {owner.isSuspended ? "Unsuspend" : "Suspend"}
                    </button>
                    <button
                      onClick={() => toggleBan(owner._id, owner.isBanned, setOwners)}
                      className="btn-secondary !py-1.5 !px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1"
                    >
                      <Ban size={13} />
                      {owner.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button
                      onClick={() => handleDelete(owner._id, owner.name, setOwners)}
                      className="btn-secondary !py-1.5 !px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      title="Permanently remove account"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Students Registry */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registered College Students</h2>
              <p className="text-xs sm:text-sm text-slate-500">Student accounts, scheduled inspections, and campus enrollments.</p>
            </div>
            <div className="relative sm:w-72">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search student by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No students found matching your search.</p>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <div
                  key={u._id}
                  className="card p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-slate-900 text-sm">{u.name}</h3>
                      {u.isIdentityVerified && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                          Verified Student
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{u.email} · {u.phone}</p>
                    <StatusBadges account={u} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleSuspend(u._id, u.isSuspended, setUsers)}
                      className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1"
                    >
                      {u.isSuspended ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                      {u.isSuspended ? "Unsuspend" : "Suspend"}
                    </button>
                    <button
                      onClick={() => toggleBan(u._id, u.isBanned, setUsers)}
                      className="btn-secondary !py-1.5 !px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1"
                    >
                      <Ban size={13} />
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button
                      onClick={() => handleDelete(u._id, u.name, setUsers)}
                      className="btn-secondary !py-1.5 !px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5-Point Photo Audit Inspection Modal */}
      {inspectingRoom && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{inspectingRoom.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  5-Point Physical Inspection Verification · {inspectingRoom.area}, {inspectingRoom.city}
                </p>
              </div>
              <button
                onClick={() => setInspectingRoom(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Photo Checklist Gallery */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submitted Photos Checklist ({inspectingRoom.images?.length || 0})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inspectingRoom.images?.map((img, idx) => {
                  const labels = [
                    "1. Building Front Look",
                    "2. Student Bedroom",
                    "3. Study Table & Desk",
                    "4. Attached Washroom",
                    "5. Mess / Dining Hall",
                  ];
                  return (
                    <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <div className="h-36 overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                      <div className="p-2 text-center text-xs font-semibold text-slate-700 bg-white border-t border-slate-100">
                        {labels[idx] || `Photo #${idx + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inspection Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Monthly Rent</span>
                  <span className="font-bold text-slate-900 text-sm">₹{inspectingRoom.rent?.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Room Type</span>
                  <span className="font-bold text-slate-900 text-sm">{inspectingRoom.roomType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Campus Proximity</span>
                  <span className="font-bold text-slate-900 text-sm">{inspectingRoom.distanceToCampusKm || 0.8} km</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Food Included</span>
                  <span className="font-bold text-slate-900 text-sm">{inspectingRoom.foodIncluded ? "Yes (Mess)" : "Self / Tiffin"}</span>
                </div>
              </div>
            </div>

            {/* Modal Decision Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => setInspectingRoom(null)}
                className="btn-secondary !py-2 !px-4 text-xs"
              >
                Close Preview
              </button>
              <button
                onClick={() => decide(inspectingRoom._id, false)}
                className="btn-secondary !py-2 !px-4 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Reject Inspection
              </button>
              <button
                onClick={() => decide(inspectingRoom._id, true)}
                className="btn-primary !py-2 !px-5 text-xs bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <Check size={14} /> Approve Physical Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Owner Identity Document: {viewingDoc.name}</h3>
              <button onClick={() => setViewingDoc(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 max-h-[60vh] flex items-center justify-center bg-slate-50">
              <img src={viewingDoc.ownerVerification?.documentUrl} alt="KYC Document" className="max-h-[60vh] object-contain" />
            </div>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100">
              <button onClick={() => setViewingDoc(null)} className="btn-secondary !py-2 !px-4 text-xs">
                Close
              </button>
              <button
                onClick={() => decideOwner(viewingDoc._id, true)}
                className="btn-primary !py-2 !px-4 text-xs bg-emerald-600 hover:bg-emerald-700"
              >
                Verify Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
