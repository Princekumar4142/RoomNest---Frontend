import { Link } from "react-router-dom";
import { Check, X as XIcon, Scale } from "lucide-react";
import { useCompare } from "../context/CompareContext";

const AMENITY_ROWS = [
  { key: "wifi", label: "WiFi" },
  { key: "ac", label: "AC" },
  { key: "attachedBathroom", label: "Attached Bathroom" },
  { key: "kitchen", label: "Kitchen" },
  { key: "parking", label: "Parking" },
  { key: "petFriendly", label: "Pet Friendly" },
];

export default function ComparePage() {
  const { items, toggleCompare } = useCompare();

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <Scale className="mx-auto text-ink/20" size={40} />
        <p className="font-display text-lg text-ink mt-4">Nothing to compare yet.</p>
        <p className="text-sm text-slate-ink/60 mt-1 mb-6">Tap the compare icon on any room card to add it here.</p>
        <Link to="/search" className="btn-primary inline-flex">Browse rooms</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-8">Compare rooms</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="w-40" />
              {items.map((room) => (
                <th key={room._id} className="p-3 text-left align-top">
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={room.images?.[0]} alt="" className="h-32 w-full object-cover" />
                    <button
                      onClick={() => toggleCompare(room)}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-paper/90"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                  <Link to={`/rooms/${room._id}`} className="mt-2 block font-display text-sm font-semibold text-ink hover:text-teal">
                    {room.title}
                  </Link>
                  <p className="text-xs text-slate-ink/60 mt-0.5">{room.area}, {room.city}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-t border-ink/8">
              <td className="p-3 text-slate-ink/60 font-medium">Rent</td>
              {items.map((room) => (
                <td key={room._id} className="p-3 font-mono font-semibold text-ink">₹{room.rent?.toLocaleString("en-IN")}/mo</td>
              ))}
            </tr>
            <tr className="border-t border-ink/8">
              <td className="p-3 text-slate-ink/60 font-medium">Room type</td>
              {items.map((room) => <td key={room._id} className="p-3">{room.roomType}</td>)}
            </tr>
            <tr className="border-t border-ink/8">
              <td className="p-3 text-slate-ink/60 font-medium">Occupancy</td>
              {items.map((room) => <td key={room._id} className="p-3">{room.occupancy}</td>)}
            </tr>
            <tr className="border-t border-ink/8">
              <td className="p-3 text-slate-ink/60 font-medium">Furnishing</td>
              {items.map((room) => <td key={room._id} className="p-3">{room.furnishing}</td>)}
            </tr>
            <tr className="border-t border-ink/8">
              <td className="p-3 text-slate-ink/60 font-medium">Rating</td>
              {items.map((room) => (
                <td key={room._id} className="p-3">
                  {room.ratingCount > 0 ? `${room.ratingAverage} ★ (${room.ratingCount})` : "No reviews yet"}
                </td>
              ))}
            </tr>
            {AMENITY_ROWS.map((a) => (
              <tr key={a.key} className="border-t border-ink/8">
                <td className="p-3 text-slate-ink/60 font-medium">{a.label}</td>
                {items.map((room) => (
                  <td key={room._id} className="p-3">
                    {room.amenities?.[a.key] ? (
                      <Check size={16} className="text-teal" />
                    ) : (
                      <XIcon size={16} className="text-ink/25" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
