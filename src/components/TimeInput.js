import { useState, useEffect } from 'react';

export default function TimeInput({ 
  value, 
  onChange, 
  name,
  id,
  className = '',
  required = false,
  disabled = false 
}) {
  const [timeValue, setTimeValue] = useState(value || '');

  useEffect(() => {
    setTimeValue(value || '');
  }, [value]);

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes since midnight to time string
  const minutesToTime = (totalMinutes) => {
    // Handle wrap around for 24 hour format
    totalMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Handle direct time input change
  const handleTimeChange = (e) => {
    const newValue = e.target.value;
    setTimeValue(newValue);
    onChange({ target: { name, value: newValue } });
  };

  // Handle minute adjustment
  const adjustMinutes = (increment) => {
    const currentMinutes = timeToMinutes(timeValue);
    const newMinutes = currentMinutes + increment;
    const newTime = minutesToTime(newMinutes);
    
    setTimeValue(newTime);
    onChange({ target: { name, value: newTime } });
  };

  // Handle hour adjustment
  const adjustHours = (increment) => {
    const currentMinutes = timeToMinutes(timeValue);
    const newMinutes = currentMinutes + (increment * 60);
    const newTime = minutesToTime(newMinutes);
    
    setTimeValue(newTime);
    onChange({ target: { name, value: newTime } });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main time input */}
      <input
        type="time"
        id={id}
        name={name}
        value={timeValue}
        onChange={handleTimeChange}
        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        required={required}
        disabled={disabled}
      />
      
      {/* Control buttons container */}
      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
        {/* Hour controls */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => adjustHours(1)}
            disabled={disabled}
            className="w-4 h-4 flex items-center justify-center text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Add 1 hour"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => adjustHours(-1)}
            disabled={disabled}
            className="w-4 h-4 flex items-center justify-center text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Subtract 1 hour"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Minute controls */}
        <div className="flex flex-col ml-1">
          <button
            type="button"
            onClick={() => adjustMinutes(15)}
            disabled={disabled}
            className="w-4 h-4 flex items-center justify-center text-xs text-gray-600 hover:text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Add 15 minutes"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => adjustMinutes(-15)}
            disabled={disabled}
            className="w-4 h-4 flex items-center justify-center text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Subtract 15 minutes"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick time buttons */}
      <div className="flex flex-wrap gap-1 mt-2">
        <button
          type="button"
          onClick={() => {
            const newTime = '09:00';
            setTimeValue(newTime);
            onChange({ target: { name, value: newTime } });
          }}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors disabled:opacity-50"
        >
          9:00 AM
        </button>
        <button
          type="button"
          onClick={() => {
            const newTime = '12:00';
            setTimeValue(newTime);
            onChange({ target: { name, value: newTime } });
          }}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors disabled:opacity-50"
        >
          12:00 PM
        </button>
        <button
          type="button"
          onClick={() => {
            const newTime = '17:00';
            setTimeValue(newTime);
            onChange({ target: { name, value: newTime } });
          }}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors disabled:opacity-50"
        >
          5:00 PM
        </button>
        <button
          type="button"
          onClick={() => {
            const newTime = '18:00';
            setTimeValue(newTime);
            onChange({ target: { name, value: newTime } });
          }}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors disabled:opacity-50"
        >
          6:00 PM
        </button>
      </div>
    </div>
  );
}
