"use client";
import { useMemo, useState } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useShifts } from "../../../context/ShiftsContext";

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
  while (cur <= last) { out.push(ymd(cur)); cur.setDate(cur.getDate() + 1); }
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
const fmtCurrency = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtHours = (n) => Number(n || 0).toFixed(2);

// NEW: robust normalization for any incoming chartData shape
function normalizeRow(row) {
  // Common possible fields from contexts/backends
  const keyRaw = row.key || row.dayKey || row.dateKey || row.date || row.day;
  let key;
  // Try to coerce to YYYY-MM-DD
  if (keyRaw instanceof Date) key = ymd(keyRaw);
  else if (typeof keyRaw === "string") {
    const d = new Date(keyRaw);
    key = Number.isNaN(d.getTime()) ? keyRaw : ymd(d);
  }
  // Fallback: if row has year/month/day numbers
  if (!key && typeof row.year === "number" && typeof row.month === "number" && typeof row.day === "number") {
    key = `${row.year}-${pad2(row.month)}-${pad2(row.day)}`;
  }

  let earnings = row.earnings ?? row.totalEarnings ?? row.sumEarnings ?? 0;
  let hours = row.hours ?? row.totalHours ?? row.sumHours ?? 0;

  // Build display date (M/D) from key if possible
  let dateDisp = row.dateLabel;
  if (!dateDisp && key && /^\d{4}-\d{2}-\d{2}$/.test(key)) {
    const [y, m, d] = key.split("-");
    dateDisp = `${Number(m)}/${Number(d)}`;
  }
  // Last resort: use raw `date` or `label`
  if (!dateDisp) dateDisp = row.date || row.label || String(key ?? "");

  return {
    key: key ?? String(dateDisp),
    date: dateDisp,
    earnings: Number(earnings) || 0,
    hours: Number(hours) || 0,
  };
}

export default function ShiftsGraph({ dateRange, height = 380 }) {
  const { chartData, earningsByDay, byDay, shiftsEnhanced = [], loading, error } = useShifts();
  const [mode, setMode] = useState("earnings"); // 'earnings' | 'hours' | 'both'

  const paddedChartData = useMemo(() => {
    const startD = toDateOnly(dateRange?.startDate);
    const endD = toDateOnly(dateRange?.endDate);

    // If we have explicit dates → build dense series from maps
    if (startD && endD) {
      return enumerateDays(startD, endD).map((key) => {
        const earnings = Number(earningsByDay.get(key) || 0);
        const hours = Number(byDay.get(key) || 0);
        const [y, m, d] = key.split("-");
        return { key, date: `${Number(m)}/${Number(d)}`, earnings, hours };
        });
    }

    // ELSE (e.g., "All") → normalize whatever `chartData` shape is
    if (Array.isArray(chartData)) {
      return chartData.map(normalizeRow);
    }
    return [];
  }, [chartData, earningsByDay, byDay, dateRange?.startDate, dateRange?.endDate]);

  const allZero = paddedChartData.length > 0 && paddedChartData.every(d => d.earnings === 0 && d.hours === 0);
  const rangeText = humanizeRange(dateRange);

  const rolesByDay = useMemo(() => {
    const map = new Map();
    for (const s of shiftsEnhanced || []) {
      const key = s.dayKey;
      if (!key) continue;
      const title = (s.position_title || "").toString().trim();
      if (!title) continue;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(title);
    }
    return map;
  }, [shiftsEnhanced]);

  const Header = () => (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <div className="text-sm text-text-secondary">
        Showing <span className="font-medium text-text-primary">{rangeText}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {["earnings", "hours", "both"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={[
              "px-3 py-1.5 rounded-full text-sm border transition",
              mode === m
                ? "bg-primary text-text-on-primary border-transparent"
                : "border-border-light bg-white hover:bg-surface-hover text-text-primary",
            ].join(" ")}
            aria-pressed={mode === m}
          >
            {m === "earnings" ? "Earnings" : m === "hours" ? "Hours" : "Both"}
          </button>
        ))}
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0]?.payload || {};
    const roleSet = rolesByDay.get(p.key);
    const roles = roleSet ? Array.from(roleSet) : [];
    return (
      <div className="rounded-md border border-border-light bg-white/95 backdrop-blur p-3 shadow-lg">
        <div className="text-sm font-semibold text-text-primary">{p.date}</div>
        <div className="mt-2 text-sm text-text-secondary space-y-1">
          {mode !== "hours" && <div>Earnings: <span className="text-text-primary font-medium">{fmtCurrency(p.earnings)}</span></div>}
          {mode !== "earnings" && <div>Hours: <span className="text-text-primary font-medium">{fmtHours(p.hours)}</span></div>}
          {roles.length > 0 && <div>Roles: {roles.join(", ")}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full" style={{ height }}>
      {loading && (
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-full max-w-md p-6">
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="h-40 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {!loading && !error && (paddedChartData.length === 0 || allZero) && (
        <div className="h-full w-full flex items-center justify-center">
          <div className="max-w-md w-full text-center bg-surface border border-border-light rounded-xl p-6 shadow-sm">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-surface-hover border border-border-light flex items-center justify-center text-lg">
              📊
            </div>
            <h3 className="text-lg font-semibold text-text-primary">No shifts in {rangeText}.</h3>
            <p className="mt-1 text-sm text-text-secondary">Try a different time range, or add a new shift to see it here.</p>
            <div className="mt-4">
              <a href="/addShift" className="inline-flex items-center rounded-lg border border-border-light px-3 py-2 text-sm font-medium hover:bg-surface-hover">
                Add a Shift
              </a>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && paddedChartData.length > 0 && !allZero && (
        <>
          <Header />
          <div className="h-[calc(100%-2.5rem)] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paddedChartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={20} tickLine={false} axisLine={{ stroke: "rgba(0,0,0,0.14)" }} />
                <YAxis tickLine={false} axisLine={{ stroke: "rgba(0,0,0,0.14)" }}
                  tickFormatter={(v) => (mode === "hours" ? fmtHours(v) : `$${Number(v).toFixed(0)}`)} />
                <Tooltip content={<CustomTooltip />} />
                {(mode === "earnings" || mode === "both") && (
                  <Bar dataKey="earnings" name="Earnings" fill="var(--color-primary-600)" radius={[8,8,0,0]} maxBarSize={32} animationDuration={260} />
                )}
                {(mode === "hours" || mode === "both") && (
                  <Bar dataKey="hours" name="Hours" fill="var(--color-secondary-500)" radius={[8,8,0,0]} maxBarSize={32} animationDuration={320} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
