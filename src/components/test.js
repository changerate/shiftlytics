"use client";
import { useMemo } from "react";
import { useShifts } from "../context/ShiftsContext";

export default function RecentShifts() {
  const { user, shiftsEnhanced = [], loading, error, refresh } = useShifts();

  const recent = useMemo(() => {
    return [...(shiftsEnhanced || [])]
      .sort((a, b) => new Date(b.clock_in) - new Date(a.clock_in))
      .slice(0, 3);
  }, [shiftsEnhanced]);

  const fmtDate = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const fmtTime = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
      .format(Number(n || 0));

  // hours -> subtle left-border color
  const hourTone = (h) =>
    h >= 8 ? "border-emerald-500/70"
      : h >= 6 ? "border-emerald-400/70"
      : h >= 3 ? "border-amber-400/70"
      : "border-gray-300";

  if (loading) {
    return (
      <div className="p-4 grid gap-3">
        {[0,1,2].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-28 bg-gray-200 rounded" />
            </div>
            <div className="mt-3 h-6 w-64 bg-gray-200 rounded" />
            <div className="mt-3 h-4 w-full bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 border border-red-200 rounded-xl bg-red-50">
        Error: {error}
      </div>
    );
  }

  return (
    <section className="p-4">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recent Shifts</h3>
          <p className="text-sm text-gray-500">{user?.email || "—"}</p>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 active:scale-[0.98]"
          aria-label="Refresh recent shifts"
        >
          Refresh
        </button>
      </header>

      {recent.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-2 h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">📭</div>
          <p className="text-sm text-gray-600">No shifts yet. Add one to see it here.</p>
          <a href="/addShift" className="mt-3 inline-block rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
            Add a Shift
          </a>
        </div>
      ) : (
        <ol className="relative ml-4 grid gap-3">
          {/* vertical line */}
          <span className="absolute left-[-1px] top-0 h-full w-[2px] bg-gray-200" aria-hidden />
          {recent.map((s, idx) => (
            <li key={s.id || s.clock_in} className="relative">
              {/* dot */}
              <span
                className="absolute -left-[9px] top-5 h-3 w-3 rounded-full bg-gray-300 ring-4 ring-white"
                aria-hidden
              />
              <article
                tabIndex={0}
                className={`outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl border ${hourTone(
                  Number(s.hoursWorked || 0)
                )} border-l-4 border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md`}
              >
                {/* top row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{fmtDate(s.clock_in)}</div>
                  <div className="text-sm text-gray-500">
                    {fmtTime(s.clock_in)} <span className="mx-1">—</span> {fmtTime(s.clock_out)}
                  </div>
                </div>

                {/* chips */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium">
                    {s.position_title || "—"}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium">
                    {Number(s.hoursWorked ?? 0).toFixed(2)}h
                  </span>
                  {"earned" in s && (
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium">
                      {fmtMoney(s.earned)}
                    </span>
                  )}
                </div>

                {/* notes */}
                <div className="mt-3 border-t border-dashed border-gray-200 pt-3">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Notes</div>
                  <p className="text-sm text-gray-800 line-clamp-3">
                    {s.notes?.trim() || "—"}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
