export default function AuditInstructions() {
  return (
    <div>
      <h2 className="text-base font-semibold text-text-primary mb-3">How it works</h2>
      <ol className="list-decimal list-inside text-sm text-text-secondary space-y-1">
        <li>Upload your paystub PDF.</li>
        <li>We parse the pay period, start/end times, and totals.</li>
        <li>We compare against your recorded shifts for that date range.</li>
        <li>Get an accuracy summary and details.</li>
      </ol>
    </div>
  );
}

