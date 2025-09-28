"use client";

import { useState } from "react";
import pdfToText from "react-pdftotext";
import Button from "../../../ui/Button";
import { useShifts } from "../../../context/ShiftsContext";

const beginDateRegex = /(begin date|start date|begin)[\s:]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i;
const endDateRegex = /(end date|stop date|end)[\s:]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i;
const payPeriodRegex = /(pay\s*period)[\s:]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})\s*[-�?"]\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i;

const hoursRegex = /\b(?:total\s+(?:hours?|hrs)\s*(?:worked)?|hours?\s*(?:worked|total)|hrs\s*total)\b[\s:\-]*([0-9]{1,3}(?:\.[0-9]{1,2})?)/i;

const hoursAcrossLinesRegex = new RegExp(
  String.raw`\b(?:total\s+(?:hours?|hrs)\s*(?:worked)?|hours?\s*(?:worked|total)|hrs\s*total)\b[\s:\-]*[\s\S]{0,80}?([0-9]{1,3}(?:\.[0-9]{1,2})?)`,
  "i"
);

const totalRowHoursRegex = new RegExp(
  String.raw`\bTOTAL\b[\s:\-]*[\s\S]{0,80}?([0-9]{1,3}(?:\.[0-9]{1,2})?)`,
  "i"
);

// normalize unique characters (dashes, backslashes)
function normalize(text) {
  return text
    .replace(/\u00A0/g, " ")
    .replace(/[�?"�?"]/g, "-")
    .replace(/[ \t]+/g, " ");
}

function extractFields(rawText) {
  const text = normalize(rawText);
  let begin = text.match(beginDateRegex)?.[2] || null;
  let end = text.match(endDateRegex)?.[2] || null;
  if (!begin && !end) {
    const pp = text.match(payPeriodRegex);
    if (pp) {
      begin = pp[2];
      end = pp[3];
    }
  }
  // try hours w/ multiple patterns
  let hours =
    text.match(hoursRegex)?.[1] ||
    text.match(hoursAcrossLinesRegex)?.[1] ||
    text.match(totalRowHoursRegex)?.[1] ||
    null;
  return { beginDate: begin, endDate: end, totalHours: hours };
}



function DatetoIso(dateStr) {
  const [month, day, year] = dateStr.split("/").map(Number);
  const iso = new Date(Date.UTC(year, month - 1, day)).toISOString();
  console.log(iso)
  return iso;
}


function beginaudit(form, shifts = []) {
  const startIso = DatetoIso(form.beginDate); 
  const endIso   = DatetoIso(form.endDate);  
  if (!startIso || !endIso) return 0;

  // normalize ISO dates so time doesn't mess with filtering
  const s = new Date(startIso);
  const e = new Date(endIso);

  const startBoundMs = Date.UTC(
    s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), 0, 0, 0, 0
  );
  const endBoundMs = Date.UTC(
    e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), 23, 59, 59, 999
  );

  let total = 0;
  for (const sft of Array.isArray(shifts) ? shifts : []) {
    const ci = new Date(sft.clock_in);
    const ciMs = ci.getTime();
    if (!Number.isFinite(ciMs)) continue;

    if (ciMs >= startBoundMs && ciMs <= endBoundMs) {
      total += Number(sft.hoursWorked || 0);
    }
  }

  return Number(total.toFixed(2));
}


