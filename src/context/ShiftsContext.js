"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getUserWages } from "../utils/wageUtils";

const ShiftsContext = createContext(null);

export function ShiftsProvider({ children }) {
  const [user, setUser] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [wages, setWages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Auth via Supabase
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const currentUser = authData?.user;
        if (!currentUser) throw new Error("Not authenticated");
        if (!cancelled) setUser(currentUser);

        // Shifts via existing API route
        const res = await fetch(`/api/data?userId=${encodeURIComponent(currentUser.id)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`API /api/data error: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setShifts(Array.isArray(json) ? json : []);

        // Wages via existing utility (direct Supabase)
        const wagesRes = await getUserWages(currentUser.id);
        if (!cancelled) setWages(wagesRes.success ? (wagesRes.wages || []) : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadTick]);

  const refresh = useCallback(() => setReloadTick((n) => n + 1), []);

  const wagesMap = useMemo(() => {
    const map = new Map();
    for (const w of wages || []) {
      if (w?.position_title) {
        map.set(w.position_title, { amount: w.amount, occurrence: w.occurrence });
      }
    }
    return map;
  }, [wages]);

  const { shiftsEnhanced, byDay, heatmapValues, earningsByDay, chartData, spreadsheetData } = useMemo(() => {
    // helpers
    const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
    const toDayKey = (d) => {
      if (!(d instanceof Date)) return null;
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    };
    const safeDate = (v) => {
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const wagesLower = new Map();
    wagesMap.forEach((val, key) => wagesLower.set(String(key).toLowerCase().trim(), val));

    const enhanced = [];
    const hoursByDay = new Map();
    const earningsByDayLocal = new Map();

    for (const s of Array.isArray(shifts) ? shifts : []) {
      const start = safeDate(s.clock_in);
      const end = safeDate(s.clock_out);
      const li = safeDate(s.lunch_in);
      const lo = safeDate(s.lunch_out);
      let ms = 0;
      if (start && end) {
        ms = Math.max(0, end - start);
        if (li && lo) ms -= Math.max(0, lo - li);
      }
      const hoursWorked = ms / (1000 * 60 * 60);
      const dayKey = start ? toDayKey(start) : null;

      // wage/earnings
      const posKey = String(s.position_title || '').toLowerCase().trim();
      const wage = wagesLower.get(posKey);
      const rate = Number(wage?.amount) || 0;
      const occ = String(wage?.occurrence || 'hourly').toLowerCase();
      let earned = 0;
      if (occ === 'hourly') earned = hoursWorked * rate;
      else if (occ === 'per_shift' || occ === 'flat' || occ === 'shift') earned = rate;
      else if (occ === 'per_day' || occ === 'daily') earned = rate;
      else earned = hoursWorked * rate;

      enhanced.push({ ...s, hoursWorked, dayKey, earned });

      if (dayKey) {
        hoursByDay.set(dayKey, (hoursByDay.get(dayKey) || 0) + hoursWorked);
        earningsByDayLocal.set(dayKey, (earningsByDayLocal.get(dayKey) || 0) + earned);
      }
    }

    const heatmapVals = Array.from(hoursByDay.entries()).map(([date, hours]) => ({ date, count: Number(hours.toFixed(2)) }));

    const chart = Array.from(earningsByDayLocal.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, earnings]) => {
        const hours = hoursByDay.get(date) || 0;
        const [y, m, d] = date.split('-');
        return {
          key: date,
          date: `${Number(m)}/${Number(d)}`,
          earnings,
          hours,
        };
      });

    const spreadsheetData = enhanced.map(s => ({
      date: s.dayKey || "",
      clockIn: s.clock_in || "",
      clockOut: s.clock_out || "",
      earnings: s.earned || 0,
      breakStart: s.lunch_in || "",
      breakEnd: s.lunch_out || "",
      notes: s.notes || "",
    }));

    return {
      shiftsEnhanced: enhanced,
      byDay: hoursByDay,
      heatmapValues: heatmapVals,
      earningsByDay: earningsByDayLocal,
      chartData: chart,
      spreadsheetData,
    };
  }, [shifts, wagesMap]);

  const value = useMemo(
    () => ({
      user,
      shifts,
      shiftsEnhanced,
      wages,
      wagesMap,
      byDay,
      heatmapValues,
      earningsByDay,
      chartData,
      spreadsheetData,
      loading,
      error,
      refresh,
    }),
    [
      user,
      shifts,
      shiftsEnhanced,
      wages,
      wagesMap,
      byDay,
      heatmapValues,
      earningsByDay,
      chartData,
      spreadsheetData,
      loading,
      error,
      refresh,
    ]
  );

  return <ShiftsContext.Provider value={value}>{children}</ShiftsContext.Provider>;
}

export function useShifts() {
  const ctx = useContext(ShiftsContext);
  if (!ctx) throw new Error("useShifts must be used within a ShiftsProvider");
  return ctx;
}
