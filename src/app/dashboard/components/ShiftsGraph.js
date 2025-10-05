"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { useShifts } from "../../../context/ShiftsContext";

const fmtCurrency = (n) => `$${Number(n || 0).toFixed(2)}`;

/**
 * Pixel-snap wrapper to prevent sub-pixel width changes while scrolling,
 * which cause Recharts to re-measure and blink axis labels.
 */
function useSnappedWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width || 0;
      // Round to nearest integer to avoid sub-pixel churn
      const snapped = Math.round(w);
      if (snapped !== width) setWidth(snapped);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [width]);

  return [ref, width];
}

export default function ShiftsGraph({ height, preset: presetProp, onPresetChange }) {
  const { loading, error, selectors, shiftsEnhanced = [] } = useShifts();

  const [mode, setMode] = useState("earnings");
  const [internalPreset, setInternalPreset] = useState("last7");
  const preset = presetProp ?? internalPreset;
  const setPreset = onPresetChange ?? setInternalPreset;

  const [openDrop, setOpenDrop] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!dropRef.current) return;
      if (!dropRef.current.contains(e.target)) setOpenDrop(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const series = useMemo(() => selectors.buildSeries(preset), [selectors, preset]);

  const rolesByDay = useMemo(() => {
    const map = new Map();
    const start = series?.start instanceof Date ? series.start : null;
    const end = series?.end instanceof Date ? series.end : null;
    const inRange = (d) => {
      if (!(start && end && d instanceof Date)) return false;
      const ymd = (dd) =>
        `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}-${String(dd.getDate()).padStart(2, "0")}`;
      const k = ymd(d);
      const sk = ymd(start);
      const ek = ymd(end);
      return k >= sk && k <= ek;
    };

    for (const s of shiftsEnhanced) {
      const dayKey =
        s.dayKey ||
        (() => {
          const di = new Date(s.clock_in);
          if (Number.isNaN(di.getTime())) return null;
          return `${di.getFullYear()}-${String(di.getMonth() + 1).padStart(2, "0")}-${String(
            di.getDate()
          ).padStart(2, "0")}`;
        })();

      if (!dayKey) continue;

      if (series?.start && series?.end) {
        const di = new Date(s.clock_in);
        if (!(di instanceof Date) || Number.isNaN(di.getTime()) || !inRange(di)) continue;
      }

      const role = (s.position_title || "").toString().trim();
      if (!role) continue;

      if (!map.has(dayKey)) map.set(dayKey, new Set());
      map.get(dayKey).add(role);
    }
    return map;
  }, [shiftsEnhanced, series?.start, series?.end]);

  const statValue =
    mode === "hours"
      ? `${Number(series.totals.hours || 0).toFixed(2)} hours`
      : fmtCurrency(series.totals.earnings || 0);

  const noData = useMemo(() => {
    const arr = series?.data || [];
    if (!arr.length) return true;
    return arr.every((d) => Number(d.earnings || 0) === 0 && Number(d.hours || 0) === 0);
  }, [series]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0]?.payload || {};
    const rolesSet = rolesByDay.get(p.key);
    const roles = rolesSet ? Array.from(rolesSet) : [];
    return (
      <div className="rounded-md border border-border-light bg-white/95 backdrop-blur p-3 shadow-lg">
        <div className="text-sm font-semibold text-text-primary">{p.date}</div>
        <div className="mt-2 text-sm text-text-secondary space-y-1">
          {mode !== "hours" && (
            <div>
              Earnings: <span className="text-text-primary font-medium">{fmtCurrency(p.earnings)}</span>
            </div>
          )}
          {mode !== "earnings" && (
            <div>
              Hours: <span className="text-text-primary font-medium">{Number(p.hours || 0).toFixed(2)}</span>
            </div>
          )}
          {roles.length > 0 && <div>Roles: {roles.join(", ")}</div>}
        </div>
      </div>
    );
  };

  const optionsLabel =
    preset === "last7" ? "Last 7 days" :
    preset === "last30" ? "Last 30 days" :
    preset === "last90" ? "Last 90 days" : "Last 7 days";

  const [snapRef, snappedWidth] = useSnappedWidth();

  return (
    <div className="relative min-w-0 max-w-full w-full bg-white rounded-lg shadow-sm p-4 md:p-6 border border-border-light flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h5 className="leading-none text-3xl font-bold text-slate-900 pb-2">
            {statValue}
          </h5>
          <p className="text-base font-normal text-slate-500">
            {mode === "hours" ? "Hours" : "Earnings"} in {series.label}
          </p>
        </div>
      </div>

      {/* Mode toggles */}
      <div className="flex items-center gap-1.5 mt-4">
        {["earnings", "hours"].map((m) => (
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
            {m === "earnings" ? "Earnings" : "Hours"}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div
        ref={snapRef}
        className={`w-full mt-3 overflow-hidden outline-none focus:outline-none ${
          !height ? "h-[240px] sm:h-[260px] md:h-[300px]" : ""
        }`}
        style={height ? { height, outline: "none" } : { outline: "none" }}
        tabIndex={-1}
      >
        <div
          className="h-full"
          style={{
            // Lock to integer width to stop X-axis flicker
            width: snappedWidth ? `${snappedWidth}px` : "100%",
          }}
        >
          {loading && (
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-10 w-10 rounded-full border-2 border-slate-300 border-t-primary animate-spin" aria-label="Loading" />
            </div>
          )}

          {!loading && error && (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-sm text-red-600">{String(error)}</div>
            </div>
          )}

          {!loading && !error && noData && (
            <div className="h-full w-full flex items-center justify-center px-2 sm:px-4">
              <div className="w-full mx-auto text-center rounded-xl border border-border-light bg-white/95 backdrop-blur shadow-sm box-border p-4 sm:p-5 max-w-[min(26rem,100%)] max-h-[calc(100%-1.25rem)] overflow-auto">
                <div className="flex items-center justify-center mb-3">
                  <img src="/clock.svg" alt="No data" className="h-14 w-14 md:h-16 md:w-16 opacity-70" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No shifts in this range</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Try a different date range, or add your latest shift.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && !noData && (
            <ResponsiveContainer
              width="100%"
              height="100%"
              debounce={150}
              className="outline-none focus:outline-none"
            >
              <AreaChart data={series.data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="areaEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary-600)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--color-primary-600)" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="areaHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-secondary-500)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--color-secondary-500)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="2 2" />
                <XAxis
                  dataKey="date"
                  interval="preserveStartEnd"
                  minTickGap={20}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(0,0,0,0.14)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "rgba(0,0,0,0.14)" }}
                  tickFormatter={(v) => (mode === "hours" ? Number(v || 0).toFixed(2) : `$${Number(v || 0).toFixed(0)}`)}
                />
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 40 }} />

                {mode === "earnings" ? (
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    name="Earnings"
                    stroke="var(--color-primary-600)"
                    fill="url(#areaEarnings)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="hours"
                    name="Hours"
                    stroke="var(--color-secondary-500)"
                    fill="url(#areaHours)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between">
        <div className="relative" ref={dropRef}>
          <button
            type="button"
            onClick={() => setOpenDrop((s) => !s)}
            aria-haspopup="menu"
            aria-expanded={openDrop ? "true" : "false"}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center"
          >
            {optionsLabel}
            <svg className="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>

          {openDrop && (
            <div
              role="menu"
              className="z-50 absolute left-0 top-full mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 border border-border-light"
            >
              <ul className="py-2 text-sm text-gray-700" aria-label="Select date range">
                {[
                  { id: "last7", label: "Last 7 days" },
                  { id: "last30", label: "Last 30 days" },
                  { id: "last90", label: "Last 90 days" },
                ].map(({ id, label }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => { setPreset(id); setOpenDrop(false); }}
                      className={`w-full text-left block px-4 py-2 hover:bg-gray-100 ${preset === id ? "font-semibold text-slate-900" : ""}`}
                      role="menuitem"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <a
          href="/paycheck-audit"
          className="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-secondary-300 hover:text-secondary-500 px-3 py-2"
        >
          Audit Paycheck
          <svg className="w-2.5 h-2.5 ms-1.5 rtl:rotate-180" viewBox="0 0 6 10" fill="none">
            <path d="m1 9 4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
