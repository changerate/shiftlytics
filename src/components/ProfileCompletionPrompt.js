"use client";

import { useState } from 'react';
import Button from './Button';
import { createUserWage } from '../utils/wageUtils';

export default function ProfileCompletionPrompt({ isOpen, onClose, userId, onCreated }) {
    const [positionTitle, setPositionTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [occurrence, setOccurrence] = useState('hourly');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const amt = Number(amount);
            if (!positionTitle || !amt || amt <= 0 || !occurrence) {
                setError('Please provide a title, a positive amount, and occurrence.');
                setSubmitting(false);
                return;
            }

            const res = await createUserWage(userId, {
                position_title: positionTitle.trim(),
                amount: amt,
                occurrence,
            });

            if (!res.success) {
                setError(res.error || 'Failed to create wage');
            } else {
                onCreated?.(res.wage);
                onClose?.();
            }
        } catch (err) {
            setError('Unexpected error creating wage');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Complete Your Profile</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                    <p className="text-gray-700">Add your first wage to start tracking earnings.</p>

                    {error && (
                        <div className="px-3 py-2 border border-red-300 rounded bg-red-50 text-red-600 text-sm">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role/Position</label>
                        <input
                            type="text"
                            value={positionTitle}
                            onChange={(e) => setPositionTitle(e.target.value)}
                            placeholder="e.g., Barista"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g., 20"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Occurrence</label>
                            <select
                                value={occurrence}
                                onChange={(e) => setOccurrence(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="hourly">Hourly</option>
                                <option value="salary">Salary</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="noOutlineBlack" onClick={onClose}>
                            Not now
                        </Button>
                        <Button type="submit" variant="primary" disabled={submitting}>
                            {submitting ? 'Saving…' : 'Create Wage'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
