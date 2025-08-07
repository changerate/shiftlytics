"use client";
import { useState } from 'react';
import Button from './Button';

const TIME_PRESETS = [
    { key: 'last7days', label: '7D', days: 7 },
    { key: 'last30days', label: '30D', days: 30 },
    { key: 'last90days', label: '90D', days: 90 },
    { key: 'ytd', label: 'YTD', isYTD: true },
    { key: 'alltime', label: 'ALL', isAllTime: true }
];





export default function TimeDataView({ 
    title = "Time Data Analytics",
    children,
    onTimeRangeChange,
    defaultTimeRange = 'last7days',
    className = ''
}) {
    const [selectedTimeRange, setSelectedTimeRange] = useState(defaultTimeRange);

    const handleTimeRangeChange = (timePreset) => {
        setSelectedTimeRange(timePreset.key);
        
        let dateRange = {};
        const now = new Date();
        
        if (timePreset.isAllTime) {
            dateRange = {
                startDate: null,
                endDate: null,
                preset: timePreset.key,
                label: timePreset.label
            };
        } else if (timePreset.isYTD) {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            dateRange = {
                startDate: yearStart,
                endDate: now,
                preset: timePreset.key,
                label: timePreset.label
            };
        } else {
        const startDate = new Date();
        startDate.setDate(now.getDate() - timePreset.days);
        dateRange = {
            startDate: startDate,
            endDate: now,
            preset: timePreset.key,
            label: timePreset.label
        };
        }
    
        // Call the callback function if provided
        if (onTimeRangeChange) {
        onTimeRangeChange(dateRange);
        }
    };


    return (
        <div className={`bg-surface rounded-lg shadow-sm border border-border-light ${className}`}>
                {/* Header with title and time range selector */}
                    <div className="p-6 border-b  border-accent">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
                            
                            {/* Time Range Selector */}
                            <div className="flex flex-wrap gap-2">
                                {TIME_PRESETS.map((preset) => (
                                <Button
                                    key={preset.key}
                                    size="small"
                                    variant={selectedTimeRange === preset.key ? 'primary' : 'ghost'}
                                    onClick={() => handleTimeRangeChange(preset)}
                                    className="flex-shrink-0"
                                >
                                {preset.label}
                            </Button>
                            ))}
                        </div>
                    </div>
                </div>

            {/* Content Area for Graphs */}
                <div className="p-2">
                    {children ? (
                        children
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-surface-hover rounded-lg border border-border-light">
                            <div className="text-center">
                                <div className="text-4xl text-text-muted mb-3">📊</div>
                                <p className="text-text-secondary">Graph components will be displayed here</p>
                                <p className="text-sm text-text-muted mt-1">
                                Currently showing data for: {TIME_PRESETS.find(p => p.key === selectedTimeRange)?.label}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
        </div>
  );
}
