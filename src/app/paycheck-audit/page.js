"use client";
import TopNav from "../../ui/TopNav";
import AuditInstructions from "./components/AuditInstructions";
import AuditUploader from "./components/AuditUploader";
import MissionStatement from "./components/MissionStatement";
import { ShiftsProvider } from "../../context/ShiftsContext";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function PaycheckAuditPage() {
    const [currentUser, setCurrentUser] = useState(null);

 
  

  return (
    <div className="min-h-screen bg-background font-sans">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <section className="mb-6">
            <h1 className="mt-1 text-3xl font-bold text-text-primary">Paycheck Audit</h1>
            <p className="mt-1 text-text-secondary max-w-2xl">Upload a paystub to verify the pay period and total hours against your recorded shifts. Edit any field before comparing.</p>
          </section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <section className="app-card p-6 lg:col-span-2">
            <div className="section-header">
              <h2 className="text-[15px] font-medium text-slate-800">Upload paystub</h2>
            </div>
            <div className="pt-4">
              <ShiftsProvider>
                <AuditUploader />
              </ShiftsProvider>
            </div>
          </section>

          <aside className="app-card p-6 lg:col-span-1">
            <div className="section-header">
              <h2 className="text-[15px] font-medium text-slate-800">Instructions</h2>
            </div>
            <div className="pt-4">
              <AuditInstructions />
            </div>
          </aside>
        </div> 
      </main>
    </div>
  );
}
