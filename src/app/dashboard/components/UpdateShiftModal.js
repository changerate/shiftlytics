"use client";
import { useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Button from "../../../ui/Button";
import TimeInput from "../../../ui/TimeInput";

const labelCls = "block text-sm font-medium text-slate-700 mb-2";
const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

function isoToHM(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function combine(baseIso, hm) {
  if (!baseIso || !hm) return null;
  const [h, m] = hm.split(":").map(Number);
  const base = new Date(baseIso);
  if (Number.isNaN(base.getTime())) return null;
  // Build ISO using the same UTC date as base, with provided HH:MM
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 0, 0, 0, 0));
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

export default function UpdateShiftModal({ shift, onClose, onSaved, onDeleted }) {
  const [shiftData, setShiftData] = useState(() => ({
    startTime: isoToHM(shift?.clock_in),
    endTime: isoToHM(shift?.clock_out),
    addLunch: Boolean(shift?.lunch_in && shift?.lunch_out),
    lunchInTime: isoToHM(shift?.lunch_in),
    lunchOutTime: isoToHM(shift?.lunch_out),
    notes: shift?.notes || "",
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onCancel = () => { if (!busy) onClose?.(); };
  const title = useMemo(() => `Edit Shift`, []);
  const baseIso = shift?.clock_in || shift?.clock_out || new Date().toISOString();
  const displayDate = useMemo(() => {
    const d = new Date(baseIso);
    return Number.isNaN(d.getTime())
      ? ""
      : `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }, [baseIso]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShiftData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const onSave = async (e) => {
    e?.preventDefault?.();
    setError("");
    setBusy(true);
    try {
      const { data: sessionWrap } = await supabase.auth.getSession();
      const token = sessionWrap?.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      const updates = {
        clock_in: combine(baseIso, shiftData.startTime),
        clock_out: combine(baseIso, shiftData.endTime),
        lunch_in: shiftData.addLunch ? combine(baseIso, shiftData.lunchInTime) : null,
        lunch_out: shiftData.addLunch ? combine(baseIso, shiftData.lunchOutTime) : null,
        notes: shiftData.notes || "",
      };
      let res = await fetch('/api/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: shift.id, updates }),
      });
      if (!res.ok) {
        // fallback to POST just in case
        res = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'update', id: shift.id, updates }),
        });
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Update failed (${res.status})`);
      }
      onSaved?.();
    } catch (err) {
      setError(err?.message || String(err));
    } finally { setBusy(false); }
  };

  const onDelete = async () => {
    if (!shift?.id) return;
    setError("");
    setBusy(true);
    try {
      const { data: sessionWrap } = await supabase.auth.getSession();
      const token = sessionWrap?.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      let res = await fetch('/api/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: shift.id }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Delete failed (${res.status})`);
      }
      onDeleted?.();
    } catch (err) {
      setError(err?.message || String(err));
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div>
        <div className="max-w-3xl mx-auto px-5">
          <div className="app-card overflow-hidden">
            <div className="section-header rounded-t-xl">
              <h2 className="text-base">Edit Shift</h2>
            </div>
            <form onSubmit={onSave} className="p-5 space-y-7">
              <div className="text-sm text-slate-600">Date: <span className="font-medium text-slate-900">{displayDate}</span></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="startTime" className={labelCls}>Clock In <span className="text-red-500">*</span></label>
                  <TimeInput id="startTime" name="startTime" value={shiftData.startTime} onChange={handleInputChange} required />
                </div>
                <div>
                  <label htmlFor="endTime" className={labelCls}>Clock Out <span className="text-red-500">*</span></label>
                  <TimeInput id="endTime" name="endTime" value={shiftData.endTime} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border-light bg-surface px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">Add a Lunch Break</div>
                  <div className="text-xs text-slate-600">Toggle on to enter lunch in/out times.</div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="addLunch" name="addLunch" checked={shiftData.addLunch} onChange={handleInputChange} className="sr-only peer" />
                  <span className="w-11 h-6 bg-slate-300 rounded-full relative transition peer-checked:bg-[var(--color-secondary-500)]" aria-hidden>
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition peer-checked:translate-x-5" />
                  </span>
                </label>
              </div>

              {shiftData.addLunch && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="lunchInTime" className={labelCls}>Lunch Out (start) <span className="text-red-500">*</span></label>
                    <TimeInput id="lunchInTime" name="lunchInTime" value={shiftData.lunchInTime} onChange={handleInputChange} required={shiftData.addLunch} />
                  </div>
                  <div>
                    <label htmlFor="lunchOutTime" className={labelCls}>Lunch In (end) <span className="text-red-500">*</span></label>
                    <TimeInput id="lunchOutTime" name="lunchOutTime" value={shiftData.lunchOutTime} onChange={handleInputChange} required={shiftData.addLunch} />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="notes" className={labelCls}>Notes</label>
                <textarea id="notes" name="notes" value={shiftData.notes} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-[var(--color-secondary-400)] focus:border-[var(--color-secondary-400)] transition" />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
                <Button type="submit" disabled={busy} variant="primary">{busy ? 'Saving…' : 'Save Changes'}</Button>
                <Button className= "bg-red-500 text-white font-bold" type="button" onClick={onDelete} disabled={busy} variant="noOutlineBlack">Delete</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
