"use client";
import { useEffect, useMemo, useState } from "react";
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
import { supabase } from "../lib/supabaseClient";
import { getUserWages } from "../utils/wageUtils";

export default function ShiftsGraph({ dateRange, defaultRate = 0 }) {
  const [shifts, setShifts] = useState([]);
  const [wageMap, setWageMap] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ---------- date helpers ----------
  const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
  const toDate = (v) => {
    if (v instanceof Date) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
    if (typeof v === "string" || typeof v === "number") {
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    return null;
  };
  const ymdLocal = (d) =>
    d instanceof Date
      ? `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
      : null;
  const enumerateDays = (start, end) => {
    if (!(start instanceof Date) || !(end instanceof Date)) return [];
    const out = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    while (cur <= last) {
      out.push(ymdLocal(cur));
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

  // ---------- load shifts + wages ----------
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const user = authData?.user;
        if (!user) {
          setError("No authenticated user. Please log in.");
          setShifts([]); setWageMap({});
          return;
        }

        const startD = toDate(dateRange?.startDate);
        const endD = toDate(dateRange?.endDate);
        const params = new URLSearchParams({ userId: user.id });
        if (startD && endD) {
          params.set("start", ymdLocal(startD));
          params.set("end", ymdLocal(endD));
        }

        const res = await fetch(`/api/data?${params.toString()}`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const rows = await res.json();
        setShifts(Array.isArray(rows) ? rows : []);

        const wagesRes = await getUserWages(user.id);
        if (!wagesRes.success) {
          console.warn("Wages fetch error:", wagesRes.error);
          setWageMap({});
        } else {
          const map = {};
          (wagesRes.wages || []).forEach((w) => {
            const key = (w.position_title || "").toLowerCase().trim();
            if (!key) return;
            map[key] = {
              amount: Number(w.amount) || 0,
              occurrence: (w.occurrence || "hourly").toLowerCase(),
            };
          });
          setWageMap(map);
        }
      } catch (e) {
        setError(e?.message || String(e));
        setShifts([]); setWageMap({});
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dateRange?.startDate, dateRange?.endDate]);

  // ---------- filter ----------
  const filtered = useMemo(() => {
    if (!Array.isArray(shifts)) return [];
    const startD = toDate(dateRange?.startDate);
    const endD = toDate(dateRange?.endDate);
    if (!startD || !endD) return shifts;

    const startMs = startD.getTime();
    const endMs = new Date(endD.getFullYear(), endD.getMonth(), endD.getDate(), 23, 59, 59, 999).getTime();

    return shifts.filter((s) => {
      const t = new Date(s.clock_in).getTime();
      return !Number.isNaN(t) && t >= startMs && t <= endMs;
    });
  }, [shifts, dateRange?.startDate, dateRange?.endDate]);

  // ---------- aggregate per day (earnings, hours, roles) ----------
  const aggregatedByDay = useMemo(() => {
    const day = new Map();
    for (const row of filtered) {
      const d = new Date(row.clock_in);
      if (Number.isNaN(d.getTime())) continue;
      const dayKey = ymdLocal(d);

      const start = row.clock_in ? new Date(row.clock_in) : null;
      const end   = row.clock_out ? new Date(row.clock_out) : null;
      if (!start || !end) continue;

      let ms = Math.max(0, end - start);
      if (row.lunch_in && row.lunch_out) {
        ms -= Math.max(0, new Date(row.lunch_out) - new Date(row.lunch_in));
      }
      const hours = ms / (1000 * 60 * 60);

      const pos = (row.position_title || "").toLowerCase().trim();
      const wage = wageMap[pos];
      const rate = Number.isFinite(wage?.amount) ? wage.amount : defaultRate;
      const occ  = (wage?.occurrence || "hourly").toLowerCase();

      let earned = 0;
      if (occ === "hourly") earned = hours * rate;
      else if (occ === "per_shift" || occ === "flat" || occ === "shift") earned = rate;
      else if (occ === "per_day" || occ === "daily") earned = rate; // simple per-day stipend
      else earned = hours * rate;

      const prev = day.get(dayKey) || { hours: 0, earnings: 0, roles: new Set() };
      prev.hours += hours;
      prev.earnings += earned;
      prev.roles.add(row.position_title || "Unknown");

      day.set(dayKey, prev);
    }
    return day;
  }, [filtered, wageMap, defaultRate]);

  // ---------- padded chart data ----------
  const paddedChartData = useMemo(() => {
    const startD = toDate(dateRange?.startDate);
    const endD = toDate(dateRange?.endDate);
    if (!startD || !endD) return [];

    return enumerateDays(startD, endD).map((key) => {
      const agg = aggregatedByDay.get(key) || { earnings: 0, hours: 0, roles: new Set() };
      const [y, m, dd] = key.split("-");
      return {
        key,
        date: `${Number(m)}/${Number(dd)}`,
        earnings: agg.earnings,
        hours: agg.hours,
        roles: Array.from(agg.roles).join(", "),
      };
    });
  }, [aggregatedByDay, dateRange?.startDate, dateRange?.endDate]);

  const allZero = paddedChartData.length > 0 && paddedChartData.every(d => d.earnings === 0 && d.hours === 0);
  const rangeText = humanizeRange(dateRange);

  // ---------- custom tooltip to show earnings + hours + roles ----------
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0]?.payload || {};
    return (
      <div className="rounded-md border border-border-light bg-surface p-3 shadow-sm">
        <div className="text-sm font-semibold text-text-primary">{label}</div>
        <div className="mt-1 text-sm text-text-secondary">
          Role{(p.roles || "").includes(",") ? "s" : ""}: {p.roles || "—"}
        </div>
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
              <a href="/addShift" className="inline-flex items-center rounded-lg border border-border-light px-3 py-2 text-sm font-medium hover:bg-surface-hover">
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
