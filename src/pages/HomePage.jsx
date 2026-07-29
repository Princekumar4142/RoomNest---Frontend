import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShieldCheck, MessageCircle, MapPinned, Star, ArrowRight, Users, Building2, Home, Warehouse, GraduationCap } from "lucide-react";
import RentCalculator from "../components/room/RentCalculator";
import { getRecentlyViewed } from "../utils/recentlyViewed";
import { parseSmartQuery, filtersToSearchParams } from "../utils/smartSearch";
import SEO from "../components/SEO";

const stats = [
  { value: "12,400+", label: "Verified listings" },
  { value: "38", label: "Cities covered" },
  { value: "0", label: "Broker fees" },
  { value: "4.7★", label: "Average rating" },
];

const steps = [
  {
    icon: Search,
    title: "Search by what matters to you",
    body: "College, office, metro station or just a city — filter by budget, room type and amenities in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Every room is verified",
    body: "Our team checks ownership documents and photos before a listing ever goes live. No fake rooms, no ghost brokers.",
  },
  {
    icon: MessageCircle,
    title: "Chat directly with the owner",
    body: "Message, call, or schedule a visit — no middlemen taking a cut or slowing things down.",
  },
];

const testimonials = [
  {
    quote: "Moved from Patna to Delhi for college and found a verified PG near North Campus in one evening. No brokers, no drama.",
    name: "Ananya S.",
    role: "DU Student",
  },
  {
    quote: "As a working professional relocating for a new job, the verified badge actually meant something — the room matched every photo.",
    name: "Rohit M.",
    role: "Software Engineer, Gurgaon",
  },
  {
    quote: "Listed my PG in Koramangala and had verified tenant enquiries within two days. The dashboard makes managing bookings painless.",
    name: "Priya N.",
    role: "Property Owner, Bangalore",
  },
];

const categories = [
  { label: "PG", icon: Building2, roomType: "PG" },
  { label: "Hostel", icon: Warehouse, roomType: "Hostel" },
  { label: "Single Room", icon: Home, roomType: "Single Room" },
  { label: "Shared Room", icon: Users, roomType: "Shared Room" },
  { label: "Flat", icon: Home, roomType: "Flat" },
  { label: "Near College", icon: GraduationCap, roomType: "" },
];

