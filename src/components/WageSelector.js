"use client";

import { useState, useEffect } from 'react';
import { getUserWages, createWageDisplayString } from '../utils/wageUtils';
import { supabase } from '../lib/supabaseClient';






export default function WageSelector({ value, onChange, name, required = false }) {
    const [wages, setWages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');



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



    const handleChange = (e) => {
        const selectedValue = e.target.value;

        if (selectedValue === '') {
            onChange({ target: { name, value: '' } });
            return;
        }

        // Find the selected wage object
        const selectedWage = wages.find(wage => wage.id.toString() === selectedValue);

        if (selectedWage) {
            onChange({
                target: {
                name,
                value: selectedValue,
                // Add additional data that might be useful
                selectedWage: selectedWage
                }
            });
        }
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

    // console.log("The wages are: ", wages);
    return (
        <select
            name={name}
            value={value}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            required={required}
        >
        <option value="">Select a wage...</option>
        {wages.map((wage) => (
            <option key={wage.id} value={wage.id}>
            {createWageDisplayString(wage)}
            </option>
        ))}
            {wages.length === 0 && (
                <option value="" disabled>
                No wages found - add wages in your profile settings
                </option>
            )}
        </select>
    );
}
