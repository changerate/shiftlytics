"use client";

import { useState, useEffect, useRef } from 'react';
import { getUserWages, createWageDisplayString } from '../utils/wageUtils';
import { supabase } from '../lib/supabaseClient';

export default function CustomWageSelector({ value, onChange, name, required = false }) {
    const [wages, setWages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const dropdownRef = useRef(null);

    // Find selected wage for display
    const selectedWage = wages.find(wage => wage.id.toString() === value);
    const displayText = selectedWage ? createWageDisplayString(selectedWage) : 'Select a wage...';

    useEffect(() => {
        const fetchWages = async () => {
        try {
            // Get the current user
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
            setError('No authenticated user found');
            setLoading(false);
            return;
            }

            // Fetch user's wages
            const wageResult = await getUserWages(user.id);
            
            if (wageResult.success) {
            setWages(wageResult.wages);
            } else {
            setError(wageResult.error);
            }
        } catch (err) {
            console.error('Error fetching wages:', err);
            setError('Failed to load wages');
        } finally {
            setLoading(false);
        }
        };

        fetchWages();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleWageSelect = (wageId) => {
        const selectedWage = wages.find(wage => wage.id.toString() === wageId);
        
        if (selectedWage) {
        onChange({ 
            target: { 
            name, 
            value: wageId,
            selectedWage: selectedWage
            } 
        });
        }
        setIsOpen(false);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setShowEditModal(true);
        setIsOpen(false);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
    };

    if (loading) {
        return (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading wages...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
            </div>
        );
    }

    return (
        <>
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 text-left border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between ${
                    required && !value ? 'border-red-300' : ''
                }`}
            >
                <span className={!selectedWage ? 'text-gray-500' : 'text-gray-900'}>
                    {displayText}
                </span>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="max-h-60 overflow-auto py-1">
                        {wages.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                            No wages found
                            </div>
                        ) : (
                            wages.map((wage) => (
                            <div 
                                key={wage.id}
                                className='w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-gray-50 focus:outline-none flex flex-row justify-between'>
                                <button
                                    // key={wage.id}
                                    type="button"
                                    onClick={() => handleWageSelect(wage.id.toString())}
                                    className={`${
                                    value === wage.id.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                                    }`}
                                >
                                        {createWageDisplayString(wage)}
                                </button>
                                <button
                                    onClick={handleEditClick}
                                    className='px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center space-x-2'
                                >
                                    edit
                                </button>
                            </div>
                            ))
                        )}
                    
                    </div>
                </div>
            )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Edit Wages</h3>
                        <button
                            onClick={closeEditModal}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Modal Content - Empty for now */}
                    <div className="px-6 py-8">
                        <div className="text-center text-gray-500">
                            <p>Wage editing interface will be implemented here.</p>
                            <p className="text-sm mt-2">This is a placeholder for the wage management system.</p>
                        </div>
                    </div>
                    
                    {/* Modal Footer */}
                    <div className="flex justify-end px-6 py-4 border-t border-gray-200 space-x-3">
                        <button
                            onClick={closeEditModal}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
