"use client";

import { useState } from "react";
import pdfToText from "react-pdftotext";

/* ---------- DATE REGEX ---------- */
const beginDateRegex = /(begin date|start date|begin)[\s:]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i;
const endDateRegex = /(end date|stop date|end)[\s:]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i;
// New combined fallback
const payPeriodRegex = /(pay\s*period)[\s:]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})\s*[-–]\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i;

/* ---------- HOURS HELPERS ---------- */
const hoursRegex = /\b(total\s+hours?|hours?\s+total|hrs\s+total|total\s+hrs)\b.*?([0-9]+(?:\.[0-9]{1,2})?)/i;

function extractFields(text) {
  let begin = text.match(beginDateRegex)?.[2] || null;
  let end = text.match(endDateRegex)?.[2] || null;

  // If both missing, check pay period line
  if (!begin && !end) {
    const pp = text.match(payPeriodRegex);
    if (pp) {
      begin = pp[2];
      end = pp[3];
    }
  }

  const hours = text.match(hoursRegex)?.[2] || null;
  return { beginDate: begin, endDate: end, totalHours: hours };
}

/* ---------- COMPONENT ---------- */
export default function AuditUploader() {
  const [form, setForm] = useState({ beginDate: "", endDate: "", totalHours: "" });
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

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
    } catch (err) {
      setError("Could not read PDF text.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Paystub Audit</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => e.target.files[0] && handleFiles(e.target.files[0])}
      />

      {fileName && <p className="mt-2 text-sm text-slate-500">File: {fileName}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Begin Date</label>
          <input
            className="border rounded w-full p-2"
            value={form.beginDate}
            onChange={(e) => setForm({ ...form, beginDate: e.target.value })}
            placeholder="MM/DD/YYYY"
          />
        </div>

        <div>
          <label className="block text-sm">End Date</label>
          <input
            className="border rounded w-full p-2"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            placeholder="MM/DD/YYYY"
          />
        </div>

        <div>
          <label className="block text-sm">Total Hours</label>
          <input
            type="number"
            className="border rounded w-full p-2"
            value={form.totalHours}
            onChange={(e) => setForm({ ...form, totalHours: e.target.value })}
            placeholder="e.g. 80"
          />
        </div>
      </div>
    </div>
  );
}