const popularCities = ["Delhi", "Bangalore", "Mumbai", "Gurgaon", "Hyderabad", "Pune", "Vellore", "Chennai"];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) {
      navigate("/search");
      return;
    }
    const filters = parseSmartQuery(query);
    const params = filtersToSearchParams(filters);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <div>
      <SEO />
      {/* HERO */}
      <section className="relative overflow-hidden bg-paper">
        <div className="absolute inset-0 bg-grain [background-size:18px_18px] opacity-40 pointer-events-none" />
        <div className="container-page relative py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/12 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-ink/70">
              <ShieldCheck size={14} className="text-teal" />
              Every listing manually verified
            </span>

            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.08] tracking-tight text-ink">
              Find verified rooms,
              <br />
              <span className="italic text-teal">not just listings.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-ink/70 max-w-md">
              RoomNest connects students, professionals and families to rooms, PGs and hostels that have actually been checked — by us, not just by an algorithm.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-ink/40" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try: girls PG under ₹6000 near Delhi University"
                  className="input-field pl-11"
                />
              </div>
              <button type="submit" className="btn-primary shrink-0">
                Search rooms
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-10 grid grid-cols-4 gap-4 max-w-lg">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-xl sm:text-2xl font-semibold text-ink">{s.value}</div>
                  <div className="text-[11px] sm:text-xs text-slate-ink/55 leading-tight mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stacked "desk of verified listings" signature visual */}
          <div className="relative hidden md:block h-[440px]">
            <div className="absolute right-8 top-4 w-64 rotate-6 card overflow-hidden shadow-xl">
              <img src="https://loremflickr.com/500/380/home,interior" alt="Home interior" className="h-40 w-full object-cover" />
              <div className="p-3">
                <div className="h-2.5 w-3/4 rounded bg-ink/10" />
                <div className="mt-2 h-2.5 w-1/2 rounded bg-ink/10" />
              </div>
            </div>
            <div className="absolute left-2 top-24 w-64 -rotate-3 card overflow-hidden shadow-xl">
              <img src="https://loremflickr.com/500/380/bedroom,room" alt="Bedroom" className="h-40 w-full object-cover" />
              <div className="p-3">
                <div className="h-2.5 w-2/3 rounded bg-ink/10" />
                <div className="mt-2 h-2.5 w-1/3 rounded bg-ink/10" />
              </div>
            </div>
            <div className="absolute right-16 bottom-2 w-60 rotate-[-8deg] card overflow-hidden shadow-xl">
              <img src="https://loremflickr.com/500/380/hotel,room" alt="Hotel room" className="h-36 w-full object-cover" />
              <div className="p-3">
                <div className="h-2.5 w-3/5 rounded bg-ink/10" />
              </div>
            </div>

            <div className="stamp absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rotate-[-14deg] bg-paper text-sm font-bold shadow-2xl animate-stamp z-10">
              <span className="leading-tight text-center">
                ✓ VERIFIED
                <br />
                <span className="text-[9px] font-medium tracking-wide">ROOMNEST</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => navigate(`/search${cat.roomType ? `?roomType=${encodeURIComponent(cat.roomType)}` : ""}`)}
              className="card flex flex-col items-center gap-2 py-5 px-2 hover:-translate-y-0.5 hover:shadow-md transition-transform"
            >
              <cat.icon size={20} className="text-teal" />
              <span className="text-xs font-medium text-ink/80 text-center">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* POPULAR CITIES */}
      <section className="container-page py-14">
        <h2 className="font-display text-xl font-semibold text-ink mb-5">Popular cities</h2>
        <div className="flex flex-wrap gap-2.5">
          {popularCities.map((city) => (
            <Link
              key={city}
              to={`/search?city=${encodeURIComponent(city)}`}
              className="rounded-full border border-ink/12 bg-white px-4 py-2 text-sm font-medium text-ink/80 hover:border-teal hover:text-teal transition-colors"
            >
              {city}
            </Link>
          ))}
        </div>
      </section>

      {/* RENT CALCULATOR + ROOMMATE CTA */}
      <section className="container-page py-14">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <RentCalculator />
          <div className="card p-6 sm:p-8 bg-ink text-paper">
            <Users size={22} className="text-seal-light" />
            <h3 className="font-display text-lg font-semibold mt-4">Moving with someone splits the load.</h3>
            <p className="text-sm text-paper/70 mt-2 leading-relaxed">
              Post what you're looking for or browse people already searching for a flatmate in your city — same budget, same neighbourhood, less alone.
            </p>
            <Link to="/roommates" className="btn-seal mt-6 inline-flex">
              Find a roommate
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* RECENTLY VIEWED */}
      {recentlyViewed.length > 0 && (
        <section className="container-page py-10">
          <h2 className="font-display text-xl font-semibold text-ink mb-5">Recently viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentlyViewed.map((room) => (
              <Link
                key={room._id}
                to={`/rooms/${room._id}`}
                className="card shrink-0 w-56 overflow-hidden hover:-translate-y-0.5 transition-transform"
              >
                <img src={room.images?.[0]} alt={room.title} className="h-32 w-full object-cover" />
                <div className="p-3">
                  <p className="text-sm font-medium text-ink line-clamp-1">{room.title}</p>
                  <p className="text-xs text-slate-ink/55 mt-0.5">{room.area}, {room.city}</p>
                  <p className="font-mono text-sm font-semibold text-ink mt-1.5">₹{room.rent?.toLocaleString("en-IN")}/mo</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="container-page py-20 md:py-28">
        <div className="max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-teal">How it works</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-ink">
            Three steps between you and a room you can trust.
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-paper">
                <step.icon size={20} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-ink/65 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-ink py-20 md:py-28">
        <div className="container-page">
          <span className="text-xs font-semibold uppercase tracking-wide text-seal-light">What people say</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-paper max-w-lg">
            Real moves, real rooms.
          </h2>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-paper/10 bg-ink-700 p-6">
                <div className="flex gap-0.5 text-seal-light mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-seal-light" />
                  ))}
                </div>
                <p className="text-sm text-paper/80 leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 text-sm">
                  <div className="font-semibold text-paper">{t.name}</div>
                  <div className="text-paper/50 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 md:py-28 text-center">
        <MapPinned className="mx-auto text-teal" size={32} />
        <h2 className="mt-5 font-display text-3xl sm:text-4xl font-semibold text-ink max-w-xl mx-auto">
          Moving to a new city shouldn't mean rolling the dice on where you'll live.
        </h2>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate("/search")} className="btn-primary">
            Browse verified rooms
          </button>
          <button onClick={() => navigate("/list-your-property")} className="btn-secondary">
            List your property
          </button>
        </div>
      </section>
    </div>
  );
}
