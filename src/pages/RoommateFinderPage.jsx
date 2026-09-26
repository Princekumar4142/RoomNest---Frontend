import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, X, MessageCircle } from "lucide-react";
import { roommateApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { Spinner, Chip } from "../components/ui/Primitives";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  city: "",
  area: "",
  budgetMin: "",
  budgetMax: "",
  genderPreference: "Any",
  occupation: "Student",
  lookingFor: "",
  aboutMe: "",
  habits: { smoking: false, pets: false, foodPreference: "Either" },
};

export default function RoommateFinderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function load(city) {
    setLoading(true);
    roommateApi
      .list(city ? { city } : {})
      .then((res) => setPosts(res.data.posts))
      .finally(() => setLoading(false));
  }

  useEffect(() => load(), []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to post a roommate request.");
      navigate("/login?redirect=/roommates");
      return;
    }
    setSaving(true);
    try {
      await roommateApi.create({
        ...form,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
      });
      toast.success("Your post is live.");
      setShowForm(false);
      setForm(EMPTY_FORM);
      load(cityFilter);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Your login session expired. Please log in again.");
        navigate("/login?redirect=/roommates");
      } else {
        toast.error(err.response?.data?.message || "Couldn't post right now.");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleOpenPostForm() {
    if (!user) {
      toast.error("Please log in to post a roommate request.");
      navigate("/login?redirect=/roommates");
      return;
    }
    setShowForm(true);
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Find a roommate</h1>
          <p className="text-sm text-slate-ink/60 mt-1">
            Moving with a flatmate splits the rent and makes a new city feel less unfamiliar.
          </p>
        </div>
        <button onClick={handleOpenPostForm} className="btn-primary shrink-0">
          <Plus size={16} />
          Post a request
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          placeholder="Filter by city"
          className="input-field max-w-xs"
        />
        <button onClick={() => load(cityFilter)} className="btn-secondary shrink-0">Search</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <Users className="mx-auto text-ink/20" size={40} />
          <p className="font-display text-lg text-ink mt-4">No roommate posts yet.</p>
          <p className="text-sm text-slate-ink/60 mt-1">Be the first to post in this city.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <div key={post._id} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper font-semibold shrink-0">
                  {post.user?.name?.[0]?.toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{post.user?.name}</p>
                  <p className="text-xs text-slate-ink/55">{post.occupation}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-ink/80 font-medium">{post.lookingFor || "Looking for a flatmate"}</p>
              <p className="mt-1 text-xs text-slate-ink/60">{post.area ? `${post.area}, ` : ""}{post.city}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip active={false}>₹{post.budgetMin.toLocaleString("en-IN")}–{post.budgetMax.toLocaleString("en-IN")}</Chip>
                <Chip active={false}>{post.genderPreference}</Chip>
                <Chip active={false}>{post.habits?.foodPreference}</Chip>
              </div>

              {post.aboutMe && <p className="mt-3 text-xs text-slate-ink/60 line-clamp-3">{post.aboutMe}</p>}

              <button
                onClick={() => {
                  if (!user) return toast.error("Please log in to message this person.");
                  if (user._id === post.user?._id) return toast.error("This is your own roommate request.");
                  navigate("/chat", {
                    state: {
                      ownerId: post.user?._id,
                      ownerName: post.user?.name,
                      roomTitle: `Roommate request: ${post.lookingFor || post.city}`,
                    },
                  });
                }}
                className="btn-secondary w-full mt-4 !py-2 text-sm flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={14} />
                Message {post.user?.name ? post.user.name.split(" ")[0] : ""}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowForm(false)} />
          <div className="relative z-10 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-paper p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-semibold text-ink">Post a roommate request</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
                <input placeholder="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Min budget ₹" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} className="input-field" />
                <input required type="number" placeholder="Max budget ₹" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} className="input-field" />
              </div>
              <input required placeholder="What are you looking for? e.g. 1 flatmate for 2BHK" value={form.lookingFor} onChange={(e) => setForm({ ...form, lookingFor: e.target.value })} className="input-field" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.genderPreference} onChange={(e) => setForm({ ...form, genderPreference: e.target.value })} className="input-field">
                  {["Any", "Male", "Female"].map((g) => <option key={g}>{g}</option>)}
                </select>
                <select value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} className="input-field">
                  {["Student", "Working Professional", "Intern", "Other"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <textarea placeholder="A little about you (optional)" rows={3} value={form.aboutMe} onChange={(e) => setForm({ ...form, aboutMe: e.target.value })} className="input-field" />
              <button disabled={saving} className="btn-primary w-full">
                {saving ? "Posting..." : "Post request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