export default function AuditUploader() {
  const [form, setForm] = useState({ beginDate: "", endDate: "", totalHours: "" });
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const { shiftsEnhanced = [] } = useShifts();
  const [auditTotalHours, setAuditTotalHours] = useState(null);

  const handleFiles = async (file) => {
    try {
      const text = await pdfToText(file);
      const { beginDate, endDate, totalHours } = extractFields(text);
      setForm({
        beginDate: beginDate || "",
        endDate: endDate || "",
        totalHours: totalHours || "",
      });
      setFileName(file.name);
      setError("");
    } catch {
      setError("Could not read PDF text.");
    }
  };

  // helper: format number safely
  const fmt = (n) =>
    typeof n === "number" && Number.isFinite(n) ? n.toFixed(2) : String(n ?? "");

  // derive verdict block
  const verdictBlock = (() => {
    if (auditTotalHours === null) return null;

    const computed = auditTotalHours; // from shifts
    const claimed = parseFloat(form.totalHours);

    // No shifts recorded in range
    if (computed === 0) {
      return (
        <div className="mt-3 rounded border border-slate-300 bg-slate-50 p-3 text-slate-800">
          <div className="font-semibold">No shifts found for this date range.</div>
          <div className="text-sm">
            We didn&apos;t find any recorded clock-ins between {form.beginDate} and {form.endDate}.
          </div>
        </div>
      );
    }

    // If claimed is missing/invalid, just show computed
    if (!Number.isFinite(claimed) || claimed <= 0) {
      return (
        <div className="mt-3 rounded border border-blue-300 bg-blue-50 p-3 text-blue-800">
          <div className="font-semibold">Computed hours</div>
          <div className="text-sm">
            Based on your recorded shifts, we computed <span className="font-semibold">{fmt(computed)}</span> hours.
            Add a valid “Total Hours” to compare against the paystub.
          </div>
        </div>
      );
    }

    const diffPct = Math.abs(computed - claimed) / claimed * 100;

    if (diffPct <= 10) {
      return (
        <div className="mt-3 rounded border border-green-300 bg-green-50 p-3 text-green-900">
          <div className="font-semibold">✅ Looks accurate</div>
          <div className="text-sm">
            Paystub hours: <span className="font-semibold">{fmt(claimed)}</span> •
            Computed hours: <span className="font-semibold">{fmt(computed)}</span> •
            Diff: ~{fmt(diffPct)}%
          </div>
        </div>
      );
    }

    if (diffPct > 30) {
      return (
        <div className="mt-3 rounded border border-red-300 bg-red-50 p-3 text-red-900">
          <div className="font-semibold">❗ This looks off</div>
          <div className="text-sm">
            Paystub hours: <span className="font-semibold">{fmt(claimed)}</span> •
            Computed hours: <span className="font-semibold">{fmt(computed)}</span> •
            Diff: ~{fmt(diffPct)}%
          </div>
        </div>
      );
    }

    if (diffPct > 20) {
      return (
        <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-amber-900">
          <div className="font-semibold">⚠️ Discrepancies detected</div>
          <div className="text-sm">
            Paystub hours: <span className="font-semibold">{fmt(claimed)}</span> •
            Computed hours: <span className="font-semibold">{fmt(computed)}</span> •
            Diff: ~{fmt(diffPct)}%
          </div>
        </div>
      );
    }

    // Between 10% and 20%: minor variance
    return (
      <div className="mt-3 rounded border border-yellow-300 bg-yellow-50 p-3 text-yellow-900">
        <div className="font-semibold">ℹ️ Small variance</div>
        <div className="text-sm">
          Paystub hours: <span className="font-semibold">{fmt(claimed)}</span> •
          Computed hours: <span className="font-semibold">{fmt(computed)}</span> •
          Diff: ~{fmt(diffPct)}%
        </div>
      </div>
    );
  })();

  return (
    <div className="mx-auto max-w-xl">
          <div className="flex items-center gap-3">
            <label className="btn btn-outline cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0])}
                className="hidden"
              />
              Upload PDF
            </label>

            {fileName && (
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                File: <span className="font-medium text-[color:var(--color-text-primary)]">{fileName}</span>
              </p>
            )}
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <div className="mt-5 grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm text-[color:var(--color-text-secondary)]">Begin Date</label>
              <input
                className="input"
                value={form.beginDate}
                onChange={(e) => setForm({ ...form, beginDate: e.target.value })}
                placeholder="MM/DD/YYYY"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[color:var(--color-text-secondary)]">End Date</label>
              <input
                className="input"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                placeholder="MM/DD/YYYY"
              />
            </div>

            {/* this hours parser is not always very accurate, hard to parse. if number is too large or too small, warn user*/}
            <div>
              <label className="mb-1 block text-sm text-[color:var(--color-text-secondary)]">Total Hours</label>
              <input
                type="number"
                className="input"
                value={form.totalHours}
                onChange={(e) => setForm({ ...form, totalHours: e.target.value })}
                placeholder="e.g. 80"
              />
              {(() => {
                const n = parseFloat(form.totalHours);
                const outOfBounds = Number.isFinite(n) && (n < 10 || n > 80);
                return outOfBounds ? (
                  <p className="mt-2 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--surface-alt)] px-3 py-2 text-sm text-[color:var(--color-text-secondary)]">
                    We&apos;re unsure about the hours (outside typical range).
                  </p>
                ) : null;
              })()}
            </div>
          </div>
          <div className="flex-shrink-0 mt-6 font-bold ">
            <Button
              className="btn btn-primary !shadow-none"
              variant="secondary"
              size="medium"
              onClick={() => setAuditTotalHours(beginaudit(form, shiftsEnhanced))}
            >
              Begin Audit
            </Button>
          </div>
          {auditTotalHours !== null && (
            <>
              <div className="mt-4 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--surface-alt)] p-3">
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  Computed hours in range: <span className="font-medium text-[color:var(--color-text-primary)]">{fmt(auditTotalHours)}</span>
                </p>
                <div className="mt-2">{verdictBlock}</div>
              </div>
            </>
          )}
    </div>
  );
}
