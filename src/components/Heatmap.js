
"use client";
import { useShifts } from "../context/ShiftsContext";

export default function Heatmap() {
  const { shifts, loading, error } = useShifts();

  if (loading) return <div>Loading heatmap…</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <p>HEATMAP PLACEHOLDER</p>
      <p style={{ fontSize: 12, color: '#666' }}>Total shifts: {shifts.length}</p>
    </div>
  );
}
