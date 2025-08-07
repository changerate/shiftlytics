"use client";
import Button from '../../../components/Button.js';
import { useState } from "react";
import { useRouter } from "next/navigation";
import TimeInput from "../../../components/TimeInput";
import CustomWageSelector from "../../../components/CustomWageSelector";
import { createShift, validateShiftTimes } from "../../../utils/shiftUtils";
import { supabase } from "../../../lib/supabaseClient";





export default function AddShiftPage() {

    const [shiftData, setShiftData] = useState({
        date: new Date().toISOString().split('T')[0],
        startTime: "",
        endTime: "",
        lunchInTime: "",
        lunchOutTime: "",
        addLunch: false,
        wageId: "",
        notes: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setShiftData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Validate shift times first
            const timeValidation = validateShiftTimes(shiftData);
            if (!timeValidation.valid) {
                setError(timeValidation.error);
                setLoading(false);
                return;
            }

            // Get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                setError('Authentication required. Please log in again.');
                setLoading(false);
                return;
            }

            console.log('Shift data to be saved:', shiftData);
            
            // Create the shift using our utility function
            const result = await createShift(shiftData, user.id);
            
            if (!result.success) {
                setError(result.error);
                setLoading(false);
                return;
            }
            
            console.log('Shift created successfully:', result.shift);
            
            // Success - redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            console.error('Error creating shift:', err);
            setError('Failed to create shift. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-background py-8">
        {/* <div className="min-h-screen bg-gray-50 py-8"> */}
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
                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
                        <div className="flex flex-col gap-12 w-full md:w-1/2 lg:w-1/3 mx-auto">


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


                            {/* Wage Selection */}
                            <div>
                                <label htmlFor="wageId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Your Wage *
                                </label>
                                <CustomWageSelector
                                    name="wageId"
                                    value={shiftData.wageId}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>


                            {/* Clock In */}
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                                Clock In *
                                </label>
                                <TimeInput
                                id="startTime"
                                name="startTime"
                                value={shiftData.startTime}
                                onChange={handleInputChange}
                                required
                                />
                            </div>


                            {/* Clock Out */}
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                                Clock Out *
                                </label>
                                <TimeInput
                                id="endTime"
                                name="endTime"
                                value={shiftData.endTime}
                                onChange={handleInputChange}
                                required
                                />
                            </div>


                            {/* Add A Lunch Checkbox */}
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-accent">
                                <input
                                    type="checkbox"
                                    id="addLunch"
                                    name="addLunch"
                                    checked={shiftData.addLunch}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label htmlFor="addLunch" className="flex-1">
                                    <span className="text-sm font-medium text-gray-900">Add A Lunch</span>
                                    <p className="text-xs text-gray-500">Check this box to add your lunch break</p>
                                </label>
                                {! shiftData.addLunch && (
                                    <div className="flex items-center space-x-1 text-blue-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="text-xs font-medium">Lunch skipped</span>
                                    </div>
                                )}
                            </div>

                            {/* Lunch In */}
                            <div className={! shiftData.addLunch ? 'opacity-50 pointer-events-none' : ''}>
                                <label htmlFor="lunchInTime" className="block text-sm font-medium text-gray-700 mb-2">
                                    Lunch In {shiftData.addLunch && '*'}
                                </label>
                                <TimeInput
                                    id="lunchInTime"
                                    name="lunchInTime"
                                    value={shiftData.lunchInTime}
                                    onChange={handleInputChange}
                                    required={shiftData.addLunch}
                                    disabled={! shiftData.addLunch}
                                />
                            </div>

                            {/* Lunch Out */}
                            <div className={! shiftData.addLunch ? 'opacity-50 pointer-events-none' : ''}>
                                <label htmlFor="lunchOutTime" className="block text-sm font-medium text-gray-700 mb-2">
                                    Lunch Out {shiftData.addLunch && '*'}
                                </label>
                                <TimeInput
                                    id="lunchOutTime"
                                    name="lunchOutTime"
                                    value={shiftData.lunchOutTime}
                                    onChange={handleInputChange}
                                    required={shiftData.addLunch}
                                    disabled={! shiftData.addLunch}
                                />
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


                        </div>


                        {/* Error Message */}
                        {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                        )}


                        {/* Form Actions */}
                        <div className="mt-8 flex justify-end space-x-3">
                            <Button
                                type="button"
                                onClick={handleCancel}
                                variant='outline'
                                // className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                variant='primary'
                                // className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Creating Shift...' : 'Create Shift'}
                            </Button>
                        </div>


                    </form>
                </div>

            </div>
        </div>
    );
}
