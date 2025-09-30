"use client";
import { useState, useRef, useEffect, cloneElement } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useShifts } from "../../../context/ShiftsContext";

export default function Heatmap() {
  const { heatmapValues, loading, error } = useShifts();
  const containerRef = useRef(null);
  const [tip, setTip] = useState({ show: false, x: 0, y: 0, date: "", hours: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Responsive breakpoint watcher (feel free to tweak 640px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = `${year - 1}-12-31`;
  const endDate = `${year}-12-31`;

  const mobilestartDate = new Date().setMonth(now.getMonth() - 3);
  const mobileendDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);



  const classForValue = (value) => {
    if (!value || !value.count) return "color-empty";
    const h = Number(value.count) || 0;
    const bucket = h >= 8 ? 4 : h >= 6 ? 3 : h >= 3 ? 2 : 1;
    return `color-gitlab-${bucket}`;
  };

  const titleForValue = () => "";

  if (loading) return <div>Loading heatmap…</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  const handleEnter = (e, value) => {
    if (!value) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const hours = Number(value.count || 0).toFixed(2);
    setTip({
      show: true,
      x: (e.clientX - (rect?.left || 0)) + 10,
      y: (e.clientY - (rect?.top || 0)) + 10,
      date: value.date,
      hours,
    });
  };

  const handleLeave = () => setTip((t) => ({ ...t, show: false }));

  return (
    <div ref={containerRef} className="relative">
      <CalendarHeatmap
        startDate={!isMobile ? startDate : mobilestartDate}
        endDate={!isMobile ? endDate : mobileendDate}
        values={heatmapValues || []}
        classForValue={classForValue}
        titleForValue={titleForValue}
        showWeekdayLabels={!isMobile}    // hide weekday labels on mobile to save space
        gutterSize={isMobile ? 1 : 1}    // tighter spacing on mobile
        transformDayElement={(element, value) =>
          cloneElement(element, {
            onMouseEnter: (e) => handleEnter(e, value),
            onMouseMove: (e) => handleEnter(e, value),
            onMouseLeave: handleLeave,
            key: value?.date ?? element.key,
          })
        }
      />
      {tip.show && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          style={{ left: tip.x, top: tip.y }}
        >
          <div className="font-sm text-gray-900 dark:text-gray-100">{tip.date}</div>
          <div className="text-gray-700 dark:text-gray-300">Hours: {tip.hours}</div>
        </div>
      )}
    </div>
  );
}
