"use client";
import TopNav from "../../components/TopNav";
import Pdfparser from "../../components/pdfparser";

export default function PaycheckAuditPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <TopNav />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro / Instructions */}
        <section className="bg-white rounded-lg shadow-sm border border-accent p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How it works</h2>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>Upload your paystub PDF.</li>
            <li>We parse the pay period, start/end times, and totals.</li>
            <li>We compare against your recorded shifts for that date range.</li>
            <li>Get a simple pass/fail with details you can review.</li>
          </ol>
        </section>

        {/* Tool */}
        <section className="bg-white rounded-lg shadow-sm border border-accent p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload paystub</h2>
          <Pdfparser />
        </section>

        {/* Mission statement / Placeholder */}
        <section className="rounded-lg border border-border-light bg-surface p-6">
          <h3 className="text-base font-semibold text-text-primary mb-2">Why this matters</h3>
          <p className="text-sm text-text-secondary">
            Placeholder mission statement: Our goal is to help workers verify that their pay accurately reflects
            the time they worked. This tool will highlight discrepancies and empower you with clear, auditable
            records. In future updates, we’ll support multiple paystub formats and automatic matching.
          </p>
        </section>
      </main>
    </div>
  );
}
