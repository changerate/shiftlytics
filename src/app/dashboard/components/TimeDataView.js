"use client";
import { useEffect, useState } from "react";
import Button from "../../../ui/Button";

const TIME_PRESETS = [
  { key: "last7days", label: "7D", days: 7 },
  { key: "last30days", label: "30D", days: 30 },
  { key: "last90days", label: "90D", days: 90 },
  { key: "ytd", label: "YTD", isYTD: true },
  { key: "alltime", label: "ALL", isAllTime: true },
];

export default function TimeDataView({
  title = "Time Data Analytics",
  children,
  onTimeRangeChange,
  defaultTimeRange = "last7days",
  className = "",
}) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(defaultTimeRange);

  function buildDateRangeFromPreset(preset) {
    const now = new Date();
    if (preset.isAllTime) {
      return { startDate: null, endDate: null, preset: preset.key, label: preset.label };
    }
    if (preset.isYTD) {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { startDate: yearStart, endDate: now, preset: preset.key, label: preset.label };
    }
    const startDate = new Date();
    startDate.setDate(now.getDate() - (preset.days || 0));
    return { startDate, endDate: now, preset: preset.key, label: preset.label };
  }

  const handleTimeRangeChange = (preset) => {
    setSelectedTimeRange(preset.key);
    const dateRange = buildDateRangeFromPreset(preset);
    if (onTimeRangeChange) onTimeRangeChange(dateRange);
  };

  useEffect(() => {
    const initial = TIME_PRESETS.find((p) => p.key === defaultTimeRange) || TIME_PRESETS[0];
    handleTimeRangeChange(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`app-card ${className}`}>
      <div className="p-6 border-b border-accent">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>

          <div className="flex flex-wrap gap-2">
            {TIME_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                size="small"
                variant={selectedTimeRange === preset.key ? "primary" : "ghost"}
                onClick={() => handleTimeRangeChange(preset)}
                className="flex-shrink-0"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-2">
        {children ? (
          children
        ) : (
          <div className="flex items-center justify-center h-64 bg-surface-hover rounded-lg border border-border-light">
            <div className="text-center">
              <div className="text-4xl text-text-muted mb-3">dY"S</div>
              <p className="text-text-secondary">Graph components will be displayed here</p>
              <p className="text-sm text-text-muted mt-1">
                Currently showing data for:{" "}
                {TIME_PRESETS.find((p) => p.key === selectedTimeRange)?.label}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

