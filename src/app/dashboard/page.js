"use client";
import Button from '../../components/Button';
import TimeDataView from '../../components/TimeDataView';
import { useEffect } from "react";
import { supabase } from '../../lib/supabaseClient';




export default function Dashboard() {
    useEffect(() => {
        // Capture and clean up OAuth token hash from URL after Google login
        const hash = window.location.hash;

        if (hash && hash.includes("access_token")) {
        supabase.auth.getSession().then(() => {
            // Replace hash URL with clean path
            window.history.replaceState({}, document.title, window.location.pathname);
        });
        }
    }, []);



    useEffect(() => {
        const checkAuth = async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
            window.location.href = "/login";
        }
        };

        checkAuth();
    }, []);

    

    const handleLogout = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        console.log("the session is: ", session)
        
        if (session) { // only logout if in a valid session
            try {
                await supabase.auth.signOut(); // clears local session
            } catch (err) {
                console.warn("Supabase logout error:", err.message);
            }
        }

        window.location.href = "/login";
    };

    const handleTimeRangeChange = (dateRange) => {
        console.log('Time range changed:', dateRange);
        // TODO: Implement data fetching based on selected time range
        // This will be useful when you integrate with your data source
    };



    return (
        <div className="min-h-screen bg-background font-sans">
        {/* Header */}
            <header className="bg-surface shadow-sm border-b border-border-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary">Welcome</h1>
                            <p className="text-text-secondary">Personal Work Schedule Management</p>
                        </div>
                        <div className="flex items-center space-x-4">

                            {/* Add New Shift */}
                            <Button 
                                onClick={() => window.location.href = "/addShift"}
                                variant="primary"
                            >
                                Add New Shift
                            </Button>

                            {/* Logout Button */}
                            <Button
                                onClick={handleLogout}
                                variant='noOutlineBlack'
                            >
                                Logout
                            </Button>

                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* ...existing code... */}
                </div>

                {/* Content Grid */}
                <p className='text-primary text-sm w-full mx-auto'>Maybe this content grid could be useful!?</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Recent Shifts */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-accent">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Shifts</h2>
                        <div className="space-y-4">
                        {/* ...existing code... */}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-accent">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                        {/* ...existing code... */}
                        </div>
                    </div>
                </div>

                {/* Time Data Analytics Section */}
                <TimeDataView 
                    title="Recent Shifts"
                    onTimeRangeChange={handleTimeRangeChange}
                    defaultTimeRange="last30days"
                    className="mb-8"
                />

            </main>
        </div>
    );
}
