import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { roomApi } from "../../api/endpoints";

const VERDICT_META = {
  below_average: { label: "Below area average", icon: TrendingDown, className: "text-teal bg-teal/10" },
  above_average: { label: "Above area average", icon: TrendingUp, className: "text-seal-dark bg-seal-light/30" },
  typical: { label: "Typical for this area", icon: Minus, className: "text-slate-ink/70 bg-ink/6" },
};

export default function RentInsight({ roomId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    roomApi.rentInsight(roomId).then((res) => setData(res.data)).catch(() => setData(null));
  }, [roomId]);

  if (!data || !data.hasData) return null;

  const meta = VERDICT_META[data.verdict];

  return (
    <div className="card p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-ink/50 mb-3">
        Rent insight
      </h3>
      <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold w-fit ${meta.className}`}>
        <meta.icon size={13} />
        {meta.label}
      </div>
      <p className="mt-3 text-sm text-slate-ink/70">
        This room is <span className="font-semibold text-ink">₹{data.thisRoomRent.toLocaleString("en-IN")}</span>,
        compared to an average of{" "}
        <span className="font-semibold text-ink">₹{data.areaAverage.toLocaleString("en-IN")}</span> across{" "}
        {data.sampleSize} similar verified listings in this city.
      </p>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-ink/50">
        <span>₹{data.areaMin.toLocaleString("en-IN")}</span>
        <div className="relative h-1.5 flex-1 rounded-full bg-ink/8">
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-ink"
            style={{
              left: `${Math.min(100, Math.max(0, ((data.thisRoomRent - data.areaMin) / (data.areaMax - data.areaMin || 1)) * 100))}%`,
            }}
          />
        </div>
        <span>₹{data.areaMax.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
