# Stale-While-Revalidate Graph Components

This implementation provides a robust stale-while-revalidate (SWR) pattern for data fetching and visualization, designed to work seamlessly with the existing graph components in your application.

## Components Overview

### 1. `useStaleWhileRevalidate` Hook (`src/hooks/useStaleWhileRevalidate.js`)

A custom React hook that implements the stale-while-revalidate pattern with the following features:

- **Immediate Data Display**: Shows cached data instantly while fetching fresh data in the background
- **Auto-refresh**: Configurable intervals for automatic data updates
- **Focus Revalidation**: Automatically refetches data when window regains focus
- **Network Recovery**: Handles network reconnection gracefully
- **Error Handling**: Built-in retry logic with exponential backoff
- **Deduplication**: Prevents duplicate requests within a specified time window

#### Usage
```javascript
const { data, error, isLoading, isValidating, mutate } = useStaleWhileRevalidate(
  'cache-key',
  fetcherFunction,
  {
    refreshInterval: 30000, // 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    staleTime: 10000, // 10 seconds
    errorRetryCount: 3,
    errorRetryInterval: 5000
  }
);
```

### 2. `ShiftsGraph` Component (`src/components/ShiftsGraph.js`)

A React component that visualizes shifts data using Recharts with stale-while-revalidate functionality:

- **Chart Types**: Supports both line and bar charts
- **Time Range Filtering**: Integrates with TimeDataView time range selection  
- **Real-time Updates**: Auto-refreshes data based on configuration
- **Loading States**: Provides visual feedback for loading, error, and empty states
- **Interactive Features**: Manual refresh button and hover tooltips
- **Data Processing**: Automatically formats and filters data for visualization

#### Props
```javascript
<ShiftsGraph 
  timeRange={timeRangeObject}     // Time range filter from TimeDataView
  chartType="line"                // 'line' or 'bar'
  refreshInterval={30000}         // Auto-refresh interval in ms
  className="custom-styles"       // Additional CSS classes
/>
```

### 3. `GraphDemo` Component (`src/components/GraphDemo.js`)

A demonstration component showcasing different variations and features:

- **Interactive Controls**: Switch between chart types and adjust refresh intervals
- **Multiple Examples**: Shows different configurations side by side
- **Feature Documentation**: Built-in explanation of SWR features

## Integration with TimeDataView

The components are designed to work seamlessly within the existing `TimeDataView` component:

```javascript
<TimeDataView 
  title="Shifts Analytics"
  onTimeRangeChange={handleTimeRangeChange}
  defaultTimeRange="last30days"
>
  <ShiftsGraph 
    timeRange={currentTimeRange}
    chartType="line"
    refreshInterval={30000}
  />
</TimeDataView>
```

## API Integration

The implementation works with the `/api/data` route which:

1. First tries to fetch real data from Supabase
2. Falls back to generated sample data if no real data exists
3. Provides error handling and graceful degradation

### Sample Data Format
```javascript
{
  id: 1,
  created_at: "2024-01-15T10:30:00.000Z",
  usage: 23.45,
  cost: 3.52,
  date: "2024-01-15"
}
```

## Key Features

### Stale-While-Revalidate Benefits

1. **Fast Initial Load**: Shows cached data immediately
2. **Background Updates**: Fetches fresh data without blocking UI
3. **Offline Resilience**: Works with cached data when offline
4. **Automatic Revalidation**: Updates data on focus, reconnection, and intervals
5. **Error Recovery**: Retries failed requests with exponential backoff

### Visual Features

1. **Loading States**: Spinner animations during initial load
2. **Update Indicators**: Shows when data is being refreshed
3. **Error States**: Clear error messages with retry options
4. **Empty States**: Helpful messages when no data is available
5. **Data Summaries**: Shows totals and statistics below charts

## Installation Requirements

```bash
npm install recharts
```

The components also require:
- React 18+
- Next.js 15+
- Tailwind CSS (for styling)

## Usage Examples

### Basic Implementation
```javascript
import ShiftsGraph from '../components/ShiftsGraph';

function Dashboard() {
  return (
    <ShiftsGraph 
      chartType="line"
      refreshInterval={60000}
    />
  );
}
```

### With Time Range Integration
```javascript
import { useState } from 'react';
import TimeDataView from '../components/TimeDataView';
import ShiftsGraph from '../components/ShiftsGraph';

function Analytics() {
  const [timeRange, setTimeRange] = useState(null);

  return (
    <TimeDataView onTimeRangeChange={setTimeRange}>
      <ShiftsGraph 
        timeRange={timeRange}
        chartType="bar"
        refreshInterval={30000}
      />
    </TimeDataView>
  );
}
```

### Custom Configuration
```javascript
<ShiftsGraph 
  timeRange={customRange}
  chartType="line"
  refreshInterval={10000}
  className="custom-graph-styles"
/>
```

## Performance Considerations

- **Deduplication**: Prevents unnecessary API calls
- **Caching**: Reduces server load and improves response times  
- **Selective Updates**: Only re-renders when data actually changes
- **Error Boundaries**: Graceful handling of rendering errors
- **Memory Management**: Cleans up intervals and event listeners

## Customization

### Styling
The components use Tailwind CSS classes that can be customized:
- Modify colors by changing class names
- Adjust spacing and layout through className props
- Override default styles with custom CSS

### Data Processing
Extend the data processing logic in `ShiftsGraph.js`:
- Add new chart types
- Modify data transformation
- Include additional metrics

### SWR Options
Configure the hook behavior through options:
- Adjust refresh intervals
- Modify retry logic
- Customize caching behavior

## Error Handling

The implementation includes comprehensive error handling:
- Network errors trigger automatic retries
- Invalid data is handled gracefully
- Fallback UI states for all error scenarios
- Console logging for debugging

## Best Practices

1. **Cache Keys**: Use descriptive, unique keys for different data sets
2. **Refresh Intervals**: Balance freshness with performance
3. **Error Boundaries**: Wrap components in error boundaries
4. **Loading States**: Always provide loading feedback
5. **Accessibility**: Include appropriate ARIA labels and keyboard support

## Testing

The components can be tested by:
- Mocking the fetch function
- Testing different time ranges
- Simulating network errors
- Verifying cache behavior

## Troubleshooting

Common issues and solutions:
- **No data shown**: Check API endpoint and data format
- **Constant loading**: Verify fetcher function returns promises
- **Memory leaks**: Ensure proper cleanup in useEffect hooks
- **Styling issues**: Check Tailwind CSS configuration
