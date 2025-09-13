"use client";
// migrating new dashboard from "the graph" branch
import Button from '../../components/Button';
import TimeDataView from '../../components/TimeDataView';
import GraphDemo from '../../components/GraphDemo';
import ShiftsGraph from '../../components/ShiftsGraph';
import Heatmap from '../../components/Heatmap';
import { useEffect, useState } from "react";
import { supabase } from '../../lib/supabaseClient';
import ProfileCompletionPrompt from '../../components/ProfileCompletionPrompt';
import ProfilePanel from '../../components/ProfilePanel';
import Spreadsheet from '../../components/Spreadsheet';
import { getUserWages } from '../../utils/wageUtils';
import { getUserProfile } from '../../utils/profileUtils';
import Test from '../../components/test';
import { ShiftsProvider } from '../../context/ShiftsContext';




export default function Dashboard() {
    const [currentTimeRange, setCurrentTimeRange] = useState(null);
    const [showProfilePrompt, setShowProfilePrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [greetingName, setGreetingName] = useState('');
    
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
        const init = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                window.location.href = "/login";
                return;
            }

            // Get user and check wages to decide if we should prompt
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUser(user);

            try {
                const res = await getUserWages(user.id);
                if (res.success && (res.wages?.length ?? 0) === 0) {
                    setShowProfilePrompt(true);
                }
                // personalize greeting
                const prof = await getUserProfile(user.id);
                if (prof.success && prof.profile) {
                    const fn = prof.profile.first_name || user.email?.split('@')[0] || 'Welcome';
                    setGreetingName(fn);
                } else {
                    setGreetingName(user.email?.split('@')[0] || 'Welcome');
                }
            } catch (e) {
                // non-fatal; just skip prompt on error
                console.warn('Failed checking wages:', e?.message);
            }
        };

        init();
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
        setCurrentTimeRange(dateRange);
    };



    return (
        <div className="min-h-screen bg-background font-sans">
        {showProfilePrompt && (
            <ProfileCompletionPrompt
                isOpen={showProfilePrompt}
                onClose={() => setShowProfilePrompt(false)}
                userId={currentUser?.id}
                onCreated={() => setShowProfilePrompt(false)}
            />
        )}
        {showProfilePanel && (
            <ProfilePanel
                isOpen={showProfilePanel}
                onClose={() => setShowProfilePanel(false)}
                userId={currentUser?.id}
            />
        )}
        {/* Header */}
            <header className="bg-surface shadow-sm border-b border-border-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary">{`Welcome${greetingName ? `, ${greetingName}` : ''}`}</h1>
                            <p className="text-text-secondary">Personal Work Schedule Management</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* My Profile */}
                            <Button 
                                onClick={() => setShowProfilePanel(true)}
                                variant="secondary"
                            >
                                My Profile
                            </Button>

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
            <ShiftsProvider>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                </div>

                {/* Content Grid */}
                <p className='text-primary text-sm w-full mx-auto'>Maybe this content grid could be useful!?</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Recent Shifts */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-accent">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Shifts</h2>
                        <div className="space-y-4">
                        <Test />
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



                {/* Time Data Analytics Section with Stale-While-Revalidate Graph */}
                <TimeDataView 
                    title="Shifts Analytics"
                    onTimeRangeChange={handleTimeRangeChange}
                    defaultTimeRange="last30days"
                    className="mb-8"
                >
                    <ShiftsGraph 
                        dateRange={currentTimeRange}
                        chartType="line"
                        refreshInterval={30000}
                        className="m-4"
                    />
                </TimeDataView>
                {/*standard box for heatmap*/}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-accent mt-8">
                   <Heatmap />
                   
                </div>
                <div>
                    <Spreadsheet />
                </div>
                

            </main>
            </ShiftsProvider>
            
            
        </div>
    );
}
