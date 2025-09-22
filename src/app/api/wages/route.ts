// Minimal wages API to satisfy Next.js module requirement.
// Currently unused by the app; returns an empty list.
// Keeping runtime on Node to allow future Supabase server usage.

export const runtime = "nodejs";

export async function GET() {
  return Response.json([], { headers: { "Cache-Control": "no-store" } });
}
