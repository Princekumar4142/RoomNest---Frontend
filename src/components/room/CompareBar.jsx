import { Link } from "react-router-dom";
import { X, Scale } from "lucide-react";
import { useCompare } from "../../context/CompareContext";

export default function CompareBar() {
  const { items, toggleCompare, clearCompare } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 w-[92%] max-w-xl">
      <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-ink px-4 py-3 shadow-2xl">
        <Scale size={16} className="text-seal-light shrink-0" />
        <div className="flex flex-1 gap-2 overflow-x-auto">
          {items.map((room) => (
            <div key={room._id} className="flex items-center gap-1.5 rounded-full bg-paper/10 pl-2.5 pr-1.5 py-1 shrink-0">
              <span className="text-xs font-medium text-paper max-w-[120px] truncate">{room.title}</span>
              <button onClick={() => toggleCompare(room)} className="text-paper/60 hover:text-paper">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <Link
          to="/compare"
          className="shrink-0 rounded-full bg-seal px-4 py-2 text-xs font-semibold text-ink hover:bg-seal-light"
        >
          Compare ({items.length})
        </Link>
        <button onClick={clearCompare} className="shrink-0 text-xs text-paper/50 hover:text-paper">
          Clear
        </button>
      </div>
    </div>
  );
}
