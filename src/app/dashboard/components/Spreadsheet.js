"use client";
import { useMemo, useState } from "react";
import { useShifts } from "../../../context/ShiftsContext";
import BasicMenu from "../../../ui/BasicMenu";
import { DocumentArrowDownIcon, ArrowDownTrayIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import UpdateShiftModal from "./UpdateShiftModal";

function formatClockTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

const columns = [
  { key: "_edit", label: "" },
  { key: "date", label: "Date" },
  { key: "earnings", label: "Earnings", format: v => `$${Number(v).toFixed(2)}` },
  { key: "clockIn", label: "Clock In", format: formatClockTime },
  { key: "clockOut", label: "Clock Out", format: formatClockTime },
  { key: "breakStart", label: "Break Start", format: formatClockTime },
  { key: "breakEnd", label: "Break End", format: formatClockTime },
  { key: "notes", label: "Notes" },
];

function exportToCSV(data, columns, filename = `spreadsheet-${new Date().toISOString().slice(0,10)}.csv`) {
  const header = columns.map(col => col.label).join(",");
  const rows = data.map(row =>
    columns.map(col => {
      const value = col.format ? col.format(row[col.key]) : row[col.key];
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(",")
  );
  const csvContent = [header, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

async function exportToPDF(data, columns, filename = `spreadsheet-${new Date().toISOString().slice(0,10)}.pdf`) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  const doc = new jsPDF();
  const tableColumn = columns.map(col => col.label);
  const tableRows = data.map(row =>
    columns.map(col => col.format ? col.format(row[col.key]) : row[col.key])
  );
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
  });
  doc.save(filename);
}

export default function Spreadsheet() {
  const { spreadsheetData = [], shiftsEnhanced = [], loading, error, refresh } = useShifts();
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(null);
  const exportColumns = useMemo(() => columns.filter(c => c.key !== "_edit"), []);
  const [editing, setEditing] = useState(null); // shift object

  const enhancedById = useMemo(() => {
    const m = new Map();
    for (const s of shiftsEnhanced || []) m.set(s.id, s);
    return m;
  }, [shiftsEnhanced]);

  const menuOptions = [
    {
      label: exporting === 'csv' ? 'Exporting CSV…' : 'Export to CSV',
      type: 'button',
      disabled: loading || spreadsheetData.length === 0 || !!exporting,
      icon: <ArrowDownTrayIcon className="size-4" aria-hidden />,
      onClick: async () => {
        try { setExporting('csv'); exportToCSV(spreadsheetData, exportColumns); } finally { setExporting(null); }
      },
    },
    {
      label: exporting === 'pdf' ? 'Exporting PDF…' : 'Export to PDF',
      type: 'button',
      disabled: loading || spreadsheetData.length === 0 || !!exporting,
      icon: <DocumentArrowDownIcon className="size-4" aria-hidden />,
      onClick: async () => {
        try { setExporting('pdf'); await exportToPDF(spreadsheetData, exportColumns); } finally { setExporting(null); }
      },
    },
  ];

  const visibleRows = expanded ? spreadsheetData : spreadsheetData.slice(0, 3);

  return (
    <>
      <div className="mb-5 flex justify-end sm:justify-end justify-between">
        <BasicMenu name="Export" options={menuOptions} />
      </div>
      <div
        className="relative rounded-2xl border border-neutral-300/80 dark:border-gray-700 
        bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-gray-800 dark:to-gray-900 
        shadow-[inset_8px_8px_16px_rgba(0,0,0,0.12),_inset_-8px_-8px_16px_rgba(255,255,255,0.7)] 
        dark:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.55),_inset_-8px_-8px_16px_rgba(255,255,255,0.05)]"
      >
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div
            className={`transition-all duration-500 ease-in-out ${
              expanded ? "max-h-[1000px]" : "max-h-[260px]"
            } overflow-hidden rounded-2xl`}
          >
            <table className="w-full text-xs sm:text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
              <thead className="text-[11px] sm:text-xs uppercase text-neutral-600 dark:text-neutral-300 bg-transparent border-b border-neutral-300/70 dark:border-gray-700">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 ${idx === 0 ? "rounded-s-lg" : ""} ${idx === columns.length - 1 ? "rounded-e-lg" : ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, idx) => (
                  <tr key={row.date + idx} className="odd:bg-neutral-50/60 even:bg-neutral-200/30 dark:odd:bg-gray-800 dark:even:bg-gray-900">
                    {columns.map((col) => {
                      if (col.key === "_edit") {
                        return (
                          <td key="_edit" className="px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 border-b border-neutral-200/70 dark:border-gray-700/70">
                            <button
                              className="inline-flex items-center justify-center rounded-md border border-[color:var(--color-border-light)] px-2 py-1 text-sm hover:bg-[color:var(--color-surface-hover)]"
                              onClick={() => {
                                const full = enhancedById.get(row.id);
                                setEditing(full || null);
                              }}
                              aria-label="Edit shift"
                              title="Edit shift"
                            >
                              <PencilSquareIcon className="size-4" aria-hidden />
                            </button>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className="px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 border-b border-neutral-200/70 dark:border-gray-700/70">
                          {col.format ? col.format(row[col.key]) : row[col.key]}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!expanded && (spreadsheetData.length - 3) > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-12 h-12 
            bg-gradient-to-t from-neutral-200/90 via-neutral-200/40 to-transparent 
            dark:from-gray-900/90 dark:via-gray-900/40" />
        )}

        {spreadsheetData.length > 3 && (
          <div className="flex justify-center items-center px-4 py-3 border-t border-neutral-300/70 dark:border-gray-700">
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md 
                bg-neutral-100/70 text-gray-800 hover:bg-neutral-200/80 
                dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-700 
                transition-colors shadow-inner border border-neutral-300 dark:border-gray-700"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
            >
              {expanded ? "Show less" : `View ${Math.max(0, spreadsheetData.length - 3)} more shift${(spreadsheetData.length - 3) === 1 ? "" : "s"}`}
              <span className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
          </div>
        )}
      </div>
      {/* End table view */}
      {editing && (
        <UpdateShiftModal
          shift={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
          onDeleted={() => { setEditing(null); refresh(); }}
        />
      )}
    </>
  );
}


