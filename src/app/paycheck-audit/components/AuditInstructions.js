export default function AuditInstructions() {
  return (
    <section className="app-card p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">How it works</h2>
      <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
        <li>Upload your paystub PDF.</li>
        <li>We parse the pay period, start/end times, and totals.</li>
        <li>We compare against your recorded shifts for that date range.</li>
        <li>Get a simple pass/fail with details you can review.</li>
      </ol>
    </section>
  );
}

