"use client";
import { useShifts } from "../context/ShiftsContext";
import Button from "./Button";

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

  return (
    <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-xl bg-clip-border">
      <table className="w-full text-left table-auto min-w-max">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                  {col.label}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spreadsheetData.map((row, idx) => (
            <tr key={row.date + idx}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.format ? col.format(row[col.key]) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Button />
      
    </div>
  );
}