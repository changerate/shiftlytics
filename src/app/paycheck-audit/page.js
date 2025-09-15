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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AuditInstructions />
        <section className="app-card p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload paystub</h2>
          <AuditUploader />
        </section>
        <div className="app-card p-6">
          <MissionStatement />
        </div>
      </main>
    </div>
  );
}
