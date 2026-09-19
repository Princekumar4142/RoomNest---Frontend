import { useState } from "react";
import { Calculator } from "lucide-react";

export default function RentCalculator() {
  const [income, setIncome] = useState(30000);
  const [existingExpenses, setExistingExpenses] = useState(5000);

  const recommendedRent = Math.max(0, Math.round(((income - existingExpenses) * 0.3) / 500) * 500);
  const stretchRent = Math.max(0, Math.round(((income - existingExpenses) * 0.4) / 500) * 500);

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10 text-teal">
          <Calculator size={17} />
        </span>
        <h3 className="font-display text-lg font-semibold text-ink">What can you afford?</h3>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <label className="font-medium text-ink/80">Monthly income</label>
            <span className="font-mono font-semibold text-ink">₹{income.toLocaleString("en-IN")}</span>
          </div>
          <input
            type="range"
            min="8000"
            max="200000"
            step="1000"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full accent-teal"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <label className="font-medium text-ink/80">Other monthly expenses</label>
            <span className="font-mono font-semibold text-ink">₹{existingExpenses.toLocaleString("en-IN")}</span>
          </div>
          <input
            type="range"
            min="0"
            max="60000"
            step="500"
            value={existingExpenses}
            onChange={(e) => setExistingExpenses(Number(e.target.value))}
            className="w-full accent-teal"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink/8 pt-6">
        <div>
          <p className="text-xs text-slate-ink/55">Comfortable budget</p>
          <p className="font-mono text-xl font-semibold text-teal mt-1">₹{recommendedRent.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-ink/45 mt-0.5">~30% of income</p>
        </div>
        <div>
          <p className="text-xs text-slate-ink/55">Upper limit</p>
          <p className="font-mono text-xl font-semibold text-ink mt-1">₹{stretchRent.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-ink/45 mt-0.5">~40% of income</p>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-slate-ink/45">
        A general rule of thumb, not financial advice — adjust for your city's cost of living.
      </p>
    </div>
  );
}
