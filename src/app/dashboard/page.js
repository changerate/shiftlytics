"use client";

import TopNav from '../../ui/TopNav';
import TimeDataView from './components/TimeDataView';
import ShiftsGraph from './components/ShiftsGraph';
import Heatmap from './components/Heatmap';
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from '../../lib/supabaseClient';
import ProfileCompletionPrompt from './components/ProfileCompletionPrompt';
import ProfilePanel from './components/ProfilePanel';
import Spreadsheet from './components/Spreadsheet';
import { getUserWages } from '../../utils/wageUtils';
import { getUserProfile } from '../../utils/profileUtils';
import RecentShifts from './components/RecentShifts';
import { ShiftsProvider } from '../../context/ShiftsContext';
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

export default function Dashboard() {
  const [currentTimeRange, setCurrentTimeRange] = useState(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [greetingName, setGreetingName] = useState('');
  const [loading, setLoading] = useState(true);

  // --- Parallax state ---
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const parallax1 = { transform: `translate3d(${scrollY * -0.06}px, ${scrollY * -0.08}px, 0)` };
  const parallax2 = { transform: `translate3d(${scrollY * 0.04}px, ${scrollY * 0.06}px, 0)` };

  // Clean OAuth hash after Google login
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      try {
        const res = await getUserWages(user.id);
        if (res.success && (res.wages?.length ?? 0) === 0) {
          setShowProfilePrompt(true);
        }

        const prof = await getUserProfile(user.id);
        if (prof.success && prof.profile) {
          const fn = prof.profile.first_name || user.email?.split('@')[0] || 'Welcome';
          setGreetingName(fn);
        } else {
          setGreetingName(user.email?.split('@')[0] || 'Welcome');
        }
      } catch (e) {
        console.warn('Failed checking wages:', e?.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleTimeRangeChange = (dateRange) => setCurrentTimeRange(dateRange);

  // Motion presets
  const fadeUp = useMemo(() => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: .35, ease: "easeOut" } }
  }), []);

  const card = useMemo(() => ({
    initial: { opacity: 0, y: 14, scale: .99 },
    whileInView: { opacity: 1, y: 0, scale: 1, transition: { duration: .35, ease: "easeOut" } },
    viewport: { once: true, margin: "-10% 0px -10% 0px" }
  }), []);



  const handleHeroAdd = () => {
    setTimeout(() => (window.location.href = "/addShift"), 380);
  };

  return (
    <div className="relative min-h-screen bg-background font-sans overflow-x-hidden">
      {/* Decorative background with parallax and fixed grid */}
      <div aria-hidden className="pointer-events-none select-none absolute inset-0 -z-10">
        <div
          style={parallax1}
          className="absolute -top-24 -right-24 h-[42rem] w-[42rem] rounded-full
                     mix-blend-normal opacity-60
                     bg-[radial-gradient(circle_at_center,rgba(118,193,195,.18),transparent_62%)]" />
        <div
          style={parallax2}
          className="absolute -bottom-32 -left-16 h-[36rem] w-[36rem] rounded-full
                     mix-blend-normal opacity-55
                     bg-[radial-gradient(circle_at_center,rgba(120,147,66,.16),transparent_66%)]" />
        <svg className="absolute inset-0 w-full h-full opacity-[.05]" xmlns="http://www.w3.org/2000/svg">
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

      <TopNav />

      <ShiftsProvider>
        <main className="relative max-w-5xl mx-auto px-5 py-8 space-y-8">
          {/* HERO: solid white surface w/ subtle halo to prevent pastel overlap */}
          <motion.header
            {...fadeUp}
            className="relative overflow-hidden rounded-2xl border border-border-light bg-white
                       shadow-[0_12px_28px_rgba(16,24,40,.08)]"
          >
            {/* halo accent, but masked so it never tints text area */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-12 -top-12 h-72 w-72 rounded-full blur-2xl opacity-70
                              bg-[radial-gradient(45%_55%_at_60%_40%,rgba(84,141,149,.25),transparent_70%)]" />
              <div className="absolute -left-14 -bottom-14 h-64 w-64 rounded-full blur-2xl opacity-70
                              bg-[radial-gradient(45%_55%_at_40%_60%,rgba(120,147,66,.22),transparent_70%)]" />
              {/* white center mask to guarantee contrast under copy */}
              <div className="absolute inset-6 rounded-xl bg-white/85 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full
                                 bg-primary text-text-on-primary text-sm font-semibold shadow-sm">PS</span>
                <p className="text-xs uppercase tracking-wider text-slate-500">Personal Scheduler</p>
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                {`Welcome${greetingName ? `, ${greetingName}` : ''}`}
              </h1>
              <p className="mt-1 text-slate-600">Track shifts, earnings, and patterns — all in one place.</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={handleHeroAdd}
                  className="group inline-flex items-center gap-2 rounded-full px-4 py-2
                             bg-primary text-text-on-primary text-sm shadow transition-all
                             hover:brightness-[1.05] active:scale-[.99]"
                >
                  Add Shift
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <a
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm
                             border border-border-light bg-white hover:bg-surface-hover transition-all"
                >
                  Profile
                </a>
              </div>
            </div>
          </motion.header>

          {/* Loading skeletons */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {[1,2,3].map(i => (
                  <div key={i} className="app-card overflow-hidden">
                    <div className="section-header">
                      <span className="section-dot" />
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
              {/* Recent Shifts */}
              <motion.section {...card} className="app-card overflow-hidden">
                <div className="section-header">
                  <span className="section-dot" />
                  <h2 className="text-base">Recent Shifts</h2>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    <RecentShifts />
                  </div>
                </div>
              </motion.section>

              {/* Analytics (stacked) */}
              <motion.section {...card} className="app-card overflow-hidden">
                <div className="section-header">
                  <span className="section-dot" />
                  <h2 className="text-base">Shifts Analytics</h2>
                </div>
                <div className="p-5">
                  <TimeDataView
                    title=""
                    onTimeRangeChange={handleTimeRangeChange}
                    defaultTimeRange="last30days"
                  >
                    <ShiftsGraph
                      dateRange={currentTimeRange}
                      chartType="line"
                      refreshInterval={30000}
                      className="mt-2"
                    />
                  </TimeDataView>
                </div>
              </motion.section>

              {/* Heatmap (stacked) */}
              <motion.section {...card} className="app-card overflow-hidden">
                <div className="section-header">
                  <span className="section-dot" />
                  <h2 className="text-base">Activity Heatmap</h2>
                </div>
                <div className="p-5">
                  <Heatmap />
                </div>
              </motion.section>

              {/* Spreadsheet */}
              <motion.section {...card} className="app-card overflow-hidden">
                <div className="section-header">
                  <span className="section-dot" />
                  <h2 className="text-base">Spreadsheet</h2>
                </div>
                <div className="p-5">
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
