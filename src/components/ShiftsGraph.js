"use client";
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import useStaleWhileRevalidate from '../hooks/useStaleWhileRevalidate';






const ShiftsGraph = ({ 
    timeRange = null,
    chartType = 'line', // 'line' or 'bar'
    refreshInterval = 30000, // 30 seconds
    className = '' 
}) => {
    // Fetcher function that calls our API
    const fetcher = async () => {
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }
        return response.json();
    };

    // Use our custom stale-while-revalidate hook
    const { data, error, isLoading, isValidating, mutate } = useStaleWhileRevalidate(
        'energy-usage-data', // cache key
        fetcher,
        {
            refreshInterval, // Auto-refresh every 30 seconds
            revalidateOnFocus: true, // Revalidate when window gains focus
            revalidateOnReconnect: true, // Revalidate when network reconnects
            staleTime: 10000, // Consider data stale after 10 seconds
            errorRetryCount: 3,
            errorRetryInterval: 5000,
        }
    );

    // Process and filter data based on time range
    const processedData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        let filteredData = [...data];

        // Filter by time range if provided
        if (timeRange && timeRange.startDate && timeRange.endDate) {
            const startTime = new Date(timeRange.startDate).getTime();
            const endTime = new Date(timeRange.endDate).getTime();
            
            filteredData = data.filter(item => {
                const itemDate = new Date(item.created_at || item.timestamp || item.date);
                const itemTime = itemDate.getTime();
                return itemTime >= startTime && itemTime <= endTime;
            });
        }

        // Sort by date/timestamp
        filteredData.sort((a, b) => {
            const dateA = new Date(a.created_at || a.timestamp || a.date);
            const dateB = new Date(b.created_at || b.timestamp || b.date);
            return dateA - dateB;
        });

        // Format data for recharts
        return filteredData.map((item, index) => {
            const date = new Date(item.created_at || item.timestamp || item.date || Date.now());
            
            return {
                id: item.id || index,
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString(),
                fullDate: date.toLocaleString(),
                usage: item.usage || item.shifts || item.value || 0,
                cost: item.cost || item.energy_cost || (item.usage * 0.15) || 0, // fallback calculation
                // Include all original fields for flexibility
                ...item
            };
        });
    }, [data, timeRange]);

    // Loading state
    if (isLoading && !data) {
        return (
            <div className={`flex items-center justify-center h-64 bg-surface-hover rounded-lg border border-border-light ${className}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading energy data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !data) {
        return (
            <div className={`flex items-center justify-center h-64 bg-surface-hover rounded-lg border border-border-light ${className}`}>
                <div className="text-center">
                    <div className="text-4xl text-red-500 mb-3">⚠️</div>
                    <p className="text-red-600 mb-2">Failed to load energy data</p>
                    <p className="text-sm text-text-muted mb-4">{error.message}</p>
                    <button 
                        onClick={() => mutate()}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No data state
    if (!processedData || processedData.length === 0) {
        return (
            <div className={`flex items-center justify-center h-64 bg-surface-hover rounded-lg border border-border-light ${className}`}>
                <div className="text-center">
                    <div className="text-4xl text-text-muted mb-3">📊</div>
                    <p className="text-text-secondary mb-2">No energy data available</p>
                    <p className="text-sm text-text-muted mb-4">
                        {timeRange ? `for the selected time range (${timeRange.label || 'Custom Range'})` : ''}
                    </p>
                    <button 
                        onClick={() => mutate()}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>
        );
    }

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-border-light rounded-lg shadow-lg">
                    <p className="font-semibold text-text-primary">{`Date: ${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.dataKey}: ${entry.value.toFixed(2)}`}
                            {entry.dataKey === 'usage' && ' kWh'}
                            {entry.dataKey === 'cost' && ' $'}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`bg-white rounded-lg p-6 ${className}`}>
            {/* Header with refresh indicator */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                    Shifts {timeRange && `(${timeRange.label})`}
                </h3>
                <div className="flex items-center gap-2">
                    {isValidating && (
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span>Updating...</span>
                        </div>
                    )}
                    <button 
                        onClick={() => mutate()}
                        className="px-3 py-1 text-sm bg-surface-hover hover:bg-surface text-text-secondary hover:text-text-primary rounded transition-colors"
                        disabled={isValidating}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                        <BarChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#666"
                                fontSize={12}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar 
                                dataKey="usage" 
                                fill="#3b82f6" 
                                name="Shifts (kWh)"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar 
                                dataKey="cost" 
                                fill="#10b981" 
                                name="Cost ($)"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    ) : (
                        <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#666"
                                fontSize={12}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="usage" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Shifts (kWh)"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="cost" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Cost ($)"
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Data summary */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t border-border-light pt-4">
                <div>
                    <p className="text-sm text-text-muted">Total Usage</p>
                    <p className="text-lg font-semibold text-text-primary">
                        {processedData.reduce((sum, item) => sum + (item.usage || 0), 0).toFixed(2)} kWh
                    </p>
                </div>
                <div>
                    <p className="text-sm text-text-muted">Total Cost</p>
                    <p className="text-lg font-semibold text-text-primary">
                        ${processedData.reduce((sum, item) => sum + (item.cost || 0), 0).toFixed(2)}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-text-muted">Data Points</p>
                    <p className="text-lg font-semibold text-text-primary">
                        {processedData.length}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShiftsGraph;
