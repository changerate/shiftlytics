"use client";
import TopNav from "../../ui/TopNav";
import AuditInstructions from "./components/AuditInstructions";
import AuditUploader from "./components/AuditUploader";
import MissionStatement from "./components/MissionStatement";

export default function PaycheckAuditPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <TopNav />

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <section className="mb-6">
          <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">Tools</div>
          <h1 className="mt-1 text-3xl font-bold text-text-primary">Paycheck Audit</h1>
          <p className="mt-1 text-text-secondary max-w-2xl">Upload a paystub to verify the pay period and total hours against your recorded shifts. Edit any field before comparing.</p>
        </section>

        {/* Main grid: uploader focus with helpful instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <section className="app-card p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload paystub</h2>
            <AuditUploader />
          </section>
          <aside className="app-card p-6 lg:col-span-1">
            <AuditInstructions />
          </aside>
        </div>

        {/* Mission statement */}
        <section className="app-card p-6">
          <MissionStatement />
        </section>
      </main>
    </div>
  );
}
