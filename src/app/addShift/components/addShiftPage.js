"use client";

import Button from '../../../ui/Button.js';
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TimeInput from "../../../components/TimeInput";
import CustomWageSelector from "../../../components/CustomWageSelector";
import { createShift, validateShiftTimes } from "../../../utils/shiftUtils.js";
import { supabase } from "../../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";

export default function AddShiftPage() {
  const [shiftData, setShiftData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
    lunchInTime: "",
    lunchOutTime: "",
    addLunch: false,
    wageId: "",
    notes: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const router = useRouter();

  // prevent side-to-side scroll at the page level
  useEffect(() => {
    const prev = document.body.style.overflowX;
    document.body.style.overflowX = "hidden";
    return () => { document.body.style.overflowX = prev; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShiftData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError("");
  };

  // quick duration helpers (for live preview)
  const parseHM = (t) => {
    // expects "HH:MM"
    if (!t || !/^\d{2}:\d{2}$/.test(t)) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const durationInfo = useMemo(() => {
    const start = parseHM(shiftData.startTime);
    const end = parseHM(shiftData.endTime);
    const li = parseHM(shiftData.lunchInTime);
    const lo = parseHM(shiftData.lunchOutTime);

    if (start == null || end == null) return { total: null, work: null, lunch: null };

    // handle overnight by assuming end next day if end < start
    const endAdj = end < start ? end + 24 * 60 : end;
    let total = endAdj - start;

    let lunch = 0;
    if (shiftData.addLunch && li != null && lo != null) {
      const loAdj = lo < li ? lo + 24 * 60 : lo;
      lunch = Math.max(0, loAdj - li);
    }

    const work = Math.max(0, total - lunch);
    return { total, work, lunch };
  }, [shiftData]);

  // client-side validity (to disable submit + show live hint)
  useEffect(() => {
    const v = validateShiftTimes(shiftData);
    setHint(v.valid ? "" : v.error || "");
  }, [shiftData]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // run validation first
    const timeValidation = validateShiftTimes(shiftData);
    if (!timeValidation.valid) {
      setError(timeValidation.error);
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const result = await createShift(shiftData, user.id);
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating shift:', err);
      setError('Failed to create shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => router.back();

  const card = {
    initial: { opacity: 0, y: 14, scale: .99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: .3, ease: "easeOut" } }
  };

  const labelCls = "block text-sm font-medium text-slate-700 mb-2";
  const sectionTitle = (t) => (
    <div className="section-header rounded-t-xl">
      <span className="section-dot" />
      <h2 className="text-base">{t}</h2>
    </div>
  );

  const isSubmitDisabled = loading || !!hint || !shiftData.date || !shiftData.startTime || !shiftData.endTime || !shiftData.wageId;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-5">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">Add New Shift</h1>
            <p className="mt-1 text-slate-600 text-sm">Enter your shift details. Duration and breaks are calculated automatically.</p>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-2 text-sm font-medium text-text-primary border border-border-light rounded-lg bg-white hover:bg-surface-hover"
          >
            ← Back
          </button>
        </div>

        {/* Main card */}
        <motion.div {...card} className="app-card overflow-hidden">
          {sectionTitle("Shift Details")}
          <form onSubmit={onSubmit} className="p-5 space-y-7">
            {/* Date & Wage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="date" className={labelCls}>Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={shiftData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-[var(--color-secondary-400)] focus:border-[var(--color-secondary-400)] transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="wageId" className={labelCls}>Wage <span className="text-red-500">*</span></label>
                <CustomWageSelector
                  name="wageId"
                  value={shiftData.wageId}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="startTime" className={labelCls}>Clock In <span className="text-red-500">*</span></label>
                <TimeInput
                  id="startTime"
                  name="startTime"
                  value={shiftData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className={labelCls}>Clock Out <span className="text-red-500">*</span></label>
                <TimeInput
                  id="endTime"
                  name="endTime"
                  value={shiftData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Lunch toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border-light bg-surface px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Add a Lunch Break</div>
                <div className="text-xs text-slate-600">Toggle on to enter lunch in/out times.</div>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="addLunch"
                  name="addLunch"
                  checked={shiftData.addLunch}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <span
                  className="w-11 h-6 bg-slate-300 rounded-full relative transition
                             peer-checked:bg-[var(--color-secondary-500)]"
                  aria-hidden
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition
                               peer-checked:translate-x-5"
                  />
                </span>
              </label>
            </div>

            {/* Lunch times (animated mount) */}
            <AnimatePresence initial={false}>
              {shiftData.addLunch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: .2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                >
                  <div>
                    <label htmlFor="lunchInTime" className={labelCls}>Lunch Out (start) <span className="text-red-500">*</span></label>
                    <TimeInput
                      id="lunchInTime"
                      name="lunchInTime"
                      value={shiftData.lunchInTime}
                      onChange={handleInputChange}
                      required={shiftData.addLunch}
                    />
                  </div>
                  <div>
                    <label htmlFor="lunchOutTime" className={labelCls}>Lunch In (end) <span className="text-red-500">*</span></label>
                    <TimeInput
                      id="lunchOutTime"
                      name="lunchOutTime"
                      value={shiftData.lunchOutTime}
                      onChange={handleInputChange}
                      required={shiftData.addLunch}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className={labelCls}>Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={shiftData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-[var(--color-secondary-400)] focus:border-[var(--color-secondary-400)] transition"
                placeholder="Add any additional notes or special instructions…"
              />
            </div>

            {/* Live summary */}
            <div className="rounded-lg border border-border-light bg-surface p-4">
              <div className="flex items-start gap-2">
                {hint ? (
                  <ExclamationTriangleIcon className="size-5 text-amber-500 mt-0.5" />
                ) : (
                  <CheckCircleIcon className="size-5 text-green-600 mt-0.5" />
                )}
                <div className="text-sm">
                  {hint ? (
                    <span className="text-slate-700">{hint}</span>
                  ) : (
                    <span className="text-slate-700">
                      {durationInfo.work != null
                        ? <>
                            Estimated <span className="font-medium">{fmtMins(durationInfo.work)}</span> of paid time
                            {durationInfo.lunch ? <> (lunch {fmtMins(durationInfo.lunch)})</> : null}
                          </>
                        : "Fill in start and end times to see duration."}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Errors */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" onClick={onCancel} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitDisabled} variant="primary">
                {loading ? 'Creating Shift…' : 'Create Shift'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function fmtMins(mins) {
  if (mins == null) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
