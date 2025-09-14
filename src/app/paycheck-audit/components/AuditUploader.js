"use client";

export default function AuditUploader() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
      <p className="text-sm text-gray-600 mb-3">Upload your paystub PDF to begin</p>
      <input type="file" accept="application/pdf" className="block w-full text-sm text-gray-600" />
    </div>
  );
}

