"use client";
import { useShifts } from "../context/ShiftsContext";

export default function Test() {
  const { user, shifts, loading, error, refresh } = useShifts();

  if (loading) return <div>Loading shifts…</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0 }}>Shifts for {user?.email}</h3>
        <button onClick={refresh} style={{ padding: "4px 8px" }}>Refresh</button>
      </div>
      {shifts.length === 0 ? (
        <div>No shifts found for this user.</div>
      ) : (
        <pre>{JSON.stringify(shifts, null, 2)}</pre>
      )}
    </div>
  );
}

