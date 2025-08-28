"use client";
import { useState } from 'react';
import ShiftsGraph from './ShiftsGraph';
import Button from './Button';

const GraphDemo = ({ timeRange }) => {
    const [chartType, setChartType] = useState('line');
    const [refreshInterval, setRefreshInterval] = useState(30000);

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-surface rounded-lg p-4 border border-border-light">
                <h4 className="font-semibold text-text-primary mb-3">Graph Controls</h4>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-text-secondary">Chart Type:</label>
                        <div className="flex gap-1">
                            <Button
                                size="small"
                                variant={chartType === 'line' ? 'primary' : 'ghost'}
                                onClick={() => setChartType('line')}
                            >
                                Line
                            </Button>
                            <Button
                                size="small"
                                variant={chartType === 'bar' ? 'primary' : 'ghost'}
                                onClick={() => setChartType('bar')}
                            >
                                Bar
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-text-secondary">Auto-refresh:</label>
                        <select 
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="text-sm border border-border-light rounded px-2 py-1 bg-white"
                        >
                            <option value={0}>Off</option>
                            <option value={10000}>10 seconds</option>
                            <option value={30000}>30 seconds</option>
                            <option value={60000}>1 minute</option>
                            <option value={300000}>5 minutes</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Graph */}
            <ShiftsGraph 
                timeRange={timeRange}
                chartType={chartType}
                refreshInterval={refreshInterval}
                className="shadow-sm border border-border-light"
            />

            {/* Additional Examples */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ShiftsGraph 
                    timeRange={timeRange}
                    chartType="line"
                    refreshInterval={0}
                    className="shadow-sm border border-border-light"
                />
                <ShiftsGraph 
                    timeRange={timeRange}
                    chartType="bar"
                    refreshInterval={0}
                    className="shadow-sm border border-border-light"
                />
            </div> */}

            {/* Usage Information */}
            <div className="bg-surface-hover rounded-lg p-4 border border-border-light">
                <h4 className="font-semibold text-text-primary mb-3">Stale-While-Revalidate Features</h4>
                <div className="text-sm text-text-secondary space-y-2">
                    <p>✅ <strong>Immediate Data:</strong> Shows cached data instantly while fetching fresh data in background</p>
                    <p>✅ <strong>Auto-refresh:</strong> Configurable interval for automatic data updates</p>
                    <p>✅ <strong>Focus Revalidation:</strong> Fetches fresh data when window regains focus</p>
                    <p>✅ <strong>Network Recovery:</strong> Automatically refetches data when connection is restored</p>
                    <p>✅ <strong>Error Handling:</strong> Built-in retry logic with exponential backoff</p>
                    <p>✅ <strong>Time Range Filtering:</strong> Integrates with TimeDataView time range selection</p>
                    <p>✅ <strong>Loading States:</strong> Visual feedback for loading, error, and empty states</p>
                    <p>✅ <strong>Manual Refresh:</strong> Click the refresh button to manually update data</p>
                </div>
            </div>
        </div>
    );
};

export default GraphDemo;
