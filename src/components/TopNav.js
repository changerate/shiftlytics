"use client";
import Button from "./Button";
import { useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export default function TopNav() {
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase logout error:", err?.message);
    }
    window.location.href = "/login";
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60 border-b border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-8">
            <a href="/dashboard" className="text-lg font-semibold text-text-primary hover:opacity-90">
              Personal Scheduler
            </a>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <a href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">Dashboard</a>
              <a href="/paycheck-audit" className="text-text-secondary hover:text-text-primary transition-colors">Paycheck Audit</a>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="small"
              onClick={() => (window.location.href = "/addShift")}
            >
              Add Shift
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => (window.location.href = "/profile")}
            >
              My Profile
            </Button>
            <Button
              variant="noOutlineBlack"
              size="small"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

