"use client";
import { useShifts } from "../context/ShiftsContext";
import Button from "./Button";
import BasicMenu from "./BasicMenu";

const columns = [
  { key: "date", label: "Date" },
  { key: "earnings", label: "Earnings", format: v => `$${Number(v).toFixed(2)}` },
  { key: "clockIn", label: "Clock In" },
  { key: "clockOut", label: "Clock Out" },
  { key: "breakStart", label: "Break Start" },
  { key: "breakEnd", label: "Break End" },
  { key: "notes", label: "Notes" },
];

export default function Spreadsheet() {
  const { spreadsheetData = [], loading, error } = useShifts();

  if (loading) return <div>Loading…</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  // Define menu options for the spreadsheet
  const menuOptions = [
    {
      label: "Export to CSV",
      type: "button",
      onClick: () => {
        console.log("Exporting to CSV...");
        // Add CSV export logic here
      }
    },
    {
      label: "Export to PDF",
      type: "button",
      onClick: () => {
        console.log("Exporting to PDF...");
        // Add PDF export logic here
      }
    }
  ];

  return (
    <>
    <div className="mb-5 flex justify-end">
      <BasicMenu name="Actions" options={menuOptions} />
    </div>
    <div className="relative overflow-x-auto rounded-xl bg-[#f5f5f5] shadow-inner shadow-lg border border-gray-200">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-[#eeeeee] dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                scope="col"
                className={`px-6 py-3 ${idx === 0 ? "rounded-s-lg" : ""} ${idx === columns.length - 1 ? "rounded-e-lg" : ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spreadsheetData.map((row, idx) => (
            <tr key={row.date + idx} className="bg-white dark:bg-gray-800">
              {columns.map((col, colIdx) => (
                <td key={col.key} className="px-6 py-4">
                  {col.format ? col.format(row[col.key]) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-center space-x-4 py-4">
      <div>
        <Button
            variant="primary"
        >
            View More
        </Button>
      </div>
    </div>
    </>
  );
}
