"use client";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useShifts } from "../context/ShiftsContext";

export default function Heatmap() {
  const { heatmapValues, loading, error } = useShifts();

  const now = new Date();
  const year = now.getFullYear();

  // From (last year)-12-31 to (this year)-12-31
  const startDate = `${year - 1}-12-31`;
  const endDate = `${year}-12-31`;

  const classForValue = (value) => {
    if (!value || !value.count) return "color-empty";
    const h = Number(value.count) || 0;
    const bucket = h >= 8 ? 4 : h >= 6 ? 3 : h >= 3 ? 2 : 1;
    return `color-gitlab-${bucket}`;
  };

  const titleForValue = (value) => {
    if (!value || !value.date) return "";
    const hours = Number(value.count || 0).toFixed(2);
    return `${value.date}: ${hours}h`;
  };

  if (loading) return <div>Loading heatmap…</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <CalendarHeatmap
      startDate={startDate}
      endDate={endDate}
      values={heatmapValues || []}
      classForValue={classForValue}
      titleForValue={titleForValue}
      showWeekdayLabels
    />
  );
}
