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

            {/* Container for minus, plus, and time */}
            <div className='py-5 px-7 flex flex-row w-full items-center justify-center gap-8 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'>
                
                {/* Minute control for adding a minute */}
                <div className="flex flex-col">
                    <button
                        type="button"
                        onClick={() => adjustMinutes(-1)}
                        disabled={disabled}
                        className="flex items-center justify-center text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Subtract 15 minutes"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="black" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                        </svg>
                    </button>
                </div>

                {/* Main time input */}
                <input
                    type="time"
                    id={id}
                    name={name}
                    value={timeValue}
                    onChange={handleTimeChange}
                    className="px-5 border-l border-r border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    // className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required={required}
                    disabled={disabled}
                />
                
                {/* Minute control for subtracting a minute */}
                <div className="flex flex-col">
                    <button
                        type="button"
                        onClick={() => adjustMinutes(1)}
                        disabled={disabled}
                        className="flex items-center justify-center text-xs text-gray-600 hover:text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Add 15 minutes"
                        >
                        <svg className="w-7 h-7" fill="none" stroke="black" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
