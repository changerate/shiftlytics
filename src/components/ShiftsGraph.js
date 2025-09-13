"use client";
import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useShifts } from "../context/ShiftsContext";

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const toDateOnly = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const enumerateDays = (start, end) => {
  if (!(start instanceof Date) || !(end instanceof Date)) return [];
  const out = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= last) {
    out.push(ymd(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};
const humanizeRange = (dr) => {
  if (!dr) return "the selected range";
  switch (dr.preset) {
    case "last7days": return "the last 7 days";
    case "last30days": return "the last 30 days";
    case "last90days": return "the last 90 days";
    case "ytd": return "year to date";
    case "alltime": return "all time";
    default: {
      const fmt = (d) => (d instanceof Date ? d.toLocaleDateString() : String(d ?? ""));
      if (dr.startDate && dr.endDate) return `from ${fmt(dr.startDate)} to ${fmt(dr.endDate)}`;
      return "the selected range";
    }
  }
};

export default function ShiftsGraph({ dateRange }) {
  const { chartData, earningsByDay, byDay, loading, error } = useShifts();

  // filter/pad using context maps only—no recomputation of earnings/hours.
  const paddedChartData = useMemo(() => {
    const startD = toDateOnly(dateRange?.startDate);
    const endD = toDateOnly(dateRange?.endDate);

    if (!startD || !endD) return Array.isArray(chartData) ? chartData : [];

    // build zero-padded rows across the range.
    return enumerateDays(startD, endD).map((key) => {
      const earnings = Number(earningsByDay.get(key) || 0);
      const hours = Number(byDay.get(key) || 0);
      const [y, m, d] = key.split("-");
      return {
        key,
        date: `${Number(m)}/${Number(d)}`,
        earnings,
        hours,
      };
    });
  }, [chartData, earningsByDay, byDay, dateRange?.startDate, dateRange?.endDate]);

  const allZero =
    paddedChartData.length > 0 &&
    paddedChartData.every((d) => d.earnings === 0 && d.hours === 0);

  const rangeText = humanizeRange(dateRange);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0]?.payload || {};
    return (
      <div className="rounded-md border border-border-light bg-surface p-3 shadow-sm">
        <div className="text-sm font-semibold text-text-primary">{label}</div>
        <div className="mt-2 text-sm">
          <div>Earnings: ${Number(p.earnings).toFixed(2)}</div>
          <div>Hours: {Number(p.hours).toFixed(2)}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: 420 }}>
      {loading && <p>Loading…</p>}
      {!loading && error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (paddedChartData.length === 0 || allZero) && (
        <div className="h-full w-full flex items-center justify-center">
          <div className="max-w-md w-full text-center bg-surface border border-border-light rounded-xl p-6 shadow-sm">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-surface-hover border border-border-light flex items-center justify-center text-2xl">
              📭
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              No shifts in {rangeText}.
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Try a different time range, or add a new shift to see it here.
            </p>
            <div className="mt-4">
              <a
                href="/addShift"
                className="inline-flex items-center rounded-lg border border-border-light px-3 py-2 text-sm font-medium hover:bg-surface-hover"
              >
                Add a Shift
              </a>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && paddedChartData.length > 0 && !allZero && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={paddedChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={20} />
            <YAxis yAxisId="left" tickFormatter={(v) => `$${Number(v).toFixed(0)}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="earnings" name="Earnings" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
