"use client";

import { useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useShifts } from "../../../context/ShiftsContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const enumerateDays = (start, end) => {
  const out = [];
  let cur = midnight(start);
  const last = midnight(end);
  while (cur <= last) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const da = String(cur.getDate()).padStart(2, "0");
    out.push(`${y}-${m}-${da}`);
    cur = addDays(cur, 1);
  }
  return out;
};
const rangeForPreset = (preset) => {
  const today = midnight(new Date());
  if (preset === "last30") return [addDays(today, -29), today];
  if (preset === "last90") return [addDays(today, -89), today];
  return [addDays(today, -6), today];
};

const palette = {
  netFill: "#3f6b72",
  netStroke: "#34565c",
  taxFill: "#9aa363",
  taxStroke: "#7d874f",
};

export default function IncomePie({ preset = "last7" }) {
  const { earningsByDay, loading, error } = useShifts();
  const [taxRatePct, setTaxRatePct] = useState(15);

  const gross = useMemo(() => {
    if (!earningsByDay) return 0;
    const [startD, endD] = rangeForPreset(preset);
    let total = 0;
    for (const key of enumerateDays(startD, endD)) {
      total += Number(earningsByDay.get(key) || 0);
    }
    return total;
  }, [earningsByDay, preset]);

  const taxes = Math.max(0, gross * (Number(taxRatePct) / 100));
  const net = Math.max(0, gross - taxes);

  const chartData = useMemo(
    () => ({
      labels: ["Net Income", "Taxes"],
      datasets: [
        {
          data: [Math.max(net, 0), Math.max(taxes, 0)],
          backgroundColor: [palette.netFill, palette.taxFill],
          borderColor: [palette.netStroke, palette.taxStroke],
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [net, taxes]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            padding: 16,
            color: "#475569",
            font: { size: 12 },
          },
        },
        // keep this comment outside the object in your file or use // like this
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = Number(ctx.raw ?? 0);
              return `${ctx.label}: $${val.toFixed(2)}`;
            },
          },
        },
      },
    }),
    []
  );

  const empty = !loading && !error && gross <= 0;

  return (
    <div className="min-w-0 w-full bg-white rounded-lg shadow-sm border border-border-light p-4 md:p-6 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h5 className="text-xl font-bold leading-none text-slate-900">Breakdown</h5>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-700"
            title="Net = Gross - estimated taxes. Adjust the rate to experiment."
            aria-label="About this breakdown"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 7a1 1 0 102 0 1 1 0 00-2 0zm.25 3.5a.75.75 0 000 1.5h.5V14a.75.75 0 001.5 0v-2.25A1.25 1.25 0 0010 10.5h-.75z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="taxRate" className="text-xs text-slate-500">Tax %</label>
          <input
            id="taxRate"
            type="number"
            min={0}
            max={60}
            step={1}
            value={taxRatePct}
            onChange={(e) => setTaxRatePct(e.target.value)}
            className="w-16 px-2 py-1 border border-border-light rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="py-4 flex-1">
        <div className="relative h-[240px] sm:h-[260px] md:h-[300px] rounded-xl border border-border-light bg-slate-50/70 flex items-center justify-center px-4">
          {loading ? (
            <div className="text-slate-500 text-sm">Loading...</div>
          ) : error ? (
            <div className="text-red-600 text-sm">{String(error)}</div>
          ) : empty ? (
            <div className="text-slate-500 text-sm">No earnings in range</div>
          ) : (
            <div className="w-full h-full">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Spacer footer to align with ShiftsGraph's footer (keeps dropdown rows level) */}
      <div className="mt-4 pt-3 border-t border-transparent flex items-center justify-between">
        <span className="text-sm invisible">spacer</span>
        <span className="text-sm invisible">spacer</span>
      </div>
    </div>
  );
}
