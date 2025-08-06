"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TimeInput from "../../../components/TimeInput";





export default function AddShiftPage() {
    const [shiftData, setShiftData] = useState({
        employeeName: "",
        position: "",
        date: "",
        startTime: "",
        endTime: "",
        department: "",
        notes: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShiftData(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
        // TODO: Add shift creation logic here
        console.log('Shift data to be saved:', shiftData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Success - redirect to dashboard or shifts list
        router.push('/dashboard');
        } catch (err) {
        setError('Failed to create shift. Please try again.');
        } finally {
        setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Shift</h1>
                {/* <p className="mt-2 text-gray-600">Create a new shift.</p> */}
            </div>
            <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                ← Back
            </button>
            </div>
        </div>

        {/* Main Content Rectangle */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Shift Details</h2>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                {/* Date */}
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                    </label>
                    <input
                    type="date"
                    id="date"
                    name="date"
                    value={shiftData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    />
                </div>

                {/* Start Time */}
                <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                    </label>
                    <TimeInput
                    id="startTime"
                    name="startTime"
                    value={shiftData.startTime}
                    onChange={handleInputChange}
                    required
                    />
                </div>

                {/* End Time */}
                <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                    </label>
                    <TimeInput
                    id="endTime"
                    name="endTime"
                    value={shiftData.endTime}
                    onChange={handleInputChange}
                    required
                    />
                </div>
                </div>

                {/* Notes - Full Width */}
                <div className="mt-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    value={shiftData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Add any additional notes or special instructions..."
                />
                </div>

                {/* Error Message */}
                {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
                )}

                {/* Form Actions */}
                <div className="mt-8 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Creating Shift...' : 'Create Shift'}
                </button>
                </div>
            </form>
            </div>

        </div>
        </div>
    );
}
