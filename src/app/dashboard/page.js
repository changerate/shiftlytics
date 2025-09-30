"use client";

import TopNav from '../../ui/TopNav';
import ShiftsGraph from './components/ShiftsGraph';
import Heatmap from './components/Heatmap';
import IncomePie from "./components/IncomePie";
import ProfilePanel from './components/ProfilePanel';


import {useEffect, useMemo, useState} from "react";
import {supabase} from '../../lib/supabaseClient';
import ProfileCompletionPrompt from './components/ProfileCompletionPrompt';
import Spreadsheet from './components/Spreadsheet';
import {getUserWages} from '../../utils/wageUtils';
import {getUserProfile} from '../../utils/profileUtils';
import RecentShifts from './components/RecentShifts';
import {ShiftsProvider } from '../../context/ShiftsContext';
import {motion, AnimatePresence} from "framer-motion";
import Button from "../../ui/Button";
import { PlusIcon } from "@heroicons/react/20/solid";

export default function Dashboard() {
  const [currentTimeRange, setCurrentTimeRange] = useState(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [greetingName, setGreetingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyticsPreset, setAnalyticsPreset] = useState("last7");

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const parallax1 = { transform: `translate3d(${scrollY * -0.05}px, ${scrollY * -0.06}px, 0)`, opacity: .45 };
  const parallax2 = { transform: `translate3d(${scrollY * 0.035}px, ${scrollY * 0.05}px, 0)`, opacity: .40 };

  //  OAuth hash 
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      supabase.auth.getSession().then(() => {
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

      const { data: userData } = await supabase.auth.getUser();
      const user = userData && userData.user;
      if (!user) return;
      setCurrentUser(user);

      try {
        const res = await getUserWages(user.id);
        if (res && res.success && ((res.wages && res.wages.length) || 0) === 0) {
          setShowProfilePrompt(true);
        }

        const prof = await getUserProfile(user.id);
        if (prof && prof.success && prof.profile) {
          const fn = prof.profile.first_name || (user.email ? user.email.split('@')[0] : '') || 'Welcome';
          setGreetingName(fn);
        } else {
          setGreetingName((user.email ? user.email.split('@')[0] : '') || 'Welcome');
        }
      } catch (e) {
        console.warn('Failed checking wages:', (e && e.message) ? e.message : e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleTimeRangeChange = (dateRange) => setCurrentTimeRange(dateRange);

  // motion presets
  const fadeUp = useMemo(() => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  }), []);

  const card = useMemo(() => ({
    initial: { opacity: 0, y: 14, scale: 0.99 },
    whileInView: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
    viewport: { once: true, margin: "-10% 0px -10% 0px" }
  }), []);

  const handleHeroAdd = () => {
    setTimeout(() => { window.location.href = "/addShift"; }, 380);
  };

  return (
    <div className="relative min-h-screen bg-background font-sans overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 -z-10"
        style={{ overflow: "clip", contain: "paint" }}  
      >
        <div
          style={parallax1}
          className="absolute -top-24 -right-24 h-[40rem] w-[40rem] rounded-full
                     mix-blend-normal
                     bg-[radial-gradient(circle_at_center,rgba(118,193,195,.16),transparent_62%)]" />
        <div
          style={parallax2}
          className="absolute -bottom-32 -left-16 h-[34rem] w-[34rem] rounded-full
                     mix-blend-normal
                     bg-[radial-gradient(circle_at_center,rgba(120,147,66,.14),transparent_66%)]" />
        <svg className="absolute inset-0 w-full h-full opacity-[.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="g" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M28 0H0v28" fill="none" stroke="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
      </div>

      {showProfilePrompt && (
        <ProfileCompletionPrompt
          isOpen={showProfilePrompt}
          onClose={() => setShowProfilePrompt(false)}
          userId={currentUser ? currentUser.id : undefined}
          onCreated={() => setShowProfilePrompt(false)}
        />
      )}
      {showProfilePanel && (
        <ProfilePanel
          isOpen={showProfilePanel}
          onClose={() => setShowProfilePanel(false)}
          userId={currentUser ? currentUser.id : undefined}
        />
      )}

      <TopNav />

      <ShiftsProvider>
        <main className="relative no-inner-scroll max-w-5xl mx-auto px-5 md:px-6 py-8 md:py-10 space-y-8 md:space-y-10">
        
          <motion.header {...fadeUp} className="relative overflow-hidden no-inner-scroll">
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="mt-3 text-[28px] md:text-[34px] leading-tight font-semibold text-slate-900">
                    {`Greetings${greetingName ? `, ${greetingName}` : ''}`}
                  </h1>
                  <p className="mt-1 text-sm md:text-[15px] text-slate-600">
                    Track shifts, earnings, and accuracy.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => (window.location.href = "/addShift")}
                  >
                    <PlusIcon className="size-4 mr-1" />
                    Add Shift
                  </Button>
                </div>
              </div>
            </div>
          </motion.header>

          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 no-inner-scroll">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="app-card no-inner-scroll">
                    <div className="section-header">
                      <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
                    </div>
                    <div className="p-6">
                      <div className="h-32 rounded bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          

          {!loading && (
            <>
             {/* analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-5 md:px-6">
                <div className="min-w-0 rounded-xl border" style={{borderColor:'var(--border)'}}>
                  <ShiftsGraph preset={analyticsPreset} onPresetChange={setAnalyticsPreset} />
                </div>
                <div className="min-w-0">
                  <IncomePie preset={analyticsPreset} />
                </div>
              </div>
              {/* recent shifts */}
              <motion.section {...card} className="app-card overflow-hidden no-inner-scroll">
                <div className="section-header">
                  <h2 className="text-[15px] font-medium text-slate-800">Recent Shifts</h2>
                </div>
                <div className="p-5 md:p-6">
                  <RecentShifts />
                </div>
              </motion.section>
              {/* heatmap */}
              <motion.section {...card} className="app-card overflow-hidden no-inner-scroll">
                <div className="section-header">
                  <h2 className="text-[15px] font-medium text-slate-800">Activity</h2>
                </div>
                <div className="p-5 md:p-6">
                  <Heatmap />
                </div>
              </motion.section>

              {/* spreadsheet */}
              <motion.section {...card} className="app-card overflow-hidden no-inner-scroll">
                <div className="section-header">
                  <h2 className="text-[15px] font-medium text-slate-800">Spreadsheet</h2>
                </div>
                <div className="p-5 md:p-6">
                  <Spreadsheet />
                </div>
              </motion.section>
            </>
          )}
        </main>
      </ShiftsProvider>
    </div>
  );
}
