import { createServerSupabaseWithAuth } from "../../../lib/authServerSupabase";
function generateSampleData() {
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const baseUsage = 15 + Math.random() * 10; // Base usage between 15-25 kWh
        const seasonalMultiplier = 1 + 0.3 * Math.sin((date.getMonth() + 1) * Math.PI / 6); // Seasonal variation
        const usage = Math.round((baseUsage * seasonalMultiplier + Math.random() * 5) * 100) / 100;
        const cost = Math.round(usage * (0.12 + Math.random() * 0.06) * 100) / 100; // $0.12-0.18 per kWh
        
        data.push({
            id: i + 1,
            created_at: date.toISOString(),
            date: date.toISOString().split('T')[0],
            usage,
            cost,
            shifts: usage,
            energy_cost: cost,
            timestamp: date.toISOString()
        });
    }
    
    return data;
}




export async function GET(request: Request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServerSupabaseWithAuth(token);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("user_id", user.id);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data ?? [], { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error("/api/data error:", error?.message || error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
